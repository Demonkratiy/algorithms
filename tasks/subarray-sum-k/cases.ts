import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Перекрывающиеся подмассивы', args: [[1, 1, 1], 2], expected: 2 },
  { name: 'Разная длина подмассивов', args: [[1, 2, 3], 3], expected: 2 },
  { name: 'Повторяющиеся префиксные суммы', args: [[1, -1, 0], 0], expected: 3 },
  { name: 'Нет непустого подмассива', args: [[1], 0], expected: 0 },
  { name: 'Единственный элемент равен k', args: [[-2], -2], expected: 1 },
  { name: 'Все нули', args: [[0, 0, 0, 0], 0], expected: 10 },
  { name: 'Отрицательная цель', args: [[-1, -1, 1], -1], expected: 3 },
  { name: 'Чередующиеся знаки', args: [[1, -1, 1, -1], 0], expected: 4 },
  { name: 'Цель вне диапазона сумм', args: [[1000, -1000, 1000], 10000000], expected: 0 },
  { name: 'Много одинаковых сумм', args: [Array(600).fill(0), 0], expected: 180300 },
]
