import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const lowestCommonAncestorTask: TaskDefinition = {
  id: 'lowest-common-ancestor',
  title: 'Lowest Common Ancestor — Binary Search Tree',
  starter,
  verificationNote: 'p и q — разные существующие узлы BST с уникальными значениями. Проверяется исходный узел по ссылке, не значение и не копия. Тесты не доказывают оценки сложности.',
  complexity: {
    variables: 'N — число узлов; H — высота в узлах; W — максимальное число узлов на одном уровне. Оцени худший случай для произвольного, не обязательно сбалансированного BST.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'height', label: 'O(H)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'height', explanation: 'Свойство BST позволяет пройти один путь длиной до H. O(log N) верно лишь при балансе; у цепочки H = N. Полный обход O(N) может дать правильный ответ, но не использует целевое преимущество BST.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', accepted: ['height'], explanation: 'Итеративный поиск использует O(1) ссылок. Рекурсивный поиск по одному пути допустим, но требует O(H) стека — эту память нельзя игнорировать.' },
    ],
  },
  runner: { kind: 'binary-tree', entryPoint: 'lowestCommonAncestorBST', cases },
};
