import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const validateBstTask: TaskDefinition = {
  id: 'validate-bst',
  title: 'Validate Binary Search Tree',
  starter,
  verificationNote: 'Неравенства строгие и действуют для всего поддерева. Пустое дерево включено по явному примеру материала, несмотря на нижнюю границу N = 1 в списке ограничений. Тесты не доказывают оценки сложности.',
  complexity: {
    variables: 'N — число узлов; H — высота в узлах; W — максимальное число узлов на одном уровне. Оцени худший случай и дополнительную память, включая стек.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'height', label: 'O(H)' },
      { id: 'width', label: 'O(W)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'В худшем случае проверяется каждый узел. Допустимы DFS с границами, in-order и BFS с границами; ранний выход не меняет худший случай.' },
      { id: 'space', title: 'Дополнительная память', expected: 'height', accepted: ['width', 'linear'], explanation: 'DFS и итеративный in-order используют O(H) стека; BFS с границами и ограниченной очередью — O(W). Сохранение всей in-order последовательности или несокращаемой очереди требует O(N). У вырожденного дерева H = N.' },
    ],
  },
  runner: { kind: 'binary-tree', entryPoint: 'isValidBST', cases },
};
