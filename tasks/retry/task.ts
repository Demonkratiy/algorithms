import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const retryTask: TaskDefinition = {
  id: 'retry',
  title: 'Retry',
  starter,
  complexity: {
    variables: 'A — фактическое число попыток. Длительность ожидания, сеть/вычисления fn и работа пользовательского shouldRetry не учитываются.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(A)' },
      { id: 'quadratic', label: 'O(A²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Служебное время', expected: 'linear', explanation: 'Один шаг цикла на попытку: O(A). Backoff увеличивает сумму пауз, а не число шагов.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Цикл удерживает счётчик, текущую задержку/ошибку и O(1) callbacks; не хранит массив истории попыток. Память fn и таймерной среды исключена.' },
    ],
  },
  verificationNote: 'fn(attempt) — новая попытка с номером от 1, возвращает значение/промис или бросает синхронно. attempts — всего вызовов, положительное целое; delay — конечное ≥ 0; вход валиден. Defaults: 3, 300, backoff 1, shouldRetry () => true. Пауза только перед следующей попыткой, затем умножение на backoff. shouldRetry(error) может прекратить повторы. Сохраняй последнюю причину; не обязательно Error.',
  runner: { kind: 'scenario', entryPoint: 'retry', cases },
};
