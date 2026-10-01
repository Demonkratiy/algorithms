import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Пример — три монеты', args: [[1, 2, 5], 11], expected: 3 },
  { name: 'Недостижимая сумма', args: [[2], 3], expected: -1 },
  { name: 'Нулевая сумма', args: [[1], 0], expected: 0 },
  { name: 'Жадность не оптимальна', args: [[1, 3, 4], 6], expected: 2 },
  { name: 'Жадность не находит существующий ответ', args: [[3, 4], 6], expected: 2 },
  { name: 'Один номинал можно повторять', args: [[2], 8], expected: 4 },
  { name: 'Монета точно равна сумме', args: [[7, 2, 3], 7], expected: 1 },
  { name: 'Все монеты больше суммы', args: [[5, 10], 3], expected: -1 },
  { name: 'Номиналы не отсортированы', args: [[5, 1, 2], 11], expected: 3 },
  { name: 'Большой номинал безопасно пропускается', args: [[2147483647, 2], 4], expected: 2 },
  { name: 'Большая сумма с несколькими номиналами', args: [[1, 7, 10], 1000], expected: 100 },
  { name: 'Верхняя граница суммы', args: [[1], 10000], expected: 10000 },
];
