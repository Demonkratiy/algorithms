import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Один день', args: [[1]], expected: 0 },
  { name: 'Одна нулевая цена', args: [[0]], expected: 0 },
  { name: 'Пример нескольких сделок', args: [[7, 1, 5, 3, 6, 4]], expected: 7 },
  { name: 'Только падение', args: [[7, 6, 4, 3, 1]], expected: 0 },
  { name: 'Плато без прибыли', args: [[5, 5, 5, 5]], expected: 0 },
  { name: 'Продать только после покупки', args: [[10, 2, 4, 1]], expected: 2 },
  { name: 'Сумма выгоднее одной сделки', args: [[1, 5, 3, 6]], expected: 7 },
  { name: 'Два роста через плато', args: [[2, 2, 5, 5, 1, 1, 4]], expected: 6 },
  { name: 'Непрерывный рост', args: [[1, 2, 3, 4, 5]], expected: 4 },
  { name: 'Границы цен', args: [[0, 10000]], expected: 10000 },
  { name: 'Два дня без прибыли', args: [[10000, 0]], expected: 0 },
  { name: '512 дней и 256 сделок', args: [Array.from({ length: 512 }, (_, i) => i % 2 * 10000)], expected: 2560000 },
];
