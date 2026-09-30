import { describe, expect, it } from 'vitest';
import type { ScenarioRunner } from '../../../tasks/types';
import { runScenarioFixture } from './scenario-test-support';
import { isRunResult } from './protocol';

function runner(scripts: string[]): ScenarioRunner {
  return { kind: 'scenario', entryPoint: 'subject', cases: scripts.map((script, index) => ({
    name: `Scenario ${index + 1}`, input: 'test fixture', expected: 'assertions pass', script,
  })) };
}
describe('scenario environment', () => {
  it('advances virtual timers with a microtask checkpoint between callbacks', async () => {
    const result = await runScenarioFixture('function subject() {}', runner([`
      const events = [];
      setTimeout(() => {
        events.push('timer1');
        Promise.resolve().then(() => events.push('micro1'));
        setTimeout(() => events.push('nested'), 0);
      }, 0);
      setTimeout(() => events.push('timer2'), 0);
      Promise.resolve().then(() => events.push('initial'));
      assert.equal(clock.pending(), 2);
      await clock.tick(0);
      assert.equal(events, ['initial', 'timer1', 'micro1', 'timer2', 'nested']);
      assert.equal(clock.pending(), 0);
    `]));
    expect(result.status).toBe('passed');
    expect(isRunResult(result, 1)).toBe(true);
  });
  it('preserves Date behavior, timer arguments, receiver and cancellation return values', async () => {
    const result = await runScenarioFixture('function subject() {}', runner([`
      const start = Date.now();
      assert.equal(+new Date(), start);
      assert(new Date() instanceof Date, 'Date instance');
      assert(Date.prototype.constructor === Date, 'Date constructor');
      assert.equal(performance.now(), 0);
      const calls = [];
      setTimeout(function(...args) { calls.push([this === globalThis, args]); }, 5, 1, 2);
      const cancelled = setTimeout(() => calls.push('cancelled'), 1);
      assert.equal(clearTimeout(cancelled), undefined);
      await clock.tick(5);
      assert.equal(calls, [[true, [1, 2]]]);
      assert.equal(Date.now() - start, 5);
      assert.equal(performance.now(), 5);
    `]));
    expect(result.status).toBe('passed');
  });
  it('recompiles module state for every case and routes captured fetch through the current mock', async () => {
    const code = 'const created=performance.now(), request=fetch; function subject(url) { return url ? request(url) : created; }';
    const result = await runScenarioFixture(code, runner([
      `await clock.tick(50); assert.equal(subject(), 0); useFetch(url => Promise.resolve(url)); const state = observe(subject('first')); await flush(); assert.equal(state.value, 'first');`,
      `assert.equal(subject(), 0); assert.equal(clock.pending(), 0); useFetch(url => Promise.resolve(url)); const state = observe(subject('second')); await flush(); assert.equal(state.value, 'second');`,
    ]));
    expect(result.status).toBe('passed');
  });
  it('keeps swallowed assertion failures and rejects scenarios without checks', async () => {
    const failed = await runScenarioFixture('function subject() {}', runner(['try { assert(false, "failure"); } catch {}']));
    expect(failed.status).toBe('failed');
    expect(failed.cases[0].actual).toContain('failure');
    const empty = await runScenarioFixture('function subject() {}', runner(['subject();']));
    expect(empty.status).toBe('error');
    expect(empty.error?.message).toContain('не содержит проверок');
  });
  it('reports unhandled asynchronous errors rather than accepting a passing assertion', async () => {
    const result = await runScenarioFixture('function subject() { Promise.reject(new Error("unhandled fixture")); }',
      runner(['subject(); await flush(); assert(true, "reached");']));
    expect(result.status).toBe('error');
    expect(result.error?.message).toContain('unhandled fixture');
  });
});
