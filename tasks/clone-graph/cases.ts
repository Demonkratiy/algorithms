import type { GraphCloneCase } from '../types';

export const cases: GraphCloneCase[] = [
  { name: 'Пустой граф', adjacency: [] },
  { name: 'Изолированный узел', adjacency: [[]] },
  { name: 'Изолированный узел со значением 100', adjacency: [[]], values: [100] },
  { name: 'Одно двустороннее ребро', adjacency: [[2], [1]] },
  { name: 'Квадрат с циклом', adjacency: [[2, 4], [1, 3], [2, 4], [1, 3]] },
  { name: 'Ромб с общей вершиной', adjacency: [[2, 3], [1, 4], [1, 4], [2, 3]], values: [7, 42, 3, 99], start: 2 },
  { name: 'Звезда, корень в листе', adjacency: [[2, 3, 4, 5], [1], [1], [1], [1]], start: 4 },
  { name: 'Клика из пяти узлов', adjacency: Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) => j + 1).filter(j => j !== i + 1)),
    values: [91, 4, 50, 12, 78], start: 1 },
  { name: 'Цепочка из ста узлов, корень в конце', adjacency: Array.from({ length: 100 }, (_, i) =>
    [i, i + 2].filter(position => position >= 1 && position <= 100)), start: 99 },
];
