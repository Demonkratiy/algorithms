import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const minSubarraySumTask: TaskDefinition = {
  id: 'min-subarray-sum',
  title: 'Minimum Size Subarray Sum',
  starter,
  complexity: {
    variables: 'N — длина nums. Память — дополнительная, без входа и результата.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Каждая граница окна движется только вперёд, не более N раз. Вложенное сжатие не делает суммарное время квадратичным.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Нужны только границы окна, текущая сумма и лучшая длина; отдельный подмассив не создаётся.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'minSubArrayLen', output: { kind: 'return' }, comparison: 'exact', cases },
};
