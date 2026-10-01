import type { BinaryTreeCase } from '../types';

export const cases: BinaryTreeCase[] = [
  { name: 'Пустое дерево из примера материала', tree: [], expected: { kind: 'value', value: true } },
  { name: 'Один узел', tree: [0], expected: { kind: 'value', value: true } },
  { name: 'Корректное BST', tree: [2, 1, 3], expected: { kind: 'value', value: true } },
  { name: 'Нарушение у непосредственного потомка', tree: [5, 1, 4, null, null, 3, 6], expected: { kind: 'value', value: false } },
  { name: 'Нарушение нижней границы предка', tree: [5, 1, 6, null, null, 3, 7], expected: { kind: 'value', value: false } },
  { name: 'Нарушение верхней границы предка', tree: [10, 5, 15, null, 12], expected: { kind: 'value', value: false } },
  { name: 'Равный левый потомок запрещён', tree: [2, 2], expected: { kind: 'value', value: false } },
  { name: 'Равный правый потомок запрещён', tree: [2, null, 2], expected: { kind: 'value', value: false } },
  { name: 'Дубликат далёкого предка', tree: [5, 3, 8, null, 5], expected: { kind: 'value', value: false } },
  { name: 'Границы 32-битных значений', tree: [0, -2147483648, 2147483647], expected: { kind: 'value', value: true } },
  { name: 'Разреженное корректное дерево чётного размера', tree: [10, null, 20, 15, 30, null, 17, 25], expected: { kind: 'value', value: true } },
  { name: 'Возрастающая цепочка глубины 96', tree: [0, ...Array.from({ length: 95 }, (_, i) => [null, i + 1]).flat()], expected: { kind: 'value', value: true } },
];
