import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const validParenthesesTask: TaskDefinition = {
  id: 'valid-parentheses',
  title: 'Valid Parentheses',
  starter,
  complexity: {
    variables: 'N — длина строки. Память — дополнительная, в худшем случае.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Каждый символ обрабатывается один раз: O(N).' },
      { id: 'space', title: 'Память', expected: 'linear', explanation: 'Незакрытые скобки могут занимать O(N) памяти.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'isValid', output: { kind: 'return' }, comparison: 'exact', cases },
}
