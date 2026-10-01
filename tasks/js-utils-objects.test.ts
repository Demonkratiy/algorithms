import { describe, expect, it } from 'vitest';
import { debounceTask } from './debounce/task';
import { throttleTask } from './throttle/task';
import { throttleTrailingTask } from './throttle-trailing/task';
import { curryTask } from './curry/task';
import { memoizeTask } from './memoize/task';
import { deepCloneTask } from './deep-clone/task';
import { eventEmitterTask } from './event-emitter/task';
import type { ScenarioRunner, TaskDefinition } from './types';
import { runScenarioFixture } from '../src/lib/runner/scenario-test-support';
import { jsUtilsObjectSolutions, jsUtilsObjectWrongSolutions } from '../tests/fixtures/js-utils-objects';

const tasks = [debounceTask, throttleTask, throttleTrailingTask, curryTask, memoizeTask, deepCloneTask, eventEmitterTask];
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => unknown;

function scenario(task: TaskDefinition): ScenarioRunner {
  if (task.runner.kind !== 'scenario') throw new Error(`Expected scenario runner: ${task.id}`);
  return task.runner;
}

describe('JS utilities and objects task data', () => {
  it('has exactly seven distinct tasks and separate throttle contracts', () => {
    expect(tasks.map(task => task.id)).toEqual([
      'debounce', 'throttle', 'throttle-trailing', 'curry', 'memoize', 'deep-clone', 'event-emitter',
    ]);
    expect(new Set(tasks.map(task => task.id)).size).toBe(7);
    expect(scenario(throttleTask).entryPoint).toBe('throttle');
    expect(scenario(throttleTrailingTask).entryPoint).toBe('throttleTrailing');
    expect(throttleTask.starter).not.toEqual(throttleTrailingTask.starter);
    expect(Object.keys(jsUtilsObjectSolutions).sort()).toEqual(tasks.map(task => task.id).sort());
    expect(Object.keys(jsUtilsObjectWrongSolutions).sort()).toEqual(tasks.map(task => task.id).sort());
  });

  for (const task of tasks) {
    describe(task.id, () => {
      const runner = scenario(task);

      it('has complete metadata, neutral starter and executable assertion scripts', () => {
        expect(runner.cases.length).toBeGreaterThanOrEqual(6);
        expect(new Set(runner.cases.map(sample => sample.name)).size).toBe(runner.cases.length);
        expect(task.starter).toContain('TODO');
        expect(task.verificationNote).toContain('Big O');
        expect(task.complexity.variables.length).toBeGreaterThan(0);
        const options = new Set(task.complexity.options.map(option => option.id));
        expect(task.complexity.criteria.map(criterion => criterion.id)).toEqual(expect.arrayContaining(['time', 'space']));
        for (const criterion of task.complexity.criteria) {
          expect(options.has(criterion.expected)).toBe(true);
          expect(criterion.explanation.length).toBeGreaterThan(0);
        }
        expect(() => new Function(`${task.starter}; return ${runner.entryPoint};`)).not.toThrow();
        for (const sample of runner.cases) {
          expect(sample.name.length).toBeGreaterThan(0);
          expect(sample.input.length).toBeGreaterThan(0);
          expect(sample.expected.length).toBeGreaterThan(0);
          expect(sample.script).toMatch(/\bassert(?:\.equal)?\s*\(/);
          expect(() => new AsyncFunction('subject', 'assert', 'clock', 'flush', 'deferred', 'observe', sample.script)).not.toThrow();
        }
      });

      it('accepts the reference fixture through the scenario runtime', async () => {
        const result = await runScenarioFixture(jsUtilsObjectSolutions[task.id], runner);
        expect(result.status, JSON.stringify(result)).toBe('passed');
        expect(result.cases).toHaveLength(runner.cases.length);
        expect(result.cases.every(sample => sample.passed)).toBe(true);
      });

      it('does not accept the TODO starter', async () => {
        const result = await runScenarioFixture(task.starter, runner);
        expect(result.status).not.toBe('passed');
      });

      const wrong = jsUtilsObjectWrongSolutions[task.id];
      it('has distinct bounded wrong programs', () => {
        expect(wrong.length).toBeGreaterThanOrEqual(2);
        expect(new Set(wrong).size).toBe(wrong.length);
        for (const source of wrong) {
          expect(source).not.toBe(jsUtilsObjectSolutions[task.id]);
          expect(() => new Function(`${source}; return ${runner.entryPoint};`)).not.toThrow();
        }
      });

      wrong.forEach((source, index) => {
        it(`rejects bounded wrong fixture ${index + 1}`, async () => {
          const result = await runScenarioFixture(source, runner);
          expect(result.status, JSON.stringify(result)).not.toBe('passed');
          expect(result.status).not.toBe('timeout');
          expect(result.cases.some(sample => !sample.passed) || result.error !== undefined).toBe(true);
        });
      });
    });
  }
});
