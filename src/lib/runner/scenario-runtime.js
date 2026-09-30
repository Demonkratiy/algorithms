function createScenarioEnvironment() {
  const NativePromise = Promise
  const NativeDate = Date
  const NativeFunction = Function
  const NativeMessageChannel = MessageChannel
  const epoch = 1_700_000_000_000
  let time = 0, nextId = 1, assertions = 0, firstFailure
  const timers = new Map(), dependencies = new Map(), asynchronousErrors = []
  let fetchHandler
  const waiters = []
  const channel = new NativeMessageChannel()
  channel.port1.onmessage = () => waiters.shift()?.()
  const flush = () => new NativePromise(resolve => { waiters.push(resolve); channel.port2.postMessage(0) })

  class AssertionFailure extends Error {}
  function assert(condition, message = 'Условие проверки не выполнено.') {
    assertions++
    if (!condition) {
      firstFailure ??= new AssertionFailure(String(message).slice(0, 2000))
      throw firstFailure
    }
  }
  assert.equal = (actual, expected, message = 'Значения отличаются') =>
    assert(equal(actual, expected), `${message}. Ожидается: ${display(expected)}. Получено: ${display(actual)}.`)

  function schedule(callback, delay, args, interval) {
    if (typeof callback !== 'function') throw new TypeError('Таймер ожидает функцию.')
    if (timers.size >= 10_000) throw new RangeError('Превышен лимит активных таймеров.')
    const numeric = Number(delay)
    const wait = Number.isFinite(numeric) ? Math.max(0, Math.trunc(numeric)) : 0
    const id = nextId++
    timers.set(id, { id, callback, args, due: time + wait, interval: interval ? Math.max(1, wait) : null })
    return id
  }
  globalThis.setTimeout = (callback, delay = 0, ...args) => schedule(callback, delay, args, false)
  globalThis.setInterval = (callback, delay = 0, ...args) => schedule(callback, delay, args, true)
  globalThis.clearTimeout = globalThis.clearInterval = id => { timers.delete(Number(id)) }
  function VirtualDate(...args) {
    if (!new.target) return new NativeDate(epoch + time).toString()
    return args.length ? new NativeDate(...args) : new NativeDate(epoch + time)
  }
  Object.setPrototypeOf(VirtualDate, NativeDate)
  VirtualDate.prototype = NativeDate.prototype
  Object.defineProperty(VirtualDate, 'name', { value: 'Date' })
  Object.defineProperty(NativeDate.prototype, 'constructor', { configurable: true, writable: true, value: VirtualDate })
  VirtualDate.now = () => epoch + time
  globalThis.Date = VirtualDate
  Object.defineProperty(performance, 'now', { configurable: true, value: () => time })
  const clock = {
    now: () => epoch + time,
    pending: () => timers.size,
    async tick(ms) {
      if (!Number.isFinite(ms) || ms < 0) throw new TypeError('clock.tick ожидает неотрицательное конечное число.')
      const end = time + ms
      await flush()
      let steps = 0
      while (true) {
        let next
        for (const timer of timers.values()) {
          if (timer.due <= end && (!next || timer.due < next.due || (timer.due === next.due && timer.id < next.id))) next = timer
        }
        if (!next) break
        if (++steps > 10_000) throw new RangeError('Превышен лимит срабатываний таймеров.')
        time = next.due
        if (next.interval === null) timers.delete(next.id)
        else next.due += next.interval
        Reflect.apply(next.callback, globalThis, next.args)
        await flush()
      }
      time = end
      await flush()
    },
  }
  function deferred() {
    let resolve, reject
    const promise = new NativePromise((ok, fail) => { resolve = ok; reject = fail })
    return { promise, resolve, reject }
  }
  function observe(promise) {
    assert(promise !== null && (typeof promise === 'object' || typeof promise === 'function') && typeof promise.then === 'function', 'Ожидался Promise/thenable.')
    const state = { status: 'pending' }
    NativePromise.resolve(promise).then(
      value => { state.status = 'fulfilled'; state.value = value },
      reason => { state.status = 'rejected'; state.reason = reason },
    )
    return state
  }
  function useFetch(handler) {
    if (typeof handler !== 'function') throw new TypeError('useFetch ожидает функцию.')
    fetchHandler = handler
  }
  globalThis.fetch = (...args) => {
    if (!fetchHandler) return NativePromise.reject(new Error('Сеть недоступна: mock fetch не настроен.'))
    return fetchHandler(...args)
  }
  const dependencyNames = ['loadData', 'render', 'showError']
  for (const name of dependencyNames) {
    globalThis[name] = (...args) => {
      const handler = dependencies.get(name)
      if (!handler) throw new Error(`Зависимость ${name} не настроена для сценария.`)
      return handler(...args)
    }
  }
  function setDependency(name, handler) {
    if (!dependencyNames.includes(name) || typeof handler !== 'function') throw new TypeError('Неизвестная зависимость сценария.')
    dependencies.set(name, handler)
  }
  const onRejection = event => {
    event.preventDefault()
    asynchronousErrors.push(event.reason)
  }
  globalThis.addEventListener('unhandledrejection', onRejection)
  return {
    reset() {
      timers.clear(); dependencies.clear(); fetchHandler = undefined
      assertions = 0; firstFailure = undefined; asynchronousErrors.length = 0
      time = 0
    },
    async run(script, subject) {
      try {
        const execute = new NativeFunction('subject', 'assert', 'clock', 'observe', 'deferred', 'flush', 'useFetch', 'setDependency',
          `"use strict"; return (async () => {\n${script}\n})();`)
        await execute(subject, assert, clock, observe, deferred, flush, useFetch, setDependency)
        await flush()
        await flush()
        if (asynchronousErrors.length) throw asynchronousErrors[0]
        if (firstFailure) throw firstFailure
        if (!assertions) throw new Error('Сценарий не содержит проверок.')
        return { passed: true, actual: `Проверки пройдены (${assertions}).` }
      } catch (error) {
        if (error instanceof AssertionFailure) return { passed: false, actual: error.message }
        throw error
      } finally {
        timers.clear()
      }
    },
    dispose() {
      timers.clear()
      globalThis.removeEventListener('unhandledrejection', onRejection)
      channel.port1.close(); channel.port2.close()
    },
  }
}
