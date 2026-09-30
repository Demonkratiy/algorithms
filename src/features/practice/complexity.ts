import type { ComplexityChoices, ComplexityDefinition } from '../../../tasks/types';
import type { RunResult } from '../../lib/runner';

export type ComplexitySnapshot = {
  code: string;
  choices: ComplexityChoices;
  status: RunResult['status'];
};
export function compareComplexity(definition: ComplexityDefinition, choices: ComplexityChoices) {
  return definition.criteria.map(criterion => {
    const selected = definition.options.find(option => option.id === choices[criterion.id]);
    const expected = definition.options.find(option => option.id === criterion.expected);
    if (!expected) throw new Error(`Нет целевого варианта сложности для ${criterion.id}.`);
    return {
      ...criterion,
      selected: selected?.label ?? 'Не выбрано',
      expected: expected.label,
      outcome: !selected || selected.id === 'unknown' ? 'unanswered'
        : selected.id === criterion.expected ? 'match' : 'different',
    } as const;
  });
}
export function complexityFeedback(
  definition: ComplexityDefinition,
  code: string,
  choices: ComplexityChoices,
  snapshot: ComplexitySnapshot,
) {
  if (snapshot.status !== 'passed') return { kind: 'blocked' } as const;
  if (snapshot.code !== code || definition.criteria.some(criterion =>
    snapshot.choices[criterion.id] !== choices[criterion.id])) {
    return { kind: 'stale' } as const;
  }
  const comparisons = compareComplexity(definition, snapshot.choices);
  const kind = comparisons.some(item => item.outcome === 'unanswered') ? 'incomplete'
    : comparisons.every(item => item.outcome === 'match') ? 'match' : 'different';
  return { kind, comparisons } as const;
}
