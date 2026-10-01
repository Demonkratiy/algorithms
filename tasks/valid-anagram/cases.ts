import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Анаграмма', args: ['anagram', 'nagaram'], expected: true },
  { name: 'Разные буквы', args: ['rat', 'car'], expected: false },
  { name: 'Разная длина', args: ['a', 'ab'], expected: false },
  { name: 'Одна одинаковая буква', args: ['z', 'z'], expected: true },
  { name: 'Одна разная буква', args: ['a', 'b'], expected: false },
  { name: 'Одинаковый набор, разные частоты', args: ['aab', 'abb'], expected: false },
  { name: 'Повторяющиеся буквы', args: ['aabbcc', 'cbacba'], expected: true },
  { name: 'Одинаковые суммы кодов, разные буквы', args: ['ad', 'bc'], expected: false },
  { name: 'Длинные анаграммы', args: ['a'.repeat(6000) + 'z'.repeat(6000), 'za'.repeat(6000)], expected: true },
  { name: 'Различие в самом конце', args: ['a'.repeat(12000), 'a'.repeat(11999) + 'b'], expected: false },
]
