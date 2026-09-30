import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const fetchWithAbortTask: TaskDefinition = {
  id: 'fetch-with-abort',
  title: 'Fetch with AbortController',
  starter,
  complexity: {
    variables: 'B — размер ответа. Служебная обвязка отдельно от чтения/разбора JSON; сетевое ожидание не включаем в Big O.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'body', label: 'O(B)' },
      { id: 'quadratic', label: 'O(B²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время с чтением и разбором ответа', expected: 'body', explanation: 'Обвязка O(1); чтение и разбор B единиц ответа — порядка O(B), без сетевого ожидания.' },
      { id: 'space', title: 'Память с данными ответа', expected: 'body', explanation: 'Обвязка O(1), но тело и результат JSON требуют порядка O(B) памяти.' },
    ],
  },
  verificationNote: 'Вызови fetch(url, { signal: controller.signal }), проверь response.ok и верни JSON. Неуспех HTTP → Error("HTTP " + status). AbortError, сетевые и JSON-ошибки передавай без подмены. Контроллер принадлежит вызывающему коду. Сеть в сценариях полностью заменена mock; тесты не доказывают Big O.',
  runner: { kind: 'scenario', entryPoint: 'fetchWithAbort', cases },
};
