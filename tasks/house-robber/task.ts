import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const houseRobberTask: TaskDefinition = {
  id: 'house-robber',
  title: 'House Robber',
  starter,
  complexity: {
    variables: 'N = nums.length, 1 ≤ N ≤ 100. Дополнительная память включает таблицу и стек, но не вход; результат — число O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'exponential', label: 'O(2^N)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', explanation: 'Один переход на каждый дом: O(N).' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', accepted: ['linear'], explanation: 'Два последних состояния — O(1); таблица или кеш со стеком — O(N). Оба подхода допустимы.' },
    ],
  },
  verificationNote: 'rob(nums) возвращает максимальную сумму для непустого ряда домов. Изменение входа условием не запрещено. Проверка значений не доказывает сложность.',
  runner: { kind: 'function', entryPoint: 'rob', output: { kind: 'return' }, comparison: 'exact', cases },
};
