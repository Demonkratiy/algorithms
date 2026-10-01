import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Пустая клетка', args: [[[0]]], expected: 0 },
  { name: 'Только гнилой', args: [[[2]]], expected: 0 },
  { name: 'Свежий без источника', args: [[[1]]], expected: -1 },
  { name: 'Четыре минуты', args: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4 },
  { name: 'Недостижимая свежая компонента', args: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expected: -1 },
  { name: 'Два источника одновременно', args: [[[2, 1, 1, 1, 2]]], expected: 2 },
  { name: 'Все соседи за одну минуту', args: [[[0, 1, 0], [1, 2, 1], [0, 1, 0]]], expected: 1 },
  { name: 'Диагонали не заражают', args: [[[2, 0], [0, 1]]], expected: -1 },
  { name: 'Один столбец', args: [[[2], [1], [1], [1]]], expected: 3 },
  { name: 'Два независимых источника и компоненты', args: [[[2, 1, 0, 1, 2], [1, 1, 0, 1, 1]]], expected: 2 },
  { name: 'Свежих нет', args: [[[0, 2, 0], [2, 0, 2]]], expected: 0 },
  { name: 'Максимальная сетка с источником в углу', args: [
    Array.from({ length: 10 }, (_, r) => Array.from({ length: 10 }, (_, c) => r === 0 && c === 0 ? 2 : 1)),
  ], expected: 18 },
];
