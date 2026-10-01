import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const courseScheduleIITask: TaskDefinition = {
  id: 'course-schedule-ii',
  title: 'Course Schedule II',
  starter,
  complexity: {
    variables: 'V = numCourses, E = prerequisites.length. Дополнительная память не включает вход и возвращаемый порядок O(V).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'vertices', label: 'O(V)' },
      { id: 'graph', label: 'O(V + E)' },
      { id: 'quadratic', label: 'O(V²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'graph', explanation: 'Построение графа и топологическая сортировка обрабатывают каждую вершину и зависимость за суммарное O(V + E).' },
      { id: 'space', title: 'Дополнительная память', expected: 'graph', explanation: 'Граф, степени/состояния и очередь занимают O(V + E), даже без учёта возвращаемого массива.' },
    ],
  },
  verificationNote: 'Принимается любой полный порядок без повторов с prerequisite раньше course. При цикле принимается только []. Образец expected — не единственный правильный ответ.',
  runner: { kind: 'function', entryPoint: 'findOrder', output: { kind: 'return' }, comparison: 'topological-order', cases },
};
