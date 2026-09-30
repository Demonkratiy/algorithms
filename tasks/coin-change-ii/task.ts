import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const coinChangeIITask: TaskDefinition = {
  id: 'coin-change-ii',
  title: 'Coin Change II',
  starter,
  complexity: {
    variables: 'amount = сумма (0…5000), C = coins.length (0…100). Номиналы различны и положительны. Дополнительная память включает таблицу и стек; числовой результат — O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'amount', label: 'O(amount + 1)' },
      { id: 'coins', label: 'O(C + 1)' },
      { id: 'amount-coins', label: 'O(amount · C + amount + C + 1)' },
      { id: 'exponential', label: 'O((C + 1)^amount)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'amount-coins', explanation: 'Обработка сумм и номиналов плюс инициализация: O(amount · C + amount + C + 1). Для ненулевых размеров это привычное O(amount · C); ноль и пустой coins допустимы.' },
      { id: 'space', title: 'Дополнительная память', expected: 'amount', accepted: ['amount-coins'], explanation: 'Одна таблица — O(amount + 1). Двумерная таблица или кеш по сумме и индексу номинала — O((amount + 1) · (C + 1)), эквивалентное расширенной оценке в вариантах.' },
    ],
  },
  verificationNote: 'Порядок аргументов: change(amount, coins). Считаются комбинации, не перестановки; change(0, []) = 1. Все промежуточные количества безопасны для JS Number. Запрета изменять вход нет; сложность проверяется ревью.',
  runner: { kind: 'function', entryPoint: 'change', output: { kind: 'return' }, comparison: 'exact', cases },
};
