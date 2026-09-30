import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const removeNthFromEndTask: TaskDefinition = {
  id: 'remove-nth-from-end',
  title: 'Remove Nth Node From End of List',
  starter,
  complexity: {
    variables: 'N — длина списка, n — валидный номер удаляемого узла с конца (1 ≤ n ≤ N).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Цель — один проход за O(N). Два прохода тоже имеют O(N), поэтому требование одного прохода проверяется разбором кода, а не только тестами.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Достаточно постоянного числа ссылок и служебного dummy. Узлы, кроме удаляемого, остаются исходными и сохраняют порядок. Функциональные тесты не измеряют расход памяти.' },
    ],
  },
  runner: { kind: 'linked-list', entryPoint: 'removeNthFromEnd', cases },
};
