import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Первая ошибка не завершает any',
    input: 'Первый вход отклонён, второй позже успешен.',
    expected: 'Pending после ошибки, затем успех второго.',
    script: `
      const first = deferred(), second = deferred();
      const result = observe(subject([first.promise, second.promise]));
      first.reject("first error");
      await flush();
      assert.equal(result.status, "pending", "Одна ошибка не означает провал всех входов");
      second.resolve("success");
      await flush();
      assert.equal(result.status, "fulfilled", "Первый успех должен завершить any");
      assert.equal(result.value, "success", "Нужен результат успешного входа");
    `,
  },
  {
    name: 'Побеждает самый быстрый успех',
    input: 'Успехи на 30 и 10 мс.',
    expected: 'На 9 мс pending, на 10 мс второй результат.',
    script: `
      const slow = new Promise(resolve => setTimeout(() => resolve("slow"), 30));
      const fast = new Promise(resolve => setTimeout(() => resolve("fast"), 10));
      const result = observe(subject([slow, fast]));
      await clock.tick(9);
      assert.equal(result.status, "pending", "Успех ещё не получен");
      await clock.tick(1);
      assert.equal(result.status, "fulfilled", "Нельзя ждать всех успешных входов");
      assert.equal(result.value, "fast", "Не выбирай по позиции во входе");
      await clock.tick(20);
      assert.equal(result.value, "fast", "Поздний успех игнорируется");
    `,
  },
  {
    name: 'AggregateError в порядке входа',
    input: 'Три причины; отклонения в порядке 2, 0, 1.',
    expected: 'AggregateError.errors содержит причины в порядке 0, 1, 2.',
    script: `
      const inputs = [deferred(), deferred(), deferred()];
      const reasons = [{ code: "a" }, null, new Error("c")];
      const result = observe(subject(inputs.map(item => item.promise)));
      inputs[2].reject(reasons[2]);
      inputs[0].reject(reasons[0]);
      await flush();
      assert.equal(result.status, "pending", "Остался незавершённый вход");
      inputs[1].reject(reasons[1]);
      await flush();
      assert.equal(result.status, "rejected", "Все ошибки должны отклонить any");
      assert(result.reason instanceof AggregateError, "Нужен именно AggregateError");
      assert.equal(result.reason.errors.length, 3, "Сохрани все причины");
      for (let i = 0; i < 3; i++) assert(result.reason.errors[i] === reasons[i], "Порядок и идентичность причин важны");
    `,
  },
  {
    name: 'Пустой массив',
    input: '[]',
    expected: 'Отклонение с AggregateError и пустым errors.',
    script: `
      const promise = subject([]);
      assert(promise && typeof promise.then === "function", "Нужно вернуть промис");
      const result = observe(promise);
      await flush();
      assert.equal(result.status, "rejected", "Пустой any не остаётся pending");
      assert(result.reason instanceof AggregateError, "Нужен AggregateError");
      assert.equal(result.reason.errors, [], "Пустой вход — пустой список причин");
    `,
  },
  {
    name: 'Нормализация и falsy-значения',
    input: '[Promise.resolve(false), 2]',
    expected: 'false, а не более позднее обычное значение.',
    script: `
      const result = observe(subject([Promise.resolve(false), 2]));
      await flush();
      assert.equal(result.status, "fulfilled", "Falsy — допустимый успех");
      assert.equal(result.value, false, "Сохрани порядок готовых входов");
      const zero = observe(subject([Promise.reject("no"), 0]));
      await flush();
      assert.equal(zero.status, "fulfilled", "Обычные значения тоже нормализуются");
      assert.equal(zero.value, 0, "Нельзя терять ноль");
    `,
  },
  {
    name: 'Thenable не может отклониться дважды',
    input: 'Thenable дважды reject; другой вход ещё ожидает.',
    expected: 'Одна причина не считается двумя; поздний успех побеждает.',
    script: `
      let calls = 0;
      const pending = deferred();
      const item = { then(resolve, reject) { calls++; reject("first"); reject("again"); resolve("ignored"); } };
      const result = observe(subject([item, pending.promise]));
      await flush();
      assert.equal(calls, 1, "Thenable вызывается один раз");
      assert.equal(result.status, "pending", "Один thenable не равен двум ошибкам");
      pending.resolve("valid");
      await flush();
      assert.equal(result.status, "fulfilled", "Остался успешный вход");
      assert.equal(result.value, "valid", "Повторные завершения thenable игнорируются");
    `,
  },
  {
    name: 'Успешный thenable и ошибка getter',
    input: 'Getter then бросает; следующий thenable успешен.',
    expected: 'Успех thenable, ошибка getter — только одна из причин.',
    script: `
      const broken = { get then() { throw new Error("getter"); } };
      const result = observe(subject([broken, { then(resolve) { resolve({ data: 7 }); } }]));
      await flush();
      assert.equal(result.status, "fulfilled", "Ошибка getter не отменяет другие входы");
      assert.equal(result.value, { data: 7 }, "Нужно поддержать успешный thenable");
    `,
  },
  {
    name: 'Ошибка плюс зависший вход',
    input: 'Один reject, один pending.',
    expected: 'Any остаётся pending.',
    script: `
      const never = deferred();
      const result = observe(subject([Promise.reject("failed"), never.promise]));
      await flush();
      await clock.tick(100);
      assert.equal(result.status, "pending", "Нельзя объявлять ошибку до завершения всех входов");
    `,
  },
  {
    name: 'Поздние ошибки после успеха',
    input: 'Успех, затем отклонение проигравшего.',
    expected: 'Успех сохранён, позднее отклонение обработано.',
    script: `
      const loser = deferred();
      const result = observe(subject([Promise.resolve("ok"), loser.promise]));
      await flush();
      assert.equal(result.status, "fulfilled", "Нужен ранний успех");
      loser.reject(new Error("late"));
      await flush();
      await clock.tick(1);
      assert.equal(result.value, "ok", "Поздняя ошибка игнорируется");
    `,
  },
  {
    name: 'Без встроенного Promise.any',
    input: 'Встроенный Promise.any недоступен.',
    expected: 'Самостоятельная реализация возвращает успех.',
    script: `
      const original = Promise.any;
      Promise.any = () => { throw new Error("Promise.any запрещён условием"); };
      try {
        const result = observe(subject([Promise.resolve("custom")]));
        await flush();
        assert.equal(result.status, "fulfilled", "Реализуй комбинатор самостоятельно");
        assert.equal(result.value, "custom", "Нужен результат входа");
      } finally { Promise.any = original; }
    `,
  },
];
