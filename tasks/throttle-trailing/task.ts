import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const throttleTrailingTask: TaskDefinition = {
  id: 'throttle-trailing',
  title: 'Throttle (leading + trailing)',
  starter,
  complexity: {
    variables: 'A — число последних аргументов. Стоимость fn и системных таймеров не учитываем.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'args', label: 'O(A)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время вызова с rest-аргументами', expected: 'args', explanation: 'Последние A аргументов сохраняются/передаются за O(A); управление окном — O(1).' },
      { id: 'space', title: 'Удерживаемая память обёртки', expected: 'args', explanation: 'Храним один последний вызов, а не очередь всех пропущенных событий: O(A).' },
    ],
  },
  verificationNote: 'throttleTrailing(fn, interval), interval — положительное целое. Первый вызов синхронный. Последний пропущенный вызов выполняется на границе текущего окна, не сдвигая её. Этот trailing открывает новое полное окно; без пропусков дубля нет. Последние this/аргументы, независимые обёртки. cancel, flush, возврат результата, reentrant callback и исключения вне контракта. Проверки поведения не доказывают Big O и не анализируют алгоритм статически.',
  runner: { kind: 'scenario', entryPoint: 'throttleTrailing', cases },
};
