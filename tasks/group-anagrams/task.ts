import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

const complexity = {
  variables: 'N — число слов, K — максимальная длина слова; алфавит — 26 букв. K+1 учитывает пустые слова. Память — дополнительная, без O(N) ссылок в возвращаемых группах; строки не копируются.',
  options: [
    { id: 'constant', label: 'O(1)' },
    { id: 'linear', label: 'O(N)' },
    { id: 'linear-words', label: 'O(N · (K + 1))' },
    { id: 'sort-words', label: 'O(N · (1 + K log(K + 1)))' },
    { id: 'counter-space', label: 'O(N + K)' },
    { id: 'quadratic', label: 'O(N²)' },
    { id: 'unknown', label: 'Пока не знаю' },
  ],
  criteria: [
    { id: 'time', title: 'Время — выбранный подход', expected: 'sort-words', accepted: ['linear-words'], explanation: 'Допустимы сортировка подписи O(N · (1 + K log(K + 1))) и частотная подпись O(N · (K + 1)); более быстрый подход тоже засчитывается.' },
    { id: 'space', title: 'Дополнительная память — выбранный подход', expected: 'linear-words', accepted: ['counter-space', 'linear'], explanation: 'Сортированные ключи занимают до O(N · (K + 1)); частотные ключи фиксированного алфавита — O(N), или O(N + K) с временным представлением слова. Возвращаемые группы — O(N) ссылок, не копии строк.' },
  ],
}

export const groupAnagramsTask: TaskDefinition = {
  id: 'group-anagrams',
  title: 'Group Anagrams',
  starter,
  complexity,
  runner: { kind: 'function', entryPoint: 'groupAnagrams', output: { kind: 'return' }, comparison: 'nested-unordered', cases },
}
