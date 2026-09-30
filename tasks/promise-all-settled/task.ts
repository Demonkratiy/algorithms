import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const promiseAllSettledTask: TaskDefinition = {
  id: 'promise-all-settled',
  title: 'Свой Promise.allSettled',
  starter,
  complexity: {
    variables: 'N — длина плотного конечного массива. Служебная работа без ожидания, сети и вычислений исходных операций.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Служебное время', expected: 'linear', explanation: 'Подписка на каждый вход и создание одной записи для каждого исхода: O(N).' },
      { id: 'space', title: 'Дополнительная память с результатом', expected: 'linear', explanation: 'Удерживаемые callbacks, массив результатов и N объектов {status, value/reason}: O(N). Входные объекты значений и причин не копируются.' },
    ],
  },
  verificationNote: 'myAllSettled(promises): плотный конечный массив промисов, thenable и обычных значений. Дождись всех; в исходном порядке верни {status: "fulfilled", value} либо {status: "rejected", reason}. Ошибка входа не отклоняет общий промис; [] → []. Соответствующий встроенный Promise.allSettled запрещён. Отмена, iterable, мутация входа и идентичность результирующего промиса не требуются.',
  runner: { kind: 'scenario', entryPoint: 'myAllSettled', cases },
};
