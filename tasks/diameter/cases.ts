import type { BinaryTreeCase } from '../types';

export const cases: BinaryTreeCase[] = [
  { name: 'Пустое дерево из примера материала', tree: [], expected: { kind: 'value', value: 0 } },
  { name: 'Один узел — ноль рёбер', tree: [1], expected: { kind: 'value', value: 0 } },
  { name: 'Два узла — одно ребро', tree: [1, 2], expected: { kind: 'value', value: 1 } },
  { name: 'Пример материала', tree: [1, 2, 3, 4, 5], expected: { kind: 'value', value: 3 } },
  { name: 'Полное дерево', tree: [1, 2, 3, 4, 5, 6, 7], expected: { kind: 'value', value: 4 } },
  { name: 'Диаметр не проходит через корень', tree: [1, 2, null, 3, 4, 5, null, null, 6, 7, null, null, 8], expected: { kind: 'value', value: 6 } },
  { name: 'Разреженное дерево чётного размера', tree: [1, null, 2, 3, 4, null, 5, 6], expected: { kind: 'value', value: 4 } },
  { name: 'Повторяющиеся значения', tree: [1, 1, 1, 1, null, null, 1], expected: { kind: 'value', value: 4 } },
  { name: 'Правая цепочка глубины 96', tree: [0, ...Array.from({ length: 95 }, (_, i) => [null, i + 1]).flat()], expected: { kind: 'value', value: 95 } },
];
