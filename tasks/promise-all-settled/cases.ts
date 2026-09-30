import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Пустой вход не зависает',
    input: 'myAllSettled([])',
    expected: 'Промис с [] без таймеров',
    script: `
      const promise = subject([]);
      assert(promise && typeof promise.then === 'function', 'Возвращай промис');
      const result = observe(promise);
      await flush();
      assert.equal(result.status, 'fulfilled', 'Пустой вход выполнен');
      assert.equal(result.value, [], 'Пустой массив');
      assert.equal(clock.pending(), 0, 'Таймер не требуется');
    `,
  },
  {
    name: 'Смешанные исходы в исходном порядке',
    input: '[Promise.resolve(1), Promise.reject("x"), 3]',
    expected: 'fulfilled/value, rejected/reason, fulfilled/value',
    script: `
      const result = observe(subject([Promise.resolve(1), Promise.reject('x'), 3]));
      await flush();
      assert.equal(result.status, 'fulfilled', 'Ошибка входа не отклоняет allSettled');
      assert.equal(result.value, [
        { status: 'fulfilled', value: 1 },
        { status: 'rejected', reason: 'x' },
        { status: 'fulfilled', value: 3 }
      ], 'Точные записи результата, не только значения');
    `,
  },
  {
    name: 'Ошибка не завершает ожидание остальных',
    input: 'Индекс 1 отклонён; индекс 0 ещё pending',
    expected: 'pending до завершения индекса 0, затем все записи',
    script: `
      const a = deferred(), b = deferred(), reason = { code: 'offline' };
      const result = observe(subject([a.promise, b.promise]));
      b.reject(reason);
      await flush();
      assert.equal(result.status, 'pending', 'Не fail-fast');
      a.resolve('ok');
      await flush();
      assert.equal(result.status, 'fulfilled', 'Оба завершились');
      assert.equal(result.value, [
        { status: 'fulfilled', value: 'ok' },
        { status: 'rejected', reason }
      ], 'Исходный порядок');
      assert(result.value[1].reason === reason, 'Исходная причина по ссылке');
    `,
  },
  {
    name: 'Обратный порядок завершения и честный счётчик',
    input: 'Три deferred завершаются 2,1,0',
    expected: 'Нет раннего resolve по длине results; порядок 0,1,2',
    script: `
      const sources = [deferred(), deferred(), deferred()];
      const result = observe(subject(sources.map(source => source.promise)));
      sources[2].resolve('c');
      await flush();
      assert.equal(result.status, 'pending', 'Последний индекс — не все результаты');
      sources[1].reject('b');
      await flush();
      assert.equal(result.status, 'pending', 'Ещё ждём индекс 0');
      sources[0].resolve('a');
      await flush();
      assert.equal(result.status, 'fulfilled', 'Все завершились');
      assert.equal(result.value, [
        { status: 'fulfilled', value: 'a' },
        { status: 'rejected', reason: 'b' },
        { status: 'fulfilled', value: 'c' }
      ], 'Не порядок завершения');
    `,
  },
  {
    name: 'Все входы отклонены — общий промис всё равно успешен',
    input: '[Promise.reject(null), Promise.reject(0)]',
    expected: 'fulfilled с двумя rejected-записями',
    script: `
      const result = observe(subject([Promise.reject(null), Promise.reject(0)]));
      await flush();
      assert.equal(result.status, 'fulfilled', 'Даже все ошибки — успешный allSettled');
      assert.equal(result.value, [
        { status: 'rejected', reason: null },
        { status: 'rejected', reason: 0 }
      ], 'Причины не обязаны быть Error');
    `,
  },
  {
    name: 'Обычные значения, undefined и точная форма записи',
    input: '[undefined, false, объект, Promise.reject(undefined)]',
    expected: 'У успеха только status/value, у ошибки только status/reason',
    script: `
      const value = { nested: true };
      const result = observe(subject([undefined, false, value, Promise.reject(undefined)]));
      await flush();
      assert.equal(result.status, 'fulfilled', 'Значения поддерживаются');
      assert.equal(result.value.length, 4, 'По одной записи на вход');
      for (let i = 0; i < 3; i++) {
        assert.equal(Object.keys(result.value[i]).sort(), ['status', 'value'], 'Только ключи успеха');
        assert.equal(result.value[i].status, 'fulfilled', 'Правильный status');
      }
      assert(result.value[0].value === undefined, 'Поле value присутствует и равно undefined');
      assert(result.value[1].value === false, 'Falsy сохраняется');
      assert(result.value[2].value === value, 'Объект по ссылке');
      assert.equal(Object.keys(result.value[3]).sort(), ['reason', 'status'], 'Только ключи ошибки');
      assert.equal(result.value[3].status, 'rejected', 'Status ошибки');
      assert(result.value[3].reason === undefined, 'Undefined-причина сохранена');
    `,
  },
  {
    name: 'Thenable нормализуются для обоих исходов',
    input: 'Thenable resolve(Promise.resolve(7)) и thenable reject(объект)',
    expected: 'fulfilled(7) и rejected с исходным объектом',
    script: `
      const reason = { from: 'thenable' };
      const result = observe(subject([
        { then(resolve) { resolve(Promise.resolve(7)); } },
        { then(resolve, reject) { reject(reason); } }
      ]));
      await flush();
      assert.equal(result.status, 'fulfilled', 'Thenable обоих видов');
      assert.equal(result.value, [
        { status: 'fulfilled', value: 7 },
        { status: 'rejected', reason }
      ], 'Нормализация вложенного промиса');
      assert(result.value[1].reason === reason, 'Причина без копии');
    `,
  },
  {
    name: 'Собственная реализация без Promise.allSettled',
    input: 'Promise.allSettled временно недоступен; [1, Promise.reject("x")]',
    expected: 'Свой комбинатор собирает оба результата',
    script: `
      const original = Promise.allSettled;
      let delegated = false;
      Promise.allSettled = function () { delegated = true; throw new Error('Реализуй свой allSettled'); };
      try {
        const result = observe(subject([1, Promise.reject('x')]));
        await flush();
        assert(!delegated, 'Не вызывай соответствующий встроенный комбинатор');
        assert.equal(result.status, 'fulfilled', 'Самостоятельная реализация');
        assert.equal(result.value, [
          { status: 'fulfilled', value: 1 }, { status: 'rejected', reason: 'x' }
        ], 'Оба результата');
      } finally {
        Promise.allSettled = original;
      }
    `,
  },
];
