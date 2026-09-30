import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const searchRotatedArrayTask: TaskDefinition = {
  id: 'search-rotated-array',
  title: 'Search in Rotated Sorted Array',
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
      { id: 'time', title: 'Время функции', expected: 'logarithmic', explanation: 'Уникальность элементов позволяет определить отсортированную половину и каждый раз отбросить половину диапазона.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Итеративный поиск хранит несколько индексов. Разворачивать или копировать вход не требуется.' },
    ],
  },
  verificationNote: 'Тесты проверяют индекс в исходном массиве, но не доказывают асимптотику времени или памяти.',
  runner: { kind: 'function', entryPoint: 'search', output: { kind: 'return' }, comparison: 'exact', cases },
};
