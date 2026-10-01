import type { ClassCall, ClassCase } from '../types'

const push = (value: number, instance = 0): ClassCall => ({ instance, method: 'push', args: [value], ignoreReturn: true })
const size = (expected: number, instance = 0): ClassCall => ({ instance, property: 'size', expected })
const value = (method: 'peek' | 'pop', expected: number, instance = 0): ClassCall => ({ instance, method, args: [], expected })
const empty = (method: 'peek' | 'pop', instance = 0): ClassCall => ({ instance, method, args: [], expectedUndefined: true })

export const cases: ClassCase[] = [
  { name: 'Пустая куча', instances: [[]], calls: [size(0), empty('peek'), empty('pop'), empty('pop'), size(0)] },
  { name: 'Один элемент не воскресает', instances: [[]], calls: [push(0), size(1), value('peek', 0), value('peek', 0), size(1), value('pop', 0), size(0), empty('peek'), empty('pop')] },
  { name: 'Дубликаты минимума', instances: [[]], calls: [push(5), push(1), push(1), size(3), value('pop', 1), value('peek', 1), value('pop', 1), value('pop', 5), size(0)] },
  { name: 'Правый потомок меньше левого', instances: [[]], calls: [push(1), push(5), push(2), push(8), push(9), push(3), value('pop', 1), value('peek', 2), value('pop', 2), value('pop', 3), value('pop', 5), value('pop', 8), value('pop', 9), size(0)] },
  { name: 'Спуск и только левый потомок', instances: [[]], calls: [push(4), push(3), push(2), push(1), value('pop', 1), value('pop', 2), value('pop', 3), value('pop', 4), empty('pop')] },
  { name: 'Повторное использование и отрицательные', instances: [[]], calls: [push(-2), value('pop', -2), push(10), push(-10), push(2), value('pop', -10), value('peek', 2), size(2), push(0), value('pop', 0), value('pop', 2), value('pop', 10), size(0)] },
  { name: 'Независимые экземпляры', instances: [[], []], calls: [push(8), push(-3, 1), push(2), size(2), size(1, 1), value('pop', -3, 1), empty('peek', 1), value('peek', 2), push(4, 1), value('pop', 2), value('pop', 8), value('pop', 4, 1), size(0), size(0, 1)] },
]
