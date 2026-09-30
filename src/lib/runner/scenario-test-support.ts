import { Worker } from 'node:worker_threads';
import type { ScenarioRunner } from '../../../tasks/types';
import type { RunResult } from './types';
import { workerSource } from './worker-source';

// Test-only: never use this Node helper for code supplied by an application user.
export function runScenarioFixture(code: string, runner: ScenarioRunner): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`
      const { parentPort, workerData, MessageChannel } = require('node:worker_threads');
      const { runInNewContext } = require('node:vm');
      const listeners = new Map();
      const sandbox = {
        performance: { now: () => performance.now() },
        structuredClone, setTimeout, clearTimeout, setInterval, clearInterval,
        MessageChannel, AbortController, AbortSignal, DOMException,
        addEventListener(type, handler) {
          if (!listeners.has(type)) listeners.set(type, new Set());
          listeners.get(type).add(handler);
        },
        removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
        postMessage(message) { parentPort.postMessage(message.result); },
      };
      sandbox.self = sandbox;
      process.on('unhandledRejection', reason => {
        for (const handler of listeners.get('unhandledrejection') || []) handler({ reason, preventDefault() {} });
      });
      runInNewContext(workerData.source, sandbox, { timeout: 2000 });
      sandbox.onmessage({ data: { code: workerData.code, runner: workerData.runner } })
        .catch(error => parentPort.postMessage({ fatal: String(error) }));
    `, { eval: true, workerData: { source: workerSource, code, runner } });
    const timer = setTimeout(() => {
      void worker.terminate();
      reject(new Error(`Сценарий ${runner.entryPoint} не завершился за 10 секунд.`));
    }, 10_000);
    worker.once('error', error => { clearTimeout(timer); reject(error); });
    worker.once('message', (result: RunResult | { fatal: string }) => {
      clearTimeout(timer);
      void worker.terminate();
      if ('fatal' in result) reject(new Error(result.fatal));
      else resolve(result);
    });
    worker.once('exit', code => {
      if (code !== 0) { clearTimeout(timer); reject(new Error(`Test worker exited with code ${code}`)); }
    });
  });
}
