import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Два самых частых', args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
  { name: 'Один элемент', args: [[1], 1], expected: [1] },
  { name: 'Самый частый не первый', args: [[4, 4, 4, 6, 6, 7, 7, 7, 7], 1], expected: [7] },
  { name: 'Отрицательные и ноль', args: [[0, -2, -2, -2, 0, 5], 2], expected: [-2, 0] },
  { name: 'Все различные входят в ответ', args: [[-3, 0, 8], 3], expected: [-3, 0, 8] },
  { name: 'Равные частоты внутри top-k', args: [[3, 3, 2, 2, 1], 2], expected: [3, 2] },
  { name: 'Выбираем по частоте, не значению', args: [[100, -10, -10, -10, 2, 2], 1], expected: [-10] },
  { name: 'Все элементы одинаковые', args: [[0, 0, 0, 0], 1], expected: [0] },
  { name: 'Много частот', args: [Array.from({ length: 40 }, (_, i) => Array(i + 1).fill(i - 20)).flat(), 5], expected: [19, 18, 17, 16, 15] },
]
