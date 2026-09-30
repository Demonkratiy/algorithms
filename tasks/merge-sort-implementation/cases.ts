import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Пустой массив тоже новый', args: [[]], expected: [] },
  { name: 'Один элемент тоже в новом массиве', args: [[7]], expected: [7] },
  { name: 'Чётная длина', args: [[5, 2, 4, 1]], expected: [1, 2, 4, 5] },
  { name: 'Нечётная длина и правый хвост', args: [[1, 4, 7, 2, 3]], expected: [1, 2, 3, 4, 7] },
  { name: 'Дубликаты сохраняются', args: [[3, 3, 1, 3, 1]], expected: [1, 1, 3, 3, 3] },
  { name: 'Числа, не строки', args: [[10, -2, 2, -10, 0]], expected: [-10, -2, 0, 2, 10] },
  { name: 'Уже отсортирован', args: [[-3, 0, 2, 10]], expected: [-3, 0, 2, 10] },
  { name: 'Обратный порядок', args: [[5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5] },
]
