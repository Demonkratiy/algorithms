import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { asyncTrapsQuiz } from '../../../tasks/async-traps/quiz';
import { outputOrderQuiz } from '../../../tasks/output-order/quiz';
import { getMarkdown } from '../../lib/content';
import { parseQuizMarkdown } from './content';
import { QuizQuestion } from './QuizQuestion';

for (const [definition, file] of [[outputOrderQuiz, '01-output-order.md'], [asyncTrapsQuiz, '02-async-traps.md']] as const) {
  it(`${definition.id}: rendering never mounts analysis before an explicit answered snapshot`, async () => {
    const path = `practice/08-js-interview/03-event-loop/${file}`;
    const contents = parseQuizMarkdown(await getMarkdown(path), definition);
    for (const [index, content] of contents.entries()) {
      const question = definition.questions[index];
      function render(answer: string, checkedAnswer?: string) {
        return renderToStaticMarkup(createElement(MemoryRouter, null, createElement(QuizQuestion, {
          question, content, path, answer, checkedAnswer, explanation: '',
          onAnswer: () => {}, onExplanation: () => {},
        })));
      }
      const untouched = render('');
      expect(untouched).not.toContain('checked=""');
      expect(untouched).not.toContain('quiz-explanation');
      expect(untouched).not.toContain('Правильный вариант:');
      expect(untouched).toContain('<pre>');
      const selected = render(question.options[0].id);
      expect(selected).toContain('checked=""');
      expect(selected).not.toContain('quiz-explanation');
      const checked = render(question.answerId, question.answerId);
      expect(checked).toContain('quiz-explanation');
      expect(checked).toContain('Правильный вариант:');
      expect(checked).toContain('Верно.');
      const wrong = question.options.find(option => option.id !== question.answerId)!.id;
      expect(render(wrong, wrong)).toContain('Ответ не совпал.');
      expect(render(wrong)).not.toContain('quiz-explanation');
    }
  });
}
