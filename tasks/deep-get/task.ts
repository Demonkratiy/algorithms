import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const deepGetTask: TaskDefinition = {
  id: 'deep-get',
  title: 'Deep Get',
  starter,
  complexity: {
    variables: 'L — длина строкового пути; K — число ключей. Дополнительная память включает split; возвращается значение или ссылка без копирования, O(1) сверх входа.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'keys', label: 'O(K)' },
      { id: 'path', label: 'O(L + K)' },
      { id: 'copied-rest', label: 'O(L + K²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время функции', expected: 'path', explanation: 'Разбиение пути и проход по ключам: O(L + K). Рекурсивное копирование rest из сравнения в материале даёт до O(L + K²) и не достигает линейной цели.' },
      { id: 'space', title: 'Дополнительная память', expected: 'path', explanation: 'Split хранит ключи и массив за O(L + K). Сам итеративный проход использует O(1) рабочего состояния; это не вся память функции.' },
    ],
  },
  verificationNote: 'Непустой путь из непустых ключей через точки, обычный доступ к свойствам, без вызова функций. Вход не изменять. Промежуточный null/undefined обрывает путь; конечные 0, false, "" и null сохраняются. Здесь рекурсия не обязательна. Тесты не доказывают Big O.',
  runner: { kind: 'function', entryPoint: 'deepGet', output: { kind: 'return' }, comparison: 'exact', preserveArgs: [0], cases },
};
