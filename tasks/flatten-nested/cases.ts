import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Пустой массив', args: [[]], expected: [] },
  { name: 'Только пустые массивы', args: [[[], [[]]]], expected: [] },
  { name: 'Один элемент', args: [[1]], expected: [1] },
  { name: 'По умолчанию полная глубина', args: [[1, [2, [3, [4]], 5]]], expected: [1, 2, 3, 4, 5] },
  { name: 'Глубина один', args: [[1, [2, [3, [4]], 5]], 1], expected: [1, 2, [3, [4]], 5] },
  { name: 'Глубина два', args: [[1, [2, [3, [4]], 5]], 2], expected: [1, 2, 3, [4], 5] },
  { name: 'Глубина ноль: новый массив', args: [[1, [2, [3]], []], 0], expected: [1, [2, [3]], []] },
  { name: 'Повторы и falsy значения', args: [[0, [false, [null, '', 0]], false]], expected: [0, false, null, '', 0, false] },
  { name: 'Объекты не разворачиваются', args: [[{ items: [1, [2]] }, [{ a: null }, [3]]]], expected: [{ items: [1, [2]] }, { a: null }, 3] },
  { name: 'Глубина больше структуры', args: [[[1], [[], [2]], 3], 10], expected: [1, 2, 3] },
  { name: 'Соседние ветки не расходуют общую глубину', args: [[[1, [2]], [3, [4]]], 1], expected: [1, [2], 3, [4]] },
];
