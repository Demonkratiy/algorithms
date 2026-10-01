import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Пример с несколькими ожидающими днями', args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
  { name: 'Один день', args: [[30]], expected: [0] },
  { name: 'Возрастающие температуры', args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
  { name: 'Убывающие температуры', args: [[100, 90, 60, 30]], expected: [0, 0, 0, 0] },
  { name: 'Равные температуры', args: [[70, 70, 70, 70]], expected: [0, 0, 0, 0] },
  { name: 'Равные дни перед потеплением', args: [[30, 30, 31]], expected: [2, 1, 0] },
  { name: 'Один день закрывает несколько', args: [[75, 74, 73, 76]], expected: [3, 2, 1, 0] },
  { name: 'Первый более тёплый, не максимальный', args: [[30, 31, 100]], expected: [1, 1, 0] },
  { name: 'Длинное плато до последнего дня', args: [[...Array<number>(1024).fill(30), 100]], expected: [...Array.from({ length: 1024 }, (_, i) => 1024 - i), 0] },
  { name: 'Чередующиеся температуры', args: [Array.from({ length: 512 }, (_, i) => i % 2 ? 100 : 30)], expected: Array.from({ length: 512 }, (_, i) => i % 2 ? 0 : 1) },
]
