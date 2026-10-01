import type { ClassCall, ClassCase } from '../types'

const push = (value: number, instance = 0): ClassCall => ({ instance, method: 'push', args: [value], ignoreReturn: true })
const pop = (instance = 0): ClassCall => ({ instance, method: 'pop', args: [], ignoreReturn: true })
const top = (expected: number, instance = 0): ClassCall => ({ instance, method: 'top', args: [], expected })
const min = (expected: number, instance = 0): ClassCall => ({ instance, method: 'getMin', args: [], expected })

export const cases: ClassCase[] = [
  { name: 'Откат минимума', instances: [[]], calls: [push(-2), push(0), push(-3), min(-3), pop(), top(0), min(-2)] },
  { name: 'Дубликаты минимума', instances: [[]], calls: [push(5), push(2), push(2), min(2), pop(), min(2), top(2), pop(), min(5)] },
  { name: 'Top не удаляет и не равен минимуму', instances: [[]], calls: [push(-5), push(7), top(7), top(7), min(-5), min(-5), pop(), top(-5)] },
  { name: 'Опустошение и повторное использование', instances: [[]], calls: [push(-8), pop(), push(9), min(9), top(9), pop(), push(0), min(0)] },
  { name: 'Границы int32', instances: [[]], calls: [push(2147483647), push(-2147483648), min(-2147483648), top(-2147483648), pop(), min(2147483647), top(2147483647)] },
  { name: 'Независимые экземпляры', instances: [[], []], calls: [push(4), push(-7, 1), push(2), min(2), min(-7, 1), top(2), top(-7, 1), pop(), top(4), push(6, 1), top(6, 1), min(-7, 1), min(4)] },
  {
    name: 'Длинный спуск и восстановление минимумов', instances: [[]],
    calls: [
      ...Array.from({ length: 512 }, (_, i) => push(512 - i)),
      ...Array.from({ length: 511 }, (_, i) => [min(i + 1), top(i + 1), pop()]).flat(),
      min(512), top(512),
    ],
  },
]
