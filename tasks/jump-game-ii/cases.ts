import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Уже на финише с нулём', args: [[0]], expected: 0 },
  { name: 'Уже на финише с большим прыжком', args: [[100000]], expected: 0 },
  { name: 'Пример минимального числа', args: [[2, 3, 1, 1, 4]], expected: 2 },
  { name: 'Пример с нулём', args: [[2, 3, 0, 1, 4]], expected: 2 },
  { name: 'Не прыгать с последнего индекса', args: [[1, 1]], expected: 1 },
  { name: 'Нулевой финиш', args: [[1, 0]], expected: 1 },
  { name: 'Перепрыгнуть нулевой барьер', args: [[3, 0, 0, 0]], expected: 1 },
  { name: 'Прыгнуть короче максимума', args: [[2, 3, 0, 0, 0]], expected: 2 },
  { name: 'Большой прыжок за границу массива', args: [[100000, 0, 0]], expected: 1 },
  { name: 'Не считать каждую позицию прыжком', args: [[2, 2, 2, 2, 0]], expected: 2 },
  { name: 'Выбирать достижимость а не только значение', args: [[3, 3, 1, 2, 0, 0]], expected: 2 },
  { name: '512 позиций и 511 прыжков', args: [Array.from({ length: 512 }, (_, i) => i === 511 ? 0 : 1)], expected: 511 },
];
