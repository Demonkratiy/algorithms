import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const longestSubstringTask: TaskDefinition = {
  id: 'longest-substring',
  title: 'Longest Substring Without Repeating Characters',
  starter,
  complexity: {
    variables: 'N — длина s, A — размер алфавита. Память — дополнительная, без входа и результата; зависимость от A указана явно.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'alphabet-bound', label: 'O(min(N, A))' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'При стандартной модели O(1) для Set/Map каждый символ добавляется и удаляется не более постоянного числа раз.' },
      { id: 'space', title: 'Дополнительная память', expected: 'alphabet-bound', accepted: ['constant'], explanation: 'Set/Map хранит не более min(N, A) различных символов: это общая оценка с явной зависимостью от алфавита. O(1) также принимается при допущении, что алфавит фиксирован независимо от N; это не означает, что любая реализация расходует постоянную память.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'lengthOfLongestSubstring', output: { kind: 'return' }, comparison: 'exact', cases },
};
