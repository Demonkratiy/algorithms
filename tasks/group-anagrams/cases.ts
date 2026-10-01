import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Несколько групп', args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']] },
  { name: 'Пустое слово', args: [['']], expected: [['']] },
  { name: 'Одна буква', args: [['a']], expected: [['a']] },
  { name: 'Повторы одинаковых слов сохраняются', args: [['ab', 'ab', 'ba', 'ab']], expected: [['ab', 'ab', 'ba', 'ab']] },
  { name: 'Повторяющиеся пустые слова', args: [['', 'a', '', 'a']], expected: [['', ''], ['a', 'a']] },
  { name: 'Частоты важнее набора букв', args: [['aab', 'abb', 'baa', 'bba']], expected: [['aab', 'baa'], ['abb', 'bba']] },
  { name: 'Сумма кодов не является подписью', args: [['ad', 'bc', 'da', 'cb']], expected: [['ad', 'da'], ['bc', 'cb']] },
  { name: 'Разделители в частотной подписи', args: [['a' + 'b'.repeat(11), 'a'.repeat(11) + 'b', 'b'.repeat(11) + 'a']], expected: [['a' + 'b'.repeat(11), 'b'.repeat(11) + 'a'], ['a'.repeat(11) + 'b']] },
  { name: 'Разная длина и разные группы', args: [['a', 'aa', 'aaa', 'z']], expected: [['a'], ['aa'], ['aaa'], ['z']] },
  { name: 'Много повторяющихся групп', args: [Array.from({ length: 360 }, (_, i) => ['abc', 'bca', 'zzz'][i % 3])], expected: [Array.from({ length: 240 }, (_, i) => i % 2 ? 'bca' : 'abc'), Array(120).fill('zzz')] },
]
