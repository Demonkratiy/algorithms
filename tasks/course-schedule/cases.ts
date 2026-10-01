import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Один курс', args: [1, []], expected: true },
  { name: 'Независимые курсы', args: [5, []], expected: true },
  { name: 'Одна зависимость', args: [2, [[1, 0]]], expected: true },
  { name: 'Взаимная зависимость', args: [2, [[1, 0], [0, 1]]], expected: false },
  { name: 'Ромб — повторное достижение не цикл', args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true },
  { name: 'Несвязные цепочки и изолированный курс', args: [6, [[1, 0], [4, 3], [2, 1]]], expected: true },
  { name: 'Цикл в отдельной компоненте', args: [6, [[1, 0], [3, 2], [4, 3], [2, 4]]], expected: false },
  { name: 'Цикл после доступного старта', args: [4, [[1, 0], [2, 1], [3, 2], [1, 3]]], expected: false },
  { name: 'Зависимости от больших номеров', args: [5, [[0, 4], [1, 4], [2, 0], [3, 1], [3, 2]]], expected: true },
  { name: 'Максимальная длина цепочки', args: [2000, Array.from({ length: 1999 }, (_, i) => [i + 1, i])], expected: true },
];
