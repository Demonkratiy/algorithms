import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const countCommentsTask: TaskDefinition = {
  id: 'count-comments',
  title: 'Count Comments',
  starter,
  complexity: {
    variables: 'N — число комментариев; D — максимальная глубина стека DFS, включая корневой массив. Память дополнительная; числовой результат — O(1). Пустой вход обрабатывается за O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'depth', label: 'O(D)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Каждый комментарий считается один раз независимо от id: O(N).' },
      { id: 'space', title: 'Дополнительная память', expected: 'depth', explanation: 'Рекурсивный DFS удерживает только текущую ветку — O(D), а не все N узлов одновременно.' },
    ],
  },
  verificationNote: 'Конечное дерево без циклов и общих узлов; replies — массив, null или отсутствует. Вход не изменять. Тесты проверяют количество и сохранность аргумента, но не доказывают рекурсию или Big O.',
  runner: { kind: 'function', entryPoint: 'countComments', output: { kind: 'return' }, comparison: 'exact', preserveArgs: [0], cases },
};
