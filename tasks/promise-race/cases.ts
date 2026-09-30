import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Побеждает завершение, а не позиция',
    input: 'Первый вход: 30 мс; второй: 10 мс.',
    expected: 'На 9 мс pending, на 10 мс значение второго входа.',
    script: `
      const slow = new Promise(resolve => setTimeout(() => resolve("slow"), 30));
      const fast = new Promise(resolve => setTimeout(() => resolve("fast"), 10));
      const result = observe(subject([slow, fast]));
      await clock.tick(9);
      assert.equal(result.status, "pending", "Нельзя завершиться до первого входа");
      await clock.tick(1);
      assert.equal(result.status, "fulfilled", "Первый завершившийся вход должен победить");
      assert.equal(result.value, "fast", "Порядок входов не определяет победителя");
      await clock.tick(20);
      assert.equal(result.value, "fast", "Поздний успех не меняет результат");
    `,
  },
  {
    name: 'Ранняя ошибка тоже побеждает',
    input: 'Ошибка второго входа раньше успеха первого.',
    expected: 'Отклонение с исходной причиной, без ожидания успеха.',
    script: `
      const first = deferred(), second = deferred();
      const error = { code: "early" };
      const result = observe(subject([first.promise, second.promise]));
      second.reject(error);
      await flush();
      assert.equal(result.status, "rejected", "Race не должен ждать первого успеха");
      assert(result.reason === error, "Сохрани исходную причину ошибки");
      first.resolve("late");
      await flush();
      assert(result.reason === error, "Поздний успех не меняет ошибку");
    `,
  },
  {
    name: 'Пустой массив',
    input: '[]',
    expected: 'Возвращён промис, который остаётся pending.',
    script: `
      const promise = subject([]);
      assert(promise && typeof promise.then === "function", "Нужен промис, не undefined");
      const result = observe(promise);
      await flush();
      await clock.tick(100);
      assert.equal(result.status, "pending", "Пустой race не завершается");
    `,
  },
  {
    name: 'Готовый промис перед обычным значением',
    input: '[Promise.resolve(1), 2]',
    expected: '1, без синхронного обхода промиса обычным значением.',
    script: `
      const result = observe(subject([Promise.resolve(1), 2]));
      await flush();
      assert.equal(result.status, "fulfilled", "Нужен успешный результат");
      assert.equal(result.value, 1, "Готовые входы учитываются в порядке подписки");
    `,
  },
  {
    name: 'Обычное falsy-значение',
    input: '[незавершённый промис, 0, false]',
    expected: '0; незавершённый вход не блокирует результат.',
    script: `
      const wait = deferred();
      const result = observe(subject([wait.promise, 0, false]));
      await flush();
      assert.equal(result.status, "fulfilled", "Обычные значения тоже участвуют");
      assert.equal(result.value, 0, "Нельзя терять falsy-значения");
      wait.resolve(9);
      await flush();
      assert.equal(result.value, 0, "Результат фиксируется один раз");
    `,
  },
  {
    name: 'Thenable: только первое завершение',
    input: 'Thenable вызывает resolve, reject, resolve.',
    expected: 'Первое значение, then вызывается один раз.',
    script: `
      let calls = 0;
      const item = { then(resolve, reject) { calls++; resolve({ ok: true }); reject("ignored"); resolve(2); } };
      const result = observe(subject([item]));
      await flush();
      assert.equal(calls, 1, "Thenable нужно нормализовать один раз");
      assert.equal(result.status, "fulfilled", "Первый resolve побеждает");
      assert.equal(result.value, { ok: true }, "Значение thenable передаётся наружу");
    `,
  },
  {
    name: 'Ошибка чтения then',
    input: 'Thenable с бросающим getter then.',
    expected: 'Отклонение с исходной ошибкой.',
    script: `
      const error = new Error("then getter");
      const item = { get then() { throw error; } };
      const result = observe(subject([item]));
      await flush();
      assert.equal(result.status, "rejected", "Ошибка нормализации должна отклонить промис");
      assert(result.reason === error, "Причина ошибки должна сохраниться");
    `,
  },
  {
    name: 'Поздняя ошибка проигравшего',
    input: 'Один вход побеждает, второй позже отклоняется.',
    expected: 'Результат сохраняется; поздняя ошибка обработана.',
    script: `
      const loser = deferred();
      const result = observe(subject([Promise.resolve("winner"), loser.promise]));
      await flush();
      assert.equal(result.status, "fulfilled", "Победитель должен завершить race");
      loser.reject(new Error("late rejection"));
      await flush();
      await clock.tick(1);
      assert.equal(result.value, "winner", "Поздняя ошибка не меняет результат");
    `,
  },
  {
    name: 'Без встроенного Promise.race',
    input: 'Встроенный Promise.race недоступен.',
    expected: 'Самостоятельная реализация возвращает значение.',
    script: `
      const original = Promise.race;
      Promise.race = () => { throw new Error("Promise.race запрещён условием"); };
      try {
        const result = observe(subject([Promise.resolve("custom")]));
        await flush();
        assert.equal(result.status, "fulfilled", "Реализуй комбинатор самостоятельно");
        assert.equal(result.value, "custom", "Нужен результат входа");
      } finally { Promise.race = original; }
    `,
  },
];
