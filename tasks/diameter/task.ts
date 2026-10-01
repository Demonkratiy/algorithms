import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const diameterTask: TaskDefinition = {
  id: 'diameter',
  title: 'Diameter of Binary Tree',
  starter,
  verificationNote: 'Диаметр измеряется в рёбрах и не обязан проходить через корень. Пустое дерево включено по явному примеру материала, несмотря на нижнюю границу N = 1 в ограничениях. Тесты не доказывают линейное время.',
  complexity: {
    variables: 'N — число узлов; H — высота в узлах; W — максимальное число узлов на одном уровне. Дополнительная память включает стек вызовов и вспомогательные таблицы.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'height', label: 'O(H)' },
      { id: 'width', label: 'O(W)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Цель — один post-order обход. Повторные обходы для вычисления высот могут дать O(N²), даже если небольшие тесты проходят.' },
      { id: 'space', title: 'Дополнительная память', expected: 'height', accepted: ['linear'], explanation: 'Рекурсивный post-order или итеративный стек кадров с промежуточными результатами требует O(H). Итеративная версия с Map высот всех узлов требует O(N). У цепочки H = N; тесты умеренной глубины не запрещают рекурсию.' },
    ],
  },
  runner: { kind: 'binary-tree', entryPoint: 'diameterOfBinaryTree', cases },
};
