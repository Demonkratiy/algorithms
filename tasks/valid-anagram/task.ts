import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const validAnagramTask: TaskDefinition = {
  id: 'valid-anagram',
  title: 'Valid Anagram',
  starter,
  complexity: {
    variables: 'N — суммарная длина s и t, K — число различных букв (K ≤ 26). Память — дополнительная.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'distinct-symbols', label: 'O(K)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время — цель частотного подхода', expected: 'linear', explanation: 'Цель материала — O(N). Сортировка корректна по результату, но O(N log N) не достигает этой цели.' },
      { id: 'space', title: 'Дополнительная память — цель', expected: 'constant', accepted: ['distinct-symbols'], explanation: 'O(K) для частот, где K — число различных букв. Фиксированный алфавит ограничивает K числом 26, поэтому O(1). Допустимы и общая, и упрощённая оценки.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'isAnagram', output: { kind: 'return' }, comparison: 'exact', cases },
}
