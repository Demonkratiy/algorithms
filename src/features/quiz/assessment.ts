import type { QuizAnswers, QuizDefinition } from '../../../tasks/quiz-types';

export type QuizSnapshot = { answers: QuizAnswers; explanations: QuizAnswers };

export function assessQuiz(definition: QuizDefinition, answers: QuizAnswers) {
  const answered = definition.questions.filter(q => q.options.some(option => option.id === answers[q.id])).length;
  const correct = definition.questions.filter(q => answers[q.id] === q.answerId).length;
  return { answered, correct, passed: definition.questions.length > 0 && correct === definition.questions.length };
}

export function quizSnapshot(definition: QuizDefinition, answers: QuizAnswers, explanations: QuizAnswers): QuizSnapshot {
  return {
    answers: Object.fromEntries(definition.questions
      .filter(q => q.options.some(option => option.id === answers[q.id]))
      .map(q => [q.id, answers[q.id]])),
    explanations: Object.fromEntries(definition.questions
      .filter(q => explanations[q.id] !== undefined)
      .map(q => [q.id, explanations[q.id]])),
  };
}

export function isQuizSnapshotCurrent(definition: QuizDefinition, snapshot: QuizSnapshot, answers: QuizAnswers, explanations: QuizAnswers) {
  return definition.questions.every(q => (snapshot.answers[q.id] ?? '') === (answers[q.id] ?? '')
    && (snapshot.explanations[q.id] ?? '') === (explanations[q.id] ?? ''));
}
