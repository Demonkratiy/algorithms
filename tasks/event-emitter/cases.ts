import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Порядок, аргументы и результат emit',
    input: 'Два обработчика события data; emit(data,payload,2).',
    expected: 'Вызовы синхронны, в порядке подписки, с исходными ссылками; emit=true.',
    script: `
      const e = new subject(), calls = [], payload = {};
      e.on('data', (...args) => calls.push(['a', ...args]));
      e.on('data', (...args) => calls.push(['b', ...args]));
      assert(e.emit('data', payload, 2) === true, 'emit с подписчиками возвращает true');
      assert.equal(calls.map(row => [row[0], row[2]]), [['a', 2], ['b', 2]], 'Порядок и все аргументы');
      assert(calls.every(row => row[1] === payload), 'Аргументы передаются по ссылке');
    `,
  },
  {
    name: 'Неизвестное событие и off отсутствующей подписки',
    input: 'emit/off без подписчиков; после off последнего обработчика.',
    expected: 'Нет исключений; emit возвращает false, включая error.',
    script: `
      const e = new subject(), handler = () => {};
      assert(e.emit('missing') === false, 'Неизвестное событие');
      assert(e.emit('error', new Error('not Node')) === false, 'Здесь нет особого события error');
      e.off('missing', handler); e.on('x', handler); e.off('x', handler); e.off('x', handler);
      assert(e.emit('x') === false, 'После удаления последнего слушателя false');
    `,
  },
  {
    name: 'Функция отписки и дедупликация on',
    input: 'Один handler подписан дважды; unsubscribe вызывается дважды.',
    expected: 'Один вызов handler, затем тишина; отписка идемпотентна.',
    script: `
      const e = new subject(); let count = 0;
      const handler = () => count++, unsubscribe = e.on('x', handler);
      e.on('x', handler);
      assert(typeof unsubscribe === 'function', 'on возвращает функцию отписки');
      e.emit('x'); assert.equal(count, 1, 'Повторный on одной ссылки не дублируется');
      unsubscribe(); unsubscribe(); e.emit('x');
      assert.equal(count, 1, 'Отписка работает повторно без ошибок');
      e.on('x', handler); e.emit('x');
      assert.equal(count, 2, 'После отписки можно подписаться снова');
    `,
  },
  {
    name: 'Once выполняется один раз с аргументами',
    input: 'Один once и один постоянный handler; два emit.',
    expected: 'once только в первом emit, обычный handler в обоих.',
    script: `
      const e = new subject(), calls = [];
      e.once('x', (...args) => calls.push(['once', ...args]));
      e.on('x', x => calls.push(['on', x]));
      e.emit('x', 1); e.emit('x', 2);
      assert.equal(calls, [['once', 1], ['on', 1], ['on', 2]], 'once снимается после одного события');
    `,
  },
  {
    name: 'Once отменяется по исходному handler и unsubscribe',
    input: 'Отмена двух once до первого emit разными способами.',
    expected: 'Ни один отменённый callback не вызывается.',
    script: `
      const e = new subject(); let count = 0;
      const a = () => count++, b = () => count++;
      e.once('a', a); e.off('a', a);
      const unsubscribe = e.once('b', b);
      assert(typeof unsubscribe === 'function', 'once возвращает функцию отписки');
      unsubscribe(); unsubscribe();
      assert(e.emit('a') === false && e.emit('b') === false, 'Обе once-подписки сняты');
      assert.equal(count, 0, 'Отменённые once не выполняются');
    `,
  },
  {
    name: 'Снимок при удалении и добавлении во время emit',
    input: 'A удаляет B и добавляет C; два последовательных emit.',
    expected: 'Первый emit: A,B; второй: A,C.',
    script: `
      const e = new subject(), calls = [];
      const b = () => calls.push('b'), c = () => calls.push('c');
      e.on('x', () => { calls.push('a'); e.off('x', b); e.on('x', c); });
      e.on('x', b);
      e.emit('x');
      assert.equal(calls, ['a', 'b'], 'Список фиксируется на начало emit');
      e.emit('x');
      assert.equal(calls, ['a', 'b', 'a', 'c'], 'Изменения видны следующему emit');
    `,
  },
  {
    name: 'Reentrant emit внутри once ограничен',
    input: 'Once рекурсивно вызывает тот же emit, не более одного вложенного вызова.',
    expected: 'Once выполнен один раз, обычный handler — дважды.',
    script: `
      const e = new subject(), calls = []; let onceCalls = 0;
      e.once('x', () => {
        onceCalls++; calls.push('once');
        if (onceCalls === 1) e.emit('x', 'inner');
      });
      e.on('x', value => calls.push(value));
      e.emit('x', 'outer');
      assert.equal(onceCalls, 1, 'Снимай once ДО callback');
      assert.equal(calls, ['once', 'inner', 'outer'], 'Вложенный emit получает собственный снимок');
    `,
  },
  {
    name: 'this обычного и bound обработчика',
    input: 'Strict callback и bound callback, каждый через on и once.',
    expected: 'Обычный callback получает undefined, bound — свой receiver.',
    script: `
      const e = new subject(), owner = {}, receivers = [];
      function plain() { 'use strict'; receivers.push(this); }
      function bound() { 'use strict'; receivers.push(this); }
      e.on('x', plain); e.once('x', plain);
      e.on('x', bound.bind(owner)); e.once('x', bound.bind(owner));
      e.emit('x');
      assert.equal(receivers.length, 4, 'Все подписки вызваны');
      assert(receivers[0] === undefined && receivers[1] === undefined, 'Не привязывай this к emitter');
      assert(receivers[2] === owner && receivers[3] === owner, 'Bound this сохраняется');
    `,
  },
  {
    name: 'Исключения fail-fast, бросающий once уже снят',
    input: 'Первый once бросает Error, следующий handler не должен выполниться.',
    expected: 'Та же ошибка выходит наружу; следующий emit вызывает оставшийся handler.',
    script: `
      const e = new subject(), error = new Error('boom'); let later = 0, caught;
      e.once('x', () => { throw error; }); e.on('x', () => later++);
      try { e.emit('x'); } catch (reason) { caught = reason; }
      assert(caught === error, 'Не проглатывай и не заменяй ошибку');
      assert.equal(later, 0, 'Fail-fast прекращает текущий emit');
      assert(e.emit('x') === true, 'Бросающий once уже снят');
      assert.equal(later, 1, 'Следующее событие работает');
    `,
  },
  {
    name: 'События без коллизий и независимые экземпляры',
    input: 'События __proto__, constructor и два Symbol с одним description.',
    expected: 'Все события различаются; второй emitter не делит подписки.',
    script: `
      const a = new subject(), b = new subject(), calls = [], s1 = Symbol('x'), s2 = Symbol('x');
      const events = ['__proto__', 'constructor', s1, s2];
      events.forEach((event, index) => a.on(event, () => calls.push(index)));
      for (const event of events) {
        assert(b.emit(event) === false, 'Экземпляры независимы');
        assert(a.emit(event) === true, 'Подписка события существует');
      }
      assert.equal(calls, [0, 1, 2, 3], 'Строковые и Symbol-ключи не сталкиваются');
    `,
  },
];
