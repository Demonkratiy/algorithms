import { expect, test, type Page } from '@playwright/test'
import type { RunResult } from '../src/lib/runner/types'
import { RUN_TIMEOUT_MS, SETUP_TIMEOUT_MS } from '../src/lib/runner/protocol'
import { getRangeSumCases } from '../tasks/range-sum-query/cases'

// Test fixture only. The app starter deliberately contains no reference implementation.
const correct = `
class NumArray {
  constructor(nums) {
    this.prefix = [0];
    for (const value of nums) this.prefix.push(this.prefix[this.prefix.length - 1] + value);
  }
  sumRange(left, right) { return this.prefix[right + 1] - this.prefix[left]; }
}`

async function run(page: Page, code: string): Promise<RunResult> {
  return page.evaluate(async (code) => {
    const runner = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href)
    return runner.runTask('range-sum-query', code)
  }, code)
}

test.beforeEach(async ({ page }) => {
  await page.goto('./')
})

test.afterEach(async ({ page }) => {
  await expect(page.locator('iframe[data-runner]')).toHaveCount(0)
})

test('the only run mode always executes all six scenarios', async ({ page }) => {
  const checks = await run(page, correct)
  expect(checks.status).toBe('passed')
  expect(checks.cases).toHaveLength(6)
  expect(checks.cases.every((item) => item.passed)).toBe(true)
  expect(checks.durationMs).toBeGreaterThanOrEqual(0)
})

test('maximal-domain checks accept 32-bit sums and keep results compact', async ({ page }) => {
  const cases = getRangeSumCases()
  for (const item of cases) {
    expect(item.instances.every((nums) => nums.length >= 1 && nums.length <= 10_000
      && nums.every((value) => Number.isInteger(value) && Math.abs(value) <= 100_000))).toBe(true)
    for (const call of item.calls) {
      const nums = item.instances[call.instance]
      expect(call.left).toBeGreaterThanOrEqual(0)
      expect(call.right).toBeGreaterThanOrEqual(call.left)
      expect(call.right).toBeLessThan(nums.length)
      expect(nums.slice(call.left, call.right + 1).reduce((sum, value) => sum + value, 0)).toBe(call.expected)
    }
  }
  expect(cases.at(-1)?.instances[0]).toHaveLength(10_000)
  const bitwise = correct.replace(
    'return this.prefix[right + 1] - this.prefix[left];',
    'return (this.prefix[right + 1] - this.prefix[left]) | 0;',
  )
  const result = await run(page, bitwise)
  expect(result.status).toBe('passed')
  expect(result.cases).toHaveLength(6)
  const maximal = result.cases.at(-1)!
  expect(maximal.input).toContain('length: 10000')
  expect(maximal.input.length).toBeLessThan(500)
  expect(maximal.expected).toBe('[1000000000, 100000, 100000, 999800000]')
  expect(maximal.actual).toBe(maximal.expected)
  expect(result.cases.every((item) => [item.input, item.expected, item.actual].every((text) => text.length <= 4000))).toBe(true)
  expect(Number.isFinite(result.durationMs)).toBe(true)
  expect(result.durationMs).toBeGreaterThanOrEqual(0)
  expect(result.durationMs).toBeLessThan(SETUP_TIMEOUT_MS + RUN_TIMEOUT_MS + 1000)
})

test('execution works offline after the app modules have loaded', async ({ page, context }) => {
  await page.evaluate(async () => {
    await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href)
  })
  await context.setOffline(true)
  try {
    expect((await run(page, correct)).status).toBe('passed')
  } finally {
    await context.setOffline(false)
  }
})

test('undefined and incomplete starter are failures, never passes', async ({ page }) => {
  const result = await run(page, 'class NumArray { constructor(nums) {} sumRange() {} }')
  expect(result.status).toBe('failed')
  expect(result.cases[0].actual).toContain('undefined')
  expect(result.cases.every((item) => !item.passed)).toBe(true)
})

test('a solution that only matches examples fails the full check', async ({ page }) => {
  const overfit = `class NumArray {
    constructor(nums) { this.nums = nums; }
    sumRange(l, r) {
      if (this.nums.length === 1) return 7;
      if (l === 0 && r === 2) return 1;
      if (l === 2 && r === 5) return -1;
      return -3;
    }
  }`
  const result = await run(page, overfit)
  expect(result.cases.slice(0, 2).every(item => item.passed)).toBe(true)
  expect(result.status).toBe('failed')
  expect(result.cases).toHaveLength(6)
})

test('syntax and runtime errors preserve original names and messages', async ({ page }) => {
  const syntax = await run(page, 'class NumArray {')
  expect(syntax.status).toBe('error')
  expect(syntax.error?.name).toBe('SyntaxError')
  expect(syntax.error?.message).toBeTruthy()
  const runtime = await run(page, 'throw new RangeError("учебная ошибка");')
  expect(runtime.status).toBe('error')
  expect(runtime.error).toMatchObject({ name: 'RangeError', message: 'учебная ошибка' })
  expect((await run(page, 'throw undefined;')).status).toBe('error')
})

test('infinite loop times out without blocking the UI and can restart', async ({ page }) => {
  const result = await run(page, 'while (true) {}')
  expect(result.status).toBe('timeout')
  expect(result.error?.name).toBe('TimeoutError')
  expect(await page.evaluate(() => 2 + 2)).toBe(4)
  expect((await run(page, correct)).status).toBe('passed')
})

test('logs have count, per-entry, total limits; getters are not invoked', async ({ page }) => {
  const result = await run(page, `
    console.log({ get boom() { throw new Error('getter executed'); } });
    const circular = {}; circular.self = circular; console.log(circular);
    console.log(new Proxy({}, { ownKeys() { throw new Error('proxy trap'); } }));
    for (let i = 0; i < 10000; i++) console.log('x'.repeat(10000));
    ${correct}
  `)
  expect(result.status).toBe('passed')
  expect(result.logs[0]).toContain('[Getter/Setter]')
  expect(result.logs[1]).toContain('[Circular]')
  expect(result.logs[2]).toContain('[Uninspectable]')
  expect(result.logs.length).toBeLessThanOrEqual(100)
  expect(result.logs.every((line) => line.length <= 1000)).toBe(true)
  expect(result.logs.join('').length).toBeLessThanOrEqual(20_000)
  expect(result.logsTruncated).toBe(true)
  const emptyLogs = await run(page, 'for (let i = 0; i < 10000; i++) console.log("");' + correct)
  expect(emptyLogs.status).toBe('passed')
  expect(emptyLogs.logs).toHaveLength(100)
})

test('infinite log flood and pathological formatting are terminated', async ({ page }) => {
  expect((await run(page, 'while (true) console.log("flood");')).status).toBe('timeout')
  expect((await run(page, 'console.log(new Proxy({}, { ownKeys() { while (true) {} } }));')).status).toBe('timeout')
})

test('cancellation cleans up and immediate restart works', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href)
    const controller = new AbortController()
    const pending = runTask('range-sum-query', 'while (true) {}', controller.signal)
    setTimeout(() => controller.abort(), 100)
    return pending
  })
  expect(result.status).toBe('cancelled')
  expect((await run(page, correct)).status).toBe('passed')
  const alreadyCancelled = await page.evaluate(async () => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href)
    const controller = new AbortController()
    controller.abort()
    return runTask('range-sum-query', 'while (true) {}', controller.signal)
  })
  expect(alreadyCancelled.status).toBe('cancelled')
})

test('rejects oversized UTF-8 code before creating an iframe', async ({ page }) => {
  const result = await run(page, '// ' + 'я'.repeat(52_000))
  expect(result.status).toBe('error')
  expect(result.error?.name).toBe('CodeSizeError')
})

test('sandbox has opaque origin, no parent storage, and no network access', async ({ page }) => {
  let networkRequests = 0
  await page.route('https://runner-network.invalid/**', async (route) => {
    networkRequests++
    await route.abort()
  })
  await page.evaluate(() => localStorage.setItem('runner-test-sentinel', 'private'))
  const result = await run(page, `
    if (typeof document !== 'undefined' || typeof localStorage !== 'undefined'
      || typeof parent !== 'undefined') throw new Error('Unexpected browser access');
    if (typeof Worker !== 'undefined' || typeof SharedWorker !== 'undefined')
      throw new Error('Nested workers must be disabled');
    fetch('https://runner-network.invalid/probe').catch(() => {});
    ${correct}
  `)
  expect(result.status).toBe('passed')
  expect(networkRequests).toBe(0)
  expect(await page.evaluate(() => localStorage.getItem('runner-test-sentinel'))).toBe('private')
  await page.evaluate(() => localStorage.removeItem('runner-test-sentinel'))
})

test('ignores forged messages from wrong source or non-opaque origin', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href)
    const pending = runTask('range-sum-query', 'while (true) {}')
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-runner]')!
    const token = JSON.parse(iframe.srcdoc.match(/const CONFIG = (.*);\n/)![1]).token
    const data = {
      type: 'result', token,
      result: { status: 'error', cases: [], logs: [], logsTruncated: false, error: { name: 'Spoof', message: 'spoof' }, durationMs: 0 },
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
    window.dispatchEvent(new MessageEvent('message', { data, origin: 'null', source: window }))
    window.dispatchEvent(new MessageEvent('message', { data, origin: location.origin, source: iframe.contentWindow }))
    return pending
  })
  expect(result.status).toBe('timeout')
})

test('missing bootstrap reports setup error, not a pass', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href)
    const original = document.body.append
    document.body.append = function (...nodes: (Node | string)[]) {
      for (const node of nodes) {
        if (node instanceof HTMLIFrameElement && node.dataset.runner) node.srcdoc = '<!doctype html>'
      }
      original.apply(this, nodes)
    }
    try {
      return await runTask('range-sum-query', 'class NumArray {}')
    } finally {
      document.body.append = original
    }
  })
  expect(result.status).toBe('error')
  expect(result.error?.name).toBe('RunnerSetupError')
})

test('message validator rejects incomplete and contradictory successes', async ({ page }) => {
  const values = await page.evaluate(async () => {
    const { isRunResult } = await import(/* @vite-ignore */ new URL('src/lib/runner/protocol.ts', document.baseURI).href)
    const item = { name: 'case', input: 'input', expected: '1', actual: '1', passed: true, logs: [] }
    const base = { status: 'passed', cases: [item], logs: [], logsTruncated: false, durationMs: 1 }
    return [
      isRunResult(base, 1),
      isRunResult({ ...base, cases: [] }, 1),
      isRunResult({ ...base, status: 'failed' }, 1),
      isRunResult({ ...base, cases: [{ ...item, passed: false }] }, 1),
      isRunResult({ ...base, logs: ['x'.repeat(1001)] }, 1),
      isRunResult({ ...base, durationMs: NaN }, 1),
      isRunResult({ ...base, status: 'error' }, 1),
      isRunResult({ ...base, cases: [{ ...item, logs: ['x'.repeat(1001)] }] }, 1),
      isRunResult({ ...base, logs: Array(60).fill('a'), cases: [{ ...item, logs: Array(60).fill('b') }] }, 1),
      isRunResult({ ...base, logs: Array(15).fill('x'.repeat(1000)), cases: [{ ...item, logs: Array(15).fill('x'.repeat(1000)) }] }, 1),
      isRunResult({ ...base, cases: [{ ...item, error: { name: 'Error', message: 'inconsistent' } }] }, 1),
    ]
  })
  expect(values).toEqual([true, false, false, false, false, false, false, false, false, false, false])
})

test('malformed worker success cannot become a passing run', async ({ page }) => {
  const result = await run(page, `
    self.postMessage({ type: 'result', result: { status: 'passed', cases: [], logs: [], logsTruncated: false, durationMs: 0 } });
    while (true) {}
  `)
  expect(result.status).toBe('error')
  expect(result.error?.name).toBe('RunnerProtocolError')
})

test('constructor and method logs belong to their test, initialization logs are separate', async ({ page }) => {
  const logging = "console.log('bootstrap');" + correct
    .replace('constructor(nums) {', "constructor(nums) { console.log('constructor', nums.length);")
    .replace('sumRange(left, right) {', "sumRange(left, right) { console.log('range', left, right);")
  const result = await run(page, logging)
  expect(result.status).toBe('passed')
  expect(result.logs).toEqual(['bootstrap'])
  expect(result.logsTruncated).toBe(false)
  const cases = getRangeSumCases()
  for (let i = 0; i < cases.length; i++) {
    expect(result.cases[i].logs).toEqual([
      ...cases[i].instances.map(nums => `constructor ${nums.length}`),
      ...cases[i].calls.map(call => `range ${call.left} ${call.right}`),
    ])
  }
  const next = await run(page, correct)
  expect(next.logs).toEqual([])
  expect(next.cases.every(item => item.logs.length === 0)).toBe(true)
})

test('a failing test retains its own logs and error', async ({ page }) => {
  const result = await run(page, `class NumArray {
    constructor(nums) { console.log('created', nums.length); }
    sumRange() { console.log('before error'); throw new Error('test failure'); }
  }`)
  expect(result.status).toBe('error')
  expect(result.logs).toEqual([])
  expect(result.cases).toHaveLength(1)
  expect(result.cases[0]).toMatchObject({
    name: 'Пример из условия', passed: false,
    logs: ['created 6', 'before error'],
    error: { name: 'Error', message: 'test failure' },
  })
})

test('log budget is shared across all cases, not multiplied by the number of tests', async ({ page }) => {
  const result = await run(page, correct.replace('constructor(nums) {', `constructor(nums) {
    for (let i = 0; i < 15; i++) console.log('x'.repeat(700));
  `))
  expect(result.status).toBe('passed')
  const combined = [...result.logs, ...result.cases.flatMap(item => item.logs)]
  expect(combined.length).toBeLessThanOrEqual(100)
  expect(combined.join('').length).toBeLessThanOrEqual(20_000)
  expect(result.cases[0].logs.length).toBeGreaterThan(0)
  expect(result.cases.at(-1)?.logs).toEqual([])
  expect(result.logsTruncated).toBe(true)
})
