import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const fibonacciMemoTask: TaskDefinition = {
  id: 'fibonacci-memo',
  title: 'Fibonacci с мемоизацией',
  starter,
  complexity: {
    variables: 'N = n, 0 ≤ n ≤ 50. Память — дополнительная, включая кеш и стек; числовой результат занимает O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'exponential', label: 'O(2^N)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Мемоизация вычисляет каждое F(k) один раз: O(N). Наивная экспоненциальная рекурсия не достигает цели.' },
      { id: 'space', title: 'Дополнительная память', expected: 'linear', explanation: 'Кеш и стек рекурсивной версии занимают O(N). Итеративная версия из материала — отдельный подход с O(1) памяти, здесь цель — мемоизация.' },
    ],
  },
  verificationNote: 'Одна цель: fibMemo(n, memo = new Map()). Наивный и итеративный helper не требуются. Тесты проверяют значения, но не доказывают рекурсию, мемоизацию или Big O — это проверяется ревью.',
  runner: { kind: 'function', entryPoint: 'fibMemo', output: { kind: 'return' }, comparison: 'exact', cases },
};
