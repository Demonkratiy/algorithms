import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Смешанные знаки и ноль', args: [[4, 5, 0, -2, -3, 1], 5], expected: 7 },
  { name: 'Нет кратной суммы', args: [[5], 9], expected: 0 },
  { name: 'Один кратный элемент', args: [[-6], 3], expected: 1 },
  { name: 'Ноль делится на k', args: [[0], 2], expected: 1 },
  { name: 'Много одинаковых остатков', args: [[0, 0, 0, 0], 7], expected: 10 },
  { name: 'Нормализация отрицательного остатка', args: [[-1, 2, 9], 2], expected: 2 },
  { name: 'Остатки с разными знаками', args: [[-1, 5], 5], expected: 1 },
  { name: 'Только отрицательные числа', args: [[-2, -3, -5], 5], expected: 3 },
  { name: 'Границы значений и делителя', args: [[10000, -10000, 0], 10000], expected: 6 },
  { name: 'Длинный массив кратных значений', args: [Array.from({ length: 600 }, (_, i) => i % 2 ? -14 : 7), 7], expected: 180300 },
]
