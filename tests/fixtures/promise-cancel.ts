// Trusted test-only source. Never import these fixtures into the task registry or UI.
export const promiseCancelSolutions: Record<string, string> = {
  'promise-race': `function myRace(promises) {
    return new Promise((resolve, reject) => {
      for (const item of promises) Promise.resolve(item).then(resolve, reject);
    });
  }`,
  'promise-any': `function myAny(promises) {
    return new Promise((resolve, reject) => {
      const errors = new Array(promises.length);
      let rejected = 0;
      if (promises.length === 0) {
        reject(new AggregateError([], "All promises were rejected"));
        return;
      }
      promises.forEach((item, index) => {
        Promise.resolve(item).then(resolve, error => {
          errors[index] = error;
          rejected++;
          if (rejected === promises.length) reject(new AggregateError(errors, "All promises were rejected"));
        });
      });
    });
  }`,
  cancellation: `function cancellable(promiseFactory) {
    let settled = false, rejectOuter;
    const promise = new Promise((resolve, reject) => {
      rejectOuter = reject;
      try {
        Promise.resolve(promiseFactory()).then(
          value => { if (!settled) { settled = true; resolve(value); } },
          error => { if (!settled) { settled = true; reject(error); } },
        );
      } catch (error) { settled = true; reject(error); }
    });
    return { promise, cancel() {
      if (settled) return;
      settled = true;
      const error = new Error("Cancelled");
      error.name = "CancelledError";
      rejectOuter(error);
    } };
  }`,
  'fetch-with-abort': `async function fetchWithAbort(url, controller) {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  }`,
  'latest-search': `const search = (() => {
    let controller = null, requestId = 0;
    return async function search(query) {
      if (controller) controller.abort();
      controller = new AbortController();
      const current = ++requestId;
      try {
        const results = await loadData("/api/search?q=" + encodeURIComponent(query), controller.signal);
        if (current !== requestId) return;
        render(results);
      } catch (error) {
        if (current !== requestId || error.name === "AbortError") return;
        showError(error);
      }
    };
  })();`,
};

export const promiseCancelWrongSolutions: Record<string, string[]> = {
  'promise-race': [
    `function myRace(promises) { return Promise.race(promises); }`,
    `function myRace(promises) { return Promise.all(promises).then(values => values[0]); }`,
    `function myRace(promises) { return Promise.any(promises); }`,
    promiseCancelSolutions['promise-race'].replace(
      'return new Promise((resolve, reject) => {',
      'if (promises.length === 0) return Promise.resolve([]); return new Promise((resolve, reject) => {',
    ),
    `function myRace(promises) {
      const plain = promises.find(item => item === null || typeof item !== "object");
      if (plain !== undefined) return Promise.resolve(plain);
      return new Promise((resolve, reject) => {
        for (const item of promises) Promise.resolve(item).then(resolve, reject);
      });
    }`,
    `function myRace(promises) {
      return new Promise((resolve, reject) => {
        for (const item of promises) item.then(resolve, reject);
      });
    }`,
  ],
  'promise-any': [
    `function myAny(promises) { return Promise.any(promises); }`,
    `function myAny(promises) { return Promise.race(promises); }`,
    `function myAny(promises) { return Promise.all(promises); }`,
    promiseCancelSolutions['promise-any']
      .replace('const errors = new Array(promises.length);', 'const errors = [];')
      .replace('errors[index] = error;', 'errors.push(error);'),
    promiseCancelSolutions['promise-any'].replace(
      'reject(new AggregateError([], "All promises were rejected"));',
      'resolve([]);',
    ),
    promiseCancelSolutions['promise-any'].replace(
      'reject(new AggregateError(errors, "All promises were rejected"))',
      'reject(new Error("All promises were rejected"))',
    ),
    promiseCancelSolutions['promise-any'].replace('Promise.resolve(item).then', 'item.then'),
  ],
  cancellation: [
    `function cancellable(factory) {
      let cancelled = false;
      const promise = Promise.resolve().then(factory).then(value => {
        if (cancelled) { const error = new Error("Cancelled"); error.name = "CancelledError"; throw error; }
        return value;
      });
      return { promise, cancel() { cancelled = true; } };
    }`,
    `function cancellable(factory) {
      return { promise: Promise.resolve().then(factory), cancel() {} };
    }`,
    promiseCancelSolutions.cancellation.replace('error.name = "CancelledError";', 'error.name = "AbortError";'),
    promiseCancelSolutions.cancellation.replace(
      'Promise.resolve(promiseFactory()).then(',
      'Promise.resolve(promiseFactory()).then(() => promiseFactory()).then(',
    ),
    promiseCancelSolutions.cancellation.replace('rejectOuter(error);', 'setTimeout(() => rejectOuter(error), 1);'),
    `function cancellable(factory) {
      const source = factory();
      let rejectOuter;
      const promise = new Promise((resolve, reject) => {
        rejectOuter = reject;
        Promise.resolve(source).then(resolve, reject);
      });
      return { promise, cancel() {
        const error = new Error("Cancelled"); error.name = "CancelledError"; rejectOuter(error);
      } };
    }`,
    promiseCancelSolutions.cancellation.replace(
      'error => { if (!settled) { settled = true; reject(error); } },',
      'error => { if (!settled) { settled = true; reject(new Error(String(error))); } },',
    ),
  ],
  'fetch-with-abort': [
    promiseCancelSolutions['fetch-with-abort'].replace('{ signal: controller.signal }', '{}'),
    promiseCancelSolutions['fetch-with-abort'].replace('controller.signal', 'new AbortController().signal'),
    promiseCancelSolutions['fetch-with-abort'].replace('if (!response.ok) throw new Error("HTTP " + response.status);', ''),
    promiseCancelSolutions['fetch-with-abort'].replace('return await response.json();', 'return response;'),
    promiseCancelSolutions['fetch-with-abort'].replace('"HTTP " + response.status', '"Request failed"'),
    `async function fetchWithAbort(url, controller) {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("HTTP " + response.status);
        return await response.json();
      } catch (error) { if (error.name !== "AbortError") throw error; }
    }`,
    `async function fetchWithAbort(url, controller) {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("HTTP " + response.status);
        return await response.json();
      } catch (error) { throw new Error(error.message); }
    }`,
  ],
  'latest-search': [
    promiseCancelSolutions['latest-search'].replace('if (current !== requestId) return;', ''),
    promiseCancelSolutions['latest-search'].replace(
      'if (current !== requestId || error.name === "AbortError") return;',
      'if (error.name === "AbortError") return;',
    ),
    promiseCancelSolutions['latest-search'].replace('if (controller) controller.abort();', ''),
    promiseCancelSolutions['latest-search'].replace('encodeURIComponent(query)', 'query'),
    promiseCancelSolutions['latest-search'].replace(
      'if (current !== requestId || error.name === "AbortError") return;',
      'if (current !== requestId) return;',
    ),
    promiseCancelSolutions['latest-search'].replace('controller = new AbortController();', 'controller = controller || new AbortController();'),
    promiseCancelSolutions['latest-search'].replace('showError(error);', 'throw error;'),
    `const search = (() => {
      let controller, latestQuery;
      return async function search(query) {
        if (controller) controller.abort();
        controller = new AbortController(); latestQuery = query;
        try {
          const data = await loadData("/api/search?q=" + encodeURIComponent(query), controller.signal);
          if (query === latestQuery) render(data);
        } catch (error) {
          if (query === latestQuery && error.name !== "AbortError") showError(error);
        }
      };
    })();`,
  ],
};
