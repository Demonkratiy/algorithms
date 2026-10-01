import type { LinkedListCase } from '../types';

export const cases: LinkedListCase[] = [
  { name: 'Удаление единственного узла', lists: [{ values: [1] }], args: [1], expected: { kind: 'list', values: [], reuseNodes: true, nodeOrder: [] } },
  { name: 'Удаление головы из двух узлов', lists: [{ values: [1, 2] }], args: [2], expected: { kind: 'list', values: [2], reuseNodes: true, nodeOrder: [{ list: 0, index: 1 }] } },
  { name: 'Удаление хвоста из двух узлов', lists: [{ values: [1, 2] }], args: [1], expected: { kind: 'list', values: [1], reuseNodes: true, nodeOrder: [{ list: 0, index: 0 }] } },
  { name: 'Предпоследний узел', lists: [{ values: [1, 2, 3, 4, 5] }], args: [2], expected: { kind: 'list', values: [1, 2, 3, 5], reuseNodes: true, nodeOrder: [0, 1, 2, 4].map(index => ({ list: 0, index })) } },
  { name: 'Голова длинного списка', lists: [{ values: [1, 2, 3, 4, 5] }], args: [5], expected: { kind: 'list', values: [2, 3, 4, 5], reuseNodes: true, nodeOrder: [1, 2, 3, 4].map(index => ({ list: 0, index })) } },
  { name: 'Хвост длинного списка', lists: [{ values: [1, 2, 3, 4, 5] }], args: [1], expected: { kind: 'list', values: [1, 2, 3, 4], reuseNodes: true, nodeOrder: [0, 1, 2, 3].map(index => ({ list: 0, index })) } },
  { name: 'Равные значения не заменяют нужную ссылку', lists: [{ values: [7, 7, 7, 7] }], args: [3], expected: { kind: 'list', values: [7, 7, 7], reuseNodes: true, nodeOrder: [0, 2, 3].map(index => ({ list: 0, index })) } },
  { name: 'Удаление центрального узла', lists: [{ values: [0, 2, 9, 2, 0] }], args: [3], expected: { kind: 'list', values: [0, 2, 2, 0], reuseNodes: true, nodeOrder: [0, 1, 3, 4].map(index => ({ list: 0, index })) } },
  {
    name: 'Предельная длина, удаление второго узла',
    lists: [{ values: Array.from({ length: 30 }, (_, i) => i) }], args: [29],
    expected: {
      kind: 'list', values: Array.from({ length: 30 }, (_, i) => i).filter(i => i !== 1), reuseNodes: true,
      nodeOrder: Array.from({ length: 30 }, (_, index) => ({ list: 0, index })).filter(node => node.index !== 1),
    },
  },
];
