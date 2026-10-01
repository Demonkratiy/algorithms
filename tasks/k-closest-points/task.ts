import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const kClosestPointsTask: TaskDefinition = {
  id: 'k-closest-points', title: 'K Closest Points to Origin', starter,
  verificationNote: 'Допускается любой порядок и любой выбор точек на граничном расстоянии. Проверяются исходные точки с учётом кратности; expected — лишь один допустимый ответ. Выходные тесты не доказывают использование heap или асимптотику.',
  complexity: {
    variables: 'N — число точек, k — размер ответа. Мутация входа разрешена; память включает выход O(k).',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'k', label: 'O(k)' },
      { id: 'linear', label: 'O(N)' }, { id: 'n-log-k', label: 'O(N log(k + 1))' },
      { id: 'linearithmic', label: 'O(N log N)' }, { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время (Quickselect — ожидаемое)', expected: 'n-log-k', accepted: ['linearithmic', 'linear'], explanation: 'Max-heap размера k: O(N log(k + 1)); сортировка: O(N log N); рандомизированный Quickselect ожидаемо O(N), худшее O(N²). +1 учитывает k = 1.' },
      { id: 'space', title: 'Память с выходом', expected: 'k', accepted: ['linear'], explanation: 'Heap и выход занимают O(k). JS sort может потребовать O(N). Итеративный in-place Quickselect использует O(1) рабочей памяти, но с выходом это O(k), не O(1).' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'kClosest', output: { kind: 'return' }, comparison: 'closest-points', cases },
}
