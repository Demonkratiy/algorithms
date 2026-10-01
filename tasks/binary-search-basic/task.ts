import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const binarySearchBasicTask: TaskDefinition = {
  id: 'binary-search-basic',
  title: 'Binary Search',
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
      { id: 'time', title: 'Время функции', expected: 'logarithmic', explanation: 'Область поиска уменьшается вдвое; требуется O(log N), а не линейный просмотр.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Итеративному поиску достаточно нескольких индексов. Рекурсивный стек потребовал бы O(log N).' },
    ],
  },
  verificationNote: 'Тесты проверяют значения, но не доказывают асимптотику времени или памяти.',
  runner: { kind: 'function', entryPoint: 'search', output: { kind: 'return' }, comparison: 'exact', cases },
};
