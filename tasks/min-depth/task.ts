import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const minDepthTask: TaskDefinition = {
  id: 'min-depth',
  title: 'Minimum Depth of Binary Tree',
  starter,
  verificationNote: 'Путь заканчивается в листе, а не в отсутствующем потомке. Тесты не доказывают оценки сложности.',
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
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'DFS обходит дерево; BFS может завершиться раньше на первом листе, но в худшем случае посещает O(N) узлов. Операции очереди должны быть амортизированно O(1).' },
      { id: 'space', title: 'Дополнительная память', expected: 'height', accepted: ['width', 'linear'], explanation: 'DFS требует O(H) стека, BFS с ограниченной активным фронтом очередью — O(W). Несокращаемый массив очереди занимает O(N). Для цепочки H = N, для широкого дерева W = O(N).' },
    ],
  },
  runner: { kind: 'binary-tree', entryPoint: 'minDepth', cases },
};
