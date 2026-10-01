import { describe, expect, it } from 'vitest';
import { rangeSumTask } from '../../../tasks/range-sum-query/task';
import { compareComplexity, complexityFeedback, type ComplexitySnapshot } from './complexity';

const definition = rangeSumTask.complexity;
const choices = {
  'build-time': 'linear', 'build-space': 'linear',
  'query-time': 'constant', 'query-space': 'constant',
};
const snapshot: ComplexitySnapshot = { code: 'code', choices, status: 'passed' };

describe('complexity self-assessment', () => {
  it('compares all four time/space targets from task metadata', () => {
    expect(definition.criteria).toHaveLength(4);
    expect(new Set(definition.criteria.map(item => item.id)).size).toBe(4);
    expect(compareComplexity(definition, choices).every(item => item.outcome === 'match')).toBe(true);
    expect(complexityFeedback(definition, 'code', choices, snapshot).kind).toBe('match');
  });
  it('missing choices and explicit uncertainty are incomplete, not incorrect', () => {
    expect(complexityFeedback(definition, 'code', {}, { ...snapshot, choices: {} }).kind).toBe('incomplete');
    const uncertain = { ...choices, 'query-time': 'unknown' };
    const feedback = complexityFeedback(definition, 'code', uncertain, { ...snapshot, choices: uncertain });
    expect(feedback.kind).toBe('incomplete');
    expect(compareComplexity(definition, uncertain)[2].outcome).toBe('unanswered');
  });
  it('recognizes a different target without asserting the code has that complexity', () => {
    const different = { ...choices, 'build-time': 'constant' };
    const result = complexityFeedback(definition, 'code', different, { ...snapshot, choices: different });
    expect(result.kind).toBe('different');
    expect(compareComplexity(definition, different)[0]).toMatchObject({ selected: 'O(1)', expected: 'O(N)' });
  });
  it('invalidates the comparison when code or a choice changes after the run snapshot', () => {
    expect(complexityFeedback(definition, 'new code', choices, snapshot).kind).toBe('stale');
    expect(complexityFeedback(definition, 'code', { ...choices, 'query-time': 'linear' }, snapshot).kind).toBe('stale');
  });
  it.each(['failed', 'error', 'timeout', 'cancelled'] as const)('does not compare after %s', status => {
    expect(complexityFeedback(definition, 'new code', choices, { ...snapshot, status }).kind).toBe('blocked');
  });
  it('does not treat an obsolete stored option as a valid answer', () => {
    expect(compareComplexity(definition, { ...choices, 'build-time': 'obsolete' })[0].outcome).toBe('unanswered');
  });
  it('accepts explicitly documented alternative goals', () => {
    const alternative = {
      ...definition,
      criteria: definition.criteria.map((criterion, index) => index === 0
        ? { ...criterion, accepted: ['constant'] } : criterion),
    };
    const selected = { ...choices, 'build-time': 'constant' };
    expect(compareComplexity(alternative, selected)[0]).toMatchObject({
      expected: 'O(N) или O(1)', outcome: 'match',
    });
  });
});
