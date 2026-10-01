import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const spiralMatrixTask: TaskDefinition = {
  id: 'spiral-matrix',
  title: 'Spiral Matrix',
  starter,
  complexity: {
    variables: 'M — число строк, N — число столбцов. Дополнительная память не включает вход и массив-результат из M × N элементов.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'rows', label: 'O(M)' },
      { id: 'columns', label: 'O(N)' },
      { id: 'perimeter', label: 'O(M + N)' },
      { id: 'cells', label: 'O(M × N)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'cells', explanation: 'Каждый элемент прямоугольной матрицы добавляется в ответ ровно один раз.' },
      { id: 'space', title: 'Дополнительная память без результата', expected: 'constant', explanation: 'Для обхода достаточно четырёх границ и индексов. Сам массив-результат занимает O(M × N) и здесь не учитывается.' },
    ],
  },
  verificationNote: 'Тесты проверяют точный порядок элементов, но не доказывают O(1) дополнительной памяти без результата.',
  runner: { kind: 'function', entryPoint: 'spiralOrder', output: { kind: 'return' }, comparison: 'exact', cases },
};
