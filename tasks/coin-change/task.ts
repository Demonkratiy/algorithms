import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const coinChangeTask: TaskDefinition = {
  id: 'coin-change',
  title: 'Coin Change',
  starter,
  complexity: {
    variables: 'amount = целевая сумма (0…10000), C = coins.length (1…12). Память — дополнительная таблица и стек, выход — O(1). При amount = 0 база занимает O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'amount', label: 'O(amount + 1)' },
      { id: 'coins', label: 'O(C)' },
      { id: 'amount-coins', label: 'O(amount · C + 1)' },
      { id: 'amount-coins-table', label: 'O((amount + 1) · C)' },
      { id: 'exponential', label: 'O(C^amount)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'amount-coins', accepted: ['amount-coins-table'], explanation: 'Для каждой положительной суммы перебираем C монет: O(amount · C); +1 учитывает нулевую сумму. Версия с внешним циклом по монетам дополнительно обходит C номиналов.' },
      { id: 'space', title: 'Дополнительная память', expected: 'amount', accepted: ['amount-coins-table'], explanation: 'Таблица по сумме и возможный стек — O(amount + 1). Допустима и двумерная таблица по сумме и номиналам O((amount + 1) · C).' },
    ],
  },
  verificationNote: 'coinChange(coins, amount) возвращает минимум монет или -1, а не число комбинаций. Пустой coins не входит в условие. Тесты не доказывают Big O и не запрещают изменение входа.',
  runner: { kind: 'function', entryPoint: 'coinChange', output: { kind: 'return' }, comparison: 'exact', cases },
};
