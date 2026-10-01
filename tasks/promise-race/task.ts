import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const promiseRaceTask: TaskDefinition = {
  id: 'promise-race',
  title: 'Свой Promise.race',
  starter,
  complexity: {
    variables: 'N — число входов. Оцениваем подписку, а не wall-clock ожидание; учитываем обработчики всех входов.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Служебная работа', expected: 'linear', explanation: 'Нужно подписаться на N входов: O(N). Ожидание определяется первым завершением, для пустого массива не ограничено.' },
      { id: 'space', title: 'Дополнительная память', expected: 'linear', explanation: 'Обработчики занимают O(N), хотя локальное состояние результата — O(1).' },
    ],
  },
  verificationNote: 'Плотный конечный массив значений, промисов и thenable. Первый успех или ошибка определяет результат; пустой массив остаётся pending. Проигравшие операции не отменяются, их ошибки обрабатываются. Promise.race использовать нельзя. Сценарии используют виртуальное время; тесты не доказывают Big O.',
  runner: { kind: 'scenario', entryPoint: 'myRace', cases },
};
