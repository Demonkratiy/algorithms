import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const mergeSortImplementationTask: TaskDefinition = {
  id: 'merge-sort-implementation', title: 'Implement Merge Sort', starter,
  verificationNote: 'Проверяется mergeSort: новый массив (включая пустой и одноэлементный) и сохранение входа. Helper merge(a,b) проверяется косвенно через сортировку, не отдельно. Использование именно Merge Sort, запрет встроенного sort(), стабильность на объектах и асимптотика требуют отдельного ревью.',
  complexity: {
    variables: 'N — длина arr. Память — пиковая живая память, включая выход, не сумма всех выделений.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' }, { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время, худший случай', expected: 'linearithmic', explanation: 'На каждом из O(log N) уровней слияния суммарно обрабатываются N элементов.' },
      { id: 'space', title: 'Пиковая память с выходом', expected: 'linear', explanation: 'Буферы и новый результат занимают O(N), стек рекурсии O(log N); сумма O(N).' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'mergeSort', output: { kind: 'return' }, comparison: 'exact', preserveArgs: [0], freshArray: true, cases },
}
