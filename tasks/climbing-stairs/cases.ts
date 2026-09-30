import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Одна ступенька', args: [1], expected: 1 },
  { name: 'Две ступеньки — не F(2)', args: [2], expected: 2 },
  { name: 'Порядок шагов имеет значение', args: [3], expected: 3 },
  { name: 'Четыре ступеньки', args: [4], expected: 5 },
  { name: 'Обновление двух состояний', args: [5], expected: 8 },
  { name: 'Десять ступенек', args: [10], expected: 89 },
  { name: 'Средняя лестница', args: [20], expected: 10946 },
  { name: 'Большая лестница', args: [40], expected: 165580141 },
  { name: 'Верхняя граница n', args: [45], expected: 1836311903 },
];
