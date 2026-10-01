import type { LinkedListCase } from '../types';

export const cases: LinkedListCase[] = [
  { name: 'Чередование с дубликатами', lists: [{ values: [1, 2, 4] }, { values: [1, 3, 4] }], expected: { kind: 'list', values: [1, 1, 2, 3, 4, 4], reuseNodes: true } },
  { name: 'Оба списка пусты', lists: [{ values: [] }, { values: [] }], expected: { kind: 'list', values: [], reuseNodes: true } },
  { name: 'Первый список пуст', lists: [{ values: [] }, { values: [0] }], expected: { kind: 'list', values: [0], reuseNodes: true } },
  { name: 'Второй список пуст', lists: [{ values: [-2, 0, 3] }, { values: [] }], expected: { kind: 'list', values: [-2, 0, 3], reuseNodes: true } },
  { name: 'Независимые одиночные узлы равного значения', lists: [{ values: [7] }, { values: [7] }], expected: { kind: 'list', values: [7, 7], reuseNodes: true } },
  { name: 'Остаток первого списка', lists: [{ values: [1, 5, 9, 11] }, { values: [2, 3] }], expected: { kind: 'list', values: [1, 2, 3, 5, 9, 11], reuseNodes: true } },
  { name: 'Остаток второго списка', lists: [{ values: [2, 3] }, { values: [1, 5, 9, 11] }], expected: { kind: 'list', values: [1, 2, 3, 5, 9, 11], reuseNodes: true } },
  { name: 'Отрицательные числа и нули', lists: [{ values: [-9, -3, 0, 0] }, { values: [-8, -3, 0, 10] }], expected: { kind: 'list', values: [-9, -8, -3, -3, 0, 0, 0, 10], reuseNodes: true } },
  { name: 'Равные значения допускают любой порядок между списками', lists: [{ values: [2, 2, 2] }, { values: [2, 2] }], expected: { kind: 'list', values: [2, 2, 2, 2, 2], reuseNodes: true } },
  {
    name: 'Два списка предельной длины',
    lists: [{ values: Array.from({ length: 50 }, (_, i) => 2 * i) }, { values: Array.from({ length: 50 }, (_, i) => 2 * i + 1) }],
    expected: { kind: 'list', values: Array.from({ length: 100 }, (_, i) => i), reuseNodes: true },
  },
];
