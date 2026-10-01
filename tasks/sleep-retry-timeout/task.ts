import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const sleepTask: TaskDefinition = {
  id: 'sleep-retry-timeout',
  title: 'Sleep',
  starter,
  complexity: {
    variables: 'Один вызов; ms — длительность ожидания. Оцениваем служебную работу, не wall-clock время и не работу Event Loop.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(ms)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Служебное время', expected: 'constant', explanation: 'Создание промиса и регистрация таймера — O(1). Ожидание ms не является вычислительной работой.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Один промис, таймер и удерживаемый callback: O(1) на вызов, без массивов результатов.' },
    ],
  },
  verificationNote: 'Старый ID сохранён только для sleep(ms). ms — конечное неотрицательное число в диапазоне таймера. Промис выполняется значением undefined не раньше ms; даже нулевая пауза асинхронна и не блокирует поток. Виртуальные таймеры проверяют поведение, не Big O.',
  runner: { kind: 'scenario', entryPoint: 'sleep', cases },
};
