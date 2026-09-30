import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const eventEmitterTask: TaskDefinition = {
  id: 'event-emitter',
  title: 'EventEmitter',
  starter,
  complexity: {
    variables: 'K — число подписчиков события, S — общее число подписок. Стоимость обработчиков не учитываем; Map/Set — O(1) в среднем.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'listeners', label: 'O(K)' },
      { id: 'all', label: 'O(S)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время emit', expected: 'listeners', explanation: 'Снимок и обход K обработчиков: O(K), не считая пользовательских callback.' },
      { id: 'space', title: 'Дополнительная память одного emit', expected: 'listeners', explanation: 'Снимок подписчиков занимает O(K). Постоянное хранилище подписок — O(S); reentrant emit создаёт отдельный снимок на каждом уровне.' },
      { id: 'off', title: 'off по original в модели линейного поиска', expected: 'listeners', explanation: 'Поиск once-обёртки по исходному handler требует O(K) без дополнительного индекса. Обычный delete по прямой ссылке можно выполнить за O(1).' },
    ],
  },
  verificationNote: 'Синхронный EventEmitter: on/once возвращают функцию отписки; off снимает подписку, в том числе once по исходному handler (его return не проверяется). Повторный on того же handler дедуплицируется. emit возвращает false без подписчиков, иначе true; снимок и порядок на начало emit. once снимается до callback, включая reentrancy. Callback вызывается как обычная функция, НЕ с this=emitter (strict callback получает undefined); bound this сохраняется. Ошибки fail-fast, без особого поведения события error. Строковые/Symbol-события, независимые экземпляры. Async emit, приоритеты и несколько once одной исходной функции вне контракта. Тесты не доказывают Big O и не анализируют алгоритм статически.',
  runner: { kind: 'scenario', entryPoint: 'EventEmitter', cases },
};
