import { describe, expect, it } from 'vitest';
import { topics } from '../content/course';
import { getTaskDefinition, taskDefinitions } from './index';
import { validateTask } from './validate';

describe('runnable task registry', () => {
  it('enables twenty-six tasks without UI-specific metadata', () => {
    expect(taskDefinitions).toHaveLength(26);
    const courseTasks = topics.flatMap(topic => topic.tasks);
    expect(courseTasks.filter(task => task.runnable).map(task => task.id)).toEqual(taskDefinitions.map(task => task.id));
    for (const definition of taskDefinitions) {
      expect(() => validateTask(definition)).not.toThrow();
      expect(courseTasks.filter(task => task.id === definition.id)).toHaveLength(1);
      expect(definition.starter).toContain(definition.runner.entryPoint);
      expect(definition.runner.cases.length).toBeGreaterThanOrEqual(6);
    }
    expect(getTaskDefinition('not-a-task')).toBeUndefined();
  });
  it('validates the task contract and complexity targets', () => {
    const definition = getTaskDefinition('range-sum-query')!;
    expect(() => validateTask({ ...definition, runner: { ...definition.runner, entryPoint: 'invalid.entry' } })).toThrow();
    expect(() => validateTask({
      ...definition, complexity: { ...definition.complexity, criteria: [{ id: 'time', title: 'Time', expected: 'missing', explanation: '' }] },
    })).toThrow();
  });
  it('rejects invalid list references, cycle positions and unchecked class cases', () => {
    const list = getTaskDefinition('middle-of-list')!;
    expect(() => validateTask({
      ...list, runner: { kind: 'linked-list', entryPoint: 'middleNode', cases: [
        { name: 'bad cycle', lists: [{ values: [], cycleAt: 0 }], expected: { kind: 'node', node: null } },
      ] },
    })).toThrow();
    expect(() => validateTask({
      ...list, runner: { kind: 'linked-list', entryPoint: 'middleNode', cases: [
        { name: 'bad reference', lists: [{ values: [1] }], expected: { kind: 'node', node: { list: 0, index: 2 } } },
      ] },
    })).toThrow();
    const stack = getTaskDefinition('min-stack')!;
    expect(() => validateTask({
      ...stack, runner: { kind: 'class', entryPoint: 'MinStack', cases: [
        { name: 'unchecked', instances: [[]], calls: [{ instance: 0, method: 'push', args: [1], ignoreReturn: true }] },
      ] },
    })).toThrow();
  });
});
