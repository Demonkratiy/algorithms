import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const invertTreeTask: TaskDefinition = {
  id: 'invert-tree',
  title: 'Invert Binary Tree',
  starter,
  verificationNote: 'Материал явно требует изменения на месте: проверяются структура, значения и использование исходных узлов. Тесты не доказывают оценки сложности.',
  complexity: {
    variables: 'N — число узлов; H — высота в узлах; W — максимальное число узлов на одном уровне. Оцени дополнительную память, включая стек; исходные узлы не копируются.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'height', label: 'O(H)' },
      { id: 'width', label: 'O(W)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Обход всех N узлов с постоянной работой в каждом; итеративные DFS и BFS также допустимы. Для BFS нужна очередь без линейного сдвига при каждом извлечении.' },
      { id: 'space', title: 'Дополнительная память', expected: 'height', accepted: ['width', 'linear'], explanation: 'Рекурсивный или стековый DFS: O(H); BFS с освобождением обработанной части: O(W). Очередь-массив, хранящая все посещённые ссылки, требует O(N). Это вспомогательная память, несмотря на изменение дерева на месте.' },
    ],
  },
  runner: { kind: 'binary-tree', entryPoint: 'invertTree', cases },
};
