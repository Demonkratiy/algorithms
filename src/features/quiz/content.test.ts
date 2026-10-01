import { describe, expect, it } from 'vitest';
import { outputOrderQuiz } from '../../../tasks/output-order/quiz';
import { asyncTrapsQuiz } from '../../../tasks/async-traps/quiz';
import { getMarkdown } from '../../lib/content';
import { parseQuizMarkdown } from './content';

const sources = [
  [outputOrderQuiz, '01-output-order.md'],
  [asyncTrapsQuiz, '02-async-traps.md'],
] as const;

describe('quiz source and metadata', () => {
  for (const [definition, file] of sources) {
    it(`${definition.id}: six unique choices and explanations from the existing Markdown`, async () => {
      const markdown = await getMarkdown(`practice/08-js-interview/03-event-loop/${file}`);
      const parsed = parseQuizMarkdown(markdown, definition);
      expect(parsed.map(q => q.id)).toEqual(Array.from({ length: 6 }, (_, i) => `snippet-${i + 1}`));
      expect(new Set(definition.questions.map(q => q.options.findIndex(option => option.id === q.answerId))).size).toBeGreaterThan(1);
      for (const [index, content] of parsed.entries()) {
        const question = definition.questions[index];
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(question.options.length).toBeLessThanOrEqual(4);
        expect(new Set(question.options.map(option => option.label)).size).toBe(question.options.length);
        expect(question.options.filter(option => option.id === question.answerId)).toHaveLength(1);
        expect(content.statement).toContain('```js');
        expect(markdown.replace(/\r\n/g, '\n')).toContain(content.statement);
        expect(markdown.replace(/\r\n/g, '\n')).toContain(content.explanation);
        expect(content.statement).not.toMatch(/<details|<summary|\*\*Ответ:|Мои ответы|Правило:|Как исправить/);
        expect(content.explanation).not.toContain('<summary>');
      }
    });
  }

  it('each complete output option agrees exactly with the Markdown answer, without retyping source code', async () => {
    const parsed = parseQuizMarkdown(await getMarkdown('practice/08-js-interview/03-event-loop/01-output-order.md'), outputOrderQuiz);
    for (const [index, content] of parsed.entries()) {
      const question = outputOrderQuiz.questions[index];
      const line = content.explanation.match(/^\*\*Ответ:\*\* (.+)$/m)![1];
      const expected = [...line.matchAll(/`([^`]+)`/g)].map(match => match[1]);
      expect(question.options.find(option => option.id === question.answerId)!.label.split(' → ')).toEqual(expected);
      for (const option of question.options) {
        expect(option.label.split(' → ')).toHaveLength(expected.length);
      }
    }
  });

  it('async metadata matches the six source diagnoses, including valid and redundant code', async () => {
    const parsed = parseQuizMarkdown(await getMarkdown('practice/08-js-interview/03-event-loop/02-async-traps.md'), asyncTrapsQuiz);
    const sourceEvidence = [
      /не ждёт завершения запросов/, /код \*\*правильный\*\*/, /не обязательно функциональный баг/,
      /Синхронное исключение самого вызова он поймает/, /Гонка при повторных кликах/,
      /Состояние в момент `console.log`/,
    ];
    const optionEvidence = [/forEach игнорирует/, /Код корректен/, /избыточна, а не сломана/, /синхронный throw этот try поймает/, /finally/, /В момент console.log массив пуст/];
    parsed.forEach((content, index) => {
      expect(content.explanation).toMatch(sourceEvidence[index]);
      const question = asyncTrapsQuiz.questions[index];
      expect(question.options.find(option => option.id === question.answerId)!.label).toMatch(optionEvidence[index]);
    });
  });
});

describe('parseQuizMarkdown boundaries', () => {
  const definition = { ...outputOrderQuiz, questions: [outputOrderQuiz.questions[0]] };
  const source = [
    '# Task', '## Сниппет 1 — sample', '```js', 'const text = `',
    '## Сниппет 9', '## 🔍 Разбор', '<details>', '<summary>Сниппет 9</summary>', '</details>', '`;', '```',
    '---', '## ✍️ Мои ответы', 'PRIVATE',
    '## 🔍 Разбор', '<details>', '<summary>Сниппет 1</summary>', 'EXPLANATION',
    '~~~~js', '</details>', '## Сниппет 2', '~~~', '~~~~',
    '<details><summary>Nested</summary>Nested detail</details>', '</details>',
    '<details>', '<summary>Итог</summary>', 'UNRELATED', '</details>',
  ].join('\r\n');

  it('preserves fences and nested details, excludes personal notes and unrelated analyses', () => {
    const [result] = parseQuizMarkdown(source, definition);
    expect(result.statement).toContain('## 🔍 Разбор\n<details>');
    expect(result.statement).not.toContain('EXPLANATION');
    expect(result.explanation).toContain('~~~~js\n</details>\n## Сниппет 2\n~~~\n~~~~');
    expect(result.explanation).toContain('<details><summary>Nested</summary>Nested detail</details>');
    expect(JSON.stringify(result)).not.toMatch(/PRIVATE|UNRELATED/);
  });

  it('rejects missing, duplicate or unclosed material instead of showing the raw source', () => {
    expect(() => parseQuizMarkdown('', definition)).toThrow();
    expect(() => parseQuizMarkdown(source.replace('<summary>Сниппет 1</summary>', '<summary>Other</summary>'), definition)).toThrow();
    expect(() => parseQuizMarkdown(source + '\r\n<details>', definition)).toThrow(/Незакрытый/);
    expect(() => parseQuizMarkdown(source.replace('## ✍️ Мои ответы', '## Сниппет 1'), definition)).toThrow(/Повтор/);
    expect(() => parseQuizMarkdown(source + '\r\n<details>\r\n<summary>Сниппет 1</summary>\r\nDuplicate\r\n</details>', definition)).toThrow(/Повтор/);
  });

  it('rejects invalid metadata and missing code fences', () => {
    expect(() => parseQuizMarkdown(source, { ...definition, questions: [{ ...definition.questions[0], answerId: 'missing' }] })).toThrow();
    expect(() => parseQuizMarkdown(source, { ...definition, questions: [definition.questions[0], definition.questions[0]] })).toThrow();
    expect(() => parseQuizMarkdown(source.replace('```js', '```text'), definition)).toThrow();
  });
});
