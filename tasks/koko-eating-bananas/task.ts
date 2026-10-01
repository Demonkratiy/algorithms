import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const kokoEatingBananasTask: TaskDefinition = {
  id: 'koko-eating-bananas',
  title: 'Koko Eating Bananas',
  starter,
  complexity: {
    variables: 'N — число куч, M — max(piles). Память — дополнительная, без входного массива.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log M)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'answer-search', label: 'O(N log M)' },
      { id: 'brute-force', label: 'O(N × M)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'answer-search', explanation: 'Каждая проверка скорости проходит N куч; бинарный поиск выполняет O(log M) таких проверок (при M = 1 достаточно O(N)).' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Максимум и часы можно считать циклами, храня лишь несколько чисел, без массивов промежуточных результатов.' },
    ],
  },
  verificationNote: 'Все входы имеют piles.length ≤ h, поэтому допустимая скорость существует. Тесты не доказывают асимптотику.',
  runner: { kind: 'function', entryPoint: 'minEatingSpeed', output: { kind: 'return' }, comparison: 'exact', cases },
};
