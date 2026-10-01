import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const curryTask: TaskDefinition = {
  id: 'curry',
  title: 'Curry',
  starter,
  complexity: {
    variables: 'N — число накопленных аргументов. Модель из разбора: каждый шаг создаёт новый массив; fn не учитываем. Считаем одну цепочку по одному аргументу без пустых вызовов.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Суммарное время цепочки в модели копирования', expected: 'quadratic', explanation: 'Копируются префиксы длины 1, 2, …, N: O(N²), не O(N). Другие представления накопленных аргументов могут улучшить эту цель.' },
      { id: 'space', title: 'Аргументы одной живой частичной функции', expected: 'linear', explanation: 'Один префикс занимает O(N). Если сохранить все промежуточные функции, суммарная удерживаемая память в этой модели достигает O(N²).' },
    ],
  },
  verificationNote: 'Арность — fn.length; завершение при >=, все лишние аргументы передаются. Пустые вызовы не завершают цепочку при положительной арности; fn.length=0 выполняется при первом вызове. Частичные функции переиспользуемы. this берётся у завершающего вызова (обычная function из итогового разбора, не стрелка из подсказки). Placeholder и угадывание арности default/rest не требуются. Проверки не доказывают Big O и не навязывают алгоритм статически.',
  runner: { kind: 'scenario', entryPoint: 'curry', cases },
};
