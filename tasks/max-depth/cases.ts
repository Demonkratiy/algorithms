import type { BinaryTreeCase } from '../types';

export const cases: BinaryTreeCase[] = [
  { name: 'Пустой массив', tree: [], expected: { kind: 'value', value: 0 } },
  { name: 'Пустой корень', tree: [null], expected: { kind: 'value', value: 0 } },
  { name: 'Один узел', tree: [0], expected: { kind: 'value', value: 1 } },
  { name: 'Единственный правый потомок', tree: [1, null, 2], expected: { kind: 'value', value: 2 } },
  { name: 'Единственный левый потомок', tree: [1, 2], expected: { kind: 'value', value: 2 } },
  { name: 'Разреженный пример', tree: [3, 9, 20, null, null, 15, 7], expected: { kind: 'value', value: 3 } },
  { name: 'Полное дерево нечётного размера', tree: [1, 2, 3, 4, 5, 6, 7], expected: { kind: 'value', value: 3 } },
  { name: 'Разная глубина ветвей и чётный размер', tree: [0, -100, 100, null, 4, null, null, 5, null, null, 6], expected: { kind: 'value', value: 5 } },
  { name: 'Одинаковые значения не означают один узел', tree: [7, 7, 7, 7, null, null, 7], expected: { kind: 'value', value: 3 } },
  { name: 'Правая цепочка глубины 96', tree: [0, ...Array.from({ length: 95 }, (_, i) => [null, i + 1]).flat()], expected: { kind: 'value', value: 96 } },
];
