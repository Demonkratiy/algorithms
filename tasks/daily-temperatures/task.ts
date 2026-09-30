import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const dailyTemperaturesTask: TaskDefinition = {
  id: 'daily-temperatures',
  title: 'Daily Temperatures',
  starter,
  complexity: {
    variables: 'N — число дней. Память — дополнительная, в худшем случае.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время всего обхода', expected: 'linear', explanation: 'Каждый индекс добавляется один раз и удаляется не более одного раза. Суммарно O(N), хотя отдельная итерация может стоить O(N).' },
      { id: 'space', title: 'Память', expected: 'linear', explanation: 'Стек ожидающих индексов в худшем случае содержит N элементов; массив ответа также занимает O(N).' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'dailyTemperatures', output: { kind: 'return' }, comparison: 'exact', cases },
}
