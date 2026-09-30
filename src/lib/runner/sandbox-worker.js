(() => {
  const post = self.postMessage.bind(self)
  const now = performance.now.bind(performance)
  const ownKeys = Reflect.ownKeys
  const descriptor = Object.getOwnPropertyDescriptor
  const isArray = Array.isArray
  const stringify = JSON.stringify
  const FunctionConstructor = Function
  const slice = Function.call.bind(String.prototype.slice)
  const string = String
  const apply = Reflect.apply
  const arrayPush = Array.prototype.push
  const arrayJoin = Array.prototype.join
  const arraySlice = Array.prototype.slice
  const push = (array, item) => apply(arrayPush, array, [item])
  const join = (array, separator) => apply(arrayJoin, array, [separator])
  const logs = []
  let logChars = 0
  let logCount = 0
  let logsTruncated = false
  let currentCase

  function describeInput(nums) {
    if (nums.length <= 20) return stringify(nums)
    const preview = stringify(apply(arraySlice, nums, [0, 10]))
    return `${slice(preview, 0, -1)}, …] /* length: ${nums.length} */`
  }

  function format(value, depth = 0, seen = new Set()) {
    if (typeof value === 'string') return slice(value, 0, 1000)
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'function') return '[Function]'
    if (typeof value !== 'object') return slice(string(value), 0, 1000)
    if (seen.has(value)) return '[Circular]'
    if (depth >= 2) return isArray(value) ? '[Array]' : '[Object]'
    seen.add(value)
    const parts = []
    const keys = ownKeys(value)
    const count = Math.min(keys.length, 10)
    for (let i = 0; i < count; i++) {
      const key = keys[i]
      if (isArray(value) && key === 'length') continue
      const property = descriptor(value, key)
      const text = property && 'value' in property
        ? format(property.value, depth + 1, seen) : '[Getter/Setter]'
      push(parts, `${slice(string(key), 0, 80)}: ${text}`)
    }
    if (keys.length > 10) push(parts, '…')
    return slice(`${isArray(value) ? '[' : '{'}${join(parts, ', ')}${isArray(value) ? ']' : '}'}`, 0, 1000)
  }

  function log(...args) {
    if (logCount >= 100 || logChars >= 20_000) {
      logsTruncated = true
      return
    }
    const parts = []
    for (let i = 0; i < Math.min(args.length, 10); i++) {
      if (typeof args[i] === 'string' && args[i].length > 1000) logsTruncated = true
      try {
        push(parts, format(args[i]))
      } catch {
        // A proxy can reject introspection; formatting must not turn a correct answer into an error.
        push(parts, '[Uninspectable]')
      }
    }
    const content = join(parts, ' ')
    const line = slice(content, 0, Math.min(1000, 20_000 - logChars))
    if (line.length < content.length || args.length > 10) logsTruncated = true
    logChars += line.length
    logCount++
    push(currentCase ? currentCase.logs : logs, line)
  }

  for (const method of ['log', 'info', 'warn', 'error', 'debug', 'table', 'trace', 'dir', 'dirxml', 'count', 'timeLog', 'timeEnd', 'group', 'groupCollapsed', 'assert']) {
    console[method] = log
  }
  for (const method of ['clear', 'countReset', 'time', 'groupEnd', 'profile', 'profileEnd', 'timeStamp']) {
    console[method] = () => {}
  }
  // No descendant workers: a cancelled run must not leave learner-created workers behind.
  Object.defineProperty(self, 'Worker', { value: undefined, configurable: false, writable: false })
  Object.defineProperty(self, 'SharedWorker', { value: undefined, configurable: false, writable: false })

  function describeError(error) {
    if (error && (typeof error === 'object' || typeof error === 'function')) {
      try {
        const message = descriptor(error, 'message')
        let name = descriptor(error, 'name')
        if (!name) name = descriptor(Object.getPrototypeOf(error), 'name')
        return {
          name: name && typeof name.value === 'string' ? slice(name.value, 0, 100) : 'Error',
          message: message && typeof message.value === 'string'
            ? slice(message.value, 0, 2000) : slice(format(error), 0, 2000),
        }
      } catch {
        return { name: 'Error', message: 'Выброшен объект, который невозможно прочитать.' }
      }
    }
    return { name: 'Error', message: slice(format(error), 0, 2000) }
  }

  self.onmessage = ({ data }) => {
    self.onmessage = null
    const startedAt = now()
    const results = []
    try {
      const NumArray = new FunctionConstructor(`${data.code}\n; return typeof NumArray === "function" ? NumArray : undefined;\n`)()
      if (typeof NumArray !== 'function') throw new TypeError('Определи класс NumArray с constructor(nums) и sumRange(left, right).')
      for (const test of data.cases) {
        currentCase = {
          name: test.name,
          input: slice(join(test.instances.map((nums, i) => `a${i} = new NumArray(${describeInput(nums)})`), '; ')
            + '; ' + join(test.calls.map((call) => `a${call.instance}.sumRange(${call.left}, ${call.right})`), '; '), 0, 4000),
          expected: `[${join(test.calls.map((call) => string(call.expected)), ', ')}]`,
          actual: 'Выполнение теста не завершено.',
          passed: false,
          logs: [],
        }
        push(results, currentCase)
        const instances = test.instances.map((nums) => new NumArray([...nums]))
        const actual = []
        let passed = true
        for (const call of test.calls) {
          const value = instances[call.instance].sumRange(call.left, call.right)
          push(actual, format(value))
          if (typeof value !== 'number' || value !== call.expected) passed = false
        }
        currentCase.actual = slice(`[${join(actual, ', ')}]`, 0, 4000)
        currentCase.passed = passed
        currentCase = undefined
      }
      post({ type: 'result', result: {
        status: results.every((test) => test.passed) ? 'passed' : 'failed',
        cases: results, logs, logsTruncated, durationMs: now() - startedAt,
      } })
    } catch (error) {
      const described = describeError(error)
      if (currentCase) currentCase.error = described
      post({ type: 'result', result: {
        status: 'error', cases: results, logs, logsTruncated, error: described, durationMs: now() - startedAt,
      } })
    }
  }
})()
