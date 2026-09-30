import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const palindromeLinkedListTask: TaskDefinition = {
  id: 'palindrome-linked-list',
  title: 'Palindrome Linked List',
  starter,
  complexity: {
    variables: 'N — число узлов непустого списка. Мутация связей разрешена; восстановление списка — необязательный бонус.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Поиск середины, разворот половины и сравнение суммарно занимают O(N). Дополнительное восстановление не меняет эту оценку.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Цель — O(1) ссылок. Массив значений даёт правильный ответ, но требует O(N) памяти; функциональные тесты не подтверждают выполнение цели O(1).' },
    ],
  },
  runner: { kind: 'linked-list', entryPoint: 'isPalindrome', cases },
};
