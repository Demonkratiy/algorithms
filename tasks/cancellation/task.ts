import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const cancellationTask: TaskDefinition = {
  id: 'cancellation',
  title: 'cancellable — логическая отмена',
  starter,
  complexity: {
    variables: 'Одна обёртка; фабрика и исходная операция не входят в служебную оценку.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Служебная работа', expected: 'constant', explanation: 'Создание одной обёртки, обработка завершения и cancel требуют O(1). Время исходной операции не ограничено.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Состояние одной обёртки и её обработчики занимают O(1), без памяти исходной операции.' },
    ],
  },
  verificationNote: 'Верни { promise, cancel }, вызови фабрику один раз. Значение, промис или ошибка фабрики передаются наружу. Cancel до завершения немедленно отклоняет внешний промис с name === "CancelledError"; повторный cancel и cancel после завершения — no-op. Исходная операция продолжается; поздние ошибки должны быть обработаны.',
  runner: { kind: 'scenario', entryPoint: 'cancellable', cases },
};
