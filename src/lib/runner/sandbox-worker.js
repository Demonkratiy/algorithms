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
  const arraySort = Array.prototype.sort
  const keysOf = Object.keys
  const clone = structuredClone
  const finite = Number.isFinite
  const push = (array, item) => apply(arrayPush, array, [item])
  const join = (array, separator) => apply(arrayJoin, array, [separator])
  const logs = []
  let logChars = 0
  let logCount = 0
  let logsTruncated = false
  let currentCase

  function display(value, depth = 0) {
    if (typeof value === 'string') return stringify(slice(value, 0, 1000)) + (value.length > 1000 ? '…' : '')
    if (!isArray(value)) return format(value)
    if (depth > 3) return '[Array]'
    const parts = []
    for (let i = 0; i < Math.min(value.length, 20); i++) push(parts, display(value[i], depth + 1))
    return slice(`[${join(parts, ', ')}${value.length > 20 ? `, …] /* length: ${value.length} */` : ']'}`, 0, 4000)
  }

  function equal(actual, expected) {
    if (actual === expected) return true
    if (actual === null || expected === null || typeof actual !== 'object' || typeof expected !== 'object') return false
    if (isArray(actual) !== isArray(expected)) return false
    if (isArray(expected)) {
      if (actual.length !== expected.length) return false
      for (let i = 0; i < expected.length; i++) if (!equal(actual[i], expected[i])) return false
      return true
    }
    const keys = keysOf(expected)
    if (keysOf(actual).length !== keys.length) return false
    for (const key of keys) if (!descriptor(actual, key) || !equal(actual[key], expected[key])) return false
    return true
  }

  function primitiveKey(value) {
    if (value === null) return 'null'
    if (typeof value === 'number' && finite(value)) return `number:${value}`
    if (typeof value === 'string' || typeof value === 'boolean') return `${typeof value}:${string(value)}`
    return undefined
  }

  function unorderedKeys(values, nested) {
    const normalized = []
    for (const value of values) {
      let key
      if (nested) {
        if (!isArray(value)) return undefined
        const members = unorderedKeys(value, false)
        if (!members) return undefined
        key = stringify(members)
      } else {
        key = primitiveKey(value)
        if (key === undefined) return undefined
      }
      push(normalized, key)
    }
    return apply(arraySort, normalized, [])
  }

  function matches(actual, expected, comparison) {
    if (comparison === 'exact') return equal(actual, expected)
    if (!isArray(actual) || !isArray(expected) || actual.length !== expected.length) return false
    const left = unorderedKeys(actual, comparison === 'nested-unordered')
    const right = unorderedKeys(expected, comparison === 'nested-unordered')
    return left !== undefined && right !== undefined && equal(left, right)
  }

  function describeArgs(args) {
    return join(args.map(value => display(value)), ', ')
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
      const runner = data.runner
      const Entry = new FunctionConstructor(`${data.code}\n; return typeof ${runner.entryPoint} === "function" ? ${runner.entryPoint} : undefined;\n`)()
      if (typeof Entry !== 'function') throw new TypeError(`Определи ${runner.kind === 'class' ? 'класс' : 'функцию'} ${runner.entryPoint} из стартового шаблона.`)
      for (const test of runner.cases) {
        const input = runner.kind === 'function'
          ? `${runner.entryPoint}(${describeArgs(test.args)})`
          : join(test.instances.map((args, i) => `a${i} = new ${runner.entryPoint}(${describeArgs(args)})`), '; ')
            + '; ' + join(test.calls.map(call => `a${call.instance}.${call.method}(${describeArgs(call.args)})`), '; ')
        currentCase = {
          name: test.name,
          input: slice(input, 0, 4000),
          expected: display(runner.kind === 'function' ? test.expected : test.calls.map(call => call.expected)),
          actual: 'Выполнение теста не завершено.',
          passed: false,
          logs: [],
        }
        push(results, currentCase)
        if (runner.kind === 'function') {
          const args = clone(test.args)
          const returned = apply(Entry, undefined, args)
          const actual = runner.output.kind === 'argument' ? args[runner.output.index] : returned
          currentCase.actual = display(actual)
          currentCase.passed = matches(actual, test.expected, runner.comparison)
          if (runner.preserveArgs?.some(index => !equal(args[index], test.args[index]))) {
            currentCase.passed = false
            currentCase.feedback = 'Изменён входной аргумент, который по условию должен оставаться неизменным.'
          }
          if (runner.freshArray && (!isArray(returned) || args.some(arg => arg === returned))) {
            currentCase.passed = false
            currentCase.feedback = 'По условию нужно вернуть новый массив, а не ссылку на входной.'
          }
        } else {
          const instances = test.instances.map(args => new Entry(...clone(args)))
          const actual = []
          let passed = true
          for (const call of test.calls) {
            const value = apply(instances[call.instance][call.method], instances[call.instance], clone(call.args))
            push(actual, value)
            if (!equal(value, call.expected)) passed = false
          }
          currentCase.actual = display(actual)
          currentCase.passed = passed
        }
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
