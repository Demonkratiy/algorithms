import type { FunctionCase } from '../types';

const ascending = Array.from({ length: 1024 }, (_, i) => i - 512);
const rotated = [...ascending.slice(257), ...ascending.slice(0, 257)];

export const cases: FunctionCase[] = [
  { name: 'Цель на pivot', args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
  { name: 'Отсутствующая цель', args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
  { name: 'Цель в левой части', args: [[4, 5, 6, 7, 0, 1, 2], 5], expected: 1 },
  { name: 'Цель в конце правой части', args: [[4, 5, 6, 7, 0, 1, 2], 2], expected: 6 },
  { name: 'Один элемент — совпадение', args: [[1], 1], expected: 0 },
  { name: 'Один элемент — промах', args: [[1], 0], expected: -1 },
  { name: 'Два элемента — минимум справа', args: [[3, 1], 1], expected: 1 },
  { name: 'Два элемента — максимум слева', args: [[3, 1], 3], expected: 0 },
  { name: 'Нулевой сдвиг — последний элемент', args: [[1, 2, 3, 4, 5], 5], expected: 4 },
  { name: 'Pivot сразу после первого', args: [[5, 1, 2, 3, 4], 1], expected: 1 },
  { name: 'Pivot на последнем элементе', args: [[2, 3, 4, 5, 1], 1], expected: 4 },
  { name: 'Отрицательные значения', args: [[0, 4, -8, -5, -2], -5], expected: 3 },
  { name: 'Большой массив — правая граница', args: [rotated, -256], expected: 1023 },
];
