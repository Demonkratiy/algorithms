import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Три цвета вперемешку', args: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2] },
  { name: 'Повторная проверка обмена справа', args: [[1, 2, 0]], expected: [0, 1, 2] },
  { name: 'Последний неизвестный элемент', args: [[1, 0]], expected: [0, 1] },
  { name: 'Один элемент', args: [[2]], expected: [2] },
  { name: 'Только нули', args: [[0, 0, 0]], expected: [0, 0, 0] },
  { name: 'Только двойки', args: [[2, 2, 2]], expected: [2, 2, 2] },
  { name: 'Уже упорядочены', args: [[0, 0, 1, 1, 2, 2]], expected: [0, 0, 1, 1, 2, 2] },
  { name: 'Обратный порядок', args: [[2, 2, 1, 1, 0, 0]], expected: [0, 0, 1, 1, 2, 2] },
  { name: 'Максимальная длина', args: [Array.from({ length: 300 }, (_, i) => 2 - i % 3)], expected: [...Array(100).fill(0), ...Array(100).fill(1), ...Array(100).fill(2)] },
]
