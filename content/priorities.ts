import practiceIndex from './practice/README.md?raw';
export { practiceIndex };

export type TaskPriority = 'core' | 'optional';

export function parseTaskPriorities(markdown: string): ReadonlyMap<string, TaskPriority> {
  const result = new Map<string, TaskPriority>();
  for (const match of markdown.matchAll(/(🔴|⚪)\s*\[[^\]]+\]\(([^)]+)\)/g)) {
    const path = `practice/${match[2]}`;
    if (result.has(path)) throw new Error(`Повтор приоритета задачи в оглавлении: ${path}`);
    result.set(path, match[1] === '🔴' ? 'core' : 'optional');
  }
  return result;
}

const priorities = parseTaskPriorities(practiceIndex);
export function getTaskPriority(path: string): TaskPriority {
  const priority = priorities.get(path);
  if (!priority) throw new Error(`Приоритет задачи не указан в оглавлении практики: ${path}`);
  return priority;
}
