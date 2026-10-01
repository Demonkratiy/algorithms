import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const maxDepthTask: TaskDefinition = {
  id: 'max-depth',
  title: 'Maximum Depth of Binary Tree',
  starter,
  verificationNote: 'Проверяется глубина в узлах. Тесты не доказывают оценки сложности; DFS и BFS допустимы.',
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
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'DFS и BFS посещают каждый узел. Для линейного времени очередь не должна многократно сдвигать массив через shift().' },
      { id: 'space', title: 'Дополнительная память', expected: 'height', accepted: ['width', 'linear'], explanation: 'DFS: O(H), включая стек; BFS с освобождением обработанных элементов: O(W). Массив очереди с растущим head без сокращения занимает O(N). H достигает N у цепочки, W достигает O(N) у полного дерева.' },
    ],
  },
  runner: { kind: 'binary-tree', entryPoint: 'maxDepth', cases },
};
