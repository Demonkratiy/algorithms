import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Нулевая степень', args: [2, 0], expected: 1 },
  { name: 'Ноль в нулевой степени', args: [0, 0], expected: 1 },
  { name: 'Нулевое основание', args: [0, 5], expected: 0 },
  { name: 'Степень один', args: [7, 1], expected: 7 },
  { name: 'Нечётная степень', args: [2, 5], expected: 32 },
  { name: 'Чётная степень', args: [3, 4], expected: 81 },
  { name: 'Отрицательное основание, нечётная степень', args: [-2, 5], expected: -32 },
  { name: 'Отрицательное основание, чётная степень', args: [-2, 6], expected: 64 },
  { name: 'Единица', args: [1, 200], expected: 1 },
  { name: 'Дробное основание', args: [1.1, 13], expected: 3.4522712143931 },
  { name: 'Малый дробный результат', args: [0.1, 8], expected: 0.00000001 },
  { name: 'Большой конечный результат', args: [10, 100], expected: 1e100 },
];
