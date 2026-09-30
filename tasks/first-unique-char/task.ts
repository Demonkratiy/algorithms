import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const firstUniqueCharTask: TaskDefinition = {
  id: 'first-unique-char',
  title: 'First Unique Character in a String',
  starter,
  complexity: {
    variables: 'N — длина s, K — число различных букв (K ≤ 26). Память — дополнительная, без входа.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'distinct-symbols', label: 'O(K)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Цель — O(N): число полных проходов по строке постоянно.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', accepted: ['distinct-symbols'], explanation: 'Общая оценка частотного словаря — O(K), где K — число различных букв. Здесь K ≤ 26, поэтому O(1). Обе формулировки допустимы с этой оговоркой.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'firstUniqChar', output: { kind: 'return' }, comparison: 'exact', cases },
}
