import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const flattenNestedTask: TaskDefinition = {
  id: 'flatten-nested',
  title: 'Flatten Nested Array',
  starter,
  complexity: {
    variables: 'N — просмотренные элементы на разрешённых уровнях; D — максимальная глубина активного обхода; K — длина результата. Рабочая память исключает O(K) результата; всего O(D + K).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'depth', label: 'O(D)' },
      { id: 'output', label: 'O(K)' },
      { id: 'repeated-copy', label: 'O(N · D)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Общий аккумулятор обрабатывает каждый просмотренный элемент один раз. Копирование подрезультатов на каждом уровне до O(N · D) не достигает линейной цели.' },
      { id: 'space', title: 'Рабочая память без результата', expected: 'depth', explanation: 'Стек O(D), включая верхний вызов. Результат из K элементов требует ещё O(K); вложенные объекты не нужно глубоко копировать.' },
    ],
  },
  verificationNote: 'Плотные конечные массивы без циклов. depth — неотрицательное целое или Infinity (в JSON-кейсах Infinity задаётся пропуском аргумента). Вход не изменять, результат — новый массив, включая depth = 0. flat запрещён; тесты не доказывают его отсутствие, рекурсию или Big O.',
  runner: { kind: 'function', entryPoint: 'flatten', output: { kind: 'return' }, comparison: 'exact', preserveArgs: [0], freshArray: true, cases },
};
