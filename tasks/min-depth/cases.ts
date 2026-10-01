import type { BinaryTreeCase } from '../types';

export const cases: BinaryTreeCase[] = [
  { name: 'Пустой массив', tree: [], expected: { kind: 'value', value: 0 } },
  { name: 'Пустой корень', tree: [null], expected: { kind: 'value', value: 0 } },
  { name: 'Один узел', tree: [-100], expected: { kind: 'value', value: 1 } },
  { name: 'Отсутствующий левый потомок не лист', tree: [1, null, 2], expected: { kind: 'value', value: 2 } },
  { name: 'Отсутствующий правый потомок не лист', tree: [1, 2], expected: { kind: 'value', value: 2 } },
  { name: 'Ближайший лист слева', tree: [3, 9, 20, null, null, 15, 7], expected: { kind: 'value', value: 2 } },
  { name: 'Ближайший лист справа', tree: [0, -100, 100, 4, null, null, null, 5], expected: { kind: 'value', value: 2 } },
  { name: 'Полное дерево нечётного размера', tree: [1, 2, 3, 4, 5, 6, 7], expected: { kind: 'value', value: 3 } },
  { name: 'Разреженное дерево чётного размера', tree: [0, 1, 2, null, 3, 4, null, 5], expected: { kind: 'value', value: 3 } },
  { name: 'Повторы в цепочке', tree: [1, null, 1, 1, null, null, 1], expected: { kind: 'value', value: 4 } },
  { name: 'Правая цепочка глубины 96', tree: [0, ...Array.from({ length: 95 }, (_, i) => [null, i + 1]).flat()], expected: { kind: 'value', value: 96 } },
];
