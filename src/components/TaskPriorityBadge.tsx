import type { TaskPriority } from '../../content/priorities';

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const label = priority === 'core' ? 'Основная' : 'Дополнительная';
  return <span className={`badge priority-badge priority-${priority}`} title={label}>{label}</span>;
}
