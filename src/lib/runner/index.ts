import { getTaskDefinition } from '../../../tasks'
import frameSource from './sandbox-frame.js?raw'
import workerSource from './sandbox-worker.js?raw'
import { isEnvelope, isRunResult, MAX_CODE_BYTES, RUN_TIMEOUT_MS, SETUP_TIMEOUT_MS } from './protocol'
import type { RunError, RunResult } from './types'

export type { CaseResult, RunError, RunResult } from './types'

export function runTask(taskId: string, code: string, signal?: AbortSignal): Promise<RunResult> {
  const startedAt = performance.now()
  return new Promise((resolve) => {
    let iframe: HTMLIFrameElement | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let settled = false
    let ready = false
    let token = ''
    const runner = getTaskDefinition(taskId)?.runner

    function finish(status: RunResult['status'], error?: RunError, result?: RunResult) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', cancel)
      window.removeEventListener('message', onMessage)
      // Notify before removal as well: the frame owns its worker and explicitly terminates it.
      iframe?.contentWindow?.postMessage({ type: 'dispose', token }, '*')
      iframe?.remove()
      resolve({
        status,
        cases: result?.cases ?? [],
        logs: result?.logs ?? [],
        logsTruncated: result?.logsTruncated ?? false,
        ...(error ? { error } : {}),
        durationMs: Math.max(0, performance.now() - startedAt),
      })
    }

    function cancel() {
      finish('cancelled')
    }

    function onMessage(event: MessageEvent<unknown>) {
      if (!iframe || event.source !== iframe.contentWindow || event.origin !== 'null'
        || !isEnvelope(event.data, token)) return
      if (event.data.type === 'ready' && !ready) {
        ready = true
        clearTimeout(timer)
        timer = setTimeout(() => finish('timeout', {
          name: 'TimeoutError', message: `Выполнение превысило ${RUN_TIMEOUT_MS} мс.`,
        }), RUN_TIMEOUT_MS + 100)
        iframe.contentWindow?.postMessage({ type: 'run', token, code, runner }, '*')
      } else if (event.data.type === 'result' && ready) {
        if (!isRunResult(event.data.result, runner?.cases.length ?? 0)) {
          finish('error', { name: 'RunnerProtocolError', message: 'Некорректный ответ среды выполнения.' })
          return
        }
        finish(event.data.result.status, event.data.result.error, event.data.result)
      }
    }

    if (signal?.aborted) {
      cancel()
      return
    }
    if (!runner) {
      finish('error', { name: 'TaskNotFoundError', message: `Проверка задачи «${taskId}» не подключена.` })
      return
    }
    if (typeof code !== 'string') {
      finish('error', { name: 'TypeError', message: 'Ожидается JavaScript-код в виде строки.' })
      return
    }
    if (new TextEncoder().encode(code).byteLength > MAX_CODE_BYTES) {
      finish('error', { name: 'CodeSizeError', message: 'Размер кода не должен превышать 100 КБ (UTF-8).' })
      return
    }

    try {
      token = crypto.randomUUID()
      const nonce = crypto.randomUUID().replaceAll('-', '')
      const config = JSON.stringify({
        token,
        parentOrigin: window.location.origin,
        workerSource,
        timeoutMs: RUN_TIMEOUT_MS,
      }).replaceAll('<', '\\u003c')
      iframe = document.createElement('iframe')
      iframe.hidden = true
      iframe.title = 'Изолированная среда выполнения JavaScript'
      iframe.dataset.runner = 'javascript'
      iframe.setAttribute('sandbox', 'allow-scripts')
      iframe.referrerPolicy = 'no-referrer'
      iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}' 'unsafe-eval'; worker-src blob:; connect-src 'none'; img-src 'none'; style-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'"></head><body><script nonce="${nonce}">const CONFIG = ${config};\n${frameSource}</script></body></html>`
      window.addEventListener('message', onMessage)
      signal?.addEventListener('abort', cancel, { once: true })
      timer = setTimeout(() => finish('error', {
        name: 'RunnerSetupError', message: 'Не удалось запустить изолированную среду выполнения.',
      }), SETUP_TIMEOUT_MS)
      document.body.append(iframe)
    } catch (error) {
      finish('error', {
        name: error instanceof Error ? error.name : 'RunnerSetupError',
        message: error instanceof Error ? error.message : 'Не удалось создать среду выполнения.',
      })
    }
  })
}
