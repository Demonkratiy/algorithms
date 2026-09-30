import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const sqrtTask: TaskDefinition = {
  id: 'sqrt',
  title: 'Sqrt(x)',
  starter,
  complexity: {
    variables: 'x — входное неотрицательное целое. Память — дополнительная. Для x = 0 и x = 1 работа O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log x)' },
      { id: 'square-root', label: 'O(√x)' },
      { id: 'linear', label: 'O(x)' },
      { id: 'quadratic', label: 'O(x²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'logarithmic', explanation: 'Бинарный поиск по пространству целых ответов требует O(log x) итераций при x ≥ 2.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Для итеративного поиска достаточно границ и последнего подходящего кандидата.' },
    ],
  },
  verificationNote: 'Math.sqrt, Math.pow и ** запрещены условием. Тесты проверяют целую часть корня; запрет операций и асимптотика требуют ревью кода.',
  runner: { kind: 'function', entryPoint: 'mySqrt', output: { kind: 'return' }, comparison: 'exact', cases },
};
