import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Лучшее окно внутри строки', args: ['abciiidef', 3], expected: 3 },
  { name: 'Только гласные', args: ['aeiou', 2], expected: 2 },
  { name: 'Несколько лучших окон', args: ['leetcode', 3], expected: 2 },
  { name: 'Нет гласных, y не гласная', args: ['rhythms', 4], expected: 0 },
  { name: 'Одна гласная, k равно единице', args: ['a', 1], expected: 1 },
  { name: 'Одна согласная', args: ['z', 1], expected: 0 },
  { name: 'k равно длине строки', args: ['azebicoduf', 10], expected: 5 },
  { name: 'Лучшее окно самое первое', args: ['aeibbbb', 3], expected: 3 },
  { name: 'Лучшее окно самое последнее', args: ['bbbbaei', 3], expected: 3 },
  { name: 'Ушедшую гласную нужно вычесть', args: ['ababa', 2], expected: 1 },
  { name: 'Единичное окно и последняя гласная', args: ['bbbbbu', 1], expected: 1 },
  { name: 'Длинный префикс согласных перед полным окном гласных', args: ['b'.repeat(512) + 'a'.repeat(128), 128], expected: 128 },
];
