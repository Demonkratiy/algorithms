import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Пустой массив немедленно выполняется',
    input: 'myPromiseAll([])',
    expected: 'Промис с [] после микрозадач, без таймеров',
    script: `
      const promise = subject([]);
      assert(promise && typeof promise.then === 'function', 'Нужен промис, не массив');
      const result = observe(promise);
      await flush();
      assert.equal(result.status, 'fulfilled', 'Пустой вход не должен зависнуть');
      assert.equal(result.value, [], 'Пустой массив результатов');
      assert.equal(clock.pending(), 0, 'Таймер для пустого входа не нужен');
    `,
  },
  {
    name: 'Значения и промисы, включая falsy',
    input: '[0, Promise.resolve(false), "", null, undefined, объект]',
    expected: 'Все значения сохраняются, объект не копируется',
    script: `
      const value = { answer: 1 };
      const result = observe(subject([0, Promise.resolve(false), '', null, undefined, value]));
      await flush();
      assert.equal(result.status, 'fulfilled', 'Обычные значения допустимы');
      assert.equal(result.value, [0, false, '', null, undefined, value], 'Порядок и falsy');
      assert(result.value[4] === undefined, 'undefined не заменяется на null');
      assert(result.value[5] === value, 'Сохрани исходный объект');
    `,
  },
  {
    name: 'Thenable нормализуется, а не возвращается как объект',
    input: 'Thenable → Promise.resolve("nested"), Promise.resolve(2)',
    expected: '["nested", 2]',
    script: `
      const thenable = { then(resolve) { resolve(Promise.resolve('nested')); } };
      const result = observe(subject([thenable, Promise.resolve(2)]));
      await flush();
      assert.equal(result.status, 'fulfilled', 'Thenable поддерживается');
      assert.equal(result.value, ['nested', 2], 'Нужна ассимиляция thenable');
    `,
  },
  {
    name: 'Последний индекс завершился первым — это ещё не всё',
    input: 'Три deferred, порядок завершения 2,1,0',
    expected: 'pending до последнего завершения; ["a","b","c"]',
    script: `
      const sources = [deferred(), deferred(), deferred()];
      const result = observe(subject(sources.map(source => source.promise)));
      sources[2].resolve('c');
      await flush();
      assert.equal(result.status, 'pending', 'results.length не счётчик завершений');
      sources[1].resolve('b');
      await flush();
      assert.equal(result.status, 'pending', 'Ещё ждём индекс 0');
      sources[0].resolve('a');
      await flush();
      assert.equal(result.status, 'fulfilled', 'Все три завершились');
      assert.equal(result.value, ['a', 'b', 'c'], 'Запись по исходному индексу');
    `,
  },
  {
    name: 'Fail-fast не ждёт более ранний индекс',
    input: 'Индекс 0 pending, индекс 1 отклоняется объектом',
    expected: 'rejected с исходным объектом сразу после reject',
    script: `
      const a = deferred(), b = deferred(), reason = { code: 503 };
      const result = observe(subject([a.promise, b.promise]));
      b.reject(reason);
      await flush();
      assert.equal(result.status, 'rejected', 'Не последовательный await по индексам');
      assert(result.reason === reason, 'Исходная причина по ссылке');
      a.resolve('late');
      await flush();
      assert(result.reason === reason, 'Поздний успех ничего не меняет');
    `,
  },
  {
    name: 'Первая причина по времени сохраняется при нескольких ошибках',
    input: 'Reject индекса 1: null; затем reject индекса 0: "late"',
    expected: 'rejected(null), поздняя ошибка обработана',
    script: `
      const a = deferred(), b = deferred();
      const result = observe(subject([a.promise, b.promise]));
      b.reject(null);
      await flush();
      assert.equal(result.status, 'rejected', 'null — допустимая причина');
      assert(result.reason === null, 'Сохрани null');
      a.reject('late');
      await flush();
      assert.equal(result.status, 'rejected', 'Не allSettled');
      assert(result.reason === null, 'Первая причина остаётся');
    `,
  },
  {
    name: 'Единственный reject и thenable с ошибкой',
    input: 'Один thenable, отклоняющийся объектом',
    expected: 'rejected с тем же объектом',
    script: `
      const reason = { error: 'thenable' };
      const result = observe(subject([{ then(resolve, reject) { reject(reason); } }]));
      await flush();
      assert.equal(result.status, 'rejected', 'Reject thenable не теряется');
      assert(result.reason === reason, 'Без переупаковки причины');
    `,
  },
  {
    name: 'Независимые вызовы не разделяют счётчик и результаты',
    input: 'Два параллельных myPromiseAll с разными входами',
    expected: 'Один может завершиться, пока второй ещё pending',
    script: `
      const a = deferred(), b = deferred();
      const first = observe(subject([a.promise, 1]));
      const second = observe(subject([b.promise]));
      b.resolve('b');
      await flush();
      assert.equal(second.status, 'fulfilled', 'Второй вызов завершён отдельно');
      assert.equal(second.value, ['b'], 'Его собственный результат');
      assert.equal(first.status, 'pending', 'Первый продолжает ждать');
      a.resolve('a');
      await flush();
      assert.equal(first.status, 'fulfilled', 'Первый завершился позже');
      assert.equal(first.value, ['a', 1], 'Нет общего массива результатов');
    `,
  },
  {
    name: 'Собственная реализация без встроенного Promise.all',
    input: 'Promise.all временно недоступен; [Promise.resolve(1), 2]',
    expected: 'Самостоятельный комбинатор возвращает [1,2]',
    script: `
      const original = Promise.all;
      let delegated = false;
      Promise.all = function () { delegated = true; throw new Error('Реализуй свой Promise.all'); };
      try {
        const result = observe(subject([Promise.resolve(1), 2]));
        await flush();
        assert(!delegated, 'Нельзя делегировать соответствующему встроенному комбинатору');
        assert.equal(result.status, 'fulfilled', 'Работает без Promise.all');
        assert.equal(result.value, [1, 2], 'Правильный результат');
      } finally {
        Promise.all = original;
      }
    `,
  },
];
