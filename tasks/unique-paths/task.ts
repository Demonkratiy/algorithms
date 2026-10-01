import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const uniquePathsTask: TaskDefinition = {
  id: 'unique-paths',
  title: 'Unique Paths',
  starter,
  complexity: {
    variables: 'm = число строк, n = число столбцов, 1 ≤ m, n ≤ 100. Ответ ≤ 2^31 − 1. Дополнительная память без входа; числовой выход — O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'columns', label: 'O(n)' },
      { id: 'rows', label: 'O(m)' },
      { id: 'minimum', label: 'O(min(m, n))' },
      { id: 'grid', label: 'O(m · n)' },
      { id: 'exponential', label: 'O(2^(m + n))' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'grid', accepted: ['minimum'], explanation: 'DP обходит m · n клеток. Допустима комбинаторика из материала: O(min(m, n)) времени.' },
      { id: 'space', title: 'Дополнительная память', expected: 'columns', accepted: ['rows', 'minimum', 'grid', 'constant'], explanation: 'Rolling array требует O(n), либо O(m) при обходе по столбцам, либо O(min(m, n)) при выборе короткой стороны. Полная таблица — O(m · n), комбинаторика — O(1).' },
    ],
  },
  verificationNote: 'uniquePaths(m, n) возвращает число путей. Проверяются только размеры с гарантированным 32-битным ответом, а не все пары до 100 × 100. Тесты не доказывают Big O; оценки времени и памяти должны соответствовать одному подходу.',
  runner: { kind: 'function', entryPoint: 'uniquePaths', output: { kind: 'return' }, comparison: 'exact', cases },
};
