import { describe, expect, it } from 'vitest';
import { runScenarioFixture } from '../src/lib/runner/scenario-test-support';
import { promiseCancelSolutions, promiseCancelWrongSolutions } from '../tests/fixtures/promise-cancel';
import { promiseRaceTask } from './promise-race/task';
import { promiseAnyTask } from './promise-any/task';
import { cancellationTask } from './cancellation/task';
import { fetchWithAbortTask } from './fetch-with-abort/task';
import { latestSearchTask } from './latest-search/task';
import type { ScenarioRunner, TaskDefinition } from './types';

const tasks = [promiseRaceTask, promiseAnyTask, cancellationTask, fetchWithAbortTask, latestSearchTask];
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => unknown;

function scenarioRunner(task: TaskDefinition): ScenarioRunner {
  if (task.runner.kind !== 'scenario') throw new Error(`Not a scenario: ${task.id}`);
  return task.runner;
}

describe('Promise/cancellation task definitions', () => {
  it('contains exactly the five requested tasks with test-only references', () => {
    expect(tasks.map(task => task.id)).toEqual([
      'promise-race', 'promise-any', 'cancellation', 'fetch-with-abort', 'latest-search',
    ]);
    expect(Object.keys(promiseCancelSolutions).sort()).toEqual(tasks.map(task => task.id).sort());
    expect(Object.keys(promiseCancelWrongSolutions).sort()).toEqual(tasks.map(task => task.id).sort());
  });

  for (const task of tasks) {
    it(`${task.id}: complete metadata, neutral starter and valid trusted scripts`, () => {
      const runner = scenarioRunner(task);
      expect(runner.cases.length).toBeGreaterThanOrEqual(6);
      expect(new Set(runner.cases.map(sample => sample.name)).size).toBe(runner.cases.length);
      expect(task.verificationNote?.length).toBeGreaterThan(30);
      expect(task.complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space']);
      for (const criterion of task.complexity.criteria) {
        expect(task.complexity.options.some(option => option.id === criterion.expected)).toBe(true);
      }
      expect(task.starter).not.toEqual(promiseCancelSolutions[task.id]);
      expect(promiseCancelWrongSolutions[task.id].length).toBeGreaterThanOrEqual(3);
      for (const code of [task.starter, promiseCancelSolutions[task.id], ...promiseCancelWrongSolutions[task.id]]) {
        expect(() => new Function(`${code}; return ${runner.entryPoint};`)).not.toThrow();
      }
      for (const sample of runner.cases) {
        expect(sample.name.length).toBeGreaterThan(0);
        expect(sample.input.length).toBeGreaterThan(0);
        expect(sample.expected.length).toBeGreaterThan(0);
        expect(() => new AsyncFunction(
          'subject', 'assert', 'clock', 'flush', 'deferred', 'observe', 'useFetch', 'setDependency', sample.script,
        )).not.toThrow();
        expect(sample.script).not.toMatch(/await\s+subject\s*\(/);
      }
    });
  }
});

describe('Promise/cancellation scenarios', () => {
  for (const task of tasks) {
    it(`${task.id}: reference passes every scenario`, async () => {
      const runner = scenarioRunner(task);
      const result = await runScenarioFixture(promiseCancelSolutions[task.id], runner);
      expect(result.status, JSON.stringify(result)).toBe('passed');
      expect(result.cases).toHaveLength(runner.cases.length);
    });

    it(`${task.id}: neutral starter does not pass`, async () => {
      const result = await runScenarioFixture(task.starter, scenarioRunner(task));
      expect(['failed', 'error'], JSON.stringify(result)).toContain(result.status);
    });

    promiseCancelWrongSolutions[task.id].forEach((code, index) => {
      it(`${task.id}: finite wrong reference ${index + 1} is rejected`, async () => {
        const result = await runScenarioFixture(code, scenarioRunner(task));
        expect(['failed', 'error'], JSON.stringify(result)).toContain(result.status);
      });
    });
  }
});
