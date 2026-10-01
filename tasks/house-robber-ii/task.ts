import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const houseRobberIITask: TaskDefinition = {
  id: 'house-robber-ii',
  title: 'House Robber II',
  starter,
  complexity: {
    variables: 'N = nums.length, 1 ≤ N ≤ 100. Дополнительная память учитывает slice, таблицу, кеш и стек; скалярный выход — O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'exponential', label: 'O(2^N)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Два линейных диапазона всё ещё требуют O(N) времени.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', accepted: ['linear'], explanation: 'Работа по границам с двумя состояниями — O(1); версия из материала со slice или таблицей — O(N).' },
    ],
  },
  verificationNote: 'Проверяется robCircular(nums), включая один и два дома. Линейный helper при необходимости добавь в редакторе. Запрета изменять вход нет; Big O требует ревью.',
  runner: { kind: 'function', entryPoint: 'robCircular', output: { kind: 'return' }, comparison: 'exact', cases },
};
