import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const courseScheduleTask: TaskDefinition = {
  id: 'course-schedule',
  title: 'Course Schedule',
  starter,
  complexity: {
    variables: 'V = numCourses, E = prerequisites.length. Дополнительная память не включает вход и результат.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'vertices', label: 'O(V)' },
      { id: 'graph', label: 'O(V + E)' },
      { id: 'quadratic', label: 'O(V²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'graph', explanation: 'Построение списков смежности и обработка всех вершин и зависимостей требуют O(V + E).' },
      { id: 'space', title: 'Дополнительная память', expected: 'graph', explanation: 'Списки смежности занимают O(V + E), состояния/степени и очередь — O(V).' },
    ],
  },
  verificationNote: 'Пара [course, prerequisite] задаёт ребро prerequisite → course. Проверяется boolean; обратное направление всех рёбер не меняет наличие цикла, поэтому направление дополнительно проверяется в Course Schedule II.',
  runner: { kind: 'function', entryPoint: 'canFinish', output: { kind: 'return' }, comparison: 'exact', cases },
};
