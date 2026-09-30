import type { BinaryTreeCase } from '../types';

const example = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4];

export const cases: BinaryTreeCase[] = [
  { name: 'Разные ветви без свойства BST', tree: [...example], nodeArgs: [1, 2], expected: { kind: 'node', index: 0 } },
  { name: 'p — предок q', tree: [...example], nodeArgs: [1, 10], expected: { kind: 'node', index: 1 } },
  { name: 'q — предок p', tree: [...example], nodeArgs: [10, 1], expected: { kind: 'node', index: 1 } },
  { name: 'Два глубоких листа', tree: [...example], nodeArgs: [9, 10], expected: { kind: 'node', index: 4 } },
  { name: 'Оба справа', tree: [...example], nodeArgs: [5, 6], expected: { kind: 'node', index: 2 } },
  { name: 'Два узла, один из них корень', tree: [1, 2], nodeArgs: [0, 1], expected: { kind: 'node', index: 0 } },
  { name: 'Аргументы в обратном порядке', tree: [...example], nodeArgs: [2, 1], expected: { kind: 'node', index: 0 } },
  { name: 'Разреженное дерево чётного размера', tree: [1, null, 2, 3, 4, null, 5, 6], nodeArgs: [6, 7], expected: { kind: 'node', index: 2 } },
  { name: 'Значения обманчиво указывают в одну сторону', tree: [10, 20, 30, 40, 50], nodeArgs: [3, 4], expected: { kind: 'node', index: 1 } },
  { name: 'Отрицательные значения без порядка', tree: [-10, 0, -20, -5, 10], nodeArgs: [3, 4], expected: { kind: 'node', index: 1 } },
  { name: 'Правая цепочка глубины 96', tree: [0, ...Array.from({ length: 95 }, (_, i) => [null, i + 1]).flat()], nodeArgs: [80, 190], expected: { kind: 'node', index: 80 } },
];
