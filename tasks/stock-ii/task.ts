import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const stockIITask: TaskDefinition = {
  id: 'stock-ii', title: 'Best Time to Buy and Sell Stock II', starter,
  verificationNote: '1 <= prices.length <= 10^5; целые цены от 0 до 10^4. Число сделок не ограничено, одновременно не более одной акции; продажа и новая покупка в один день разрешены. Можно не торговать. Верни число. Мутация входа разрешена. Тесты не доказывают сложность.',
  complexity: {
    variables: 'N — число дней. Оцениваем дополнительную память.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' }, { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Один проход по ценам: O(N).' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Состояние не растёт с числом дней: O(1).' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'maxProfitMultiple', output: { kind: 'return' }, comparison: 'exact', cases },
};
