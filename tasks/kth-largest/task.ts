import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const kthLargestTask: TaskDefinition = {
  id: 'kth-largest', title: 'Kth Largest Element', starter,
  verificationNote: 'Сортировка, heap и Quickselect допустимы. Оценки времени и памяти должны описывать один выбранный алгоритм; выходные тесты этого не доказывают.',
  complexity: {
    variables: 'N — длина nums, k — ранг с учётом повторов. Мутация входа допустима; скалярный выход O(1).',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'k', label: 'O(k)' }, { id: 'linear', label: 'O(N)' },
      { id: 'n-log-k', label: 'O(N log(k + 1))' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' }, { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время выбранного подхода (для Quickselect — ожидаемое)', expected: 'linearithmic', accepted: ['n-log-k', 'linear'], explanation: 'Сортировка O(N log N), heap O(N log(k + 1)), рандомизированный Quickselect ожидаемо O(N), но в худшем случае O(N²). +1 сохраняет корректную запись при k = 1.' },
      { id: 'space', title: 'Дополнительная память', expected: 'linear', accepted: ['k', 'constant', 'logarithmic'], explanation: 'JS sort может использовать O(N), heap размера k — O(k), итеративный in-place Quickselect — O(1). O(log N) требует обоснования сортировки; ECMAScript не фиксирует память sort.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'findKthLargest', output: { kind: 'return' }, comparison: 'exact', cases },
}
