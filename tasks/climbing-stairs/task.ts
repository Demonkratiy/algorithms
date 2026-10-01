import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const climbingStairsTask: TaskDefinition = {
  id: 'climbing-stairs',
  title: 'Climbing Stairs',
  starter,
  complexity: {
    variables: 'N = n, 1 ≤ n ≤ 45. Дополнительная память включает таблицу, кеш и стек; скалярный результат занимает O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'exponential', label: 'O(2^N)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'DP вычисляет каждое состояние один раз: O(N). Наивный повторный перебор не достигает цели.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', accepted: ['linear'], explanation: 'Два состояния требуют O(1); таблица или мемоизация со стеком из материала требуют O(N).' },
    ],
  },
  verificationNote: 'Проверяется одна функция climbStairs(n), возвращающая число. Helpers climbStairsMemo и climbStairsTable не требуются. Тесты проверяют значения, но не доказывают DP или Big O.',
  runner: { kind: 'function', entryPoint: 'climbStairs', output: { kind: 'return' }, comparison: 'exact', cases },
};
