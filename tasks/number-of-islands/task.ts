import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const numberOfIslandsTask: TaskDefinition = {
  id: 'number-of-islands',
  title: 'Number of Islands',
  starter,
  complexity: {
    variables: 'R — число строк, C — число столбцов. Дополнительная память не включает вход и результат.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'dimensions', label: 'O(R + C)' },
      { id: 'cells', label: 'O(R × C)' },
      { id: 'quadratic', label: 'O((R × C)²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'cells', explanation: 'Каждая клетка и каждое из её четырёх соседств обрабатываются константное число раз.' },
      { id: 'space', title: 'Дополнительная память', expected: 'cells', explanation: 'В худшем случае очередь, стек обхода или visited занимают O(R × C), даже при пометках во входе.' },
    ],
  },
  verificationNote: 'Проверяется число островов, мутация grid разрешена. На большой сетке рекурсивный DFS может переполнить стек JavaScript; тесты не доказывают Big O.',
  runner: { kind: 'function', entryPoint: 'numIslands', output: { kind: 'return' }, comparison: 'exact', cases },
};
