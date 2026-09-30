import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { topics } from '../../../content/course';
import { getMarkdown, splitTaskMarkdown } from './index';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const content = join(root, 'content');
const tasks = topics.flatMap((topic) => topic.tasks);
const normalize = (text: string) => text.replace(/\r\n/g, '\n');

function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(path) : path.endsWith('.md') ? [path] : [];
  });
}

describe('splitTaskMarkdown', () => {
  it('separates hints and reference solution, removing every personal section', () => {
    const result = splitTaskMarkdown([
      '# Task', '## Условие', 'Keep statement.',
      '## 💡 Подсказки', '<details>', '<summary>First</summary>', 'Hint one.', '</details>',
      '<details>', '<summary>Second</summary>', 'Hint two.', '</details>',
      '---', '## ✍️ Моё решение 1', 'PRIVATE_ATTEMPT',
      '## 🧮 Моя оценка сложности', 'PRIVATE_EVALUATION',
      '## ✍️ Моё решение 2', 'PRIVATE_SECOND_ATTEMPT',
      '## 🔍 Разбор — после попытки', '<details>', '<summary>Reference</summary>',
      'REFERENCE_ONLY', '</details>',
    ].join('\r\n'));
    expect(result.statement).toBe('# Task\n## Условие\nKeep statement.');
    expect(result.hints).toEqual(['### First\n\nHint one.', '### Second\n\nHint two.']);
    expect(result.solution).toContain('REFERENCE_ONLY');
    expect(result.statement).not.toContain('REFERENCE_ONLY');
    expect(JSON.stringify(result)).not.toContain('PRIVATE_');
  });

  it('handles absent hints and solutions, plus event-loop answer placeholders', () => {
    expect(splitTaskMarkdown('')).toEqual({ statement: '', hints: [], solution: '' });
    expect(splitTaskMarkdown('# Task\n## ✍️ Мои ответы\n1: PRIVATE')).toEqual({
      statement: '# Task', hints: [], solution: '',
    });
    expect(splitTaskMarkdown('# Task\n## ✍️ Моё решение\nPRIVATE\n## 🧮 Самопроверка\n- [ ] Check')).toEqual({
      statement: '# Task\n## 🧮 Самопроверка\n- [ ] Check', hints: [], solution: '',
    });
    const model = '# Task\n## 🧠 Ментальная модель (см. эталонный разбор)\nModel';
    expect(splitTaskMarkdown(model)).toEqual({ statement: model, hints: [], solution: '' });
  });

  it('does not parse fenced headings or details tags as structure', () => {
    const statement = '# Task\n~~~~js\n## Разбор\n<details>\n~~~~';
    const result = splitTaskMarkdown(`${statement}\n## Подсказки
<details>
<summary>Outer</summary>
\`\`\`html
</details>
## Моё решение
\`\`\`
<details><summary>Nested</summary>More</details>
</details>
## Моё решение
PRIVATE`);
    expect(result.statement).toBe(statement);
    expect(result.hints).toHaveLength(1);
    expect(result.hints[0]).toContain('<details><summary>Nested</summary>More</details>');
    expect(result.hints[0]).toContain('## Моё решение');
    expect(JSON.stringify(result)).not.toContain('PRIVATE');
  });

  it('preserves reference subsections and plain or incomplete hints behind the gate', () => {
    const result = splitTaskMarkdown('# Task\n## Подсказки\nPlain hint\n## Разбор\nReference\n## Complexity\nDetails');
    expect(result.hints).toEqual(['Plain hint']);
    expect(result.solution).toBe('Reference\n## Complexity\nDetails');
    expect(result.statement).toBe('# Task');
    const incomplete = splitTaskMarkdown('# Task\n## Подсказки\n<details><summary>Hint</summary>\nHidden');
    expect(incomplete.statement).toBe('# Task');
    expect(incomplete.hints).toHaveLength(1);
    expect(incomplete.hints[0]).toContain('Hidden');
  });
});

describe('course catalog and migration', () => {
  it('covers exactly 22 theory topics and 79 tasks with stable unique IDs and paths', () => {
    expect(topics).toHaveLength(22);
    expect(tasks).toHaveLength(79);
    const entries = [...topics, ...tasks];
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    for (const entry of entries) expect(entry.id).toMatch(/^[a-z][a-z0-9-]*$/);
    const paths = [...topics.map((topic) => topic.theoryPath), ...tasks.map((task) => task.path)];
    expect(new Set(paths).size).toBe(101);
    for (const path of paths) {
      expect(path).not.toMatch(/^\/|\\|(?:^|\/)\.\.(?:\/|$)/);
      expect(existsSync(join(content, path)), path).toBe(true);
    }
    const publicTasks = markdownFiles(join(content, 'practice'))
      .filter((path) => !path.endsWith('README.md'))
      .map((path) => relative(content, path).replaceAll('\\', '/'));
    expect(tasks.map((task) => task.path).sort()).toEqual(publicTasks.sort());
    const theoryPaths = markdownFiles(content)
      .map((path) => relative(content, path).replaceAll('\\', '/'))
      .filter((path) => /^0[1-8]-/.test(path));
    expect(topics.map((topic) => topic.theoryPath).sort()).toEqual(theoryPaths.sort());
    expect(tasks.filter((task) => task.runnable).map((task) => task.id)).toEqual(['range-sum-query']);
  });

  it('keeps all migrated relative Markdown links valid', () => {
    const files = [
      ...markdownFiles(content), ...markdownFiles(join(root, 'personal')),
      join(root, '.github', 'copilot-instructions.md'),
    ];
    for (const file of files) {
      const markdown = readFileSync(file, 'utf8')
        .replace(/```[^\n]*\n[\s\S]*?```/g, '')
        .replace(/`[^`\n]*`/g, '');
      for (const match of markdown.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
        const url = match[1];
        if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(url)) continue;
        const path = decodeURIComponent(url.split(/[?#]/)[0]);
        const target = path ? resolve(dirname(file), path) : file;
        expect(existsSync(target), `${file}: ${url}`).toBe(true);
        const anchor = url.split('#')[1];
        if (anchor && target.endsWith('.md')) {
          const headings = [...readFileSync(target, 'utf8').matchAll(/^#{1,6}\s+(.+)$/gm)];
          const slugs = headings.map((heading) => heading[1].trim().toLowerCase()
            .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '').replace(/ /g, '-'));
          expect(slugs, `${file}: ${url}`).toContain(decodeURIComponent(anchor));
        }
      }
    }
  });

  it('archives only filled attempts and preserves their statements', () => {
    const archiveRoot = join(root, 'personal', 'solutions');
    const archives = markdownFiles(archiveRoot);
    expect(archives).toHaveLength(10);
    for (const archive of archives) {
      const original = normalize(readFileSync(archive, 'utf8'));
      const publicMarkdown = normalize(readFileSync(join(content, relative(archiveRoot, archive)), 'utf8'));
      expect(publicMarkdown.split('## ✍️')[0]).toBe(original.split('## ✍️')[0]);
      expect(publicMarkdown).toContain('Время: O(?) · Память: O(?)');
      expect(publicMarkdown).not.toBe(original);
    }
  });

  it('loads and splits every actual task without displaying attempts or gated content', async () => {
    let references = 0;
    for (const task of tasks) {
      const markdown = await getMarkdown(task.path);
      const result = splitTaskMarkdown(markdown);
      expect(Boolean(result.solution), task.id).toBe(/^## 🔍 Разбор/m.test(markdown));
      expect(result.statement, task.id).toContain('# ');
      expect(result.statement, task.id).not.toMatch(/^##.*(?:Моё решение|Мои ответы|Моя оценка|Подсказки|Разбор)/m);
      expect(result.hints, task.id).toHaveLength((markdown.match(/<summary>Подсказка/g) ?? []).length);
      for (const hint of result.hints) expect(result.statement).not.toContain(hint);
      if (result.solution) {
        references++;
        expect(result.statement).not.toContain(result.solution);
      }
    }
    expect(references).toBe(69);
  });
});

describe('getMarkdown', () => {
  it('returns theory unchanged', async () => {
    const path = topics[0].theoryPath;
    expect(await getMarkdown(path)).toBe(readFileSync(join(content, path), 'utf8'));
  });

  it('rejects missing, non-Markdown, absolute, traversal and personal paths', async () => {
    for (const path of ['missing.md', '/README.md', '../personal/PROGRESS.md', 'personal/PROGRESS.md', 'README.md?raw', 'practice\\README.md', 'course.ts']) {
      await expect(getMarkdown(path)).rejects.toThrow(/Markdown/);
    }
  });
});
