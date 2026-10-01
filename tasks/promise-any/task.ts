import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const promiseAnyTask: TaskDefinition = {
  id: 'promise-any',
  title: 'Свой Promise.any',
  starter,
  complexity: {
    variables: 'N — число входов. Оцениваем служебную работу и память, не длительность исходных операций.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Служебная работа', expected: 'linear', explanation: 'Подписка и обработка завершений N входов требуют O(N). Ожидание — до первого успеха или последней ошибки, иногда бесконечно.' },
      { id: 'space', title: 'Дополнительная память', expected: 'linear', explanation: 'Обработчики и причины ошибок всех входов занимают O(N).' },
    ],
  },
  verificationNote: 'Плотный конечный массив промисов, thenable и значений. Первый успех побеждает; при всех ошибках нужен AggregateError с errors в порядке входа. Пустой массив отклоняется с AggregateError([]). Входы не отменяются. Promise.any использовать нельзя; тесты не доказывают Big O.',
  runner: { kind: 'scenario', entryPoint: 'myAny', cases },
};
