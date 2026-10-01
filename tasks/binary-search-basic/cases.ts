import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Элемент внутри массива', args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
  { name: 'Пропуск между элементами', args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
  { name: 'Один элемент — совпадение', args: [[5], 5], expected: 0 },
  { name: 'Один элемент — промах', args: [[5], -5], expected: -1 },
  { name: 'Первый из двух', args: [[1, 2], 1], expected: 0 },
  { name: 'Последний из двух', args: [[1, 2], 2], expected: 1 },
  { name: 'Меньше минимума', args: [[-9, -3, 0, 8], -10], expected: -1 },
  { name: 'Больше максимума', args: [[-9, -3, 0, 8], 9], expected: -1 },
  { name: 'Нижняя допустимая граница', args: [[-9999, 0, 9999], -9999], expected: 0 },
  { name: 'Верхняя допустимая граница', args: [[-9999, 0, 9999], 9999], expected: 2 },
  { name: 'Большой массив — последняя итерация', args: [Array.from({ length: 1024 }, (_, i) => i * 2 - 1024), 1022], expected: 1023 },
];
