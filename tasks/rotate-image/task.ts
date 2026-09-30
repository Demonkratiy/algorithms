import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const rotateImageTask: TaskDefinition = {
  id: 'rotate-image',
  title: 'Rotate Image',
  starter,
  complexity: {
    variables: 'N — число строк и столбцов квадратной матрицы. Память — дополнительная, без изменяемого входа.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'cubic', label: 'O(N³)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'quadratic', explanation: 'Нужно переставить элементы N × N матрицы, выполняя константное число действий на элемент.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Цель — поворот на месте без новой матрицы, с несколькими индексами и временным значением.' },
    ],
  },
  verificationNote: 'Проверяется изменённый аргумент matrix, а не return. Тесты не доказывают отсутствие временной копии или O(1) памяти — это проверяется ревью.',
  runner: { kind: 'function', entryPoint: 'rotate', output: { kind: 'argument', index: 0 }, comparison: 'exact', cases },
};
