import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Положительные числа', args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
  { name: 'Ноль и отрицательные числа', args: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
  { name: 'Минимальная длина', args: [[2, 3]], expected: [3, 2] },
  { name: 'Два нуля', args: [[0, 2, 0, 4]], expected: [0, 0, 0, 0] },
  { name: 'Ноль в начале', args: [[0, 2, 3]], expected: [6, 0, 0] },
  { name: 'Ноль в конце', args: [[2, 3, 0]], expected: [0, 0, 6] },
  { name: 'Только отрицательные', args: [[-1, -2, -3, -4]], expected: [-24, -12, -8, -6] },
  { name: 'Два нулевых элемента', args: [[0, 0]], expected: [0, 0] },
  { name: 'Большое допустимое произведение', args: [[1000, 1000, 1000]], expected: [1000000, 1000000, 1000000] },
  { name: 'Длинный массив со знаками', args: [Array.from({ length: 1000 }, (_, i) => i % 2 ? -1 : 1)], expected: Array.from({ length: 1000 }, (_, i) => i % 2 ? -1 : 1) },
]
