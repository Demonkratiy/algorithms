import type { LinkedListCase } from '../types';

export const cases: LinkedListCase[] = [
  { name: 'Один узел', lists: [{ values: [1] }], expected: { kind: 'value', value: true } },
  { name: 'Два одинаковых значения', lists: [{ values: [0, 0] }], expected: { kind: 'value', value: true } },
  { name: 'Два разных значения', lists: [{ values: [1, 2] }], expected: { kind: 'value', value: false } },
  { name: 'Чётный палиндром', lists: [{ values: [1, 2, 2, 1] }], expected: { kind: 'value', value: true } },
  { name: 'Нечётный палиндром', lists: [{ values: [1, 2, 3, 2, 1] }], expected: { kind: 'value', value: true } },
  { name: 'Три узла, центр не сравнивается', lists: [{ values: [9, 0, 9] }], expected: { kind: 'value', value: true } },
  { name: 'Совпадают края, но не внутренняя пара', lists: [{ values: [1, 2, 3, 1] }], expected: { kind: 'value', value: false } },
  { name: 'Нечётная длина с несовпадением внутри', lists: [{ values: [1, 2, 0, 3, 1] }], expected: { kind: 'value', value: false } },
  { name: 'Повторы не гарантируют палиндром', lists: [{ values: [1, 1, 1, 2] }], expected: { kind: 'value', value: false } },
  { name: 'Длинный палиндром с повторами', lists: [{ values: [...Array.from({ length: 128 }, (_, i) => i % 10), ...Array.from({ length: 128 }, (_, i) => (127 - i) % 10)] }], expected: { kind: 'value', value: true } },
];
