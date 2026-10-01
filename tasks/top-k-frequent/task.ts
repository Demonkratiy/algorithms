import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

const complexity = {
  variables: 'N — длина nums, M — число различных значений, k — размер ответа. Память — дополнительная, без O(k) возвращаемого массива.',
  options: [
    { id: 'constant', label: 'O(1)' },
    { id: 'linear', label: 'O(N)' },
    { id: 'distinct', label: 'O(M)' },
    { id: 'sort-distinct', label: 'O(N + M log M)' },
    { id: 'linearithmic', label: 'O(N log N)' },
    { id: 'heap', label: 'O(N + M log(k + 1))' },
    { id: 'quadratic', label: 'O(N²)' },
    { id: 'unknown', label: 'Пока не знаю' },
  ],
  criteria: [
    { id: 'time', title: 'Время — выбранный подход', expected: 'sort-distinct', accepted: ['linearithmic', 'linear', 'heap'], explanation: 'Сортировка частот: O(N + M log M), в худшем случае O(N log N). Bucket sort: O(N). Heap размера k: O(N + M log(k + 1)). Все эти подходы допустимы.' },
    { id: 'space', title: 'Дополнительная память — выбранный подход', expected: 'distinct', accepted: ['linear'], explanation: 'Map и сортировка/heap используют O(M); корзины по частоте — O(N). В худшем случае M = N, обе оценки допустимы. Сам ответ занимает ещё O(k).' },
  ],
}

export const topKFrequentTask: TaskDefinition = {
  id: 'top-k-frequent',
  title: 'Top K Frequent Elements',
  starter,
  complexity,
  runner: { kind: 'function', entryPoint: 'topKFrequent', output: { kind: 'return' }, comparison: 'unordered', cases },
}
