import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Первый вызов синхронный',
    input: 'interval=100; один вызов с несколькими аргументами.',
    expected: 'Вызов сразу, без повторения после тишины.',
    script: `
      const calls = [], t = subject((...args) => calls.push(args), 100);
      t(1, 'a', false);
      assert.equal(calls, [[1, 'a', false]], 'Первый вызов должен пройти сразу');
      await clock.tick(300);
      assert.equal(calls.length, 1, 'Не планируй trailing без необходимости');
    `,
  },
  {
    name: 'Пропущенные вызовы не получают trailing',
    input: 'interval=100; a@0, b@20, c@80, тишина.',
    expected: 'Только a, даже после нескольких интервалов.',
    script: `
      const calls = [], t = subject(x => calls.push(x), 100);
      t('a'); await clock.tick(20); t('b'); await clock.tick(60); t('c');
      await clock.tick(300);
      assert.equal(calls, ['a'], 'Leading-only навсегда отбрасывает b и c');
    `,
  },
  {
    name: 'Точная граница интервала',
    input: 'interval=100; вызовы в t=0,99,100,199,200.',
    expected: 'Проходят только t=0,100,200.',
    script: `
      const start = clock.now(), calls = [], t = subject(() => calls.push(clock.now() - start), 100);
      t(); await clock.tick(99); t(); await clock.tick(1); t();
      await clock.tick(99); t(); await clock.tick(1); t();
      assert.equal(calls, [0, 100, 200], 'На границе >= interval, а не > interval');
    `,
  },
  {
    name: 'Подавленные события не продлевают окно',
    input: 'interval=40; событие каждые 10 мс до t=120.',
    expected: 'Вызовы в t=0,40,80,120.',
    script: `
      const start = clock.now(), calls = [], t = subject(() => calls.push(clock.now() - start), 40);
      t();
      for (let i = 0; i < 12; i++) { await clock.tick(10); t(); }
      assert.equal(calls, [0, 40, 80, 120], 'Не превращай throttle в debounce');
    `,
  },
  {
    name: 'this и аргументы принятого вызова',
    input: 'Одна обёртка вызывается через разные receiver.',
    expected: 'Каждый разрешённый вызов получает свой receiver и исходную ссылку.',
    script: `
      const a = { id: 'a' }, b = { id: 'b' }, payload = {}, calls = [];
      const t = subject(function (...args) { calls.push({ receiver: this, args }); }, 25);
      t.call(a, payload, 1); t.call(b, 'ignored');
      await clock.tick(25); t.call(b, payload, 2);
      assert.equal(calls.length, 2, 'Два разрешённых вызова');
      assert(calls[0].receiver === a && calls[1].receiver === b, 'Не теряй this');
      assert(calls.every(c => c.args[0] === payload), 'Не копируй аргументы по JSON');
      assert.equal(calls.map(c => c.args[1]), [1, 2], 'Аргументы разрешённых вызовов');
    `,
  },
  {
    name: 'Независимые обёртки и окна',
    input: 'A(interval=30), B(interval=50); вызовы обеих в t=0,30,50.',
    expected: 'A@0, B@0, A@30, B@50.',
    script: `
      const calls = [], a = subject(() => calls.push('a'), 30), b = subject(() => calls.push('b'), 50);
      a(); b(); await clock.tick(30); a(); b(); await clock.tick(20); a(); b();
      assert.equal(calls, ['a', 'b', 'a', 'b'], 'У каждой обёртки собственное окно');
    `,
  },
  {
    name: 'После длинной тишины новый leading',
    input: 'interval=10; две серии синхронных вызовов с паузой 1000 мс.',
    expected: 'Первый вызов каждой серии проходит сразу.',
    script: `
      const calls = [], t = subject(x => calls.push(x), 10);
      t(0); t(1); await clock.tick(1000); t(2); t(3);
      assert.equal(calls, [0, 2], 'После тишины новый leading');
      await clock.tick(100);
      assert.equal(calls, [0, 2], 'Не выполняй последний пропущенный вызов');
    `,
  },
];
