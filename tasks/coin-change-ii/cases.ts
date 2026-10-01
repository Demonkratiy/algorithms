import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Пример — четыре комбинации', args: [5, [1, 2, 5]], expected: 4 },
  { name: 'Комбинации, не перестановки', args: [3, [1, 2]], expected: 2 },
  { name: 'Нельзя набрать сумму', args: [3, [2]], expected: 0 },
  { name: 'Ноль без номиналов', args: [0, []], expected: 1 },
  { name: 'Положительная сумма без номиналов', args: [4, []], expected: 0 },
  { name: 'Ноль с номиналами', args: [0, [1, 3]], expected: 1 },
  { name: 'Неограниченное повторение', args: [8, [2]], expected: 1 },
  { name: 'Все номиналы больше суммы', args: [3, [5, 1000000]], expected: 0 },
  { name: 'Порядок номиналов не важен', args: [5, [5, 2, 1]], expected: 4 },
  { name: 'Две комбинации без единицы', args: [6, [2, 3]], expected: 2 },
  { name: 'Умеренно большая сумма', args: [100, [1, 2, 5]], expected: 541 },
  { name: 'Верхняя граница суммы с безопасными счётчиками', args: [5000, [1, 2]], expected: 2501 },
];
