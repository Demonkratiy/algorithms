import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Пустой календарь', args: [[]], expected: true },
  { name: 'Одна встреча', args: [[[0, 1]]], expected: true },
  { name: 'Длинная встреча перекрывает две', args: [[[0, 30], [5, 10], [15, 20]]], expected: false },
  { name: 'Касание допустимо', args: [[[5, 8], [1, 5], [8, 10]]], expected: true },
  { name: 'Неупорядоченные непересекающиеся', args: [[[10, 12], [2, 4], [7, 9]]], expected: true },
  { name: 'Одинаковые встречи', args: [[[2, 5], [2, 5]]], expected: false },
  { name: 'Конфликт в последней паре', args: [[[0, 1], [4, 8], [7, 9]]], expected: false },
  { name: 'Вложенный интервал', args: [[[1, 1000000], [4, 5]]], expected: false },
]
