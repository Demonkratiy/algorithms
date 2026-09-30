import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const subsetsTask: TaskDefinition = {
  id: 'subsets',
  title: 'Subsets',
  starter,
  complexity: {
    variables: 'N — число уникальных элементов. Рабочая память исключает ответ: он занимает O(N · 2^N). Пустой вход из примера даёт [[]] за O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'exponential', label: 'O(2^N)' },
      { id: 'output', label: 'O(N · 2^N)' },
      { id: 'factorial', label: 'O(N · N!)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время с построением ответа', expected: 'output', explanation: 'Нужно сформировать 2^N подмножеств, копируя до N элементов: O(N · 2^N).' },
      { id: 'space', title: 'Рабочая память без ответа', expected: 'linear', accepted: ['output'], explanation: 'Backtracking: стек и текущий путь O(N), отдельно ответ O(N · 2^N). Итеративная версия из материала удерживает дополнительные копии результата, до O(N · 2^N) рабочей памяти.' },
    ],
  },
  verificationNote: 'Порядок неважен и снаружи, и внутри подмножеств; повторные подмножества недопустимы. Вход содержит уникальные числа. Пустой вход проверяется по явному примеру материала, несмотря на нижнюю границу 1 в списке ограничений. Тесты не доказывают backtracking или Big O.',
  runner: { kind: 'function', entryPoint: 'subsets', output: { kind: 'return' }, comparison: 'nested-unordered', cases },
};
