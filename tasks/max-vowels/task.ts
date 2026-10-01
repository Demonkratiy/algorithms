import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const maxVowelsTask: TaskDefinition = {
  id: 'max-vowels',
  title: 'Maximum Number of Vowels in a Substring of Length K',
  starter,
  complexity: {
    variables: 'N — длина s, K — длина окна k. Память — дополнительная, без входа и результата.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'window', label: 'O(K)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'rescan', label: 'O(N · K)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Первое окно считается один раз, затем каждый сдвиг требует постоянного числа операций. Полный повторный подсчёт каждого окна не нужен.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Счётчики и набор из пяти гласных имеют постоянный размер. Саму подстроку окна хранить не нужно.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'maxVowels', output: { kind: 'return' }, comparison: 'exact', cases },
};
