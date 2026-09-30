import type { LinkedListCase } from '../types';
import { cycleScenarios } from '../linked-list-cycle/cases';

export const cases: LinkedListCase[] = cycleScenarios.map(({ name, list, entry }) => ({
  name,
  lists: [list],
  expected: { kind: 'node', node: entry === null ? null : { list: 0, index: entry } },
}));
