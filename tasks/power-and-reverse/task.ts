import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const powerTask: TaskDefinition = {
  id: 'power-and-reverse',
  title: 'Power',
  starter,
  complexity: {
    variables: 'N = exponent — неотрицательное целое. Для N = 0 время и память O(1). Память включает стек; конечный числовой результат — O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'linear', accepted: ['logarithmic'], explanation: 'Рекурсивное уменьшение степени на один — O(N). Бонус: быстрое возведение с одним вычислением половины — O(log N).' },
      { id: 'space', title: 'Дополнительная память', expected: 'linear', accepted: ['logarithmic'], explanation: 'Стек наивной версии — O(N); стек быстрого возведения — O(log N). Оценка должна соответствовать выбранной версии.' },
    ],
  },
  verificationNote: 'Legacy id сохранён только для Power. Проверяется power(base, exponent), fastPower не требуется. ** и Math.pow запрещены материалом; тесты не доказывают рекурсию, отсутствие запрещённых операций или Big O. Отрицательные степени вне условия.',
  runner: { kind: 'function', entryPoint: 'power', output: { kind: 'return' }, comparison: 'approximate', tolerance: { absolute: 1e-12, relative: 1e-10 }, cases },
};
