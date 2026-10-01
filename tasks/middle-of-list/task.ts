import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const middleOfListTask: TaskDefinition = {
  id: 'middle-of-list',
  title: 'Middle of the Linked List',
  starter,
  complexity: {
    variables: 'N — число узлов непустого списка. При чётном N нужна вторая середина — исходный узел, не копия.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Цель — один проход за O(N). Подсчёт длины и повторный проход тоже дают O(N), поэтому одного Big O и функциональных тестов недостаточно для проверки требования одного прохода.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Цель — O(1) ссылок без массива или коллекции узлов. Тесты проверяют исходную ссылку результата, но не доказывают оценку памяти.' },
    ],
  },
  runner: { kind: 'linked-list', entryPoint: 'middleNode', cases },
};
