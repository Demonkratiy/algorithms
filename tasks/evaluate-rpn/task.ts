import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const evaluateRpnTask: TaskDefinition = {
  id: 'evaluate-rpn',
  title: 'Evaluate Reverse Polish Notation',
  starter,
  complexity: {
    variables: 'N — число токенов. Память — дополнительная, в худшем случае.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Каждый токен требует фиксированного числа арифметических операций: O(N).' },
      { id: 'space', title: 'Память', expected: 'linear', explanation: 'До появления операторов стек может накопить O(N) операндов.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'evalRPN', output: { kind: 'return' }, comparison: 'exact', cases },
}
