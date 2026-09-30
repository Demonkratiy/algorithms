import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const firstLastPositionTask: TaskDefinition = {
  id: 'first-last-position',
  title: 'Find First and Last Position',
  starter,
  complexity: {
    variables: 'N — длина nums. Память — дополнительная, без входа и массива-ответа из двух индексов.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'logarithmic', explanation: 'Два поиска границ дают O(log N). Линейное расширение по дубликатам не выполняет требование.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Границы можно искать итеративно без копий и рекурсивного стека; ответ имеет фиксированный размер.' },
    ],
  },
  verificationNote: 'Тесты проверяют индексы, но не доказывают O(log N) времени или O(1) памяти.',
  runner: { kind: 'function', entryPoint: 'searchRange', output: { kind: 'return' }, comparison: 'exact', cases },
};
