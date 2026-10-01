import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const debounceTask: TaskDefinition = {
  id: 'debounce',
  title: 'Debounce',
  starter,
  complexity: {
    variables: 'A — число аргументов последнего вызова. Стоимость fn и реализации системных таймеров не учитываем.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'args', label: 'O(A)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Обработка вызова с rest-аргументами', expected: 'args', explanation: 'Сбор и передача A аргументов стоят O(A); управление одним таймером — O(1) в принятой модели.' },
      { id: 'space', title: 'Удерживаемая память обёртки', expected: 'args', explanation: 'Один таймер, контекст и последние A аргументов: O(A), без глубокого копирования их объектов.' },
    ],
  },
  verificationNote: 'debounce(fn, delay, immediate=false), delay — неотрицательное целое. Trailing по умолчанию; immediate=true выполняет только leading и продлевает окно тишины каждым вызовом. Обязателен cancel(): отмена и сброс окна, повторная отмена безопасна. Последние this/аргументы, независимость обёрток. Возврат результата, Promise и метод flush не требуются. Время виртуальное; тесты проверяют поведение, но не доказывают Big O и не анализируют алгоритм статически.',
  runner: { kind: 'scenario', entryPoint: 'debounce', cases },
};
