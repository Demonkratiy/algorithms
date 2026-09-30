import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const reverseStringTask: TaskDefinition = {
  id: 'reverse-string',
  title: 'Reverse String',
  starter,
  complexity: {
    variables: 'N — длина ASCII-строки. Память включает стек и удерживаемые подстроки; возвращаемая строка занимает O(N).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'quadratic', accepted: ['linear'], explanation: 'В модели копирования строк slice и конкатенация дают O(N²). Вариант через массив из материала — O(N).' },
      { id: 'space', title: 'Дополнительная память', expected: 'quadratic', accepted: ['linear'], explanation: 'Стек O(N) не учитывает удерживаемые подстроки: вместе до O(N²). Версия через массив занимает O(N), включая результат.' },
    ],
  },
  verificationNote: 'Вход — ASCII, не Unicode-упражнение. Нужен рекурсивный разворот без встроенного reverse и изменения внешнего объекта. Тесты проверяют результат; технику, побочные эффекты вне аргументов и Big O проверяют ревью.',
  runner: { kind: 'function', entryPoint: 'reverseString', output: { kind: 'return' }, comparison: 'exact', cases },
};
