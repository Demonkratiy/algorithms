import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const heapComparatorTask: TaskDefinition = {
  id: 'heap-comparator', title: 'Heap Comparator (Bonus)', starter,
  verificationNote: 'Необязательное расширение MinHeap: compare(a,b) < 0 означает более высокий приоритет a. Фабрики передают настоящие callback, не строки. Стабильность равных приоритетов не требуется; сложность и устройство heap проверяются ревью.',
  complexity: {
    variables: 'N — число элементов. Компаратор O(1), рост JS-массива учитывается амортизированно.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'push-time', title: 'push — время', expected: 'logarithmic', explanation: 'O(log N) сравнений на пути к корню; рост массива амортизирован.' },
      { id: 'pop-time', title: 'pop — время', expected: 'logarithmic', explanation: 'O(log N) уровней; выбор потомка определяется компаратором.' },
      { id: 'peek-time', title: 'peek — время', expected: 'constant', explanation: 'Чтение корня без обхода.' },
      { id: 'size-time', title: 'size — время', expected: 'constant', explanation: 'Чтение длины массива без обхода.' },
      { id: 'space', title: 'Память структуры', expected: 'linear', explanation: 'Храним N элементов и один callback.' },
    ],
  },
  runner: { kind: 'class', entryPoint: 'MinHeap', cases },
}
