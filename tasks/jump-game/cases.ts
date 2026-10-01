import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Уже на финише с нулём', args: [[0]], expected: true },
  { name: 'Уже на финише с большим прыжком', args: [[100000]], expected: true },
  { name: 'Пример достижимого финиша', args: [[2, 3, 1, 1, 4]], expected: true },
  { name: 'Нулевой барьер', args: [[3, 2, 1, 0, 4]], expected: false },
  { name: 'Нельзя использовать недостижимую позицию', args: [[0, 100000]], expected: false },
  { name: 'Перепрыгнуть ноль', args: [[2, 0, 1]], expected: true },
  { name: 'Последний индекс равен нулю', args: [[1, 0]], expected: true },
  { name: 'Ровно до последнего индекса', args: [[2, 0, 0]], expected: true },
  { name: 'Максимальная длина не обязательна', args: [[2, 3, 0, 0, 0]], expected: true },
  { name: 'Большой прыжок за границу массива', args: [[100000, 0, 0]], expected: true },
  { name: 'Барьер перед последним индексом', args: [[1, 1, 0, 1]], expected: false },
  { name: '512 позиций по одному шагу', args: [Array.from({ length: 512 }, (_, i) => i === 511 ? 0 : 1)], expected: true },
];
