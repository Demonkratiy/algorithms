import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const lowestCommonAncestorBinaryTreeTask: TaskDefinition = {
  id: 'lowest-common-ancestor-binary-tree',
  title: 'Lowest Common Ancestor — Binary Tree',
  starter,
  verificationNote: 'Свойства BST нет. p и q — разные существующие узлы с уникальными значениями; ответ сравнивается по ссылке. Тесты не доказывают оценки сложности.',
  complexity: {
    variables: 'N — число узлов; H — высота в узлах; W — максимальное число узлов на одном уровне. Дополнительная память включает стек и вспомогательные таблицы.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'height', label: 'O(H)' },
      { id: 'width', label: 'O(W)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'В обычном дереве значения не выбирают ветвь поиска; в худшем случае нужен обход O(N) узлов. Предок может совпадать с p или q.' },
      { id: 'space', title: 'Дополнительная память', expected: 'height', accepted: ['linear'], explanation: 'Рекурсивный обход или итеративный DFS с кадрами требует O(H). Итеративный поиск с Map родителей и Set предков — O(N). H достигает N у цепочки; умеренная глубина тестов позволяет рекурсию.' },
    ],
  },
  runner: { kind: 'binary-tree', entryPoint: 'lowestCommonAncestor', cases },
};
