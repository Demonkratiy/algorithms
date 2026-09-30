// Trusted TEST ONLY sources. Never import these implementations into the app or registry.
export const promiseCoreSolutions: Record<string, string> = {
  'sleep-retry-timeout': `function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }`,
  'with-timeout': `function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error(\`Timeout after \${ms}ms\`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }`,
  retry: `async function retry(fn, { attempts = 3, delay = 300, backoff = 1, shouldRetry = () => true } = {}) {
    let lastError, currentDelay = delay;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await fn(attempt);
      } catch (error) {
        lastError = error;
        if (attempt === attempts || !shouldRetry(error)) break;
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoff;
      }
    }
    throw lastError;
  }`,
  'promise-pool': `async function promisePool(tasks, limit) {
    const results = new Array(tasks.length);
    let index = 0;
    async function worker() {
      while (index < tasks.length) {
        const current = index++;
        results[current] = await tasks[current]();
      }
    }
    const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
    await Promise.all(workers);
    return results;
  }`,
  'promise-all': `function myPromiseAll(promises) {
    return new Promise((resolve, reject) => {
      const results = new Array(promises.length);
      let completed = 0;
      if (!promises.length) { resolve(results); return; }
      promises.forEach((item, index) => {
        Promise.resolve(item).then(value => {
          results[index] = value;
          if (++completed === promises.length) resolve(results);
        }, reject);
      });
    });
  }`,
  'promise-all-settled': `function myAllSettled(promises) {
    return new Promise(resolve => {
      const results = new Array(promises.length);
      let completed = 0;
      if (!promises.length) { resolve(results); return; }
      const save = (index, result) => {
        results[index] = result;
        if (++completed === promises.length) resolve(results);
      };
      promises.forEach((item, index) => {
        Promise.resolve(item).then(
          value => save(index, { status: 'fulfilled', value }),
          reason => save(index, { status: 'rejected', reason })
        );
      });
    });
  }`,
};

// Bounded wrong implementations: pending promises are observed, never directly awaited by scenarios.
// No CPU-infinite loops, busy waits, network or real-time sleeps.
export const promiseCoreWrongSolutions: Record<string, string[]> = {
  'sleep-retry-timeout': [
    `function sleep(ms) { return Promise.resolve(); }`,
    `function sleep(ms) { return new Promise(resolve => setTimeout(() => resolve(ms), ms)); }`,
    `function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms * 2)); }`,
    `function sleep(ms) { return new Promise(() => {}); }`,
    `function sleep(ms) { setTimeout(() => {}, ms); }`,
    `let timer;
     function sleep(ms) {
       clearTimeout(timer);
       return new Promise(resolve => { timer = setTimeout(resolve, ms); });
     }`,
  ],
  'with-timeout': [
    promiseCoreSolutions['with-timeout'].replace('.finally(() => clearTimeout(timer))', ''),
    promiseCoreSolutions['with-timeout'].replace(
      '.finally(() => clearTimeout(timer))',
      '.then(value => { clearTimeout(timer); return value; })',
    ),
    promiseCoreSolutions['with-timeout'].replace(
      '.finally(() => clearTimeout(timer))',
      '.catch(error => { clearTimeout(timer); throw error; })',
    ),
    promiseCoreSolutions['with-timeout'].replace('Timeout after', 'Timed out after'),
    `function withTimeout(promise, ms) { return promise; }`,
    promiseCoreSolutions['with-timeout'].replace(
      '.finally(() => clearTimeout(timer))',
      '.finally(() => clearTimeout(timer)).catch(() => undefined)',
    ),
    promiseCoreSolutions['with-timeout'].replace(
      'Promise.race([promise, timeout])',
      'Promise.race([promise.catch(error => { throw new Error(String(error)); }), timeout])',
    ),
  ],
  retry: [
    promiseCoreSolutions.retry.replace('attempt <= attempts', 'attempt <= attempts + 1')
      .replace('attempt === attempts', 'attempt === attempts + 1'),
    promiseCoreSolutions.retry.replace('fn(attempt)', 'fn()'),
    promiseCoreSolutions.retry.replace('currentDelay *= backoff', 'currentDelay *= 1'),
    promiseCoreSolutions.retry.replace(' || !shouldRetry(error)', ''),
    promiseCoreSolutions.retry.replace(
      'await new Promise(resolve => setTimeout(resolve, currentDelay));',
      'await Promise.resolve();',
    ),
    promiseCoreSolutions.retry.replace('return await fn(attempt)', 'return fn(attempt)'),
    promiseCoreSolutions.retry.replace(
      'throw lastError;',
      'await new Promise(resolve => setTimeout(resolve, delay)); throw lastError;',
    ),
    promiseCoreSolutions.retry.replace('throw lastError;', 'throw new Error(String(lastError));'),
    promiseCoreSolutions.retry.replace('attempts = 3, delay = 300', 'attempts = 2, delay = 30'),
  ],
  'promise-pool': [
    `async function promisePool(tasks, limit) { return Promise.all(tasks.map(task => task())); }`,
    promiseCoreSolutions['promise-pool'].replace('Math.min(limit, tasks.length)', 'Math.min(1, tasks.length)'),
    promiseCoreSolutions['promise-pool'].replace('new Array(tasks.length)', '[]')
      .replace('results[current] = await tasks[current]();', 'results.push(await tasks[current]());'),
    promiseCoreSolutions['promise-pool'].replace('index < tasks.length', 'index < tasks.length - 1'),
    promiseCoreSolutions['promise-pool'].replace(
      'await Promise.all(workers);',
      'await Promise.all(workers).catch(error => { throw new Error(String(error)); });',
    ),
    `async function promisePool(tasks, limit) {
      const results = [];
      for (let i = 0; i < tasks.length; i += limit) {
        results.push(...await Promise.all(tasks.slice(i, i + limit).map(task => task())));
      }
      return results;
    }`,
    promiseCoreSolutions['promise-pool'].replace('await Promise.all(workers);', 'await Promise.allSettled(workers);'),
  ],
  'promise-all': [
    `function myPromiseAll(promises) { return Promise.all(promises); }`,
    promiseCoreSolutions['promise-all'].replace('if (!promises.length) { resolve(results); return; }', ''),
    promiseCoreSolutions['promise-all'].replace('new Array(promises.length)', '[]')
      .replace('results[index] = value;', 'results.push(value);'),
    promiseCoreSolutions['promise-all'].replace('new Array(promises.length)', '[]')
      .replace('++completed === promises.length', 'results.length === promises.length'),
    `async function myPromiseAll(promises) {
      promises.forEach(item => { Promise.resolve(item).catch(() => {}); });
      const results = [];
      for (const promise of promises) results.push(await promise);
      return results;
    }`,
    promiseCoreSolutions['promise-all'].replace('}, reject);', '}, reason => reject(new Error(String(reason))));'),
    promiseCoreSolutions['promise-all'].replace('}, reject);', '}, reason => resolve(reason));'),
  ],
  'promise-all-settled': [
    `function myAllSettled(promises) { return Promise.allSettled(promises); }`,
    promiseCoreSolutions['promise-all-settled'].replace('if (!promises.length) { resolve(results); return; }', ''),
    promiseCoreSolutions['promise-all-settled'].replace('new Array(promises.length)', '[]')
      .replace('results[index] = result;', 'results.push(result);'),
    promiseCoreSolutions['promise-all-settled'].replace("status: 'fulfilled'", "status: 'resolved'"),
    promiseCoreSolutions['promise-all-settled'].replace("status: 'rejected', reason", "status: 'rejected', value: reason"),
    promiseCoreSolutions['promise-all-settled'].replace(
      'new Promise(resolve =>', 'new Promise((resolve, reject) =>',
    ).replace("reason => save(index, { status: 'rejected', reason })", 'reason => reject(reason)'),
    promiseCoreSolutions['promise-all-settled'].replace(
      "reason => save(index, { status: 'rejected', reason })",
      "reason => save(index, { status: 'rejected', reason: String(reason) })",
    ),
    promiseCoreSolutions['promise-all-settled'].replace('new Array(promises.length)', '[]')
      .replace('++completed === promises.length', 'results.length === promises.length'),
    promiseCoreSolutions['promise-all-settled'].replace(
      "{ status: 'fulfilled', value }", "{ status: 'fulfilled', value, reason: undefined }",
    ),
  ],
};
