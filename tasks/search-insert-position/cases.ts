import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Существующий элемент', args: [[1, 3, 5, 6], 5], expected: 2 },
  { name: 'Вставка между элементами', args: [[1, 3, 5, 6], 2], expected: 1 },
  { name: 'Вставка после конца', args: [[1, 3, 5, 6], 7], expected: 4 },
  { name: 'Вставка перед началом', args: [[1, 3, 5, 6], 0], expected: 0 },
  { name: 'Один элемент — совпадение', args: [[4], 4], expected: 0 },
  { name: 'Один элемент — вставка слева', args: [[4], 3], expected: 0 },
  { name: 'Один элемент — вставка справа', args: [[4], 5], expected: 1 },
  { name: 'Совпадение с первым', args: [[-8, -2, 0, 7], -8], expected: 0 },
  { name: 'Совпадение с последним', args: [[-8, -2, 0, 7], 7], expected: 3 },
  { name: 'Отрицательная цель между соседями', args: [[-8, -2, 0, 7], -3], expected: 1 },
  { name: 'Большой массив — вставка на правой границе', args: [Array.from({ length: 1024 }, (_, i) => i * 2), 2047], expected: 1024 },
];
