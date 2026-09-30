import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Нулевая база', args: [0], expected: 0 },
  { name: 'Первая база', args: [1], expected: 1 },
  { name: 'Две базы вместе', args: [2], expected: 1 },
  { name: 'Первый нетривиальный шаг', args: [3], expected: 2 },
  { name: 'Пять', args: [5], expected: 5 },
  { name: 'Десять', args: [10], expected: 55 },
  { name: 'Промежуточное значение', args: [20], expected: 6765 },
  { name: 'Большой индекс', args: [40], expected: 102334155 },
  { name: 'Верхняя граница', args: [50], expected: 12586269025 },
];
