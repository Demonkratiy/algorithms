import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const levelOrderTask: TaskDefinition = {
  id: 'level-order',
  title: 'Binary Tree Level Order Traversal',
  starter,
  verificationNote: 'Проверяется порядок уровней и узлов слева направо. BFS и DFS допустимы; тесты не доказывают оценки сложности.',
  complexity: {
    variables: 'N — число узлов; H — высота в узлах; W — максимальное число узлов на одном уровне. Дополнительную память оцени без результата O(N), но со стеком вызовов.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'height', label: 'O(H)' },
      { id: 'width', label: 'O(W)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Каждый узел добавляет одно значение в ответ. У BFS операции очереди должны быть амортизированно O(1); shift() может дать квадратичное время на широком дереве.' },
      { id: 'space', title: 'Дополнительная память без результата', expected: 'width', accepted: ['height', 'linear'], explanation: 'BFS с хранением только активного фронта требует O(W); DFS с номером уровня — O(H). Несокращаемая очередь-массив с head хранит O(N) ссылок, даже если активный фронт узкий. Сам результат отдельно занимает O(N).' },
    ],
  },
  runner: { kind: 'binary-tree', entryPoint: 'levelOrder', cases },
};
