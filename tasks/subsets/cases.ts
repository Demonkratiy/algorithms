import type { FunctionCase } from '../types';

const boundary = Array.from({ length: 10 }, (_, i) => i - 5);
const boundaryExpected = Array.from({ length: 2 ** boundary.length }, (_, mask) =>
  boundary.filter((_, i) => (mask & (1 << i)) !== 0));

export const cases: FunctionCase[] = [
  { name: 'Пустой вход из примера материала', args: [[]], expected: [[]] },
  { name: 'Один ноль', args: [[0]], expected: [[], [0]] },
  { name: 'Одно отрицательное число', args: [[-3]], expected: [[], [-3]] },
  { name: 'Два числа', args: [[1, 2]], expected: [[], [1], [2], [1, 2]] },
  { name: 'Три числа', args: [[1, 2, 3]], expected: [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]] },
  { name: 'Несортированные числа и ноль', args: [[2, -1, 0]], expected: [[], [2], [-1], [0], [2, -1], [2, 0], [-1, 0], [2, -1, 0]] },
  { name: 'Верхняя граница длины', args: [boundary], expected: boundaryExpected },
];
