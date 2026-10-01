import type { BinaryTreeCase } from '../types';

export const cases: BinaryTreeCase[] = [
  { name: 'Пустой массив', tree: [], expected: { kind: 'tree', values: [], reuseNodes: true } },
  { name: 'Пустой корень', tree: [null], expected: { kind: 'tree', values: [], reuseNodes: true } },
  { name: 'Один узел', tree: [0], expected: { kind: 'tree', values: [0], reuseNodes: true } },
  { name: 'Левый потомок', tree: [1, 2], expected: { kind: 'tree', values: [1, null, 2], reuseNodes: true } },
  { name: 'Правый потомок', tree: [1, null, 2], expected: { kind: 'tree', values: [1, 2], reuseNodes: true } },
  { name: 'Полное дерево', tree: [4, 2, 7, 1, 3, 6, 9], expected: { kind: 'tree', values: [4, 7, 2, 9, 6, 3, 1], reuseNodes: true } },
  { name: 'Разреженное дерево чётного размера', tree: [1, null, 2, 3, 4, null, 5, 6], expected: { kind: 'tree', values: [1, 2, null, 4, 3, null, 6, 5], reuseNodes: true } },
  { name: 'Повторы и отрицательные значения', tree: [0, -1, -1, 0, null, null, -2], expected: { kind: 'tree', values: [0, -1, -1, -2, null, null, 0], reuseNodes: true } },
  { name: 'Правая цепочка глубины 64', tree: [0, ...Array.from({ length: 63 }, (_, i) => [null, i + 1]).flat()], expected: { kind: 'tree', values: [0, ...Array.from({ length: 63 }, (_, i) => [i + 1, null]).flat()].slice(0, -1), reuseNodes: true } },
];
