import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Один дом разрешено взять', args: [[5]], expected: 5 },
  { name: 'Один нулевой дом', args: [[0]], expected: 0 },
  { name: 'Два дома — первый больше', args: [[9, 3]], expected: 9 },
  { name: 'Два дома — второй больше', args: [[3, 9]], expected: 9 },
  { name: 'Треугольник соседей', args: [[2, 3, 2]], expected: 3 },
  { name: 'Пример с четырьмя домами', args: [[1, 2, 3, 1]], expected: 4 },
  { name: 'Первый и последний конфликтуют', args: [[2, 1, 1, 2]], expected: 3 },
  { name: 'Дорогие крайние дома нельзя сложить', args: [[10, 1, 1, 10]], expected: 11 },
  { name: 'Нужно исключить последний', args: [[10, 1, 2, 1]], expected: 12 },
  { name: 'Нужно исключить первый', args: [[1, 2, 1, 10]], expected: 12 },
  { name: 'Нечётный круг с равными деньгами', args: [[4, 4, 4, 4, 4]], expected: 8 },
  { name: 'Все нули', args: [[0, 0, 0]], expected: 0 },
  { name: 'Сто домов по кругу', args: [Array(100).fill(400)], expected: 20000 },
];
