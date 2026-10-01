import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const nonOverlappingIntervalsTask: TaskDefinition = {
  id: 'non-overlapping-intervals', title: 'Non-overlapping Intervals', starter,
  verificationNote: '1 <= intervals.length <= 10^5; целые -50000 <= start < end <= 50000. Касание концами не считается пересечением. Верни минимальное число удалений. Мутация входа, включая сортировку, разрешена. Тесты не доказывают сложность.',
  complexity: {
    variables: 'N — число интервалов. Дополнительная память включает расходы сортировки; числовой выход занимает O(1).',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' }, { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linearithmic', explanation: 'Сортировка O(N log N) доминирует над проходом O(N), при соответствующем алгоритме сортировки. ECMAScript не гарантирует сложность Array.sort.' },
      { id: 'space', title: 'Дополнительная память, включая сортировку', expected: 'linear', accepted: ['logarithmic', 'constant'], explanation: 'Сам проход требует O(1), как в условии без учёта sort. Array.sort не гарантирует O(1): распространённые JS-реализации могут требовать O(N). O(log N) или O(1) допустимы при обоснованном выборе соответствующей сортировки; мутация входа разрешена.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'eraseOverlapIntervals', output: { kind: 'return' }, comparison: 'exact', cases },
};
