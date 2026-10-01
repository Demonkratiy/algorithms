import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

const complexity = {
  variables: 'N — длина nums, K = k — положительный делитель. Память — дополнительная.',
  options: [
    { id: 'constant', label: 'O(1)' },
    { id: 'linear', label: 'O(N)' },
    { id: 'remainders', label: 'O(K)' },
    { id: 'sparse-remainders', label: 'O(min(N + 1, K))' },
    { id: 'quadratic', label: 'O(N²)' },
    { id: 'unknown', label: 'Пока не знаю' },
  ],
  criteria: [
    { id: 'time', title: 'Время', expected: 'linear', explanation: 'Один проход по N числам, O(N) в среднем при операциях Map за O(1).' },
    { id: 'space', title: 'Дополнительная память', expected: 'remainders', accepted: ['sparse-remainders'], explanation: 'Возможны K остатков: O(K). Для Map точнее O(min(N + 1, K)): записей не больше количества префиксов и классов остатков.' },
  ],
}

export const subarraySumsDivisibleByKTask: TaskDefinition = {
  id: 'subarray-sums-divisible-by-k',
  title: 'Subarray Sums Divisible by K',
  starter,
  complexity,
  runner: { kind: 'function', entryPoint: 'subarraysDivByK', output: { kind: 'return' }, comparison: 'exact', cases },
}
