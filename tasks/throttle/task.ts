import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const throttleTask: TaskDefinition = {
  id: 'throttle',
  title: 'Throttle (leading)',
  starter,
  complexity: {
    variables: 'A — число аргументов вызова. Не учитываем fn и внутреннюю реализацию таймеров.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'args', label: 'O(A)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время вызова с rest-аргументами', expected: 'args', explanation: 'Сбор и передача аргументов — O(A), проверка окна — O(1).' },
      { id: 'space', title: 'Состояние между вызовами', expected: 'constant', explanation: 'Leading-only не хранит пропущенные аргументы: достаточно времени последнего вызова или одного таймера. Временный rest-массив во время вызова занимает O(A).' },
    ],
  },
  verificationNote: 'Только leading: первый вызов синхронный, внутри interval вызовы теряются навсегда, на границе разрешён новый вызов. interval — положительное целое. this/аргументы сохраняются, обёртки независимы. Trailing — отдельная задача throttle-trailing. cancel, flush и возврат результата не требуются; reentrant callback и исключения вне проверяемого контракта. Тесты не доказывают Big O и не проверяют алгоритм статически.',
  runner: { kind: 'scenario', entryPoint: 'throttle', cases },
};
