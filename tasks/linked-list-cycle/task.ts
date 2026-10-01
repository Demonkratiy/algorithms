import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const linkedListCycleTask: TaskDefinition = {
  id: 'linked-list-cycle',
  title: 'Linked List Cycle — обнаружение цикла',
  starter,
  complexity: {
    variables: 'N — число различных достижимых узлов, включая префикс и цикл.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Floyd обнаруживает цикл за O(N). В этой задаче нужно вернуть только boolean; поиск входа проверяется отдельно.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Цель — Floyd с O(1) ссылок. Set узлов допустим как первый вариант, но занимает O(N). Успех функциональных тестов и выбор O(1) не подтверждают фактическое потребление памяти: нужен разбор кода.' },
    ],
  },
  runner: { kind: 'linked-list', entryPoint: 'hasCycle', cases },
};
