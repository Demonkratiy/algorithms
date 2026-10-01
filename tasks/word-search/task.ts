import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const wordSearchTask: TaskDefinition = {
  id: 'word-search',
  title: 'Word Search',
  starter,
  complexity: {
    variables: 'R — число строк, C — число столбцов, L — длина word. Дополнительная память не включает вход и результат.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'word', label: 'O(L)' },
      { id: 'cells', label: 'O(R × C)' },
      { id: 'product', label: 'O(R × C × L)' },
      { id: 'exponential', label: 'O(R × C × 3^L)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'exponential', explanation: 'До R × C стартов; после первого шага до трёх продолжений, поскольку предыдущая клетка уже занята. Первый шаг даёт лишь константный множитель.' },
      { id: 'space', title: 'Дополнительная память', expected: 'word', explanation: 'При временных пометках в board стек текущего пути занимает O(L). Все пометки необходимо откатить и при успехе, и при неудаче.' },
    ],
  },
  verificationNote: 'Проверяется boolean и сохранность board после вызова: материал явно требует восстановления клетки даже при успешном возврате. Оценка Big O проверяется отдельно от тестов.',
  runner: { kind: 'function', entryPoint: 'exist', output: { kind: 'return' }, comparison: 'exact', preserveArgs: [0], cases },
};
