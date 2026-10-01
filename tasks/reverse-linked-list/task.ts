import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const reverseLinkedListTask: TaskDefinition = {
  id: 'reverse-linked-list',
  title: 'Reverse Linked List',
  starter,
  complexity: {
    variables: 'N — число узлов. Оцени основную итеративную функцию; дополнительная память включает стек вызовов.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Каждый из N узлов должен изменить направление связи. Проверка результата не доказывает итеративность реализации.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Цель — итеративный разворот исходных узлов с O(1) ссылок. Рекурсия требует O(N) памяти стека: это второй вариант, а не выполнение основной цели. Тесты не измеряют память.' },
    ],
  },
  runner: { kind: 'linked-list', entryPoint: 'reverseList', cases },
};
