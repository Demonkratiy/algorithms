import { practiceIndex } from '../../../content/priorities';

const markdownFiles = import.meta.glob<string>(['/content/**/*.md', '!/content/practice/README.md'], {
  query: '?raw',
  import: 'default',
});

export async function getMarkdown(path: string): Promise<string> {
  if (
    !path.endsWith('.md') ||
    path.includes('\\') ||
    path.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw new Error('Недопустимый путь Markdown: нужен относительный путь внутри content/.');
  }
  if (path === 'practice/README.md') return practiceIndex;
  const load = markdownFiles[`/content/${path}`];
  if (!load) {
    throw new Error(`Markdown не найден в каталоге курса: ${path}`);
  }
  return load();
}

type TaskMarkdown = { statement: string; hints: string[]; solution: string };
type Section = 'statement' | 'hints' | 'solution' | 'personal';

// Headings and HTML tags inside fenced examples are text, not course structure.
function structuralLines(markdown: string): { text: string; structural: boolean }[] {
  let fence: string | undefined;
  return markdown.replace(/\r\n?/g, '\n').split('\n').map((text) => {
    const marker = text.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (
        marker && marker[1][0] === fence[0] && marker[1].length >= fence.length &&
        text.slice(marker[0].length).trim() === ''
      ) {
        fence = undefined;
      }
      return { text, structural: false };
    }
    if (marker) {
      fence = marker[1];
      return { text, structural: false };
    }
    return { text, structural: true };
  });
}

function cleanSection(text: string): string {
  return text.trim().replace(/^(?:---[ \t]*(?:\n\s*|$))+|(?:\n\s*---[ \t]*)+$/g, '').trim();
}

function extractHints(markdown: string): string[] {
  const hints: string[] = [];
  const lines = structuralLines(markdown);
  let depth = 0;
  let block: string[] = [];
  for (const { text, structural } of lines) {
    if (structural) {
      for (const tag of text.matchAll(/<\/?details\b[^>]*>/gi)) {
        depth += tag[0].startsWith('</') ? -1 : 1;
      }
    }
    block.push(text);
    if (depth === 0 && structural && /<\/details\s*>/i.test(text)) {
      const body = block.join('\n')
        .replace(/^[\s\S]*?<details\b[^>]*>/i, '')
        .replace(/<\/details\s*>\s*$/i, '')
        .replace(/^\s*<summary\b[^>]*>([\s\S]*?)<\/summary\s*>/i, '### $1\n');
      if (body.trim()) hints.push(body.trim());
      block = [];
    }
  }
  // Retain plain-text hints and incomplete blocks behind the hint control as well.
  const remainder = cleanSection(block.join('\n'));
  if (remainder) hints.push(remainder);
  return hints;
}

export function splitTaskMarkdown(markdown: string): TaskMarkdown {
  const sections: Record<Section, string[]> = {
    statement: [], hints: [], solution: [], personal: [],
  };
  let section: Section = 'statement';
  let detailsDepth = 0;

  for (const { text, structural } of structuralLines(markdown)) {
    const heading = structural && detailsDepth === 0 ? text.match(/^##\s+(.+)/) : null;
    if (heading) {
      const title = heading[1];
      if (/Мо[её] решение|Мои ответы|Моя оценка/i.test(title)) {
        section = 'personal';
      } else if (/^(?:🔍\s*)?Разбор(?:\s|[—:–-]|$)/i.test(title)) {
        section = 'solution';
        continue;
      } else if (/^(?:💡\s*)?Подсказки(?:\s|[—:–-]|$)/i.test(title)) {
        section = 'hints';
        continue;
      } else if (section !== 'solution') {
        section = 'statement';
      }
    }
    sections[section].push(text);
    if (structural) {
      for (const tag of text.matchAll(/<\/?details\b[^>]*>/gi)) {
        detailsDepth = Math.max(0, detailsDepth + (tag[0].startsWith('</') ? -1 : 1));
      }
    }
  }

  return {
    statement: cleanSection(sections.statement.join('\n')),
    hints: extractHints(sections.hints.join('\n')),
    solution: cleanSection(sections.solution.join('\n')),
  };
}
