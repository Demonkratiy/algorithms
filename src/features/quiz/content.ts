import type { QuizDefinition } from '../../../tasks/quiz-types';
import { splitTaskMarkdown } from '../../lib/content';

export type QuizContent = { id: string; title: string; statement: string; explanation: string };

function lines(markdown: string) {
  let fence = '';
  return markdown.replace(/\r\n?/g, '\n').split('\n').map(text => {
    const marker = text.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length
        && !text.slice(marker[0].length).trim()) fence = '';
      return { text, structural: false };
    }
    if (marker) { fence = marker[1]; return { text, structural: false }; }
    return { text, structural: true };
  });
}

const clean = (text: string) => text.trim().replace(/(?:\n\s*---\s*)+$/, '').trim();

// Fail closed: a content edit must never put an analysis block into the question.
export function parseQuizMarkdown(markdown: string, definition: QuizDefinition): QuizContent[] {
  const { statement, solution } = splitTaskMarkdown(markdown);
  const snippets = new Map<string, { title: string; body: string[] }>();
  let current: { title: string; body: string[] } | undefined;
  for (const line of lines(statement)) {
    const heading = line.structural && line.text.match(/^##\s+Сниппет\s+(\d+)\b(.*)$/);
    if (heading) {
      const id = `snippet-${heading[1]}`;
      if (snippets.has(id)) throw new Error(`Повтор сниппета: ${id}`);
      current = { title: `Сниппет ${heading[1]}${heading[2]}`, body: [] };
      snippets.set(id, current);
    } else if (line.structural && /^##\s/.test(line.text)) {
      current = undefined;
    } else current?.body.push(line.text);
  }

  const explanations = new Map<string, string>();
  let depth = 0;
  let body: string[] = [];
  let id: string | undefined;
  for (const line of lines(solution)) {
    if (line.structural && depth === 0 && /^\s*<details\b[^>]*>\s*$/i.test(line.text)) {
      depth = 1; body = []; id = undefined; continue;
    }
    if (!depth) continue;
    if (line.structural && depth === 1) {
      const summary = line.text.match(/^\s*<summary[^>]*>Сниппет\s+(\d+)\b.*<\/summary>\s*$/i);
      if (summary) { id = `snippet-${summary[1]}`; continue; }
    }
    if (line.structural) {
      for (const tag of line.text.matchAll(/<\/?details\b[^>]*>/gi)) {
        depth += /^<\//.test(tag[0]) ? -1 : 1;
      }
    }
    if (depth === 0) {
      if (id) {
        if (explanations.has(id)) throw new Error(`Повтор разбора: ${id}`);
        explanations.set(id, clean(body.join('\n')));
      }
      continue;
    }
    body.push(line.text);
  }
  if (depth) throw new Error('Незакрытый блок разбора.');
  const ids = new Set(definition.questions.map(question => question.id));
  if (ids.size !== definition.questions.length || !ids.size || snippets.size !== ids.size
    || explanations.size !== ids.size) throw new Error('Состав квиза не совпадает с Markdown.');
  return definition.questions.map(question => {
    const snippet = snippets.get(question.id);
    const explanation = explanations.get(question.id);
    const optionIds = new Set(question.options.map(option => option.id));
    if (!snippet || !explanation || !snippet.body.some(text => /^\s*(`{3,}|~{3,})js\s*$/.test(text))
      || question.options.length < 2 || optionIds.size !== question.options.length
      || !optionIds.has(question.answerId) || question.options.some(option => !option.label.trim())) {
      throw new Error(`Неполный материал квиза: ${question.id}`);
    }
    return { id: question.id, title: snippet.title, statement: clean(snippet.body.join('\n')), explanation };
  });
}
