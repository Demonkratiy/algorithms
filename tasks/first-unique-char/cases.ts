import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Первый символ', args: ['leetcode'], expected: 0 },
  { name: 'Уникальный в середине', args: ['loveleetcode'], expected: 2 },
  { name: 'Все повторяются', args: ['aabb'], expected: -1 },
  { name: 'Один символ', args: ['z'], expected: 0 },
  { name: 'Уникальный в конце', args: ['aabbc'], expected: 4 },
  { name: 'Нужен первый, не последний', args: ['abc'], expected: 0 },
  { name: 'Порядок строки, не алфавита', args: ['zbaab'], expected: 0 },
  { name: 'Три повторения', args: ['aaabbb'], expected: -1 },
  { name: 'Длинная строка с уникальным хвостом', args: ['ab'.repeat(5000) + 'z'], expected: 10000 },
]
