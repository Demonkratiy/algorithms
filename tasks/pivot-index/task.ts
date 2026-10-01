import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const pivotIndexTask: TaskDefinition = {
  id: 'pivot-index',
  title: 'Find Pivot Index',
  starter,
  complexity: {
    variables: 'N — длина nums. Память — дополнительная, без входного массива.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Постоянное число линейных проходов: O(N).' },
      { id: 'space', title: 'Дополнительная память — цель', expected: 'constant', explanation: 'Цель — только текущие суммы и индекс, O(1). Полный массив префиксов не нужен.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'pivotIndex', output: { kind: 'return' }, comparison: 'exact', cases },
}
