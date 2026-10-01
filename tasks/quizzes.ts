import { outputOrderQuiz } from './output-order/quiz';
import { asyncTrapsQuiz } from './async-traps/quiz';
import type { QuizDefinition } from './quiz-types';

export const quizDefinitions: readonly QuizDefinition[] = [outputOrderQuiz, asyncTrapsQuiz];
if (new Set(quizDefinitions.map(quiz => quiz.id)).size !== quizDefinitions.length) throw new Error('Повторяющийся ID мини-теста.');
for (const quiz of quizDefinitions) {
  const ids = new Set(quiz.questions.map(question => question.id));
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(quiz.id) || !quiz.questions.length || ids.size !== quiz.questions.length) throw new Error(`Некорректные вопросы: ${quiz.id}`);
  for (const question of quiz.questions) {
    const options = new Set(question.options.map(option => option.id));
    if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(question.id) || options.size !== question.options.length
      || question.options.length < 2 || !options.has(question.answerId)
      || question.options.some(option => !/^[a-z0-9][a-z0-9-]{0,79}$/.test(option.id) || !option.label)) {
      throw new Error(`Некорректный мини-тест: ${quiz.id}, вопрос ${question.id}`);
    }
  }
}
export function getQuizDefinition(id: string) { return quizDefinitions.find(quiz => quiz.id === id); }
