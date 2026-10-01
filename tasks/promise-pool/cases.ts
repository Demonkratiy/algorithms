import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Пустой массив задач',
    input: 'promisePool([], 3)',
    expected: 'Промис выполняется с [] без таймеров',
    script: `
      const promise = subject([], 3);
      assert(promise && typeof promise.then === 'function', 'Пул возвращает промис');
      const result = observe(promise);
      await flush();
      assert.equal(result.status, 'fulfilled', 'Пустой пул не зависает');
      assert.equal(result.value, [], 'Пустой результат');
      assert.equal(clock.pending(), 0, 'Пустому пулу таймеры не нужны');
    `,
  },
  {
    name: 'Одна фабрика вызывается ровно один раз',
    input: 'Одна pending-задача, limit = 1',
    expected: 'Один запуск; ожидание завершения; [false]',
    script: `
      const source = deferred();
      let calls = 0;
      const result = observe(subject([() => { calls++; return source.promise; }], 1));
      await flush();
      assert.equal(calls, 1, 'Фабрику надо вызвать один раз');
      assert.equal(result.status, 'pending', 'Пул ждёт задачу');
      source.resolve(false);
      await flush();
      assert.equal(result.status, 'fulfilled', 'Задача завершилась');
      assert.equal(result.value, [false], 'Не теряй falsy');
      assert.equal(calls, 1, 'Повторного запуска нет');
    `,
  },
  {
    name: 'Лимит больше числа задач',
    input: 'Две фабрики, limit = 10',
    expected: 'Обе стартуют, каждая один раз, порядок входа',
    script: `
      const sources = [deferred(), deferred()], calls = [];
      const result = observe(subject(sources.map((source, i) => () => {
        calls.push(i); return source.promise;
      }), 10));
      await flush();
      assert.equal([...calls].sort(), [0, 1], 'Обе задачи запущены без лишних вызовов');
      sources[1].resolve('b');
      await flush();
      assert.equal(result.status, 'pending', 'Нужны все результаты');
      sources[0].resolve('a');
      await flush();
      assert.equal(result.status, 'fulfilled', 'Большой limit допустим');
      assert.equal(result.value, ['a', 'b'], 'Порядок входного массива');
    `,
  },
  {
    name: 'limit = 1 — строго последовательный запуск',
    input: 'Три фабрики с ручным завершением; limit = 1',
    expected: 'Каждая следующая стартует только после предыдущей',
    script: `
      const sources = [deferred(), deferred(), deferred()], calls = [];
      const result = observe(subject(sources.map((source, i) => () => {
        calls.push(i); return source.promise;
      }), 1));
      await flush();
      assert.equal(calls, [0], 'Не вызывай фабрики заранее');
      sources[0].resolve(10);
      await flush();
      assert.equal(calls, [0, 1], 'Освободился один слот');
      sources[1].resolve(20);
      await flush();
      assert.equal(calls, [0, 1, 2], 'Каждая задача ровно один раз');
      assert.equal(result.status, 'pending', 'Третью надо дождаться');
      sources[2].resolve(30);
      await flush();
      assert.equal(result.status, 'fulfilled', 'Последняя задача завершена');
      assert.equal(result.value, [10, 20, 30], 'Результаты всех задач');
    `,
  },
  {
    name: 'Свободный слот заполняется без ожидания всего батча',
    input: 'Четыре задачи, limit = 2; вторая завершится первой',
    expected: 'Сначала 0 и 1; затем 2 и 3 при освобождении одного слота',
    script: `
      const sources = Array.from({ length: 4 }, () => deferred());
      const calls = [];
      let active = 0, maxActive = 0;
      const result = observe(subject(sources.map((source, i) => () => {
        calls.push(i);
        maxActive = Math.max(maxActive, ++active);
        return source.promise.then(value => { active--; return value; });
      }), 2));
      await flush();
      assert.equal(calls, [0, 1], 'Ленивый запуск только первых двух');
      assert.equal(active, 2, 'Не сериализуй весь пул');
      sources[1].resolve('b');
      await flush();
      assert.equal(calls, [0, 1, 2], 'Не жди медленную задачу 0');
      assert.equal(active, 2, 'Свободный слот снова занят');
      sources[2].resolve('c');
      await flush();
      assert.equal(calls, [0, 1, 2, 3], 'Следующая незапущенная задача');
      sources[3].resolve('d');
      await flush();
      assert.equal(result.status, 'pending', 'Задача 0 ещё работает');
      sources[0].resolve('a');
      await flush();
      assert.equal(maxActive, 2, 'Максимальная конкуренция ровно limit');
      assert.equal(active, 0, 'Все фабрики завершились');
      assert.equal(result.status, 'fulfilled', 'Пул завершён');
      assert.equal(result.value, ['a', 'b', 'c', 'd'], 'Не порядок завершения');
    `,
  },
  {
    name: 'Таймерные задачи соблюдают конкуренцию и порядок',
    input: 'Длительности [30,5,10,2,4,1], limit = 3',
    expected: 'Каждая фабрика один раз; maxActive = 3; результат [0..5]',
    script: `
      const durations = [30, 5, 10, 2, 4, 1], calls = [];
      let active = 0, maxActive = 0;
      const result = observe(subject(durations.map((ms, i) => () => {
        calls.push(i); maxActive = Math.max(maxActive, ++active);
        return new Promise(resolve => setTimeout(() => { active--; resolve(i); }, ms));
      }), 3));
      await flush();
      assert.equal(calls, [0, 1, 2], 'Запущены только три задачи');
      await clock.tick(29);
      assert.equal(result.status, 'pending', 'Самая долгая ещё выполняется');
      await clock.tick(1);
      assert.equal(result.status, 'fulfilled', 'Все таймерные задачи завершены');
      assert.equal(result.value, [0, 1, 2, 3, 4, 5], 'Результат по индексам');
      assert.equal(calls, [0, 1, 2, 3, 4, 5], 'Нет потерь или дублей');
      assert.equal(maxActive, 3, 'Ни превышения лимита, ни последовательного запуска');
      assert.equal(active, 0, 'Нет оставшихся задач');
    `,
  },
  {
    name: 'Fail-fast не ждёт pending-соседа',
    input: 'Две запущенные задачи; вторая отклоняется объектом',
    expected: 'Пул rejected с тем же объектом, пока первая pending',
    script: `
      const a = deferred(), b = deferred(), reason = { code: 'failed' };
      const result = observe(subject([() => a.promise, () => b.promise], 2));
      await flush();
      b.reject(reason);
      await flush();
      assert.equal(result.status, 'rejected', 'Не жди завершения всех при ошибке');
      assert(result.reason === reason, 'Сохрани причину, не упаковывай в Error');
      a.resolve('late');
      await flush();
      assert.equal(result.status, 'rejected', 'Поздний успех не меняет исход');
      assert(result.reason === reason, 'Первая ошибка осталась');
    `,
  },
  {
    name: 'Первая по времени ошибка, не по индексу задачи',
    input: 'Ошибка задачи 1 раньше ошибки задачи 0; limit = 2',
    expected: 'rejected("second-index"), поздняя ошибка обработана',
    script: `
      const a = deferred(), b = deferred();
      const result = observe(subject([() => a.promise, () => b.promise], 2));
      await flush();
      b.reject('second-index');
      await flush();
      assert.equal(result.status, 'rejected', 'Первый reject отклоняет пул');
      assert.equal(result.reason, 'second-index', 'Не требуется Error');
      a.reject('first-index');
      await flush();
      assert.equal(result.reason, 'second-index', 'Не заменяй причину поздним reject');
    `,
  },
];
