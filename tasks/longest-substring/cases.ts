import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Пустая строка', args: [''], expected: 0 },
  { name: 'Один символ', args: ['q'], expected: 1 },
  { name: 'Повторяющиеся блоки', args: ['abcabcbb'], expected: 3 },
  { name: 'Только одинаковые символы', args: ['bbbbb'], expected: 1 },
  { name: 'Подстрока, не подпоследовательность', args: ['pwwkew'], expected: 3 },
  { name: 'Все символы разные', args: ['abcdef'], expected: 6 },
  { name: 'Левая граница не должна идти назад', args: ['abba'], expected: 2 },
  { name: 'Повтор вне текущего окна', args: ['tmmzuxt'], expected: 5 },
  { name: 'Повтор требует нескольких удалений', args: ['dvdf'], expected: 3 },
  { name: 'Пробелы, цифры, пунктуация и регистр важны', args: ['aA1! a'], expected: 5 },
  { name: 'Два пробела — повтор', args: ['  '], expected: 1 },
  { name: 'Лучшее окно в самом конце', args: ['aaaaabcdef'], expected: 6 },
  { name: 'Длинная строка из циклических блоков алфавита', args: ['abcdefghijklmnopqrstuvwxyz'.repeat(32)], expected: 26 },
];
