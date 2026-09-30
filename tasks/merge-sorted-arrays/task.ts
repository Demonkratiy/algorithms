import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const mergeSortedArraysTask: TaskDefinition = {
  id: 'merge-sorted-arrays',
  title: 'Merge Two Sorted Arrays',
  starter,
  complexity: {
    variables: 'N и M — длины a и b. Дополнительная память не включает входы и обязательный новый массив результата размером O(N + M).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log(N + M))' },
      { id: 'linear', label: 'O(N + M)' },
      { id: 'linearithmic', label: 'O((N + M) log(N + M))' },
      { id: 'quadratic', label: 'O((N + M)²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Каждый элемент обоих массивов переносится в результат один раз, включая оставшиеся хвосты.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Кроме нового массива результата нужны только индексы. Сам результат занимает O(N + M); с его учётом суммарная выделенная память — O(N + M), а вспомогательная — O(1).' },
    ],
  },
  runner: {
    kind: 'function', entryPoint: 'mergeSorted', output: { kind: 'return' }, comparison: 'exact',
    preserveArgs: [0, 1], freshArray: true, cases,
  },
};
