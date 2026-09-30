import { describe, expect, it } from 'vitest';
import { outputOrderQuiz } from '../../../tasks/output-order/quiz';
import { assessQuiz, isQuizSnapshotCurrent, quizSnapshot } from './assessment';

const definition = outputOrderQuiz;
const answers = Object.fromEntries(definition.questions.map(question => [question.id, question.answerId]));

describe('quiz assessment', () => {
  it('requires all six valid, correct choices; empty, partial and unknown selections cannot pass', () => {
    expect(assessQuiz(definition, {})).toEqual({ answered: 0, correct: 0, passed: false });
    expect(assessQuiz(definition, { 'snippet-1': answers['snippet-1'] })).toEqual({ answered: 1, correct: 1, passed: false });
    expect(assessQuiz(definition, { ...answers, 'snippet-1': 'unknown' })).toEqual({ answered: 5, correct: 5, passed: false });
    const wrong = definition.questions[0].options.find(option => option.id !== answers['snippet-1'])!.id;
    expect(assessQuiz(definition, { ...answers, 'snippet-1': wrong })).toEqual({ answered: 6, correct: 5, passed: false });
    expect(assessQuiz(definition, answers)).toEqual({ answered: 6, correct: 6, passed: true });
    expect(assessQuiz({ ...definition, questions: [] }, {})).toEqual({ answered: 0, correct: 0, passed: false });
  });

  it('copies answer and optional explanation snapshots without grading notes', () => {
    const draft: Record<string, string> = { ...answers, unknown: 'choice' };
    const notes = { 'snippet-1': 'A deliberately incorrect explanation', unknown: 'Ignore me' };
    const snapshot = quizSnapshot(definition, draft, notes);
    expect(snapshot.answers).toEqual(answers);
    expect(snapshot.explanations).toEqual({ 'snippet-1': notes['snippet-1'] });
    expect(assessQuiz(definition, snapshot.answers).passed).toBe(true);
    draft['snippet-1'] = 'changed';
    notes['snippet-1'] = 'changed';
    expect(snapshot.answers).toEqual(answers);
    expect(snapshot.explanations['snippet-1']).not.toBe('changed');
  });

  it('marks answer edits, clearing and note edits stale, but not key ordering or equivalent blank notes', () => {
    const snapshot = quizSnapshot(definition, answers, {});
    expect(isQuizSnapshotCurrent(definition, snapshot, Object.fromEntries(Object.entries(answers).reverse()), { 'snippet-1': '' })).toBe(true);
    expect(isQuizSnapshotCurrent(definition, snapshot, { ...answers, 'snippet-1': '' }, {})).toBe(false);
    expect(isQuizSnapshotCurrent(definition, snapshot, answers, { 'snippet-1': 'New thought' })).toBe(false);
  });
});
