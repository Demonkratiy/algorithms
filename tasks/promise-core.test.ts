import { describe, expect, it } from 'vitest';
import { sleepTask } from './sleep-retry-timeout/task';
import { withTimeoutTask } from './with-timeout/task';
import { retryTask } from './retry/task';
import { promisePoolTask } from './promise-pool/task';
import { promiseAllTask } from './promise-all/task';
import { promiseAllSettledTask } from './promise-all-settled/task';
import type { ScenarioRunner, TaskDefinition } from './types';
import { promiseCoreSolutions, promiseCoreWrongSolutions } from '../tests/fixtures/promise-core';
import { runScenarioFixture } from '../src/lib/runner/scenario-test-support';

const tasks = [sleepTask, withTimeoutTask, retryTask, promisePoolTask, promiseAllTask, promiseAllSettledTask];
const signatures: Record<string, string> = {
  'sleep-retry-timeout': 'function sleep(ms)',
  'with-timeout': 'function withTimeout(promise, ms)',
  retry: 'async function retry(fn, { attempts = 3, delay = 300, backoff = 1, shouldRetry = () => true } = {})',
  'promise-pool': 'async function promisePool(tasks, limit)',
  'promise-all': 'function myPromiseAll(promises)',
  'promise-all-settled': 'function myAllSettled(promises)',
};
const caseCounts: Record<string, number> = {
  'sleep-retry-timeout': 6,
  'with-timeout': 8,
  retry: 10,
  'promise-pool': 8,
  'promise-all': 9,
  'promise-all-settled': 8,
};

function runnerFor(task: TaskDefinition): ScenarioRunner {
  if (task.runner.kind !== 'scenario') throw new Error(`Unexpected runner: ${task.id}`);
  return task.runner;
}

describe('Promise core fixture coverage', () => {
  it('covers exactly six standalone tasks, preserving the sleep legacy ID', () => {
    const ids = tasks.map(task => task.id).sort();
    expect(new Set(ids).size).toBe(6);
    expect(Object.keys(promiseCoreSolutions).sort()).toEqual(ids);
    expect(Object.keys(promiseCoreWrongSolutions).sort()).toEqual(ids);
    expect(sleepTask.runner.entryPoint).toBe('sleep');
    expect(sleepTask.starter).not.toMatch(/function (retry|withTimeout)/);
  });
});

for (const task of tasks) {
  const runner = runnerFor(task);
  describe(task.id, () => {
    it('has a neutral exact signature, named bounded scenarios and complexity choices', () => {
      expect(task.starter.replace(/\r\n/g, '\n').trim()).toBe(`${signatures[task.id]} {\n  // TODO\n}`);
      expect(runner.cases).toHaveLength(caseCounts[task.id]);
      expect(runner.cases.length).toBeGreaterThanOrEqual(6);
      expect(new Set(runner.cases.map(sample => sample.name)).size).toBe(runner.cases.length);
      for (const sample of runner.cases) {
        expect(sample.name.trim()).not.toBe('');
        expect(sample.input.trim()).not.toBe('');
        expect(sample.expected.trim()).not.toBe('');
        expect(sample.script).toMatch(/\bassert(?:\.equal)?\(/);
        expect(sample.script).not.toMatch(/\bawait\s+(?:subject\s*\(|\w+\.promise\b)/);
        expect(sample.script).not.toMatch(/clock\.now\(\)\s*,\s*0/);
      }
      expect(task.verificationNote).toBeTruthy();
      expect(task.complexity.variables).toBeTruthy();
      const options = task.complexity.options.map(option => option.id);
      expect(options).toContain('unknown');
      expect(task.complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space']);
      for (const criterion of task.complexity.criteria) {
        expect(criterion.explanation).toBeTruthy();
        expect(options).toContain(criterion.expected);
        expect(criterion.expected).not.toBe('unknown');
      }
      const constant = ['sleep-retry-timeout', 'with-timeout'].includes(task.id);
      expect(task.complexity.criteria[0].expected).toBe(constant ? 'constant' : 'linear');
      expect(task.complexity.criteria[1].expected).toBe(constant || task.id === 'retry' ? 'constant' : 'linear');
    });

    for (const sample of runner.cases) {
      it(`${sample.name}: trusted solution passes`, async () => {
        const result = await runScenarioFixture(promiseCoreSolutions[task.id], { ...runner, cases: [sample] });
        expect(result.status, JSON.stringify(result)).toBe('passed');
        expect(result.cases).toHaveLength(1);
        expect(result.cases[0].passed).toBe(true);
      });
    }

    it('the TODO starter cannot pass any scenario', async () => {
      const result = await runScenarioFixture(task.starter, runner);
      expect(result.status).not.toBe('passed');
      expect(result.cases).toHaveLength(runner.cases.length);
      expect(result.cases.every(sample => !sample.passed)).toBe(true);
    });

    for (const [index, source] of promiseCoreWrongSolutions[task.id].entries()) {
      it(`rejects finite wrong variant ${index + 1}`, async () => {
        expect(source).not.toBe(promiseCoreSolutions[task.id]);
        const result = await runScenarioFixture(source, runner);
        expect(result.status, `Wrong variant ${index + 1} escaped: ${JSON.stringify(result)}`).not.toBe('passed');
        expect(result.status).not.toBe('timeout');
        expect(result.cases.some(sample => !sample.passed)).toBe(true);
      });
    }
  });
}
