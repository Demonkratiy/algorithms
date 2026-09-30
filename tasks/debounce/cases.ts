import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Не раньше delay, ровно один вызов',
    input: 'delay=100; вызов в t=0; tick(99), tick(1), tick(200)',
    expected: 'Нет синхронного вызова; один вызов в t=100.',
    script: `
      const start = clock.now(), calls = [];
      const d = subject((...args) => calls.push([clock.now() - start, args]), 100);
      d('a', 2);
      assert.equal(calls, [], 'Не вызывай fn синхронно');
      await clock.tick(99);
      assert.equal(calls, [], 'Полный delay ещё не прошёл');
      await clock.tick(1);
      assert.equal(calls, [[100, ['a', 2]]], 'Вызов на границе delay');
      await clock.tick(200);
      assert.equal(calls.length, 1, 'Не повторяй выполненный вызов');
    `,
  },
  {
    name: 'Последний вызов перезапускает окно',
    input: 'delay=100; a@0, b@60, c@120',
    expected: 'Только c в t=220.',
    script: `
      const start = clock.now(), calls = [];
      const d = subject(x => calls.push([clock.now() - start, x]), 100);
      d('a'); await clock.tick(60); d('b'); await clock.tick(60); d('c');
      await clock.tick(99);
      assert.equal(calls, [], 'Каждый вызов начинает новое окно');
      await clock.tick(1);
      assert.equal(calls, [[220, 'c']], 'Сохраняй последние аргументы');
    `,
  },
  {
    name: 'Последний this и реальные ссылки',
    input: 'Одна обёртка вызывается с двумя receiver и объектом-аргументом.',
    expected: 'fn получает второй receiver, тот же объект и все аргументы.',
    script: `
      const first = { id: 1 }, last = { id: 2 }, payload = { value: 7 }, calls = [];
      const d = subject(function (...args) { calls.push({ receiver: this, args }); }, 20);
      d.call(first, 'old'); d.call(last, payload, 0, false);
      await clock.tick(20);
      assert.equal(calls.length, 1, 'Один trailing-вызов');
      assert(calls[0].receiver === last, 'Сохраняй последний this');
      assert(calls[0].args[0] === payload, 'Аргумент передаётся по ссылке');
      assert.equal(calls[0].args.slice(1), [0, false], 'Передавай все аргументы');
    `,
  },
  {
    name: 'Cancel отменяет и допускает повторный запуск',
    input: 'Запланировать, отменить дважды, затем запланировать снова.',
    expected: 'Старый вызов отсутствует, новый выполняется.',
    script: `
      const calls = [], d = subject(x => calls.push(x), 30);
      assert(typeof d.cancel === 'function', 'Нужен метод cancel');
      d('old'); await clock.tick(10); d.cancel(); d.cancel();
      await clock.tick(100);
      assert.equal(calls, [], 'cancel должен отменять таймер');
      assert.equal(clock.pending(), 0, 'После cancel нет активных таймеров');
      d('new'); await clock.tick(30);
      assert.equal(calls, ['new'], 'После cancel обёртка работает');
      d.cancel();
    `,
  },
  {
    name: 'Независимые обёртки',
    input: 'A(delay=20), B(delay=30); отменить только A.',
    expected: 'B не отменяется; затем работают обе обёртки.',
    script: `
      const calls = [], a = subject(x => calls.push('a' + x), 20), b = subject(x => calls.push('b' + x), 30);
      a(1); b(1); a.cancel(); await clock.tick(30);
      assert.equal(calls, ['b1'], 'Отмена A не влияет на B');
      a(2); b(2); await clock.tick(30);
      assert.equal(calls, ['b1', 'a2', 'b2'], 'Таймеры принадлежат своим обёрткам');
    `,
  },
  {
    name: 'Immediate — leading без trailing',
    input: 'immediate=true, delay=100; a@0, b@80, c@100, d@200.',
    expected: 'a синхронно, b/c подавлены; d после окна тишины.',
    script: `
      const calls = [], d = subject(x => calls.push(x), 100, true);
      d('a'); assert.equal(calls, ['a'], 'Leading синхронный');
      await clock.tick(80); d('b'); await clock.tick(20); d('c');
      assert.equal(calls, ['a'], 'Окно продлевается, это не throttle');
      await clock.tick(100);
      assert.equal(calls, ['a'], 'В immediate нет trailing');
      d('d'); assert.equal(calls, ['a', 'd'], 'После тишины новый leading');
      await clock.tick(100);
      assert.equal(calls, ['a', 'd'], 'Не дублируй leading');
    `,
  },
  {
    name: 'Immediate сохраняет this, cancel открывает окно',
    input: 'Вызов методом, cancel, немедленный повторный вызов.',
    expected: 'Оба leading-вызова проходят с правильным this.',
    script: `
      const owner = { id: 9 }, calls = [];
      const d = subject(function (x) { calls.push([this.id, x]); }, 50, true);
      d.call(owner, 1); d.cancel(); d.call(owner, 2);
      assert.equal(calls, [[9, 1], [9, 2]], 'cancel сбрасывает leading-окно');
      await clock.tick(50);
      assert.equal(calls.length, 2, 'Без trailing');
    `,
  },
  {
    name: 'Нулевой delay всё ещё асинхронный',
    input: 'delay=0; три синхронных вызова без аргументов.',
    expected: 'До tick(0) вызовов нет; после — один.',
    script: `
      const calls = [], d = subject((...args) => calls.push(args), 0);
      d(); d(); d();
      assert.equal(calls, [], 'setTimeout(0) не синхронен');
      await clock.tick(0);
      assert.equal(calls, [[]], 'Пустые аргументы не означают отсутствие вызова');
    `,
  },
];
