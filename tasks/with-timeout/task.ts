import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const withTimeoutTask: TaskDefinition = {
  id: 'with-timeout',
  title: 'With Timeout',
  starter,
  complexity: {
    variables: 'Одна обёртка; длительность ожидания и вычисления/сеть исходной операции не учитываются.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(ms)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Служебное время', expected: 'constant', explanation: 'Регистрация обработчиков и таймера, выбор исхода и очистка — O(1).' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Постоянное число промисов, таймеров и callbacks — O(1); массив гонки, если используется, имеет постоянную длину. Исходная операция может удерживать callback после таймаута.' },
    ],
  },
  verificationNote: 'withTimeout(promise, ms): валидный промис и конечное ms ≥ 0 в диапазоне таймера. Первое завершение выигрывает; значение/причина передаются без замены. Таймаут — Error с сообщением Timeout after ${ms}ms. Таймер очищается и при успехе, и при ошибке. Отмена исходной операции и третий аргумент не требуются.',
  runner: { kind: 'scenario', entryPoint: 'withTimeout', cases },
};
