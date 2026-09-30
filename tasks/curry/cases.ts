import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Все разбиения трёх аргументов',
    input: 'fn(a,b,c); группы 1+1+1,2+1,1+2,3.',
    expected: 'Во всех случаях аргументы [1,2,3] в исходном порядке.',
    script: `
      const c = subject((a, b, c) => [a, b, c]);
      assert.equal(c(1)(2)(3), [1, 2, 3], 'Три шага');
      assert.equal(c(1, 2)(3), [1, 2, 3], 'Два аргумента на первом шаге');
      assert.equal(c(1)(2, 3), [1, 2, 3], 'Два аргумента на последнем шаге');
      assert.equal(c(1, 2, 3), [1, 2, 3], 'Все сразу');
    `,
  },
  {
    name: 'Ленивость до достижения арности',
    input: 'Четыре параметра; накопление 1+2+1.',
    expected: 'fn вызывается только на последнем шаге и ровно один раз.',
    script: `
      let calls = 0;
      const c = subject(function (a, b, c, d) { calls++; return [a, b, c, d]; });
      const first = c(1), next = first(2, 3);
      assert(typeof first === 'function' && typeof next === 'function', 'Нужны частичные функции');
      assert.equal(calls, 0, 'Не вызывай fn раньше арности');
      assert.equal(next(4), [1, 2, 3, 4], 'Последний аргумент завершает цепочку');
      assert.equal(calls, 1, 'Один вызов fn');
    `,
  },
  {
    name: 'Частичные функции переиспользуемы',
    input: 'Один префикс [10], две независимые ветви.',
    expected: '[10,1,2], [10,7,8], затем [10,1,9].',
    script: `
      const c = subject((a, b, c) => [a, b, c]), add10 = c(10), left = add10(1), right = add10(7);
      assert.equal(left(2), [10, 1, 2], 'Первая ветвь');
      assert.equal(right(8), [10, 7, 8], 'Вторая ветвь не мутирует первую');
      assert.equal(left(9), [10, 1, 9], 'Префикс left переиспользуем');
      assert.equal(add10(3, 4), [10, 3, 4], 'Исходный префикс не испорчен');
    `,
  },
  {
    name: 'Лишние аргументы передаются, не обрезаются',
    input: 'fn.length=2, но переданы четыре аргумента.',
    expected: 'Возвращаются все четыре аргумента.',
    script: `
      const c = subject(function (a, b) { return Array.from(arguments); });
      assert.equal(c(1, 2, 3, 4), [1, 2, 3, 4], 'Проверяй >=, не ===');
      assert.equal(c(1)(2, 3, 4), [1, 2, 3, 4], 'Не обрезай последний пакет');
    `,
  },
  {
    name: 'Пустые вызовы не теряют накопленные аргументы',
    input: 'fn.length=2; c()()(1)()(2).',
    expected: 'До второго аргумента fn не вызывается.',
    script: `
      let calls = 0;
      const c = subject((a, b) => { calls++; return [a, b]; });
      const p = c()()(1)();
      assert.equal(calls, 0, 'Пустой вызов не является терминатором');
      assert.equal(p(2), [1, 2], 'Пустые шаги сохраняют префикс');
      assert.equal(calls, 1, 'Один итоговый вызов');
    `,
  },
  {
    name: 'Нулевая арность и правило fn.length',
    input: 'Функции без параметров, с default и с rest.',
    expected: 'Завершение определяется реальным fn.length.',
    script: `
      let calls = 0;
      const zero = subject(() => { calls++; return 42; });
      assert.equal(calls, 0, 'Создание обёртки не вызывает fn');
      assert.equal(zero(), 42, 'Арность 0 выполняется при первом вызове');
      const defaults = subject((a, b = 5) => [a, b]);
      assert.equal(defaults(2), [2, 5], 'Default-параметры не входят в fn.length');
      const rest = subject((...args) => args);
      assert.equal(rest(1, 2), [1, 2], 'Rest имеет арность 0');
    `,
  },
  {
    name: 'this завершающего вызова',
    input: 'Промежуточный receiver A, последний receiver B.',
    expected: 'fn получает B; разные завершения не фиксируют один this.',
    script: `
      const a = { id: 'a' }, b = { id: 'b' };
      const c = subject(function (x, y) { return [this.id, x, y]; });
      const p = c.call(a, 1);
      assert.equal(p.call(b, 2), ['b', 1, 2], 'this задаёт последний вызов');
      assert.equal(p.call(a, 3), ['a', 1, 3], 'Префикс не фиксирует receiver');
      assert.equal(c.call(b, 4, 5), ['b', 4, 5], 'this при прямом завершении');
    `,
  },
  {
    name: 'Возврат значения и независимость обёрток',
    input: 'Функции возвращают объект, undefined, false.',
    expected: 'Точные значения без преобразования; исходные ссылки сохраняются.',
    script: `
      const payload = {}, c = subject((a, b) => a);
      assert(c(payload)(0) === payload, 'Верни результат по исходной ссылке');
      assert(subject((a) => undefined)(1) === undefined, 'Не теряй undefined');
      assert(subject((a) => false)(1) === false, 'Не теряй false');
      const other = subject((a, b) => [b, a]);
      assert.equal(other(1)(2), [2, 1], 'Каждая обёртка хранит свою fn');
    `,
  },
];
