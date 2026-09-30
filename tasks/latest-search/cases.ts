import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Кодирование query и успешный результат',
    input: 'query = "ре акт&x=1/?#"; успешные данные.',
    expected: 'Точный encoded URL, свежий signal, один render с исходными данными.',
    script: `
      const requests = [], rendered = [], errors = [], source = deferred();
      const data = { items: ["react"] };
      setDependency("loadData", (url, signal) => { requests.push({ url, signal }); return source.promise; });
      setDependency("render", value => rendered.push(value));
      setDependency("showError", error => errors.push(error));
      const result = observe(subject("ре акт&x=1/?#"));
      await flush();
      assert.equal(requests.length, 1, "Один вызов search — один запрос");
      assert.equal(requests[0].url, "/api/search?q=" + encodeURIComponent("ре акт&x=1/?#"), "Query нужно кодировать");
      assert(requests[0].signal instanceof AbortSignal, "Передай AbortSignal в loadData");
      assert.equal(requests[0].signal.aborted, false, "Первый signal не отменён");
      assert.equal(rendered, [], "Нельзя рисовать до получения данных");
      source.resolve(data);
      await flush();
      assert.equal(rendered.length, 1, "Последний успех отображается один раз");
      assert(rendered[0] === data, "Передай исходные данные в render");
      assert.equal(errors, [], "Успех не вызывает showError");
      assert.equal(result.status, "fulfilled", "Search должен обработать завершение");
    `,
  },
  {
    name: 'Предыдущий signal отменяется; контроллеры свежие',
    input: 'Три вызова подряд, loadData соблюдает отмену.',
    expected: 'Первые два signal отменены, третий свежий; AbortError скрыты.',
    script: `
      const requests = [], rendered = [], errors = [], results = [];
      setDependency("loadData", (url, signal) => {
        const request = deferred();
        requests.push({ url, signal, request });
        if (signal) signal.addEventListener("abort", () => request.reject(new DOMException("Aborted", "AbortError")), { once: true });
        return request.promise;
      });
      setDependency("render", value => rendered.push(value));
      setDependency("showError", error => errors.push(error));
      for (const query of ["re", "rea", "react"]) { results.push(observe(subject(query))); await flush(); }
      assert.equal(requests.length, 3, "Нельзя заменить контракт debounce");
      for (const item of requests) assert(item.signal instanceof AbortSignal, "Каждый запрос получает signal");
      assert.equal(requests.map(item => item.signal.aborted), [true, true, false], "Новый запрос отменяет только предыдущие");
      assert(new Set(requests.map(item => item.signal)).size === 3, "Для нового запроса нужен свежий контроллер");
      requests[2].request.resolve(["latest"]);
      await flush();
      assert.equal(rendered, [["latest"]], "Отображается только последний запрос");
      assert.equal(errors, [], "AbortError не отображается");
      assert(results.every(result => result.status === "fulfilled"), "Поиски должны завершаться без отклонений");
    `,
  },
  {
    name: 'Старый успех приходит после нового',
    input: 'loadData игнорирует signal; новый успех раньше старого.',
    expected: 'Старый результат не перезаписывает UI.',
    script: `
      const requests = [], rendered = [], errors = [];
      setDependency("loadData", () => { const request = deferred(); requests.push(request); return request.promise; });
      setDependency("render", value => rendered.push(value));
      setDependency("showError", error => errors.push(error));
      const first = observe(subject("old")), second = observe(subject("new"));
      await flush();
      assert.equal(requests.length, 2, "Должны начаться оба запроса");
      requests[1].resolve("new data");
      await flush();
      assert.equal(rendered, ["new data"], "Новый ответ должен отобразиться");
      requests[0].resolve("old data");
      await flush();
      assert.equal(rendered, ["new data"], "Одного abort недостаточно при игнорировании signal");
      assert.equal(errors, [], "Успехи не вызывают showError");
      assert(first.status === "fulfilled" && second.status === "fulfilled", "Успешные поиски должны завершиться");
    `,
  },
  {
    name: 'Старый успех до завершения нового',
    input: 'Новый запрос уже начат, но ещё pending; старый успешен.',
    expected: 'UI не меняется до результата нового запроса.',
    script: `
      const requests = [], rendered = [], errors = [];
      setDependency("loadData", () => { const request = deferred(); requests.push(request); return request.promise; });
      setDependency("render", value => rendered.push(value));
      setDependency("showError", error => errors.push(error));
      const first = observe(subject("first")), second = observe(subject("second"));
      await flush();
      assert.equal(requests.length, 2, "Должны начаться оба запроса");
      requests[0].resolve("stale");
      await flush();
      assert.equal(rendered, [], "Старый ответ уже устарел, даже если новый ещё pending");
      requests[1].resolve(0);
      await flush();
      assert.equal(rendered, [0], "Falsy-данные последнего запроса должны отобразиться");
      assert.equal(errors, [], "Не должно быть ошибок UI");
      assert(first.status === "fulfilled" && second.status === "fulfilled", "Оба поиска должны завершиться без отклонений");
    `,
  },
  {
    name: 'Старые ошибки игнорируются',
    input: 'Три запроса; старые ошибки до и после последнего успеха.',
    expected: 'ShowError не вызывается для устаревших ошибок.',
    script: `
      const requests = [], rendered = [], errors = [];
      setDependency("loadData", () => { const request = deferred(); requests.push(request); return request.promise; });
      setDependency("render", value => rendered.push(value));
      setDependency("showError", error => errors.push(error));
      const results = [observe(subject("a")), observe(subject("b")), observe(subject("c"))];
      await flush();
      assert.equal(requests.length, 3, "Все вызовы должны начать запросы");
      requests[0].reject(new Error("stale before"));
      await flush();
      assert.equal(errors, [], "Устаревшая ошибка не показывается во время нового запроса");
      requests[2].resolve("current");
      await flush();
      requests[1].reject(new Error("stale after"));
      await flush();
      assert.equal(rendered, ["current"], "Последний результат сохраняется");
      assert.equal(errors, [], "Устаревшая ошибка не показывается после нового результата");
      assert(results.every(result => result.status === "fulfilled"), "Search должен обработать устаревшие ошибки");
    `,
  },
  {
    name: 'Ошибка актуального запроса',
    input: 'Старый успех после ошибки последнего запроса.',
    expected: 'Один showError с исходной ошибкой, ни одного render.',
    script: `
      const requests = [], rendered = [], errors = [], error = new Error("current failure");
      setDependency("loadData", () => { const request = deferred(); requests.push(request); return request.promise; });
      setDependency("render", value => rendered.push(value));
      setDependency("showError", reason => errors.push(reason));
      const old = observe(subject("old")), current = observe(subject("current"));
      await flush();
      assert.equal(requests.length, 2, "Оба запроса должны начаться");
      requests[1].reject(error);
      await flush();
      assert.equal(errors.length, 1, "Актуальная обычная ошибка должна отображаться");
      assert(errors[0] === error, "Передай исходную ошибку в showError");
      requests[0].resolve("stale");
      await flush();
      assert.equal(rendered, [], "Устаревший успех не должен скрыть актуальную ошибку");
      assert.equal(errors.length, 1, "Не дублируй ошибку");
      assert(current.status === "fulfilled" && old.status === "fulfilled", "Ошибки обрабатываются внутри search");
    `,
  },
  {
    name: 'AbortError актуального запроса скрыт',
    input: 'Последний loadData отклоняется AbortError.',
    expected: 'Ни render, ни showError; ошибка не выходит наружу.',
    script: `
      const rendered = [], errors = [];
      setDependency("loadData", () => Promise.reject(new DOMException("Aborted", "AbortError")));
      setDependency("render", value => rendered.push(value));
      setDependency("showError", error => errors.push(error));
      const result = observe(subject("cancelled"));
      await flush();
      assert.equal(rendered, [], "Отмена не является успешными данными");
      assert.equal(errors, [], "AbortError не отображается, даже если запрос актуален");
      assert.equal(result.status, "fulfilled", "AbortError должен быть обработан");
    `,
  },
  {
    name: 'Повтор одинакового query — новый запрос',
    input: 'Два одинаковых query, ответы в обратном порядке.',
    expected: 'Идентичный query не делает старый запрос актуальным.',
    script: `
      const requests = [], rendered = [], errors = [];
      setDependency("loadData", (url, signal) => {
        const request = deferred(); requests.push({ url, signal, request }); return request.promise;
      });
      setDependency("render", value => rendered.push(value));
      setDependency("showError", error => errors.push(error));
      const first = observe(subject("")), second = observe(subject(""));
      await flush();
      assert.equal(requests.length, 2, "Пустой и повторный query разрешены");
      assert.equal(requests.map(item => item.url), ["/api/search?q=", "/api/search?q="], "Пустой query кодируется в пустую строку");
      assert(requests[0].signal !== requests[1].signal, "Повторный query требует нового контроллера");
      requests[1].request.resolve("fresh");
      await flush();
      requests[0].request.resolve("cached old");
      await flush();
      assert.equal(rendered, ["fresh"], "Актуальность нельзя определять только строкой query");
      assert.equal(errors, [], "Успехи не вызывают showError");
      assert(first.status === "fulfilled" && second.status === "fulfilled", "Повторные поиски должны завершиться");
    `,
  },
];
