import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Фраза с пробелами и разным регистром', args: ['A man, a plan, a canal: Panama'], expected: true },
  { name: 'Не палиндром после очистки', args: ['race a car'], expected: false },
  { name: 'Пробел даёт пустую очищенную строку', args: [' '], expected: true },
  { name: 'Только знаки препинания', args: ['.,:;!?_[]{}'], expected: true },
  { name: 'Один символ', args: ['Z'], expected: true },
  { name: 'Два разных символа', args: ['ab'], expected: false },
  { name: 'Чётная длина и регистр', args: ['aBbA'], expected: true },
  { name: 'Цифры нельзя игнорировать', args: ['0P'], expected: false },
  { name: 'Цифры и буквы вместе', args: ['1a2A1'], expected: true },
  { name: 'ASCII вокруг диапазонов букв и цифр', args: ['@A[`:_a!'], expected: true },
  { name: 'Различие в последней паре у центра', args: ['a'.repeat(256) + 'bc' + 'a'.repeat(256)], expected: false },
  { name: 'Длинный зеркальный блок с пунктуацией', args: ['.,'.repeat(128) + 'A1'.repeat(256) + '1a'.repeat(256) + '!?'.repeat(128)], expected: true },
];
