import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Фабрика вызывается один раз',
    input: 'Фабрика возвращает обычный объект.',
    expected: 'Promise выполняется тем же объектом; фабрика вызвана один раз.',
    script: `
      let calls = 0;
      const value = { payload: 1 };
      const operation = subject(() => { calls++; return value; });
      assert(operation && typeof operation.cancel === "function", "Нужен объект с cancel");
      assert(operation.promise && typeof operation.promise.then === "function", "Нужен promise");
      const result = observe(operation.promise);
      await flush();
      assert.equal(calls, 1, "Фабрика вызывается ровно один раз");
      assert.equal(result.status, "fulfilled", "Обычное значение должно завершить promise");
      assert(result.value === value, "Сохрани значение фабрики без копирования");
      operation.cancel();
      operation.cancel();
      await flush();
      assert.equal(calls, 1, "Cancel не должен перезапускать фабрику");
      assert.equal(result.status, "fulfilled", "После успеха cancel ничего не меняет");
    `,
  },
  {
    name: 'Отмена зависшей операции немедленна',
    input: 'Исходный промис не завершается; cancel вызывается дважды.',
    expected: 'CancelledError без продвижения времени; причина не меняется.',
    script: `
      const pending = deferred();
      let calls = 0;
      const operation = subject(() => { calls++; return pending.promise; });
      const result = observe(operation.promise);
      const time = clock.now();
      operation.cancel();
      await flush();
      assert.equal(result.status, "rejected", "Cancel не должен ждать исходный промис или таймер");
      assert(result.reason instanceof Error && result.reason.name === "CancelledError", "Нужна ошибка CancelledError");
      const error = result.reason;
      operation.cancel();
      await flush();
      assert(result.reason === error, "Повторная отмена — no-op");
      assert.equal(clock.now(), time, "Отмена не требует продвижения времени");
      assert.equal(calls, 1, "Даже отменённая операция вызывает фабрику один раз");
    `,
  },
  {
    name: 'Отмена не прерывает исходную работу',
    input: 'Фабрика завершит работу через 20 мс; cancel до завершения.',
    expected: 'Внешний промис отменён, исходная работа всё равно выполняется.',
    script: `
      let completed = 0;
      const operation = subject(() => new Promise(resolve => setTimeout(() => {
        completed++; resolve("late");
      }, 20)));
      const result = observe(operation.promise);
      operation.cancel();
      await flush();
      assert.equal(result.status, "rejected", "Ожидание отменяется сразу");
      assert.equal(result.reason.name, "CancelledError", "Сохрани тип отмены");
      const error = result.reason;
      await clock.tick(20);
      assert.equal(completed, 1, "Логическая отмена не останавливает исходную работу");
      assert(result.reason === error, "Поздний успех игнорируется");
    `,
  },
  {
    name: 'Поздняя ошибка после отмены обработана',
    input: 'Cancel, затем reject исходной операции.',
    expected: 'CancelledError остаётся результатом; нет unhandled rejection.',
    script: `
      const source = deferred();
      const operation = subject(() => source.promise);
      const result = observe(operation.promise);
      operation.cancel();
      await flush();
      assert.equal(result.status, "rejected", "Нужна немедленная отмена");
      assert.equal(result.reason.name, "CancelledError", "Нужна ошибка отмены");
      const error = result.reason;
      source.reject(new Error("late failure"));
      await flush();
      await clock.tick(1);
      assert(result.reason === error, "Поздняя ошибка не заменяет отмену");
    `,
  },
  {
    name: 'Асинхронный успех и cancel после него',
    input: 'Фабрика возвращает промис; успех до cancel.',
    expected: 'Исходное значение сохранено после отмены.',
    script: `
      const source = deferred();
      const operation = subject(() => source.promise);
      const result = observe(operation.promise);
      await flush();
      assert.equal(result.status, "pending", "Нужно дождаться результата фабрики");
      source.resolve(false);
      await flush();
      assert.equal(result.status, "fulfilled", "Успех передаётся наружу");
      assert.equal(result.value, false, "Falsy-значение должно сохраниться");
      operation.cancel();
      operation.cancel();
      await flush();
      assert.equal(result.status, "fulfilled", "Cancel после успеха — no-op");
      assert.equal(result.value, false, "Успешное значение не меняется");
    `,
  },
  {
    name: 'Асинхронная ошибка и cancel после неё',
    input: 'Исходный промис отклоняется объектом причины.',
    expected: 'Та же причина ошибки, не CancelledError.',
    script: `
      const source = deferred(), reason = { code: "source" };
      const operation = subject(() => source.promise);
      const result = observe(operation.promise);
      source.reject(reason);
      await flush();
      assert.equal(result.status, "rejected", "Ошибка фабрики передаётся наружу");
      assert(result.reason === reason, "Нельзя оборачивать исходную причину");
      operation.cancel();
      await flush();
      assert(result.reason === reason, "Cancel после ошибки — no-op");
    `,
  },
  {
    name: 'Синхронная ошибка фабрики',
    input: 'Фабрика бросает Error.',
    expected: 'Отклонённый promise, фабрика вызвана один раз.',
    script: `
      const error = new Error("factory");
      let calls = 0;
      const operation = subject(() => { calls++; throw error; });
      const result = observe(operation.promise);
      await flush();
      assert.equal(calls, 1, "Не перезапускай фабрику при ошибке");
      assert.equal(result.status, "rejected", "Синхронный throw должен попасть в promise");
      assert(result.reason === error, "Сохрани исходную ошибку");
      operation.cancel();
      await flush();
      assert(result.reason === error, "Уже отклонённый promise не меняется");
    `,
  },
  {
    name: 'Thenable фабрики',
    input: 'Thenable сначала resolve(undefined), затем reject.',
    expected: 'Fulfilled с undefined, одно обращение к then.',
    script: `
      let calls = 0;
      const operation = subject(() => ({ then(resolve, reject) {
        calls++; resolve(undefined); reject(new Error("ignored"));
      } }));
      assert(operation.promise && typeof operation.promise.then === "function", "Нужен promise");
      const result = observe(operation.promise);
      await flush();
      assert.equal(calls, 1, "Thenable нужно нормализовать один раз");
      assert.equal(result.status, "fulfilled", "Первое завершение thenable определяет результат");
      assert(result.value === undefined, "undefined — допустимое значение");
      operation.cancel();
      await flush();
      assert.equal(result.status, "fulfilled", "Поздняя отмена не меняет статус");
    `,
  },
];
