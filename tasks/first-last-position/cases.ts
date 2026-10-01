import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Дубликаты в середине', args: [[5, 7, 7, 8, 8, 10], 8], expected: [3, 4] },
  { name: 'Цель отсутствует между элементами', args: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
  { name: 'Пустой массив', args: [[], 0], expected: [-1, -1] },
  { name: 'Один элемент — совпадение', args: [[2], 2], expected: [0, 0] },
  { name: 'Один элемент — промах', args: [[2], 3], expected: [-1, -1] },
  { name: 'Два одинаковых элемента', args: [[2, 2], 2], expected: [0, 1] },
  { name: 'Дубликаты в начале', args: [[-3, -3, -3, 0, 4], -3], expected: [0, 2] },
  { name: 'Дубликаты в конце', args: [[-3, 0, 4, 4, 4], 4], expected: [2, 4] },
  { name: 'Цель меньше всех', args: [[2, 2, 3], 1], expected: [-1, -1] },
  { name: 'Цель больше всех', args: [[2, 2, 3], 4], expected: [-1, -1] },
  { name: 'Единственное вхождение внутри', args: [[1, 1, 2, 3, 3], 2], expected: [2, 2] },
  { name: 'Большой блок одинаковых значений', args: [Array(4096).fill(8), 8], expected: [0, 4095] },
];
