import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Синхронный успех с первой попытки',
    input: 'fn(1) возвращает объект; опции не заданы',
    expected: 'Один вызов, тот же объект, без паузы',
    script: `
      const calls = [];
      const value = { ok: true };
      const result = observe(subject(attempt => { calls.push(attempt); return value; }));
      await flush();
      assert.equal(calls, [1], 'Нумерация начинается с 1');
      assert.equal(result.status, 'fulfilled', 'Значение тоже успех');
      assert(result.value === value, 'Сохрани значение');
      assert.equal(clock.pending(), 0, 'После успеха паузы нет');
    `,
  },
  {
    name: 'Defaults: ровно три попытки с паузами 300',
    input: 'fn всегда отклоняется; retry(fn)',
    expected: 'Попытки 1,2,3 в моменты 0,300,600; последняя причина',
    script: `
      const start = clock.now(), calls = [];
      const reasons = [{ attempt: 1 }, { attempt: 2 }, { attempt: 3 }];
      const result = observe(subject(attempt => {
        calls.push([attempt, clock.now() - start]);
        return Promise.reject(reasons[attempt - 1]);
      }));
      await flush();
      assert.equal(calls, [[1, 0]], 'Сначала одна попытка');
      await clock.tick(299);
      assert.equal(calls.length, 1, 'Пауза по умолчанию 300');
      await clock.tick(1);
      assert.equal(calls, [[1, 0], [2, 300]], 'Вторая попытка');
      await clock.tick(300);
      assert.equal(calls, [[1, 0], [2, 300], [3, 600]], 'Всего три вызова');
      assert.equal(result.status, 'rejected', 'Все попытки исчерпаны');
      assert(result.reason === reasons[2], 'Последняя причина по ссылке');
      assert.equal(clock.pending(), 0, 'После последнего reject нет паузы');
    `,
  },
  {
    name: 'Успех второй попытки останавливает повторы',
    input: 'attempts = 4, delay = 20; успех на второй попытке',
    expected: 'Два вызова с паузой 20, результат false',
    script: `
      const calls = [];
      const result = observe(subject(attempt => {
        calls.push(attempt);
        return attempt === 1 ? Promise.reject('again') : Promise.resolve(false);
      }, { attempts: 4, delay: 20 }));
      await flush();
      await clock.tick(19);
      assert.equal(calls, [1], 'Нельзя повторять раньше задержки');
      await clock.tick(1);
      assert.equal(calls, [1, 2], 'Успех прекращает цикл');
      assert.equal(result.status, 'fulfilled', 'Асинхронный успех');
      assert.equal(result.value, false, 'Falsy — тоже успех');
      assert.equal(clock.pending(), 0, 'Лишних повторов нет');
    `,
  },
  {
    name: 'attempts = 1 — без дополнительного вызова и таймера',
    input: 'Одна неуспешная попытка; delay = 50',
    expected: 'rejected(null), один вызов, сразу после микрозадач',
    script: `
      let calls = 0;
      const result = observe(subject(() => { calls++; return Promise.reject(null); },
        { attempts: 1, delay: 50 }));
      await flush();
      assert.equal(calls, 1, 'attempts — число попыток, не повторов');
      assert.equal(result.status, 'rejected', 'Нет ожидания после последней ошибки');
      assert(result.reason === null, 'Причина может быть null');
      assert.equal(clock.pending(), 0, 'Последний таймер не создаётся');
    `,
  },
  {
    name: 'Синхронный throw тоже повторяется',
    input: 'Два throw, затем значение; attempts = 3, delay = 7',
    expected: 'Три вызова с номерами 1,2,3; fulfilled(9)',
    script: `
      const calls = [];
      const result = observe(subject(attempt => {
        calls.push(attempt);
        if (attempt < 3) throw new Error('sync');
        return 9;
      }, { attempts: 3, delay: 7 }));
      await flush();
      assert.equal(result.status, 'pending', 'Синхронная ошибка попала в retry');
      await clock.tick(7);
      assert.equal(calls, [1, 2], 'Вторая попытка после паузы');
      await clock.tick(7);
      assert.equal(calls, [1, 2, 3], 'Третья попытка');
      assert.equal(result.status, 'fulfilled', 'Синхронный успех');
      assert.equal(result.value, 9, 'Результат последней попытки');
    `,
  },
  {
    name: 'Backoff умножает задержку после каждого ожидания',
    input: 'attempts = 4, delay = 5, backoff = 2',
    expected: 'Попытки в моменты 0,5,15,35; паузы 5,10,20',
    script: `
      const start = clock.now(), times = [];
      const result = observe(subject(attempt => {
        times.push(clock.now() - start);
        return attempt < 4 ? Promise.reject(attempt) : Promise.resolve('done');
      }, { attempts: 4, delay: 5, backoff: 2 }));
      await flush();
      await clock.tick(4);
      assert.equal(times, [0], 'Первая пауза не умножена заранее');
      await clock.tick(1);
      assert.equal(times, [0, 5], 'Первая пауза 5');
      await clock.tick(9);
      assert.equal(times.length, 2, 'Вторая пауза не меньше 10');
      await clock.tick(1);
      assert.equal(times, [0, 5, 15], 'Вторая пауза 10');
      await clock.tick(19);
      assert.equal(times.length, 3, 'Третья пауза не меньше 20');
      await clock.tick(1);
      assert.equal(times, [0, 5, 15, 35], 'Третья пауза 20');
      assert.equal(result.status, 'fulfilled', 'Четвёртая попытка успешна');
      assert.equal(result.value, 'done', 'Не теряй результат');
      assert.equal(clock.pending(), 0, 'Без лишнего таймера');
    `,
  },
  {
    name: 'shouldRetry запрещает повтор без паузы',
    input: 'shouldRetry возвращает false для первой ошибки',
    expected: 'Текущая причина, один вызов fn, таймера нет',
    script: `
      const reason = { status: 401 }, seen = [];
      let calls = 0;
      const result = observe(subject(() => { calls++; return Promise.reject(reason); },
        { attempts: 4, delay: 30, shouldRetry: error => { seen.push(error); return false; } }));
      await flush();
      assert.equal(calls, 1, 'Фильтр остановил повторы');
      assert.equal(seen.length, 1, 'Фильтр получил ошибку');
      assert(seen[0] === reason, 'Фильтру передана исходная причина');
      assert.equal(result.status, 'rejected', 'Ошибка не проглочена');
      assert(result.reason === reason, 'Причина не заменена');
      assert.equal(clock.pending(), 0, 'Фильтр проверяется до паузы');
    `,
  },
  {
    name: 'Фильтр допускает первую ошибку, но останавливает вторую',
    input: '503 → 404; shouldRetry = error.status >= 500',
    expected: 'Два вызова, только одна пауза, причина 404',
    script: `
      const errors = [{ status: 503 }, { status: 404 }], seen = [];
      let calls = 0;
      const result = observe(subject(() => Promise.reject(errors[calls++]), {
        attempts: 5, delay: 12,
        shouldRetry: error => { seen.push(error.status); return error.status >= 500; }
      }));
      await flush();
      assert.equal(result.status, 'pending', 'Первую ошибку можно повторить');
      await clock.tick(12);
      assert.equal(calls, 2, 'Вторая ошибка остановила цикл');
      assert.equal(seen, [503, 404], 'Фильтр применяется к каждой нужной ошибке');
      assert.equal(result.status, 'rejected', 'Завершение без второй паузы');
      assert(result.reason === errors[1], 'Текущая причина 404');
      assert.equal(clock.pending(), 0, 'Не планируй третью попытку');
    `,
  },
  {
    name: 'Нулевая задержка остаётся таймерной паузой',
    input: 'attempts = 2, delay = 0',
    expected: 'Вторая попытка после tick(0), а не только flush()',
    script: `
      let calls = 0;
      const result = observe(subject(() => ++calls === 1 ? Promise.reject('x') : 'ok',
        { attempts: 2, delay: 0 }));
      await flush();
      assert.equal(calls, 1, 'Даже sleep(0) отдаёт управление таймерам');
      assert.equal(result.status, 'pending', 'Повтор ещё ждёт');
      await clock.tick(0);
      assert.equal(calls, 2, 'Вторая попытка после таймера');
      assert.equal(result.status, 'fulfilled', 'Нулевая пауза допустима');
      assert.equal(result.value, 'ok', 'Результат повторной попытки');
    `,
  },
  {
    name: 'Пауза отсчитывается после ошибки, а не запуска',
    input: 'Первый запрос длится 10 мс; delay = 8',
    expected: 'Следующая попытка через 18 мс от начала',
    script: `
      const source = deferred(), start = clock.now(), times = [];
      const result = observe(subject(attempt => {
        times.push(clock.now() - start);
        return attempt === 1 ? source.promise : Promise.resolve(2);
      }, { attempts: 2, delay: 8 }));
      await clock.tick(10);
      assert.equal(times, [0], 'Нельзя параллельно запускать попытки');
      source.reject('slow failure');
      await flush();
      await clock.tick(7);
      assert.equal(times, [0], 'Полная пауза после завершения fn');
      await clock.tick(1);
      assert.equal(times, [0, 18], 'Длительность запроса плюс пауза');
      assert.equal(result.status, 'fulfilled', 'Вторая попытка успешна');
    `,
  },
];
