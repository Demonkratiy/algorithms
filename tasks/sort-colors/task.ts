import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const sortColorsTask: TaskDefinition = {
  id: 'sort-colors', title: 'Sort Colors', starter,
  verificationNote: 'Проверяется изменённый nums; возвращаемое значение не важно. Выходные тесты не доказывают один проход, отсутствие sort() или заявленную сложность.',
  complexity: {
    variables: 'N — длина nums. Память — дополнительная, без входного массива.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' }, { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linear', explanation: 'Каждый элемент обрабатывается ограниченное число раз. Цель — один проход; counting sort тоже имеет O(N), но два прохода.' },
      { id: 'space', title: 'Дополнительная память', expected: 'constant', explanation: 'Фиксированное число индексов; сортировка выполняется in-place.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'sortColors', output: { kind: 'argument', index: 0 }, comparison: 'exact', cases },
}
