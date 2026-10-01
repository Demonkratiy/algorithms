import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Одна клетка', args: [1, 1], expected: 1 },
  { name: 'Одна длинная строка', args: [1, 100], expected: 1 },
  { name: 'Один длинный столбец', args: [100, 1], expected: 1 },
  { name: 'Два на два', args: [2, 2], expected: 2 },
  { name: 'Прямоугольник из примера', args: [3, 7], expected: 28 },
  { name: 'Транспонированный прямоугольник', args: [7, 3], expected: 28 },
  { name: 'Три на два', args: [3, 2], expected: 3 },
  { name: 'Квадрат три на три', args: [3, 3], expected: 6 },
  { name: 'Большой узкий прямоугольник', args: [100, 3], expected: 5050 },
  { name: 'Большой квадрат с 32-битным ответом', args: [17, 17], expected: 601080390 },
];
