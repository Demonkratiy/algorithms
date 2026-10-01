import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Единственный дом', args: [[5]], expected: 5 },
  { name: 'Один пустой дом', args: [[0]], expected: 0 },
  { name: 'Два дома — выбрать больший', args: [[3, 9]], expected: 9 },
  { name: 'Два дома — первый больше', args: [[9, 3]], expected: 9 },
  { name: 'Пример с четырьмя домами', args: [[1, 2, 3, 1]], expected: 4 },
  { name: 'Пример с пятью домами', args: [[2, 7, 9, 3, 1]], expected: 12 },
  { name: 'Не сумма чётных или нечётных', args: [[2, 1, 1, 2]], expected: 4 },
  { name: 'Первый и последний не соседи', args: [[10, 1, 1, 10]], expected: 20 },
  { name: 'Нулевые промежутки', args: [[0, 8, 0, 0, 9, 0]], expected: 17 },
  { name: 'Все нули', args: [[0, 0, 0, 0]], expected: 0 },
  { name: 'Равные суммы домов', args: [[4, 4, 4, 4, 4]], expected: 12 },
  { name: 'Сто домов на верхней границе денег', args: [Array(100).fill(400)], expected: 20000 },
];
