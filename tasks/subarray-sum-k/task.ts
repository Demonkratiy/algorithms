import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const subarraySumKTask: TaskDefinition = {
  id: 'subarray-sum-k',
  title: 'Subarray Sum Equals K',
  starter,
  complexity: {
    variables: 'N — длина nums. Память — дополнительная, без входного массива.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Цель — один проход, O(N) в среднем при операциях Map за O(1).' },
      { id: 'space', title: 'Дополнительная память', expected: 'linear', explanation: 'В худшем случае все N + 1 префиксных сумм различны: O(N) записей.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'subarraySum', output: { kind: 'return' }, comparison: 'exact', cases },
}
