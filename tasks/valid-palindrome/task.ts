import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const validPalindromeTask: TaskDefinition = {
  id: 'valid-palindrome',
  title: 'Valid Palindrome',
  starter,
  complexity: {
    variables: 'N — длина исходной строки. Память — дополнительная, без входа и результата.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'В худшем случае нужно проверить всю строку; указатели проходят её за линейное время.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Целевой подход хранит только указатели и текущие символы. Очищенная копия строки потребовала бы O(N) дополнительной памяти.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'isPalindrome', output: { kind: 'return' }, comparison: 'exact', cases },
};
