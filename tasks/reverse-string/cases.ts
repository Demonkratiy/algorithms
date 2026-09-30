import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Пустая строка', args: [''], expected: '' },
  { name: 'Один символ', args: ['a'], expected: 'a' },
  { name: 'Два символа', args: ['ab'], expected: 'ba' },
  { name: 'Нечётная длина', args: ['hello'], expected: 'olleh' },
  { name: 'Чётная длина', args: ['abcd'], expected: 'dcba' },
  { name: 'Повторы', args: ['aabca'], expected: 'acbaa' },
  { name: 'Пробелы, регистр и знаки', args: [' A b! '], expected: ' !b A ' },
  { name: 'ASCII управляющие символы', args: ['a\tb\n'], expected: '\nb\ta' },
];
