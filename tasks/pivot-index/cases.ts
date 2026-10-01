import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Pivot в середине', args: [[1, 7, 3, 6, 5, 6]], expected: 3 },
  { name: 'Нет pivot', args: [[1, 2, 3]], expected: -1 },
  { name: 'Pivot в начале', args: [[2, 1, -1]], expected: 0 },
  { name: 'Один ноль', args: [[0]], expected: 0 },
  { name: 'Один ненулевой элемент', args: [[-1000]], expected: 0 },
  { name: 'Pivot в конце', args: [[1, -1, 2]], expected: 2 },
  { name: 'Самый левый из нескольких', args: [[0, 0, 0]], expected: 0 },
  { name: 'Отрицательные суммы', args: [[-1, -1, -1, -1, -1, 0]], expected: 2 },
  { name: 'Два разных элемента', args: [[1, 2]], expected: -1 },
  { name: 'Длинный симметричный массив', args: [Array(1001).fill(1)], expected: 500 },
]
