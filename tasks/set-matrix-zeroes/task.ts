import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const setMatrixZeroesTask: TaskDefinition = {
  id: 'set-matrix-zeroes',
  title: 'Set Matrix Zeroes',
  starter,
  complexity: {
    variables: 'M — число строк, N — число столбцов. Память — дополнительная, без изменяемого входа.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'rows', label: 'O(M)' },
      { id: 'columns', label: 'O(N)' },
      { id: 'perimeter', label: 'O(M + N)' },
      { id: 'cells', label: 'O(M × N)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'cells', explanation: 'Константного числа проходов по M × N клеткам достаточно для учёта исходных нулей и изменения матрицы.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Целевой вариант хранит флаги в самом входе. Два Set требуют O(M + N), а копия — O(M × N) памяти.' },
    ],
  },
  verificationNote: 'Проверяется изменённый аргумент matrix, а не return. Тесты не доказывают отсутствие временной копии или O(1) памяти — это проверяется ревью.',
  runner: { kind: 'function', entryPoint: 'setZeroes', output: { kind: 'argument', index: 0 }, comparison: 'exact', cases },
};
