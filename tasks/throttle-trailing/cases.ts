import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Один leading без лишнего trailing',
    input: 'interval=100; один вызов.',
    expected: 'Вызов синхронный и единственный; таймеры в конце завершены.',
    script: `
      const calls = [], t = subject(x => calls.push(x), 100);
      t('first'); assert.equal(calls, ['first'], 'Первый вызов синхронный');
      await clock.tick(500);
      assert.equal(calls, ['first'], 'Без пропущенного события нет trailing');
      assert.equal(clock.pending(), 0, 'Не оставляй бесконечную цепочку таймеров');
    `,
  },
  {
    name: 'Последний пропущенный вызов на фиксированной границе',
    input: 'interval=100; a@0,b@20,c@90.',
    expected: 'a@0,c@100, а не c@190.',
    script: `
      const start = clock.now(), calls = [], t = subject(x => calls.push([clock.now() - start, x]), 100);
      t('a'); await clock.tick(20); t('b'); await clock.tick(70); t('c');
      await clock.tick(9);
      assert.equal(calls, [[0, 'a']], 'Не выполняй раньше границы');
      await clock.tick(1);
      assert.equal(calls, [[0, 'a'], [100, 'c']], 'Последний вызов на исходной границе');
      await clock.tick(300);
      assert.equal(calls.length, 2, 'Не воспроизводи очередь пропущенных событий');
    `,
  },
  {
    name: 'Trailing открывает новое полное окно',
    input: 'interval=100; a@0,b@40,c@110.',
    expected: 'a@0,b@100,c@200.',
    script: `
      const start = clock.now(), calls = [], t = subject(x => calls.push([clock.now() - start, x]), 100);
      t('a'); await clock.tick(40); t('b'); await clock.tick(70); t('c');
      assert.equal(calls, [[0, 'a'], [100, 'b']], 'c не может пройти через 10 мс после trailing');
      await clock.tick(89);
      assert.equal(calls.length, 2, 'Новое окно длится целый interval');
      await clock.tick(1);
      assert.equal(calls, [[0, 'a'], [100, 'b'], [200, 'c']], 'Trailing тоже ограничивает частоту');
    `,
  },
  {
    name: 'Непрерывный поток и последний хвост',
    input: 'interval=100; события каждые 30 мс от t=0 до t=270.',
    expected: 'Вызовы: [0,0], [100,90], [200,180], [300,270].',
    script: `
      const start = clock.now(), calls = [], t = subject(x => calls.push([clock.now() - start, x]), 100);
      t(0);
      for (let i = 1; i <= 9; i++) { await clock.tick(30); t(i * 30); }
      await clock.tick(130);
      assert.equal(calls, [[0, 0], [100, 90], [200, 180], [300, 270]], 'Регулярный поток, не debounce');
      assert.equal(clock.pending(), 0, 'После тишины таймеры завершаются');
    `,
  },
  {
    name: 'Последние this и аргументы в trailing',
    input: 'Leading с A; пропущенные вызовы с B, затем C.',
    expected: 'Trailing получает C и последнюю исходную ссылку.',
    script: `
      const a = {}, b = {}, c = {}, payload = {}, calls = [];
      const t = subject(function (...args) { calls.push({ receiver: this, args }); }, 20);
      t.call(a, 1); t.call(b, 2); t.call(c, payload, false);
      await clock.tick(20);
      assert.equal(calls.length, 2, 'Leading + один trailing');
      assert(calls[0].receiver === a && calls[1].receiver === c, 'Последний this');
      assert(calls[1].args[0] === payload, 'Исходная ссылка аргумента');
      assert.equal(calls[1].args.slice(1), [false], 'Все последние аргументы');
    `,
  },
  {
    name: 'Пустой список аргументов тоже pending-вызов',
    input: 'Два синхронных вызова без аргументов; затем тишина.',
    expected: 'Один leading и один trailing.',
    script: `
      const calls = [], t = subject((...args) => calls.push(args), 10);
      t(); t(); await clock.tick(10);
      assert.equal(calls, [[], []], 'Не теряй trailing без аргументов');
      await clock.tick(100);
      assert.equal(calls.length, 2, 'После хвоста остановиться');
    `,
  },
  {
    name: 'Независимые обёртки',
    input: 'A(interval=20), B(interval=30), у обеих есть pending-вызов.',
    expected: 'A1,B1,A2,B2 в собственных окнах.',
    script: `
      const calls = [], a = subject(x => calls.push('a' + x), 20), b = subject(x => calls.push('b' + x), 30);
      a(1); b(1); a(2); b(2); await clock.tick(20);
      assert.equal(calls, ['a1', 'b1', 'a2'], 'Окно A не управляет B');
      await clock.tick(10);
      assert.equal(calls, ['a1', 'b1', 'a2', 'b2'], 'Независимый trailing B');
    `,
  },
  {
    name: 'Повторный leading после тишины и точная граница',
    input: 'interval=25; a@0,b@25; пауза 100 мс; c.',
    expected: 'Каждый вызов проходит синхронно, без дублей.',
    script: `
      const calls = [], t = subject(x => calls.push(x), 25);
      t('a'); await clock.tick(25); t('b');
      assert.equal(calls, ['a', 'b'], 'Точная граница доступна');
      await clock.tick(100); t('c');
      assert.equal(calls, ['a', 'b', 'c'], 'После тишины новый leading');
      await clock.tick(100);
      assert.equal(calls.length, 3, 'Не дублируй одиночные вызовы');
    `,
  },
];
