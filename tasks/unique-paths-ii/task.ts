import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const uniquePathsIITask: TaskDefinition = {
  id: 'unique-paths-ii',
  title: 'Unique Paths II',
  starter,
  complexity: {
    variables: 'm = obstacleGrid.length, n = obstacleGrid[0].length, 1 ≤ m, n ≤ 100. Память — дополнительная, включая кеш и стек, без входа; скалярный выход — O(1).',
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
      { id: 'time', title: 'Время функции', expected: 'grid', explanation: 'В худшем случае DP обрабатывает каждую клетку: O(m · n). Формула без препятствий здесь не подходит.' },
      { id: 'space', title: 'Дополнительная память', expected: 'columns', accepted: ['rows', 'minimum', 'grid'], explanation: 'Одна строка — O(n), один столбец — O(m), выбор короткой стороны — O(min(m, n)). Полная таблица/кеш — O(m · n). Перезаписывать вход для O(1) запрещает условие.' },
    ],
  },
  verificationNote: 'uniquePathsWithObstacles(obstacleGrid) возвращает число путей, не изменяя сетку. 0 — свободно, 1 — препятствие. Ответ и промежуточные состояния безопасны для JS Number, не обязательно 32-битные. Big O проверяется ревью.',
  runner: { kind: 'function', entryPoint: 'uniquePathsWithObstacles', output: { kind: 'return' }, comparison: 'exact', preserveArgs: [0], cases },
};
