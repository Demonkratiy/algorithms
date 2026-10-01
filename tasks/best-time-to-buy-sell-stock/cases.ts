import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Один день', args: [[1]], expected: 0 },
  { name: 'Одна нулевая цена', args: [[0]], expected: 0 },
  { name: 'Пример одной сделки', args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
  { name: 'Только падение', args: [[7, 6, 4, 3, 1]], expected: 0 },
  { name: 'Плато без прибыли', args: [[5, 5, 5, 5]], expected: 0 },
  { name: 'Продать только после покупки', args: [[10, 2, 4, 1]], expected: 2 },
  { name: 'Не складывать прибыль сделок', args: [[1, 5, 3, 6]], expected: 5 },
  { name: 'Рост через плато', args: [[2, 2, 5, 5, 1, 1, 4]], expected: 3 },
  { name: 'Продажа в последний день', args: [[4, 1, 2, 3, 8]], expected: 7 },
  { name: 'Границы цен', args: [[0, 10000]], expected: 10000 },
  { name: 'Два дня без прибыли', args: [[10000, 0]], expected: 0 },
  { name: '512 дней чередующихся цен', args: [Array.from({ length: 512 }, (_, i) => i % 2 * 10000)], expected: 10000 },
];
