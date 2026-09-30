import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const mergeTwoSortedListsTask: TaskDefinition = {
  id: 'merge-two-sorted-lists',
  title: 'Merge Two Sorted Lists',
  starter,
  complexity: {
    variables: 'N и M — длины независимых входных списков. Узлы результата переиспользуются; разрешён служебный dummy.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log(N + M))' },
      { id: 'linear', label: 'O(N + M)' },
      { id: 'linearithmic', label: 'O((N + M) log(N + M))' },
      { id: 'quadratic', label: 'O((N + M)²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'В худшем случае слияние обрабатывает узлы обоих списков за O(N + M); оставшийся хвост можно присоединить целиком.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Цель — O(1) ссылок и один dummy, без копирования узлов. Рекурсивное слияние требует O(N + M) стека. Проверка переиспользования не измеряет всю вспомогательную память.' },
    ],
  },
  runner: { kind: 'linked-list', entryPoint: 'mergeTwoLists', cases },
};
