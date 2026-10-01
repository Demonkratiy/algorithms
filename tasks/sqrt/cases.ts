import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Ноль', args: [0], expected: 0 },
  { name: 'Единица', args: [1], expected: 1 },
  { name: 'Два', args: [2], expected: 1 },
  { name: 'Первый нетривиальный квадрат', args: [4], expected: 2 },
  { name: 'Нельзя округлять к ближайшему', args: [8], expected: 2 },
  { name: 'Перед квадратом', args: [15], expected: 3 },
  { name: 'Точный квадрат', args: [16], expected: 4 },
  { name: 'Сразу после квадрата', args: [17], expected: 4 },
  { name: 'Большой точный квадрат', args: [1_000_000], expected: 1000 },
  { name: 'Перед максимальным квадратом int32', args: [2_147_395_599], expected: 46339 },
  { name: 'Максимальный квадрат int32', args: [2_147_395_600], expected: 46340 },
  { name: 'После максимального квадрата int32', args: [2_147_395_601], expected: 46340 },
  { name: 'Верхняя граница int32', args: [2_147_483_647], expected: 46340 },
];
