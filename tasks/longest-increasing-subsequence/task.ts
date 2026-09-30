import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const longestIncreasingSubsequenceTask: TaskDefinition = {
  id: 'longest-increasing-subsequence',
  title: 'Longest Increasing Subsequence',
  starter,
  complexity: {
    variables: 'N = nums.length, 1 ≤ N ≤ 2500. Память — дополнительная таблица/tails и стек; возвращается только длина, O(1), не сама подпоследовательность.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'exponential', label: 'O(2^N)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'quadratic', accepted: ['linearithmic'], explanation: 'Ожидаемый DP перебирает предыдущие элементы: O(N²). Бонус из материала с tails и lower bound даёт O(N log N) и также принимается.' },
      { id: 'space', title: 'Дополнительная память', expected: 'linear', explanation: 'И таблица DP, и tails требуют O(N) памяти в худшем случае.' },
    ],
  },
  verificationNote: 'lengthOfLIS(nums) возвращает длину строго возрастающей подпоследовательности, не подмассива. Пустого входа нет. Изменение входа само по себе не запрещено; тесты не доказывают сложность.',
  runner: { kind: 'function', entryPoint: 'lengthOfLIS', output: { kind: 'return' }, comparison: 'exact', cases },
};
