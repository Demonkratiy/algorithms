import type { ClassCall, ClassCase } from '../types'

const push = (value: number, instance = 0): ClassCall => ({ instance, method: 'push', args: [value], ignoreReturn: true })
const pop = (expected: number, instance = 0): ClassCall => ({ instance, method: 'pop', args: [], expected })
const peek = (expected: number, instance = 0): ClassCall => ({ instance, method: 'peek', args: [], expected })
const empty = (expected: boolean, instance = 0): ClassCall => ({ instance, method: 'empty', args: [], expected })

export const cases: ClassCase[] = [
  { name: 'Новая очередь пуста', instances: [[]], calls: [empty(true), empty(true)] },
  { name: 'FIFO и peek без удаления', instances: [[]], calls: [push(1), push(2), empty(false), peek(1), peek(1), pop(1), empty(false), pop(2), empty(true)] },
  { name: 'Добавление при непустом выходном стеке', instances: [[]], calls: [push(1), push(2), push(3), pop(1), push(4), peek(2), pop(2), push(5), pop(3), pop(4), peek(5), pop(5), empty(true)] },
  { name: 'Empty учитывает оба стека', instances: [[]], calls: [push(9), empty(false), peek(9), empty(false), push(1), pop(9), empty(false), pop(1), empty(true)] },
  { name: 'Опустошение и повторное использование', instances: [[]], calls: [push(1), pop(1), empty(true), push(9), peek(9), pop(9), empty(true)] },
  { name: 'Повторяющиеся значения', instances: [[]], calls: [push(2), push(2), push(1), pop(2), peek(2), pop(2), pop(1), empty(true)] },
  { name: 'Независимые экземпляры', instances: [[], []], calls: [push(1), empty(true, 1), push(9, 1), push(2), peek(1), peek(9, 1), pop(9, 1), empty(true, 1), empty(false), pop(1), pop(2), empty(true)] },
  {
    name: 'Большая детерминированная серия', instances: [[]],
    calls: [
      ...Array.from({ length: 40 }, (_, i) => push(i % 9 + 1)),
      peek(1),
      ...Array.from({ length: 40 }, (_, i) => pop(i % 9 + 1)),
      empty(true),
    ],
  },
]
