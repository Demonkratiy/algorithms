import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Один элемент', args: [[5]], expected: 1 },
  { name: 'Единственный ноль', args: [[0]], expected: 1 },
  { name: 'Пример — подпоследовательность с пропусками', args: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
  { name: 'Повторяющиеся значения', args: [[0, 1, 0, 3, 2, 3]], expected: 4 },
  { name: 'Равные элементы не возрастают', args: [[7, 7, 7, 7]], expected: 1 },
  { name: 'Убывающий массив', args: [[5, 4, 3, 2, 1]], expected: 1 },
  { name: 'Ответ заканчивается не последним элементом', args: [[1, 2, 3, 0]], expected: 3 },
  { name: 'Не только непрерывный подмассив', args: [[1, 4, 2, 5, 3, 6]], expected: 4 },
  { name: 'Исходный порядок нельзя сортировать', args: [[3, 1, 2]], expected: 2 },
  { name: 'Отрицательные и граничные значения', args: [[-10000, -5, -5, 0, 10000]], expected: 4 },
  { name: 'Длинный массив с дубликатами', args: [Array.from({ length: 600 }, (_, i) => Math.floor(i / 3) - 100)], expected: 200 },
  { name: 'Верхняя граница длины по убыванию', args: [Array.from({ length: 2500 }, (_, i) => 2500 - i)], expected: 1 },
];
