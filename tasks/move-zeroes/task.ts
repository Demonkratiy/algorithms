import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const moveZeroesTask: TaskDefinition = {
  id: 'move-zeroes',
  title: 'Move Zeroes',
  starter,
  complexity: {
    variables: 'N — длина nums. Память — дополнительная, без изменяемого входного массива.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Достаточно линейного числа чтений и записей, даже если нули стоят перед всеми ненулевыми элементами.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Перемещение выполняется in-place: несколько индексов и временное значение, без копии массива.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'moveZeroes', output: { kind: 'argument', index: 0 }, comparison: 'exact', cases },
};
