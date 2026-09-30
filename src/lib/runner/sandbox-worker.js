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

  function unorderedKeys(values, comparison) {
    const normalized = []
    for (const value of values) {
      let key
      if (comparison === 'nested-unordered' || comparison === 'unordered-tuples') {
        if (!isArray(value)) return undefined
        const members = comparison === 'nested-unordered' ? unorderedKeys(value, 'unordered') : value.map(primitiveKey)
        if (!members) return undefined
        if (members.some(item => item === undefined)) return undefined
        key = stringify(members)
      } else {
        key = primitiveKey(value)
        if (key === undefined) return undefined
      }
      push(normalized, key)
    }
    return apply(arraySort, normalized, [])
  }

  function closestPoints(actual, args) {
    const [points, k] = args
    if (!isArray(actual) || actual.length !== k) return false
    const counts = new Map()
    const distance = point => point[0] * point[0] + point[1] * point[1]
    for (const point of points) {
      const key = stringify(point)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    const distances = []
    for (const point of actual) {
      if (!isArray(point) || point.length !== 2 || !point.every(value => typeof value === 'number' && finite(value))) return false
      const key = stringify(point)
      const remaining = counts.get(key) ?? 0
      if (!remaining) return false
      counts.set(key, remaining - 1)
      push(distances, distance(point))
    }
    const ordered = apply(arraySort, points.map(distance), [(a, b) => a - b])
    apply(arraySort, distances, [(a, b) => a - b])
    for (let i = 0; i < k; i++) if (distances[i] !== ordered[i]) return false
    return true
  }

  function matches(actual, expected, comparison, args) {
    if (comparison === 'exact') return equal(actual, expected)
    if (comparison === 'closest-points') return closestPoints(actual, args)
    if (!isArray(actual) || !isArray(expected) || actual.length !== expected.length) return false
    const left = unorderedKeys(actual, comparison)
    const right = unorderedKeys(expected, comparison)
    return left !== undefined && right !== undefined && equal(left, right)
  }

  function describeArgs(args) {
    return join(args.map(value => display(value)), ', ')
  }

  function classArguments(test, index, describe = false) {
    const args = describe ? test.instances[index].map(value => display(value)) : clone(test.instances[index])
    for (const factory of test.factories ?? []) {
      if (factory.instance !== index) continue
      const left = factory.direction === 'asc' ? 'a' : 'b'
      const right = factory.direction === 'asc' ? 'b' : 'a'
      if (describe) {
        const field = factory.kind === 'property' ? `[${stringify(factory.property)}]` : ''
        args[factory.argument] = `(a, b) => ${left}${field} - ${right}${field}`
      } else {
        const sign = factory.direction === 'asc' ? 1 : -1
        args[factory.argument] = factory.kind === 'number'
          ? (a, b) => sign * (a - b)
          : (a, b) => sign * (a[factory.property] - b[factory.property])
      }
    }
    return describe ? join(args, ', ') : args
  }

  function describeCall(call) {
    return call.property !== undefined ? `a${call.instance}.${call.property}`
      : `a${call.instance}.${call.method}(${describeArgs(call.args)})`
  }

  class ListNode {
    constructor(val = 0, next = null) {
      this.val = val
      this.next = next
    }
  }

  function buildLists(inputs) {
    const lists = inputs.map(input => {
      const nodes = input.values.map(value => new ListNode(value))
      for (let i = 0; i + 1 < nodes.length; i++) nodes[i].next = nodes[i + 1]
      if (nodes.length && input.cycleAt !== undefined && input.cycleAt >= 0) nodes[nodes.length - 1].next = nodes[input.cycleAt]
      return nodes
    })
    const all = lists.flat()
    return {
      lists, heads: lists.map(nodes => nodes[0] ?? null), pool: new Set(all),
      original: all.map(node => ({ node, val: node.val, next: node.next })),
    }
  }

  function describeNode(node, graph) {
    if (node === null) return 'null'
    for (let list = 0; list < graph.lists.length; list++) {
      const index = graph.lists[list].indexOf(node)
      if (index !== -1) return `узел lists[${list}][${index}] (val: ${display(node.val)})`
    }
    return node && typeof node === 'object'
      ? `новый/посторонний узел: ${format(node)}` : display(node)
  }

  function checkLinkedResult(actual, expected, graph) {
    if (expected.kind === 'value') return { actual: display(actual), passed: equal(actual, expected.value) }
    if (expected.kind === 'node') {
      const target = expected.node === null ? null : graph.lists[expected.node.list][expected.node.index]
      return { actual: describeNode(actual, graph), passed: actual === target }
    }
    const nodes = []
    const values = []
    const seen = new Set()
    let current = actual
    let feedback
    while (current !== null) {
      if (!current || typeof current !== 'object' || !('val' in current) || !('next' in current)) {
        feedback = 'Ожидался список из узлов { val, next }, заканчивающийся на null.'
        break
      }
      if (seen.has(current)) {
        feedback = 'В возвращённом списке обнаружен цикл.'
        break
      }
      if (nodes.length >= expected.values.length) {
        feedback = 'Возвращённый список длиннее ожидаемого.'
        break
      }
      seen.add(current)
      push(nodes, current)
      push(values, current.val)
      current = current.next
    }
    let passed = !feedback && equal(values, expected.values)
    if (expected.reuseNodes && nodes.some(node => !graph.pool.has(node))) {
      passed = false
      feedback = 'По условию нужно использовать исходные узлы, а не создавать их копии.'
    }
    if (expected.nodeOrder && (nodes.length !== expected.nodeOrder.length
      || expected.nodeOrder.some((ref, index) => nodes[index] !== graph.lists[ref.list][ref.index]))) {
      passed = false
      feedback = 'Значения недостаточно скопировать: проверь порядок ссылок на исходные узлы.'
    }
    return { actual: display(values), passed, ...(feedback ? { feedback } : {}) }
  }

  function expectedLinked(test) {
    if (test.expected.kind === 'value') return display(test.expected.value)
    if (test.expected.kind === 'list') return display(test.expected.values)
    const ref = test.expected.node
    return ref === null ? 'null' : `узел lists[${ref.list}][${ref.index}] (val: ${display(test.lists[ref.list].values[ref.index])})`
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
      const names = [...new Set([runner.entryPoint, ...(runner.kind === 'linked-list' ? runner.cases.map(test => test.entryPoint ?? runner.entryPoint) : [])])]
      const exported = join(names.map(name => `${stringify(name)}: typeof ${name} === "function" ? ${name} : undefined`), ', ')
      const entries = new FunctionConstructor('ListNode', `return (() => {\n${data.code}\n; return {${exported}};\n})()`)(ListNode)
      const Entry = entries?.[runner.entryPoint]
      if (runner.kind !== 'linked-list' && typeof Entry !== 'function') throw new TypeError(`Определи ${runner.kind === 'class' ? 'класс' : 'функцию'} ${runner.entryPoint} из стартового шаблона.`)
      for (const test of runner.cases) {
        const input = runner.kind === 'function'
          ? `${runner.entryPoint}(${describeArgs(test.args)})`
          : runner.kind === 'class'
            ? join(test.instances.map((_args, i) => `a${i} = ${runner.factoryMethod ? `${runner.entryPoint}.${runner.factoryMethod}` : `new ${runner.entryPoint}`}(${classArguments(test, i, true)})`), '; ')
              + '; ' + join(test.calls.map(describeCall), '; ')
            : `${test.entryPoint ?? runner.entryPoint}(${join([
              ...test.lists.map(list => `List(${display(list.values)}${list.cycleAt !== undefined && list.cycleAt >= 0 ? `, cycleAt: ${list.cycleAt}` : ''})`),
              ...(test.args ?? []).map(value => display(value)),
            ], ', ')})`
        currentCase = {
          name: test.name,
          input: slice(input, 0, 4000),
          expected: runner.kind === 'linked-list' ? expectedLinked(test)
            : display(runner.kind === 'function' ? test.expected : test.calls.map(call => call.ignoreReturn ? 'без проверки возврата' : call.expectedUndefined ? undefined : call.expected)),
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
          currentCase.passed = matches(actual, test.expected, runner.comparison, test.args)
          if (runner.comparison === 'closest-points') currentCase.feedback = 'Порядок точек не важен. При равных расстояниях принимается любой ближайший набор из исходных точек с учётом повторений; ожидаемый ответ — один из примеров.'
          if (runner.preserveArgs?.some(index => !equal(args[index], test.args[index]))) {
            currentCase.passed = false
            currentCase.feedback = 'Изменён входной аргумент, который по условию должен оставаться неизменным.'
          }
          if (runner.freshArray && (!isArray(returned) || args.some(arg => arg === returned))) {
            currentCase.passed = false
            currentCase.feedback = 'По условию нужно вернуть новый массив, а не ссылку на входной.'
          }
        } else if (runner.kind === 'class') {
          const constructionArgs = test.instances.map((_args, index) => classArguments(test, index))
          const instances = constructionArgs.map(args => runner.factoryMethod
            ? apply(Entry[runner.factoryMethod], Entry, args) : new Entry(...args))
          const actual = []
          let passed = true
          let mismatch
          for (let index = 0; index < test.calls.length; index++) {
            const call = test.calls[index]
            currentCase.feedback = slice(`Вызов ${index + 1}: ${describeCall(call)}`, 0, 4000)
            const value = call.property !== undefined ? instances[call.instance][call.property]
              : apply(instances[call.instance][call.method], instances[call.instance], clone(call.args))
            push(actual, call.ignoreReturn ? 'без проверки возврата' : value)
            if (!call.ignoreReturn && (call.expectedUndefined ? value !== undefined : !equal(value, call.expected))) {
              passed = false
              mismatch ??= slice(`Вызов ${index + 1}: ${slice(describeCall(call), 0, 1500)}. Ожидается: ${slice(display(call.expectedUndefined ? undefined : call.expected), 0, 1000)}. Получено: ${slice(display(value), 0, 1000)}.`, 0, 4000)
            }
          }
          currentCase.actual = display(actual)
          currentCase.passed = passed
          if (mismatch) currentCase.feedback = mismatch
          else if (test.calls.some(call => call.ignoreReturn)) currentCase.feedback = 'Для операций без ожидаемого значения возврат не проверяется. Их эффект проверяют последующие вызовы.'
          else delete currentCase.feedback
          if (runner.preserveArgs && constructionArgs.some((args, instance) =>
            runner.preserveArgs.some(index => !equal(args[index], test.instances[instance][index])))) {
            currentCase.passed = false
            currentCase.feedback = 'Исходные данные конструктора/фабрики изменены; по условию их нужно сохранить.'
          }
        } else {
          const name = test.entryPoint ?? runner.entryPoint
          const entry = entries?.[name]
          if (typeof entry !== 'function') throw new TypeError(`Определи функцию ${name} из стартового шаблона.`)
          const graph = buildLists(test.lists)
          const value = apply(entry, undefined, [...graph.heads, ...clone(test.args ?? [])])
          const checked = checkLinkedResult(value, test.expected, graph)
          currentCase.actual = checked.actual
          currentCase.passed = checked.passed
          if (checked.feedback) currentCase.feedback = checked.feedback
          if (runner.preserveInputs && graph.original.some(({ node, val, next }) =>
            node.val !== val || node.next !== next || ownKeys(node).length !== 2)) {
            currentCase.passed = false
            currentCase.feedback = 'В этой задаче исходные узлы и связи должны оставаться неизменными.'
          }
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
