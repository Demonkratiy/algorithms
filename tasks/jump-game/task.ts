import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const jumpGameTask: TaskDefinition = {
  id: 'jump-game', title: 'Jump Game', starter,
  verificationNote: '1 <= nums.length <= 10^4; целые nums[i] от 0 до 10^5. Старт на индексе 0, длина прыжка не больше nums[i]. Верни boolean: достижим ли последний индекс. Мутация входа разрешена. Тесты не доказывают сложность.',
  complexity: {
    variables: 'N — число позиций. Оцениваем дополнительную память.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' }, { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'В худшем случае нужен один проход по N позициям.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Достаточно постоянного числа переменных: O(1).' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'canJump', output: { kind: 'return' }, comparison: 'exact', cases },
};
