import type { LinkedListCase } from '../types';

export const cases: LinkedListCase[] = [
  { name: 'Пустой список', lists: [{ values: [] }], expected: { kind: 'list', values: [], reuseNodes: true, nodeOrder: [] } },
  { name: 'Один узел', lists: [{ values: [7] }], expected: { kind: 'list', values: [7], reuseNodes: true, nodeOrder: [{ list: 0, index: 0 }] } },
  { name: 'Два узла', lists: [{ values: [1, 2] }], expected: { kind: 'list', values: [2, 1], reuseNodes: true, nodeOrder: [{ list: 0, index: 1 }, { list: 0, index: 0 }] } },
  {
    name: 'Нечётная длина',
    lists: [{ values: [1, 2, 3, 4, 5] }],
    expected: { kind: 'list', values: [5, 4, 3, 2, 1], reuseNodes: true, nodeOrder: [4, 3, 2, 1, 0].map(index => ({ list: 0, index })) },
  },
  {
    name: 'Чётная длина с нулём и отрицательными',
    lists: [{ values: [-3, 0, 2, -1] }],
    expected: { kind: 'list', values: [-1, 2, 0, -3], reuseNodes: true, nodeOrder: [3, 2, 1, 0].map(index => ({ list: 0, index })) },
  },
  {
    name: 'Равные значения — разные узлы',
    lists: [{ values: [4, 4, 4, 4] }],
    expected: { kind: 'list', values: [4, 4, 4, 4], reuseNodes: true, nodeOrder: [3, 2, 1, 0].map(index => ({ list: 0, index })) },
  },
  {
    name: 'Палиндром всё равно меняет порядок узлов',
    lists: [{ values: [1, 2, 1] }],
    expected: { kind: 'list', values: [1, 2, 1], reuseNodes: true, nodeOrder: [2, 1, 0].map(index => ({ list: 0, index })) },
  },
  {
    name: 'Предельная длина и значения',
    lists: [{ values: Array.from({ length: 5000 }, (_, i) => i % 2 === 0 ? -5000 : 5000) }],
    expected: {
      kind: 'list', values: Array.from({ length: 5000 }, (_, i) => i % 2 === 0 ? 5000 : -5000),
      reuseNodes: true, nodeOrder: Array.from({ length: 5000 }, (_, i) => ({ list: 0, index: 4999 - i })),
    },
  },
];
