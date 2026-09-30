import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const queueViaStacksTask: TaskDefinition = {
  id: 'queue-via-stacks',
  title: 'Implement Queue using Stacks',
  starter,
  complexity: {
    variables: 'N — число хранимых элементов. Только два стека и их операции; shift() и произвольный доступ по индексам не разрешены. Операции абстрактного стека считаем O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'push-time', title: 'push — время', expected: 'constant', explanation: 'O(1) в модели стека; для динамического массива JS push амортизированно O(1).' },
      { id: 'pop-amortized', title: 'pop — амортизированное время', expected: 'constant', explanation: 'Каждый элемент переносится между стеками не более одного раза. M операций стоят O(M) суммарно, но не каждая отдельно O(1).' },
      { id: 'peek-amortized', title: 'peek — амортизированное время', expected: 'constant', explanation: 'Перенос оплачивается однократно для каждого элемента, повторные peek не повторяют перенос: O(1) амортизированно.' },
      { id: 'pop-worst', title: 'pop — худший отдельный вызов', expected: 'linear', explanation: 'Один вызов может перенести все N элементов: O(N).' },
      { id: 'peek-worst', title: 'peek — худший отдельный вызов', expected: 'linear', explanation: 'Первый peek также может потребовать переноса N элементов: O(N).' },
      { id: 'empty-time', title: 'empty — время', expected: 'constant', explanation: 'Проверка пустоты двух стеков: O(1).' },
      { id: 'space', title: 'Память структуры', expected: 'linear', explanation: 'Два стека суммарно хранят N элементов: O(N).' },
    ],
  },
  runner: { kind: 'class', entryPoint: 'MyQueue', cases },
}
