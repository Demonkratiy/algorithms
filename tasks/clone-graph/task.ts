import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const cloneGraphTask: TaskDefinition = {
  id: 'clone-graph',
  title: 'Clone Graph',
  starter,
  complexity: {
    variables: 'V — число узлов, E — число неориентированных рёбер. Дополнительная память не включает вход и возвращаемую копию графа O(V + E).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'vertices', label: 'O(V)' },
      { id: 'graph', label: 'O(V + E)' },
      { id: 'quadratic', label: 'O(V²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'graph', explanation: 'Каждый узел создаётся один раз, каждое ребро копируется в списках соседей обоих концов.' },
      { id: 'space', title: 'Дополнительная память', expected: 'vertices', explanation: 'Map соответствий и стек/очередь обхода требуют O(V). Новые узлы и списки соседей — результат O(V + E), здесь не учитываются.' },
    ],
  },
  verificationNote: 'Проверяются значения, рёбра, единая копия каждого узла, новые узлы и новые массивы neighbors без ссылок на оригиналы. Порядок соседей не важен; Big O требует ревью.',
  runner: { kind: 'graph-clone', entryPoint: 'cloneGraph', cases },
};
