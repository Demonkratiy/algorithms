import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Повторный вызов и порядок аргументов',
    input: 'm(1,2), m(1,2), m(2,1).',
    expected: 'Результаты [1,2], [1,2], [2,1]; fn вызвана дважды.',
    script: `
      let calls = 0;
      const m = subject((...args) => { calls++; return args; });
      const first = m(1, 2);
      assert.equal(first, [1, 2], 'Первый результат');
      assert(m(1, 2) === first, 'Попадание возвращает сохранённую ссылку');
      assert.equal(m(2, 1), [2, 1], 'Порядок аргументов влияет на ключ');
      assert.equal(calls, 2, 'Не вычисляй повторно');
    `,
  },
  {
    name: 'Все falsy-результаты кешируются',
    input: 'Отдельные ключи для undefined,null,false,0,"".',
    expected: 'Каждый результат вычисляется ровно один раз.',
    script: `
      const values = [undefined, null, false, 0, ''], counts = [0, 0, 0, 0, 0];
      const m = subject(index => { counts[index]++; return values[index]; });
      for (let i = 0; i < values.length; i++) {
        assert(m(i) === values[i], 'Первый falsy-результат');
        assert(m(i) === values[i], 'Кешированный falsy-результат');
      }
      assert.equal(counts, [1, 1, 1, 1, 1], 'Проверяй наличие ключа, а не truthiness');
    `,
  },
  {
    name: 'Коллизии типов, разделителей и арности',
    input: 'Различные наборы JSON-примитивов, которые ломают join.',
    expected: 'Все разные наборы различаются и затем попадают в кеш.',
    script: `
      let calls = 0;
      const m = subject((...args) => { calls++; return args; });
      const rows = [[1, '2'], ['1', 2], ['a,b', 'c'], ['a', 'b,c'], [], [''], [null], [false], [0], [1], [1, null]];
      for (const row of rows) assert.equal(m(...row), row, 'Неоднозначный ключ');
      for (const row of rows) assert.equal(m(...row), row, 'Повторный ключ');
      assert.equal(calls, rows.length, 'Ровно одно вычисление на набор аргументов');
    `,
  },
  {
    name: 'Resolver получает все аргументы',
    input: 'Объекты с id и вторым аргументом locale; resolver объединяет их.',
    expected: 'Совпадающий resolved key использует первый результат.',
    script: `
      let calls = 0;
      const m = subject((obj, locale) => { calls++; return [obj.value, locale]; }, (obj, locale) => obj.id + ':' + locale);
      assert.equal(m({ id: 1, value: 'first' }, 'ru'), ['first', 'ru'], 'Первый resolved key');
      assert.equal(m({ id: 1, value: 'changed' }, 'ru'), ['first', 'ru'], 'Ключ задаёт resolver, не JSON объекта');
      assert.equal(m({ id: 1, value: 'next' }, 'en'), ['next', 'en'], 'Resolver получает второй аргумент');
      assert.equal(calls, 2, 'Два resolved key');
    `,
  },
  {
    name: 'Ключи resolver не приводятся к строкам',
    input: 'Ключи __proto__,constructor,1,"1", два объекта и два Symbol.',
    expected: 'Все разные ключи независимы; повторная ссылка попадает в кеш.',
    script: `
      let calls = 0;
      const a = {}, b = {}, s1 = Symbol('x'), s2 = Symbol('x');
      const keys = ['__proto__', 'constructor', 1, '1', a, b, s1, s2];
      const m = subject(key => { calls++; return calls; }, key => key);
      const results = keys.map(key => m(key));
      assert.equal(results, [1, 2, 3, 4, 5, 6, 7, 8], 'Ключи сохраняют тип и идентичность');
      assert.equal(keys.map(key => m(key)), results, 'Повторное обращение к каждому ключу');
      assert.equal(calls, keys.length, 'Не вызывай fn при cache hit');
    `,
  },
  {
    name: 'this передаётся fn, но не входит в ключ автоматически',
    input: 'm.call(A,2), m.call(B,2), m.call(B,3).',
    expected: 'Второй вызов получает кеш A; новый ключ вычисляется с B.',
    script: `
      let calls = 0;
      const a = { base: 10 }, b = { base: 100 };
      const m = subject(function (x) { calls++; return this.base + x; });
      assert.equal(m.call(a, 2), 12, 'Сохраняй this при промахе');
      assert.equal(m.call(b, 2), 12, 'По контракту ключ строится только из аргументов');
      assert.equal(m.call(b, 3), 103, 'Новый промах использует новый receiver');
      assert.equal(calls, 2, 'Кеширование не зависит от receiver без resolver');
    `,
  },
  {
    name: 'Кеши независимы, включая пустой набор аргументов',
    input: 'Две обёртки одной функции без аргументов.',
    expected: 'У каждой собственный первый результат.',
    script: `
      let calls = 0;
      const fn = () => ++calls, a = subject(fn), b = subject(fn);
      assert.equal(a(), 1, 'Первый кеш');
      assert.equal(b(), 2, 'Второй кеш не глобальный');
      assert.equal(a(), 1, 'Первый кеш сохранён');
      assert.equal(b(), 2, 'Пустые аргументы тоже ключ');
    `,
  },
  {
    name: 'Синхронное исключение не становится результатом кеша',
    input: 'fn бросает при первом вызове ключа, затем возвращает значение.',
    expected: 'Ошибка пробрасывается; повторная попытка вычисляется и кешируется.',
    script: `
      let calls = 0;
      const error = new Error('first'), m = subject(x => { if (++calls === 1) throw error; return x * 2; });
      let caught;
      try { m(3); } catch (e) { caught = e; }
      assert(caught === error, 'Исключение fn пробрасывается без замены');
      assert.equal(m(3), 6, 'Не кешируй неуспешное вычисление');
      assert.equal(m(3), 6, 'Успешный результат кешируется');
      assert.equal(calls, 2, 'Всего две попытки');
    `,
  },
];
