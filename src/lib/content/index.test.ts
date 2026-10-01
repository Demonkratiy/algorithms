import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { topics } from '../../../content/course';
import { courseSections } from './navigation';
import { getTaskDefinition, getQuizDefinition, taskDefinitions, quizDefinitions } from '../../../tasks';
import { getMarkdown, splitTaskMarkdown } from './index';
import { parseQuizMarkdown } from '../../features/quiz/content';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const content = join(root, 'content');
const tasks = topics.flatMap((topic) => topic.tasks);
const normalize = (text: string) => text.replace(/\r\n/g, '\n');

function isCollapsedAt(source: string, position: number) {
  let fence = '', depth = 0;
  for (const line of source.slice(0, position).split('\n')) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length
        && !line.slice(marker[0].length).trim()) fence = '';
      continue;
    }
    if (marker) { fence = marker[1]; continue; }
    for (const tag of line.matchAll(/<\/?details\b[^>]*>/gi)) depth += tag[0].startsWith('</') ? -1 : 1;
  }
  return depth > 0;
}

function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(path) : path.endsWith('.md') ? [path] : [];
  });
}

function reference<T>(id: string, symbol: string, context: Record<string, unknown> = {}, block = 0): T {
  const task = tasks.find((entry) => entry.id === id)!;
  const markdown = normalize(readFileSync(join(content, task.path), 'utf8'));
  const { solution } = splitTaskMarkdown(markdown);
  const source = [...solution.matchAll(/```js\n([\s\S]*?)\n```/g)][block]?.[1];
  if (!source) throw new Error(`Missing reference code: ${id}`);
  return runInNewContext(`${source}\n${symbol}`, context, { timeout: 1000 }) as T;
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
  it('loads eight complete overviews with relative links to every topic in course order', async () => {
    for (const section of courseSections) {
      const markdown = await getMarkdown(section.overviewPath);
      expect(markdown).toBe(readFileSync(join(content, section.overviewPath), 'utf8'));
      for (const heading of ['Общая идея', 'Где это встречается', 'Что нужно знать заранее', 'Маршрут изучения', 'Что получится после раздела']) {
        expect(markdown, section.id).toContain(`## ${heading}`);
      }
      const route = markdown.split('## Маршрут изучения')[1].split('\n## ')[0];
      const targets = [...route.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)]
        .map(match => relative(content, resolve(content, dirname(section.overviewPath), match[1])).replaceAll('\\', '/'));
      expect(targets, section.id).toEqual(section.topics.map(({ topic }) => topic.theoryPath));
    }
  });

  it('covers exactly 22 theory topics and 101 activities with stable unique IDs and paths', () => {
    expect(topics).toHaveLength(22);
    expect(tasks).toHaveLength(101);
    const entries = [...topics, ...tasks];
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    for (const entry of entries) expect(entry.id).toMatch(/^[a-z][a-z0-9-]*$/);
    const paths = [...topics.map((topic) => topic.theoryPath), ...tasks.map((task) => task.path)];
    expect(new Set(paths).size).toBe(123);
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
    expect([...topics.map((topic) => topic.theoryPath), ...courseSections.map(section => section.overviewPath)].sort()).toEqual(theoryPaths.sort());
    expect(tasks.filter((task) => task.runnable).map((task) => task.id).sort())
      .toEqual([...taskDefinitions, ...quizDefinitions].map((definition) => definition.id).sort());
    for (const task of tasks) {
      expect(task.runnable, task.id).toBe(getTaskDefinition(task.id) !== undefined || getQuizDefinition(task.id) !== undefined);
    }
  });

  it('keeps split parts adjacent with explicit previous draft links and original paths', () => {
    const splits = [
      ['linked-list-cycle', 'practice/03-linear-structures/01-linked-lists/03-linked-list-cycle.md', ['linked-list-cycle-entry']],
      ['meeting-rooms', 'practice/04-search-sort/02-sorting/04-meeting-rooms.md', ['meeting-rooms-ii']],
      ['implement-min-heap', 'practice/04-search-sort/03-heap/01-implement-min-heap.md', ['heap-comparator', 'heapify']],
      ['power-and-reverse', 'practice/05-recursion-trees/01-recursion/02-power-and-reverse.md', ['reverse-string']],
      ['flatten-nested', 'practice/05-recursion-trees/01-recursion/05-flatten-nested.md', ['count-comments', 'deep-get']],
      ['max-depth', 'practice/05-recursion-trees/02-binary-trees/01-max-depth.md', ['min-depth']],
      ['lowest-common-ancestor', 'practice/05-recursion-trees/02-binary-trees/06-lowest-common-ancestor.md', ['lowest-common-ancestor-binary-tree']],
      ['house-robber', 'practice/07-dynamic-programming/01-dp-basics/02-house-robber.md', ['house-robber-ii']],
      ['coin-change', 'practice/07-dynamic-programming/01-dp-basics/03-coin-change.md', ['coin-change-ii']],
      ['unique-paths', 'practice/07-dynamic-programming/01-dp-basics/05-unique-paths.md', ['unique-paths-ii']],
      ['best-time-to-buy-sell-stock', 'practice/07-dynamic-programming/02-greedy/01-best-time-to-buy-sell-stock.md', ['stock-ii']],
      ['jump-game', 'practice/07-dynamic-programming/02-greedy/02-jump-game.md', ['jump-game-ii']],
      ['sleep-retry-timeout', 'practice/08-js-interview/04-promises/01-sleep-retry-timeout.md', ['with-timeout', 'retry']],
      ['promise-all', 'practice/08-js-interview/04-promises/03-promise-all.md', ['promise-all-settled', 'promise-race', 'promise-any']],
      ['cancellation', 'practice/08-js-interview/04-promises/04-cancellation.md', ['fetch-with-abort', 'latest-search']],
      ['throttle', 'practice/08-js-interview/01-function-utils/02-throttle.md', ['throttle-trailing']],
    ] as const;
    expect(tasks.filter((task) => task.previousTaskId)).toHaveLength(22);
    for (const [previousId, originalPath, newIds] of splits) {
      const topic = topics.find((entry) => entry.tasks.some((task) => task.id === previousId))!;
      const position = topic.tasks.findIndex((task) => task.id === previousId);
      expect(topic.tasks[position].path).toBe(originalPath);
      expect(topic.tasks[position].previousTaskId).toBeUndefined();
      expect(topic.tasks.slice(position + 1, position + 1 + newIds.length).map((task) => task.id))
        .toEqual(newIds);
      for (const id of [previousId, ...newIds]) {
        const task = topic.tasks.find((entry) => entry.id === id)!;
        if (id !== previousId) expect(task.previousTaskId).toBe(previousId);
        const markdown = normalize(readFileSync(join(content, task.path), 'utf8'));
        expect(markdown, id).toContain('## ✍️ Моё решение');
        expect(markdown, id).toContain('## 🧮 Моя оценка сложности');
        expect(markdown, id).toContain('## 💡 Подсказки');
        const parsed = splitTaskMarkdown(markdown);
        expect(parsed.hints.length, id).toBeGreaterThan(0);
        expect(parsed.solution, id).toContain('<details>');
        expect(markdown.trimEnd(), id).toMatch(/<\/details>$/);
        expect(parsed.statement, id).not.toContain('function hasCycle');
        expect(parsed.statement, id).not.toContain('function detectCycle');
      }
    }
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

  it('requires hints and a gated reference implementation for every code task', async () => {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    for (const task of tasks) {
      const markdown = await getMarkdown(task.path);
      const result = splitTaskMarkdown(markdown);
      expect(result.solution.trim(), `${task.id}: missing analysis`).not.toBe('');
      expect(result.solution, `${task.id}: analysis must be collapsed`).toMatch(/<details\b/);
      expect(result.statement, task.id).toContain('# ');
      expect(result.statement, task.id).not.toMatch(/^##.*(?:Моё решение|Мои ответы|Моя оценка|Подсказки|Разбор)/m);
      expect(result.hints, task.id).toHaveLength((markdown.match(/<summary>Подсказка/g) ?? []).length);
      for (const hint of result.hints) expect(result.statement).not.toContain(hint);
      expect(result.statement).not.toContain(result.solution);
      const quiz = getQuizDefinition(task.id);
      if (quiz) {
        const questions = parseQuizMarkdown(markdown, quiz);
        expect(questions, task.id).toHaveLength(quiz.questions.length);
        for (const question of questions) expect(question.explanation.trim(), `${task.id}: ${question.id}`).not.toBe('');
        continue;
      }
      expect(result.hints.length, `${task.id}: missing hints`).toBeGreaterThan(0);
      for (const hint of result.hints) {
        expect(hint.replace(/^#{1,6}[^\n]*(?:\n|$)/gm, '').trim(), `${task.id}: empty hint`).not.toBe('');
      }
      const definition = getTaskDefinition(task.id);
      expect(definition, `${task.id}: missing executable definition`).toBeDefined();
      const entry = definition!.runner.entryPoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const declaration = new RegExp(`\\b(?:function\\s+${entry}\\b|class\\s+${entry}\\b|(?:const|let|var)\\s+${entry}\\s*=)`);
      const matches = [...result.solution.matchAll(/```(?:js|javascript)\s*\n([\s\S]*?)\n```/g)];
      for (const match of matches) expect(isCollapsedAt(result.solution, match.index), `${task.id}: code outside spoiler`).toBe(true);
      const blocks = matches.map(match => match[1]);
      const references = blocks.filter(code => declaration.test(code) && !/TODO|пиши здесь|ваш код/i.test(code));
      expect(references.length, `${task.id}: missing reference code for ${definition!.runner.entryPoint}`).toBeGreaterThan(0);
      const parseable = references.some(code => {
        try { new Function(code); return true; }
        catch {
          try { new AsyncFunction(code); return true; }
          catch { return false; }
        }
      });
      expect(parseable, `${task.id}: no syntactically complete reference`).toBe(true);
    }
  });
});

describe('getMarkdown', () => {
  it('returns theory unchanged', async () => {
    const path = topics[0].theoryPath;
    expect(await getMarkdown(path)).toBe(readFileSync(join(content, path), 'utf8'));
  });

  describe('split reference material', () => {
    it('keeps comparator and heapify examples complete for numbers and objects', () => {
      type Item = number | { priority: number };
      type Heap = { size: number; pop(): Item | undefined; peek(): Item | undefined; push(value: Item): void };
      type HeapConstructor = {
        new(compare?: (a: Item, b: Item) => number): Heap;
        heapify(items: Item[], compare?: (a: Item, b: Item) => number): Heap;
      };
      const drain = (heap: Heap) => {
        const values: Item[] = [];
        while (heap.size) values.push(heap.pop()!);
        expect(heap.pop()).toBeUndefined();
        expect(heap.peek()).toBeUndefined();
        return values;
      };
      const Heap = reference<HeapConstructor>('heap-comparator', 'MinHeap');
      const descending = new Heap((a, b) => Number(b) - Number(a));
      [3, 9, 3, -2].forEach((value) => descending.push(value));
      expect(drain(descending)).toEqual([9, 3, 3, -2]);
      const objects = [{ priority: 5 }, { priority: 1 }];
      const queue = new Heap((a, b) => (a as { priority: number }).priority - (b as { priority: number }).priority);
      objects.forEach((value) => queue.push(value));
      expect(queue.pop()).toBe(objects[1]);
      expect(queue.pop()).toBe(objects[0]);
      const Builder = reference<HeapConstructor>('heapify', 'MinHeap');
      const input = Array.from({ length: 512 }, (_, i) => 512 - i);
      let comparisons = 0;
      const built = Builder.heapify(input, (a, b) => { comparisons++; return Number(a) - Number(b); });
      expect(comparisons).toBeLessThan(input.length * 4);
      expect(input[0]).toBe(512);
      expect(drain(built)).toEqual([...input].sort((a, b) => a - b));
      expect(drain(Builder.heapify([]))).toEqual([]);
    });

    it('retains independent array, recursion and DP reference contracts', () => {
      expect(reference<(input: unknown[], depth?: number) => unknown[]>('flatten-nested', 'flatten')([1, [2, [3]]], 1))
        .toEqual([1, 2, [3]]);
      expect(reference<(input: string) => string>('reverse-string', 'reverseString')('hello')).toBe('olleh');
      expect(reference<(input: unknown[]) => number>('count-comments', 'countComments')([{ replies: [{ id: 2 }] }, { id: 3 }])).toBe(3);
      expect(reference<(obj: unknown, path: string) => unknown>('deep-get', 'deepGet')({ a: null }, 'a.b')).toBeUndefined();
      expect(reference<(input: number[]) => number>('stock-ii', 'maxProfitMultiple')([7, 1, 5, 3, 6, 4])).toBe(7);
      expect(reference<(input: number[]) => number>('jump-game-ii', 'jump')([0])).toBe(0);
      expect(reference<(input: number[][]) => number>('meeting-rooms-ii', 'minMeetingRooms')([[1, 5], [5, 8]])).toBe(1);
      expect(reference<(input: number[]) => number>('house-robber-ii', 'robCircular', {}, 2)([2, 1, 1, 2])).toBe(3);
      expect(reference<(amount: number, coins: number[]) => number>('coin-change-ii', 'change')(5, [1, 2, 5])).toBe(4);
      const paths = reference<(grid: number[][]) => number>('unique-paths-ii', 'uniquePathsWithObstacles');
      expect(paths([[0, 0, 0], [0, 1, 0], [0, 0, 0]])).toBe(2);
      expect(paths([[1]])).toBe(0);
      expect(paths([[0, 1, 0]])).toBe(0);
    });

    it('returns original node identities for cycle entry and LCA, and counts minimum leaf depth', () => {
      type ListNode = { val: number; next: ListNode | null };
      const head: ListNode = { val: 1, next: null };
      const entry: ListNode = { val: 1, next: null };
      head.next = entry;
      entry.next = entry;
      const detectCycle = reference<(node: ListNode | null) => ListNode | null>('linked-list-cycle-entry', 'detectCycle');
      expect(detectCycle(head)).toBe(entry);
      expect(detectCycle(null)).toBeNull();
      entry.next = null;
      expect(detectCycle(head)).toBeNull();
      type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null };
      const child: TreeNode = { val: 2, left: null, right: null };
      const root: TreeNode = { val: 1, left: null, right: child };
      expect(reference<(root: TreeNode) => number>('min-depth', 'minDepth')(root)).toBe(2);
      const lca = reference<(root: TreeNode, p: TreeNode, q: TreeNode) => TreeNode>(
        'lowest-common-ancestor-binary-tree', 'lowestCommonAncestor', {}, 1,
      );
      expect(lca(root, root, child)).toBe(root);
    });

    it('handles independent combinator empty-input and rejection semantics', async () => {
      const settled = reference<(input: unknown[]) => Promise<unknown>>('promise-all-settled', 'myAllSettled');
      await expect(settled([1, Promise.reject('x')])).resolves.toEqual([
        { status: 'fulfilled', value: 1 }, { status: 'rejected', reason: 'x' },
      ]);
      await expect(settled([])).resolves.toEqual([]);
      const any = reference<(input: unknown[]) => Promise<unknown>>('promise-any', 'myAny');
      await expect(any([Promise.reject('x'), 2])).resolves.toBe(2);
      await expect(any([])).rejects.toMatchObject({ name: 'AggregateError', errors: [] });
      await expect(any([Promise.reject('a'), Promise.reject('b')])).rejects.toMatchObject({ errors: ['a', 'b'] });
      const race = reference<(input: unknown[]) => Promise<unknown>>('promise-race', 'myRace');
      await expect(race([Promise.reject('first'), Promise.resolve('later')])).rejects.toBe('first');
      const marker = {};
      expect(await Promise.race([race([]), Promise.resolve(marker)])).toBe(marker);
    });

    it('settles logical cancellation immediately and suppresses late results', async () => {
      type Cancelled = { promise: Promise<unknown>; cancel(): void };
      const cancellable = reference<(factory: () => unknown) => Cancelled>('cancellation', 'cancellable');
      const pending = cancellable(() => new Promise(() => {}));
      pending.cancel();
      pending.cancel();
      await expect(pending.promise).rejects.toMatchObject({ name: 'CancelledError' });
      const done = cancellable(() => 42);
      await expect(done.promise).resolves.toBe(42);
      done.cancel();
      await expect(done.promise).resolves.toBe(42);
      let fail!: (reason: unknown) => void;
      const late = cancellable(() => new Promise((_, reject) => { fail = reject; }));
      late.cancel();
      await expect(late.promise).rejects.toMatchObject({ name: 'CancelledError' });
      fail(new Error('late failure'));
      await Promise.resolve();
    });

    it('separates timeout cleanup from retry attempt counting', async () => {
      const withTimeout = reference<(promise: Promise<unknown>, ms: number) => Promise<unknown>>(
        'with-timeout', 'withTimeout', { setTimeout, clearTimeout },
      );
      await expect(withTimeout(Promise.resolve('ok'), 50)).resolves.toBe('ok');
      await expect(withTimeout(new Promise(() => {}), 0)).rejects.toMatchObject({ message: 'Timeout after 0ms' });
      const pauses: number[] = [];
      const retry = reference<(fn: () => unknown, options: { attempts: number; delay: number; backoff: number }) => Promise<unknown>>(
        'retry', 'retry', { sleep: async (ms: number) => { pauses.push(ms); } },
      );
      let calls = 0;
      const error = new Error('failed');
      await expect(retry(() => { calls++; throw error; }, { attempts: 3, delay: 2, backoff: 2 })).rejects.toBe(error);
      expect(calls).toBe(3);
      expect(pauses).toEqual([2, 4]);
    });

    it('ignores both stale successes and stale errors even when abort is ignored', async () => {
      const requests: { signal: AbortSignal; resolve(value: unknown): void; reject(error: unknown): void }[] = [];
      const rendered: unknown[] = [], errors: unknown[] = [];
      const search = reference<(query: string) => Promise<void>>('latest-search', 'search', {
        AbortController,
        loadData: (_url: string, signal: AbortSignal) => new Promise((resolve, reject) => {
          requests.push({ signal, resolve, reject });
        }),
        render: (value: unknown) => { rendered.push(value); },
        showError: (error: unknown) => { errors.push(error); },
      });
      const first = search('a'), second = search('ab'), third = search('abc');
      expect(requests[0].signal.aborted).toBe(true);
      expect(requests[1].signal.aborted).toBe(true);
      requests[2].resolve('latest');
      requests[0].resolve('stale');
      requests[1].reject(new Error('stale error'));
      await Promise.all([first, second, third]);
      expect(rendered).toEqual(['latest']);
      expect(errors).toEqual([]);
    });

    it('forwards the controller signal and preserves fetch failures', async () => {
      const controller = new AbortController();
      const value = { value: 42 };
      let response: { ok: boolean; status: number; json(): Promise<unknown> } = {
        ok: true, status: 200, json: async () => value,
      };
      let failure: unknown;
      const fetchWithAbort = reference<(url: string, controller: AbortController) => Promise<unknown>>(
        'fetch-with-abort', 'fetchWithAbort', {
          fetch: async (_url: string, options: { signal: AbortSignal }) => {
            expect(options.signal).toBe(controller.signal);
            if (failure) throw failure;
            return response;
          },
        },
      );
      await expect(fetchWithAbort('/fake', controller)).resolves.toBe(value);
      response = { ...response, ok: false, status: 500 };
      await expect(fetchWithAbort('/fake', controller)).rejects.toMatchObject({ message: 'HTTP 500' });
      failure = new DOMException('Aborted', 'AbortError');
      await expect(fetchWithAbort('/fake', controller)).rejects.toBe(failure);
    });
  });

  it('rejects missing, non-Markdown, absolute, traversal and personal paths', async () => {
    for (const path of ['missing.md', '/README.md', '../personal/PROGRESS.md', 'personal/PROGRESS.md', 'README.md?raw', 'practice\\README.md', 'course.ts']) {
      await expect(getMarkdown(path)).rejects.toThrow(/Markdown/);
    }
  });
});
