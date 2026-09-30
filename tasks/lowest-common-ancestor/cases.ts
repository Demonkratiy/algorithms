import type { BinaryTreeCase } from '../types';

const example = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5];

export const cases: BinaryTreeCase[] = [
  { name: 'Узлы в разных ветвях', tree: [...example], nodeArgs: [1, 2], expected: { kind: 'node', index: 0 } },
  { name: 'p — предок q', tree: [...example], nodeArgs: [1, 4], expected: { kind: 'node', index: 1 } },
  { name: 'q — предок p', tree: [...example], nodeArgs: [10, 1], expected: { kind: 'node', index: 1 } },
  { name: 'Оба глубоко слева', tree: [...example], nodeArgs: [9, 10], expected: { kind: 'node', index: 4 } },
  { name: 'Оба справа', tree: [...example], nodeArgs: [5, 6], expected: { kind: 'node', index: 2 } },
  { name: 'Два узла, один из них корень', tree: [2, 1], nodeArgs: [0, 1], expected: { kind: 'node', index: 0 } },
  { name: 'Аргументы в обратном порядке', tree: [...example], nodeArgs: [2, 1], expected: { kind: 'node', index: 0 } },
  { name: 'Разреженное BST чётного размера', tree: [10, null, 20, 15, 30, null, 17, 25], nodeArgs: [6, 7], expected: { kind: 'node', index: 2 } },
  { name: 'Отрицательные значения', tree: [0, -10, 10, -20, -5], nodeArgs: [3, 4], expected: { kind: 'node', index: 1 } },
  { name: 'Правая цепочка глубины 96', tree: [0, ...Array.from({ length: 95 }, (_, i) => [null, i + 1]).flat()], nodeArgs: [80, 190], expected: { kind: 'node', index: 80 } },
];
