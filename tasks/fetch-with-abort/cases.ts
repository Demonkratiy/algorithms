import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'URL, исходный signal и JSON',
    input: 'Успешный ответ; controller создаёт вызывающий код.',
    expected: 'Один fetch с точным URL и signal; возвращены данные JSON.',
    script: `
      const controller = new AbortController(), data = { items: [1, 2] };
      let calls = 0, jsonCalls = 0, receivedUrl, receivedSignal;
      useFetch((url, options) => {
        calls++; receivedUrl = url; receivedSignal = options && options.signal;
        return Promise.resolve({ ok: true, status: 200, async json() { jsonCalls++; return data; } });
      });
      const result = observe(subject("/api/data?q=a%20b", controller));
      await flush();
      assert.equal(calls, 1, "Fetch вызывается один раз");
      assert.equal(receivedUrl, "/api/data?q=a%20b", "Не меняй URL");
      assert(receivedSignal === controller.signal, "Передай именно controller.signal");
      assert.equal(result.status, "fulfilled", "Успешный ответ должен вернуть JSON");
      assert(result.value === data, "Верни данные, не объект response");
      assert.equal(jsonCalls, 1, "JSON читается один раз");
      assert.equal(controller.signal.aborted, false, "Функция не отменяет контроллер владельца");
    `,
  },
  {
    name: 'Асинхронное чтение тела',
    input: 'Response готов, json() ещё pending.',
    expected: 'Результат ждёт JSON, включая falsy-значение.',
    script: `
      const body = deferred();
      useFetch(() => Promise.resolve({ ok: true, status: 200, json() { return body.promise; } }));
      const result = observe(subject("/body", new AbortController()));
      await flush();
      assert.equal(result.status, "pending", "Ответ ещё не прочитан");
      body.resolve(null);
      await flush();
      assert.equal(result.status, "fulfilled", "Нужно дождаться JSON");
      assert.equal(result.value, null, "null — допустимые JSON-данные");
    `,
  },
  {
    name: 'HTTP-ошибки не читают JSON',
    input: 'response.ok === false: статусы 404, 503 и 418.',
    expected: 'Error("HTTP <status>"), json() не вызван.',
    script: `
      for (const status of [404, 503, 418]) {
        let jsonCalls = 0;
        useFetch(() => Promise.resolve({ ok: false, status, async json() { jsonCalls++; return { error: true }; } }));
        const result = observe(subject("/bad-status", new AbortController()));
        await flush();
        assert.equal(result.status, "rejected", "Fetch сам не отклоняет HTTP-ошибки");
        assert(result.reason instanceof Error, "HTTP-ошибка должна быть Error");
        assert.equal(result.reason.message, "HTTP " + status, "Точный формат HTTP-ошибки");
        assert.equal(jsonCalls, 0, "Не читай JSON у неуспешного ответа");
      }
    `,
  },
  {
    name: 'Отмена уже начатого fetch',
    input: 'Fetch pending; владелец вызывает controller.abort().',
    expected: 'Mock получает исходный signal; наружу передаётся тот же AbortError.',
    script: `
      const controller = new AbortController(), request = deferred();
      const error = new DOMException("Aborted by owner", "AbortError");
      let signal, calls = 0;
      useFetch((url, options) => {
        calls++; signal = options && options.signal;
        if (signal) {
          if (signal.aborted) request.reject(error);
          else signal.addEventListener("abort", () => request.reject(error), { once: true });
        }
        return request.promise;
      });
      const result = observe(subject("/pending", controller));
      await flush();
      assert.equal(calls, 1, "Fetch должен быть запущен");
      assert(signal === controller.signal, "Нужен исходный signal");
      assert.equal(result.status, "pending", "Запрос ещё ожидает");
      controller.abort();
      await flush();
      assert.equal(result.status, "rejected", "Нельзя превращать отмену в успешный undefined");
      assert(result.reason === error, "AbortError передаётся без подмены");
    `,
  },
  {
    name: 'Уже отменённый signal',
    input: 'controller.abort() до вызова функции.',
    expected: 'Fetch получает уже отменённый signal, AbortError передаётся наружу.',
    script: `
      const controller = new AbortController();
      controller.abort();
      const error = new DOMException("Already aborted", "AbortError");
      let calls = 0, signal;
      useFetch((url, options) => {
        calls++; signal = options && options.signal;
        return signal && signal.aborted
          ? Promise.reject(error)
          : Promise.resolve({ ok: true, status: 200, async json() { return "unexpected"; } });
      });
      const result = observe(subject("/already-aborted", controller));
      await flush();
      assert.equal(calls, 1, "По контракту нужно вызвать fetch");
      assert(signal === controller.signal, "Нельзя заменить отменённый контроллер новым");
      assert.equal(result.status, "rejected", "Отмена не является успехом");
      assert(result.reason === error, "Сохрани ошибку mock fetch");
    `,
  },
  {
    name: 'Сетевая ошибка',
    input: 'Fetch отклоняется TypeError.',
    expected: 'Исходная ошибка без подмены и повторных запросов.',
    script: `
      const error = new TypeError("Network unavailable");
      let calls = 0;
      useFetch(() => { calls++; return Promise.reject(error); });
      const result = observe(subject("/offline", new AbortController()));
      await flush();
      assert.equal(result.status, "rejected", "Нельзя проглатывать сетевую ошибку");
      assert(result.reason === error, "Сохрани исходную сетевую ошибку");
      assert.equal(calls, 1, "Повторный запрос не предусмотрен контрактом");
    `,
  },
  {
    name: 'Ошибка разбора JSON',
    input: 'HTTP успешен, json() позже отклоняется SyntaxError.',
    expected: 'Исходная JSON-ошибка передаётся наружу.',
    script: `
      const body = deferred(), error = new SyntaxError("Invalid JSON");
      useFetch(() => Promise.resolve({ ok: true, status: 200, json() { return body.promise; } }));
      const result = observe(subject("/invalid-json", new AbortController()));
      await flush();
      assert.equal(result.status, "pending", "Тело ещё ожидает");
      body.reject(error);
      await flush();
      assert.equal(result.status, "rejected", "Ошибка JSON не является успехом");
      assert(result.reason === error, "Сохрани JSON-ошибку без подмены");
    `,
  },
  {
    name: 'Синхронный throw из json',
    input: 'Успешный response, json() бросает ошибку сразу.',
    expected: 'Promise отклонён той же ошибкой.',
    script: `
      const error = new Error("Body already consumed");
      useFetch(() => Promise.resolve({ ok: true, status: 200, json() { throw error; } }));
      const result = observe(subject("/consumed", new AbortController()));
      await flush();
      assert.equal(result.status, "rejected", "Throw при чтении тела должен отклонить promise");
      assert(result.reason === error, "Сохрани исходную ошибку");
    `,
  },
  {
    name: 'Отмена при чтении тела',
    input: 'HTTP уже успешен; abort во время json().',
    expected: 'AbortError тела передаётся наружу, не успешный undefined.',
    script: `
      const controller = new AbortController(), body = deferred();
      const error = new DOMException("Body aborted", "AbortError");
      let reading = false;
      useFetch((url, options) => {
        const signal = options && options.signal;
        if (signal) signal.addEventListener("abort", () => body.reject(error), { once: true });
        return Promise.resolve({ ok: true, status: 200, json() { reading = true; return body.promise; } });
      });
      const result = observe(subject("/stream", controller));
      await flush();
      assert.equal(reading, true, "Чтение тела должно начаться");
      assert.equal(result.status, "pending", "Тело ещё не прочитано");
      controller.abort();
      await flush();
      assert.equal(result.status, "rejected", "Отмена тела не является успехом");
      assert(result.reason === error, "Сохрани AbortError тела");
    `,
  },
];
