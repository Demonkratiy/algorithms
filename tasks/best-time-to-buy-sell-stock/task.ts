import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const bestTimeToBuySellStockTask: TaskDefinition = {
  id: 'best-time-to-buy-sell-stock', title: 'Best Time to Buy and Sell Stock I', starter,
  verificationNote: '1 <= prices.length <= 10^5; целые цены от 0 до 10^4. Не более одной сделки, продажа строго позже покупки; можно не торговать. Верни число. Мутация входа разрешена. Тесты не доказывают сложность.',
  complexity: {
    variables: 'N — число дней. Оцениваем дополнительную память.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' }, { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Один проход по дням: O(N).' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Достаточно постоянного числа переменных: O(1).' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'maxProfit', output: { kind: 'return' }, comparison: 'exact', cases },
};
