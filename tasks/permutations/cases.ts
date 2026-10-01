import type { FunctionCase } from '../types';

const boundary = [3, -2, 0, 5, 1, -4];
let boundaryExpected: number[][] = [[]];
for (const value of boundary) {
  boundaryExpected = boundaryExpected.flatMap(tuple =>
    Array.from({ length: tuple.length + 1 }, (_, i) => [...tuple.slice(0, i), value, ...tuple.slice(i)]));
}

export const cases: FunctionCase[] = [
  { name: 'Один элемент', args: [[1]], expected: [[1]] },
  { name: 'Один ноль', args: [[0]], expected: [[0]] },
  { name: 'Пара с нулём', args: [[0, 1]], expected: [[0, 1], [1, 0]] },
  { name: 'Несортированная пара', args: [[3, -2]], expected: [[3, -2], [-2, 3]] },
  { name: 'Три элемента', args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
  { name: 'Отрицательные числа и ноль', args: [[-1, 0, -2]], expected: [[-1, 0, -2], [-1, -2, 0], [0, -1, -2], [0, -2, -1], [-2, -1, 0], [-2, 0, -1]] },
  { name: 'Верхняя граница: шесть элементов', args: [boundary], expected: boundaryExpected },
];
