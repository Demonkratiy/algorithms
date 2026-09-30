import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Второй по величине', args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
  { name: 'Дубликаты учитываются', args: [[5, 5, 4], 2], expected: 5 },
  { name: 'Четвёртый с повторами', args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
  { name: 'Один элемент', args: [[1], 1], expected: 1 },
  { name: 'k равно длине', args: [[7, -2, 0, -9], 4], expected: -9 },
  { name: 'Максимум и числовой порядок', args: [[2, 10, 9], 1], expected: 10 },
  { name: 'Отрицательные и границы', args: [[-10000, 10000, -1, 0], 3], expected: -1 },
  { name: 'Все равны', args: [[3, 3, 3, 3], 3], expected: 3 },
]
