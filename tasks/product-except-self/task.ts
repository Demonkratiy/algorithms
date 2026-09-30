import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

const complexity = {
  variables: 'N — длина nums. Память — дополнительная, БЕЗ O(N) выходного массива answer и без входа.',
  options: [
    { id: 'constant', label: 'O(1)' },
    { id: 'linear', label: 'O(N)' },
    { id: 'quadratic', label: 'O(N²)' },
    { id: 'unknown', label: 'Пока не знаю' },
  ],
  criteria: [
    { id: 'time', title: 'Время', expected: 'linear', explanation: 'Оба подхода из материала требуют O(N) времени; деление запрещено независимо от скорости.' },
    { id: 'space', title: 'Дополнительная память — выбранный подход', expected: 'constant', accepted: ['linear'], explanation: 'Оптимальный вариант: O(1) сверх ответа. Наглядный вариант с отдельными префиксами/суффиксами: O(N) сверх ответа, тоже допустим. Сам ответ в обоих случаях занимает O(N).' },
  ],
}

export const productExceptSelfTask: TaskDefinition = {
  id: 'product-except-self',
  title: 'Product of Array Except Self',
  starter,
  complexity,
  runner: { kind: 'function', entryPoint: 'productExceptSelf', output: { kind: 'return' }, comparison: 'exact', cases },
}
