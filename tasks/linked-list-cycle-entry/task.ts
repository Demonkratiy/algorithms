import starter from './starter.js?raw';
import { cases } from './cases';
import { linkedListCycleTask } from '../linked-list-cycle/task';
import type { TaskDefinition } from '../types';

export const linkedListCycleEntryTask: TaskDefinition = {
  id: 'linked-list-cycle-entry',
  title: 'Linked List Cycle — вход в цикл',
  starter,
  complexity: {
    ...linkedListCycleTask.complexity,
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Обнаружение цикла и поиск его входа суммарно требуют O(N). Вернуть нужно исходный узел входа, а не произвольный узел встречи.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Цель — O(1) дополнительных ссылок. Set узлов даёт рабочий вариант с O(N) памятью; тесты не доказывают фактическую сложность.' },
    ],
  },
  runner: { kind: 'linked-list', entryPoint: 'detectCycle', cases },
};
