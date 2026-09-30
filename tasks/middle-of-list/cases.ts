import type { LinkedListCase } from '../types';

export const cases: LinkedListCase[] = [
  { name: 'Один узел — сама голова', lists: [{ values: [1] }], expected: { kind: 'node', node: { list: 0, index: 0 } } },
  { name: 'Два узла — второй', lists: [{ values: [1, 2] }], expected: { kind: 'node', node: { list: 0, index: 1 } } },
  { name: 'Три узла', lists: [{ values: [1, 2, 3] }], expected: { kind: 'node', node: { list: 0, index: 1 } } },
  { name: 'Пять узлов', lists: [{ values: [1, 2, 3, 4, 5] }], expected: { kind: 'node', node: { list: 0, index: 2 } } },
  { name: 'Шесть узлов — вторая середина', lists: [{ values: [1, 2, 3, 4, 5, 6] }], expected: { kind: 'node', node: { list: 0, index: 3 } } },
  { name: 'Все значения равны, важна ссылка', lists: [{ values: [7, 7, 7, 7] }], expected: { kind: 'node', node: { list: 0, index: 2 } } },
  { name: 'Середина повторяет значение головы', lists: [{ values: [3, 8, 3, 8, 3] }], expected: { kind: 'node', node: { list: 0, index: 2 } } },
  { name: 'Предельные сто узлов', lists: [{ values: Array.from({ length: 100 }, (_, i) => i % 10) }], expected: { kind: 'node', node: { list: 0, index: 50 } } },
];
