import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { topics } from '../../../content/course';
import { getTaskPriority, parseTaskPriorities } from '../../../content/priorities';
import { getMarkdown } from './index';

describe('course task priorities', () => {
  const tasks = topics.flatMap(topic => topic.tasks);
  it('has explicit index priorities for every task, with no default for unknown paths', () => {
    const index = readFileSync(resolve('content', 'practice', 'README.md'), 'utf8');
    expect([...parseTaskPriorities(index).keys()].sort()).toEqual(tasks.map(task => task.path).sort());
    expect(tasks.filter(task => task.priority === 'core')).toHaveLength(59);
    expect(tasks.filter(task => task.priority === 'optional')).toHaveLength(42);
    expect(() => getTaskPriority('practice/missing.md')).toThrow();
  });
  it('agrees with each explicit task header and the established early mandatory exercises', () => {
    for (const task of tasks) {
      const markdown = readFileSync(resolve('content', task.path), 'utf8');
      const priority = markdown.match(/\*\*Приоритет:\*\*\s*(🔴|⚪)/)?.[1];
      if (priority) expect(task.priority, task.id).toBe(priority === '🔴' ? 'core' : 'optional');
      else expect(task.priority, `${task.id}: legacy mandatory exercise`).toBe('core');
    }
  });
  it('rejects duplicate index declarations instead of overriding their priority', () => {
    expect(() => parseTaskPriorities('🔴 [Task](task.md)\n⚪ [Task](task.md)')).toThrow();
  });
  it('serves the same index used for priority metadata without a duplicate lazy import', async () => {
    expect(await getMarkdown('practice/README.md')).toBe(readFileSync(resolve('content', 'practice', 'README.md'), 'utf8'));
  });
});
