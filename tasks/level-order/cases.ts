import type { BinaryTreeCase } from '../types';

export const cases: BinaryTreeCase[] = [
  { name: 'Пустой массив', tree: [], expected: { kind: 'value', value: [] } },
  { name: 'Пустой корень', tree: [null], expected: { kind: 'value', value: [] } },
  { name: 'Один узел', tree: [0], expected: { kind: 'value', value: [[0]] } },
  { name: 'Два узла', tree: [1, 2], expected: { kind: 'value', value: [[1], [2]] } },
  { name: 'Разреженный пример', tree: [3, 9, 20, null, null, 15, 7], expected: { kind: 'value', value: [[3], [9, 20], [15, 7]] } },
  { name: 'Порядок слева направо', tree: [1, 2, 3, 4, 5, 6, 7], expected: { kind: 'value', value: [[1], [2, 3], [4, 5, 6, 7]] } },
  { name: 'Пропуски не занимают место в уровне', tree: [1, null, 2, 3, 4, null, 5, 6], expected: { kind: 'value', value: [[1], [2], [3, 4], [5, 6]] } },
  { name: 'Повторы и отрицательные значения', tree: [0, -1, -1, 0, null, null, -2], expected: { kind: 'value', value: [[0], [-1, -1], [0, -2]] } },
  { name: 'Широкое дерево', tree: Array.from({ length: 63 }, (_, i) => i), expected: { kind: 'value', value: Array.from({ length: 6 }, (_, level) => Array.from({ length: 2 ** level }, (_, i) => 2 ** level - 1 + i)) } },
  { name: 'Правая цепочка глубины 96', tree: [0, ...Array.from({ length: 95 }, (_, i) => [null, i + 1]).flat()], expected: { kind: 'value', value: Array.from({ length: 96 }, (_, i) => [i]) } },
];
