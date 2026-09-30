import type { LinkedListCase, ListInput } from '../types';

const scenarios: { name: string; list: ListInput; entry: number | null }[] = [
  { name: 'Пустой список', list: { values: [] }, entry: null },
  { name: 'Один узел без цикла', list: { values: [1], cycleAt: -1 }, entry: null },
  { name: 'Один узел ссылается на себя', list: { values: [1], cycleAt: 0 }, entry: 0 },
  { name: 'Повторяющиеся значения без цикла', list: { values: [2, 2, 2, 2] }, entry: null },
  { name: 'Вход в цикл после головы', list: { values: [3, 2, 0, -4], cycleAt: 1 }, entry: 1 },
  { name: 'Два узла, цикл с головы', list: { values: [1, 2], cycleAt: 0 }, entry: 0 },
  { name: 'Хвост ссылается на себя', list: { values: [5, 6, 7], cycleAt: 2 }, entry: 2 },
  { name: 'Длинный префикс и короткий цикл', list: { values: [0, 1, 2, 3, 4, 5, 6, 7], cycleAt: 6 }, entry: 6 },
  { name: 'Вход и голова имеют равные значения', list: { values: [4, 8, 4, 8, 4, 8], cycleAt: 2 }, entry: 2 },
  { name: 'Многоузловой цикл одинаковых значений', list: { values: [9, 9, 9, 9, 9], cycleAt: 1 }, entry: 1 },
];

export const cases: LinkedListCase[] = [
  ...scenarios.map(({ name, list, entry }): LinkedListCase => ({
    name: `A · ${name}`, lists: [list], expected: { kind: 'value', value: entry !== null },
  })),
  ...scenarios.map(({ name, list, entry }): LinkedListCase => ({
    name: `B · ${name}`, lists: [list], entryPoint: 'detectCycle',
    expected: { kind: 'node', node: entry === null ? null : { list: 0, index: entry } },
  })),
];
