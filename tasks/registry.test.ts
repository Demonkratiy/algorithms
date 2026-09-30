import { describe, expect, it } from 'vitest';
import { topics } from '../content/course';
import { getTaskDefinition, taskDefinitions } from './index';
import { validateTask } from './validate';

describe('runnable task registry', () => {
  it('enables exactly the first fifteen array/string tasks without UI-specific metadata', () => {
    expect(taskDefinitions).toHaveLength(15);
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
});
