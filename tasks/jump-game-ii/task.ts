import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const jumpGameIITask: TaskDefinition = {
  id: 'jump-game-ii', title: 'Jump Game II', starter,
  verificationNote: '1 <= nums.length <= 10^4; целые nums[i] от 0 до 10^5. Старт на индексе 0, длина прыжка не больше nums[i]. Последний индекс гарантированно достижим. Верни минимальное число прыжков. Мутация входа разрешена. Тесты не доказывают сложность.',
  complexity: {
    variables: 'N — число позиций. Оцениваем дополнительную память.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' }, { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Обработка каждой позиции не более одного раза: O(N).' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Границы и счётчик требуют O(1) памяти.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'jump', output: { kind: 'return' }, comparison: 'exact', cases },
};
