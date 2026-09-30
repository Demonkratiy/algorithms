import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const permutationsTask: TaskDefinition = {
  id: 'permutations',
  title: 'Permutations',
  starter,
  complexity: {
    variables: 'N — число уникальных элементов, 1 ≤ N ≤ 6. Рабочая память исключает ответ размером O(N · N!).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'exponential', label: 'O(N · 2^N)' },
      { id: 'factorial', label: 'O(N!)' },
      { id: 'output', label: 'O(N · N!)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время с построением ответа', expected: 'output', explanation: 'N! перестановок, каждая копируется за O(N): O(N · N!).' },
      { id: 'space', title: 'Рабочая память без ответа', expected: 'linear', explanation: 'Стек, путь и used занимают O(N). Swap убирает used, но не стек O(N); ответ отдельно занимает O(N · N!).' },
    ],
  },
  verificationNote: 'Порядок строк ответа любой, порядок элементов каждой перестановки важен. Дубликатов во входе нет. Допускается swap с восстановлением входа из материала. Тесты проверяют полноту ответа, но не backtracking или Big O.',
  runner: { kind: 'function', entryPoint: 'permute', output: { kind: 'return' }, comparison: 'unordered-tuples', cases },
};
