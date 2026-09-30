import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const implementMinHeapTask: TaskDefinition = {
  id: 'implement-min-heap', title: 'Implement Min-Heap', starter,
  verificationNote: 'Основная задача — только числовой min-heap, без компаратора. Проверяются size как свойство, peek/pop пустой кучи как undefined; результат push не важен. Тесты не доказывают хранение в массиве или сложность.',
  complexity: {
    variables: 'N — число элементов. Операции сравнения чисел O(1); стоимость роста массива учитываем амортизированно.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'push-time', title: 'push — время', expected: 'logarithmic', explanation: 'Подъём по высоте heap — O(log N), рост динамического массива амортизирован.' },
      { id: 'pop-time', title: 'pop — время', expected: 'logarithmic', explanation: 'Просеивание корня вниз занимает O(log N); пустая куча — O(1).' },
      { id: 'peek-time', title: 'peek — время', expected: 'constant', explanation: 'Минимум находится в корне.' },
      { id: 'size-time', title: 'size — время', expected: 'constant', explanation: 'Количество хранится явно или берётся из длины массива.' },
      { id: 'space', title: 'Память структуры', expected: 'linear', explanation: 'N значений требуют O(N) памяти.' },
    ],
  },
  runner: { kind: 'class', entryPoint: 'MinHeap', cases },
}
