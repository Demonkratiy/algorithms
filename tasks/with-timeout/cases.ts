import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Ранний успех передаёт тот же объект и очищает таймер',
    input: 'Операция выполнена через 4 мс; timeout = 50',
    expected: 'Исходный объект, таймер снят',
    script: `
      const baseline = clock.pending();
      const source = deferred();
      const value = { answer: 42 };
      const result = observe(subject(source.promise, 50));
      await clock.tick(4);
      source.resolve(value);
      await flush();
      assert.equal(result.status, 'fulfilled', 'Успех до таймаута');
      assert(result.value === value, 'Не копируй и не меняй значение');
      assert.equal(clock.pending(), baseline, 'Таймер успеха очищен');
    `,
  },
  {
    name: 'Ранняя ошибка сохраняет причину и очищает таймер',
    input: 'Отклонение объектом через 3 мс; timeout = 60',
    expected: 'rejected с той же причиной, без таймеров',
    script: `
      const baseline = clock.pending();
      const source = deferred();
      const reason = { code: 'offline' };
      const result = observe(subject(source.promise, 60));
      await clock.tick(3);
      source.reject(reason);
      await flush();
      assert.equal(result.status, 'rejected', 'Ошибка не превращается в успех');
      assert(result.reason === reason, 'Сохрани причину по ссылке');
      assert.equal(clock.pending(), baseline, 'Очищай таймер и при reject');
    `,
  },
  {
    name: 'Зависшая операция ограничена точным таймаутом',
    input: 'Незавершающийся промис; timeout = 25',
    expected: 'После 25 мс: Error("Timeout after 25ms")',
    script: `
      const baseline = clock.pending();
      const source = deferred();
      const start = clock.now();
      const result = observe(subject(source.promise, 25));
      await clock.tick(24);
      assert.equal(result.status, 'pending', 'До границы не отклоняй');
      await clock.tick(1);
      assert.equal(result.status, 'rejected', 'Таймаут отклоняет промис');
      assert(result.reason instanceof Error, 'Таймаут должен быть Error');
      assert.equal(result.reason.message, 'Timeout after 25ms', 'Сообщение по контракту');
      assert.equal(clock.now() - start, 25, 'Относительное время');
      assert.equal(clock.pending(), baseline, 'Таймер таймаута больше не активен');
    `,
  },
  {
    name: 'Нулевой таймаут для pending-операции',
    input: 'Pending-промис; timeout = 0',
    expected: 'pending до таймеров, затем Timeout after 0ms',
    script: `
      const source = deferred();
      const result = observe(subject(source.promise, 0));
      await flush();
      assert.equal(result.status, 'pending', 'Нулевой таймаут тоже асинхронный');
      await clock.tick(0);
      assert.equal(result.status, 'rejected', 'Таймер 0 сработал');
      assert(result.reason instanceof Error, 'Нужен Error');
      assert.equal(result.reason.message, 'Timeout after 0ms', 'Учитывай нулевую задержку');
    `,
  },
  {
    name: 'Уже выполненный промис выигрывает у нулевого таймера',
    input: 'Promise.resolve(0); timeout = 0',
    expected: 'fulfilled(0), таймер снят',
    script: `
      const baseline = clock.pending();
      const result = observe(subject(Promise.resolve(0), 0));
      await flush();
      assert.equal(result.status, 'fulfilled', 'Микрозадачи раньше таймеров');
      assert.equal(result.value, 0, 'Falsy-значение сохраняется');
      assert.equal(clock.pending(), baseline, 'Нулевой таймер тоже очищается');
    `,
  },
  {
    name: 'Поздний успех не меняет таймаут',
    input: 'Timeout = 10, успех после таймаута',
    expected: 'Первая ошибка остаётся окончательным результатом',
    script: `
      const source = deferred();
      const result = observe(subject(source.promise, 10));
      await clock.tick(10);
      assert.equal(result.status, 'rejected', 'Сначала таймаут');
      const reason = result.reason;
      source.resolve('late');
      await flush();
      assert.equal(result.status, 'rejected', 'Поздний успех игнорируется');
      assert(result.reason === reason, 'Причина таймаута неизменна');
    `,
  },
  {
    name: 'Поздний reject исходной операции обработан',
    input: 'Timeout = 8, затем исходный reject',
    expected: 'Сохраняется таймаут, нет необработанного reject',
    script: `
      const source = deferred();
      const result = observe(subject(source.promise, 8));
      await clock.tick(8);
      assert.equal(result.status, 'rejected', 'Таймаут завершил обёртку');
      const reason = result.reason;
      source.reject({ late: true });
      await flush();
      assert(result.reason === reason, 'Поздняя ошибка не заменяет таймаут');
      assert.equal(clock.pending(), 0, 'Активных таймеров нет');
    `,
  },
  {
    name: 'Две обёртки не очищают чужой таймер',
    input: 'Два pending-промиса с timeout 20 и 40; первый успешен',
    expected: 'Первый fulfilled, второй отклоняется на своей границе',
    script: `
      const a = deferred(), b = deferred();
      const first = observe(subject(a.promise, 20));
      const second = observe(subject(b.promise, 40));
      a.resolve('ok');
      await flush();
      assert.equal(first.status, 'fulfilled', 'Первая обёртка выполнена');
      assert.equal(first.value, 'ok', 'Значение первой операции');
      await clock.tick(39);
      assert.equal(second.status, 'pending', 'Второй таймер независим');
      await clock.tick(1);
      assert.equal(second.status, 'rejected', 'Второй таймер не был снят первым');
      assert.equal(second.reason.message, 'Timeout after 40ms', 'Правильная задержка');
    `,
  },
];
