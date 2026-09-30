import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const promiseAllTask: TaskDefinition = {
  id: 'promise-all',
  title: 'Свой Promise.all',
  starter,
  complexity: {
    variables: 'N — длина плотного конечного массива. Считаем служебную работу, без ожидания, сети и выполнения входных операций.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Служебное время', expected: 'linear', explanation: 'Нормализация, подписка и запись результата для каждого входа: O(N).' },
      { id: 'space', title: 'Дополнительная память с результатом', expected: 'linear', explanation: 'Массив результатов и удерживаемые callbacks/подписки занимают O(N). Fail-fast не отменяет остальные операции и не освобождает немедленно все их подписки.' },
    ],
  },
  verificationNote: 'myPromiseAll(promises): плотный конечный массив промисов, обычных значений и thenable (нормализация через Promise.resolve). Порядок результата — порядок входа; пустой массив → []; первая по времени ошибка передаётся без замены. Другие операции не отменяются. Напиши свой комбинатор, не вызывая Promise.all. Iterable, мутация входа и идентичность результирующего промиса не проверяются.',
  runner: { kind: 'scenario', entryPoint: 'myPromiseAll', cases },
};
