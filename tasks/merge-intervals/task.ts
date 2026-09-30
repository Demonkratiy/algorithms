import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const mergeIntervalsTask: TaskDefinition = {
  id: 'merge-intervals', title: 'Merge Intervals', starter,
  verificationNote: 'Порядок интервалов ответа произволен; порядок start/end внутри пары важен. Мутация входа разрешена. Тесты результата не доказывают сложность.',
  complexity: {
    variables: 'N — число интервалов. Выход и рабочую память оцениваем отдельно.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' }, { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linearithmic', explanation: 'Сортировка по началу O(N log N), затем линейный проход.' },
      { id: 'space', title: 'Рабочая память без выхода', expected: 'linear', accepted: ['logarithmic', 'constant'], explanation: 'Array.sort не гарантирует O(1): распространённые JS-реализации используют до O(N). O(log N) или O(1) допустимы при обоснованном выборе собственной сортировки и мутации входа.' },
      { id: 'output-space', title: 'Память выхода, худший случай', expected: 'linear', explanation: 'Если интервалы раздельны, результат содержит N пар.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'merge', output: { kind: 'return' }, comparison: 'unordered-tuples', cases },
}
