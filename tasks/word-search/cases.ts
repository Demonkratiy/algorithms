import type { FunctionCase } from '../types';

const example = () => [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']];
export const cases: FunctionCase[] = [
  { name: 'Единственная буква', args: [[['A']], 'A'], expected: true },
  { name: 'Буква отсутствует', args: [[['A']], 'B'], expected: false },
  { name: 'Повороты пути', args: [example(), 'ABCCED'], expected: true },
  { name: 'Неудачная ветка перед успешной', args: [example(), 'SEE'], expected: true },
  { name: 'Нельзя повторно использовать B', args: [example(), 'ABCB'], expected: false },
  { name: 'Одну клетку нельзя повторять', args: [[['A', 'B']], 'ABA'], expected: false },
  { name: 'Диагонального соседства нет', args: [[['A', 'X'], ['X', 'B']], 'AB'], expected: false },
  { name: 'Нужно пробовать другие старты', args: [[['A', 'B', 'A'], ['C', 'D', 'X']], 'ABAC'], expected: true },
  { name: 'Откат всех веток после неудачи', args: [[['A', 'A'], ['A', 'B']], 'AAABAA'], expected: false },
  { name: 'Путь справа налево', args: [[['D', 'C', 'B', 'A']], 'ABCD'], expected: true },
  { name: 'Путь снизу вверх', args: [[['C'], ['B'], ['A']], 'ABC'], expected: true },
  { name: 'Регистр различается', args: [[['a', 'B']], 'AB'], expected: false },
  { name: 'Смешанный регистр', args: [[['a', 'B']], 'aB'], expected: true },
  { name: 'Длина слова 15 на сетке 6 на 6', args: [
    Array.from({ length: 6 }, (_, r) => Array.from({ length: 6 }, (_, c) => {
      const index = r * 6 + (r % 2 === 0 ? c : 5 - c);
      return index < 15 ? String.fromCharCode(65 + index) : 'z';
    })), 'ABCDEFGHIJKLMNO',
  ], expected: true },
];
