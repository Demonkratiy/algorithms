import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const heapifyTask: TaskDefinition = {
  id: 'heapify', title: 'Heapify — Build a Heap', starter,
  verificationNote: 'MinHeap.heapify возвращает новую рабочую кучу, не изменяя вход даже при последующих push/pop. Тесты проверяют значения, компараторы и сохранение входа, но НЕ доказывают O(N) построения или запрет последовательных push. Корректный push-based builder пройдёт проверку результата; линейный bottom-up алгоритм проверяется отдельно на ревью.',
  complexity: {
    variables: 'N — число элементов массива для heapify, текущее число элементов для методов. Компаратор O(1); рост динамического массива учитывается амортизированно.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' }, { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'build-time', title: 'heapify — время построения', expected: 'linear', explanation: 'Bottom-up просеивание суммирует высоты всех внутренних узлов: O(N), а не O(N log N). Последовательные push не достигают этой цели.' },
      { id: 'push-time', title: 'push — время', expected: 'logarithmic', explanation: 'Подъём по высоте heap требует O(log N) сравнений; рост массива амортизирован.' },
      { id: 'pop-time', title: 'pop — время', expected: 'logarithmic', explanation: 'Просеивание вниз требует O(log N) сравнений, на пустой куче O(1).' },
      { id: 'peek-time', title: 'peek — время', expected: 'constant', explanation: 'Приоритетный элемент хранится в корне.' },
      { id: 'size-time', title: 'size — время', expected: 'constant', explanation: 'Размер читается без обхода.' },
      { id: 'space', title: 'Память результата heapify', expected: 'linear', explanation: 'Новая куча хранит копию N элементов, не используя входной массив как изменяемое хранилище.' },
      { id: 'build-workspace', title: 'Рабочая память построения без результата', expected: 'constant', accepted: ['logarithmic'], explanation: 'Итеративному siftDown достаточно O(1); рекурсивный siftDown использует стек O(log N).' },
    ],
  },
  runner: { kind: 'class', entryPoint: 'MinHeap', factoryMethod: 'heapify', preserveArgs: [0], cases },
}
