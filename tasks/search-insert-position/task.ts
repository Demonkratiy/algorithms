import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const searchInsertPositionTask: TaskDefinition = {
  id: 'search-insert-position',
  title: 'Search Insert Position',
  starter,
  complexity: {
    variables: 'N — длина nums. Память — дополнительная, без входного массива.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'logarithmic', explanation: 'Искомая граница находится сужением диапазона вдвое за шаг, включая позицию после конца.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Нужны только индексы; вставлять элемент или копировать массив не требуется.' },
    ],
  },
  verificationNote: 'Тесты проверяют значения, но не доказывают асимптотику времени или памяти.',
  runner: { kind: 'function', entryPoint: 'searchInsert', output: { kind: 'return' }, comparison: 'exact', cases },
};
