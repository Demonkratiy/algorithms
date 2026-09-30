import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const rottingOrangesTask: TaskDefinition = {
  id: 'rotting-oranges',
  title: 'Rotting Oranges',
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
      { id: 'time', title: 'Время', expected: 'cells', explanation: 'Multi-source BFS посещает каждую клетку не более константного числа раз.' },
      { id: 'space', title: 'Дополнительная память', expected: 'cells', explanation: 'Очередь всех источников и заражённых клеток в худшем случае занимает O(R × C).' },
    ],
  },
  verificationNote: 'Проверяется число минут, а не итоговая сетка. Мутация grid разрешена; тесты не подтверждают заявленную сложность.',
  runner: { kind: 'function', entryPoint: 'orangesRotting', output: { kind: 'return' }, comparison: 'exact', cases },
};
