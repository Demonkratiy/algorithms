/* CONFIG is supplied by the trusted parent, never by learner code. */
(() => {
  let worker
  let workerUrl
  let timer
  let started = false
  let disposed = false
  const startedAt = performance.now()

  function cleanup() {
    clearTimeout(timer)
    worker?.terminate()
    worker = undefined
    if (workerUrl) URL.revokeObjectURL(workerUrl)
    workerUrl = undefined
  }

  function send(result) {
    if (disposed) return
    disposed = true
    cleanup()
    window.removeEventListener('message', receive)
    parent.postMessage({ type: 'result', token: CONFIG.token, result }, CONFIG.parentOrigin)
  }

  function fail(name, message, status = 'error') {
    send({ status, cases: [], logs: [], logsTruncated: false, error: { name, message }, durationMs: performance.now() - startedAt })
  }

  function receive(event) {
    if (event.source !== parent || event.origin !== CONFIG.parentOrigin
      || !event.data || typeof event.data !== 'object' || event.data.token !== CONFIG.token) return
    if (event.data.type === 'dispose') {
      disposed = true
      cleanup()
      window.removeEventListener('message', receive)
      return
    }
    if (event.data.type !== 'run' || started || disposed) return
    started = true
    if (typeof event.data.code !== 'string' || !Array.isArray(event.data.cases)) {
      fail('RunnerProtocolError', 'Некорректный запрос на выполнение.')
      return
    }
    timer = setTimeout(() => fail('TimeoutError', `Выполнение превысило ${CONFIG.timeoutMs} мс.`, 'timeout'), CONFIG.timeoutMs)
    try {
      workerUrl = URL.createObjectURL(new Blob([CONFIG.workerSource], { type: 'text/javascript' }))
      worker = new Worker(workerUrl)
      worker.onmessage = (message) => {
        if (!message.data || typeof message.data !== 'object' || message.data.type !== 'result') {
          fail('RunnerProtocolError', 'Некорректный ответ Worker.')
          return
        }
        send(message.data.result)
      }
      worker.onmessageerror = () => fail('DataCloneError', 'Не удалось прочитать ответ Worker.')
      worker.onerror = (error) => {
        error.preventDefault()
        fail('WorkerError', error.message || 'Ошибка запуска Worker.')
      }
      worker.postMessage({ code: event.data.code, cases: event.data.cases })
    } catch (error) {
      fail(error instanceof Error ? error.name : 'RunnerSetupError',
        error instanceof Error ? error.message : 'Не удалось запустить Worker.')
    }
  }

  window.addEventListener('message', receive)
  window.addEventListener('pagehide', cleanup, { once: true })
  parent.postMessage({ type: 'ready', token: CONFIG.token }, CONFIG.parentOrigin)
})()
