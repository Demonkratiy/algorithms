import type { ClassCall, ClassCase, ComparatorFactory, JsonValue } from '../types'

const push = (item: JsonValue, instance = 0): ClassCall => ({ instance, method: 'push', args: [item], ignoreReturn: true })
const size = (expected: number, instance = 0): ClassCall => ({ instance, property: 'size', expected })
const value = (method: 'peek' | 'pop', expected: JsonValue, instance = 0): ClassCall => ({ instance, method, args: [], expected })
const empty = (method: 'peek' | 'pop', instance = 0): ClassCall => ({ instance, method, args: [], expectedUndefined: true })
const numeric = (direction: 'asc' | 'desc', instance = 0): ComparatorFactory => ({ instance, argument: 0, kind: 'number', direction })
const priority = (direction: 'asc' | 'desc'): ComparatorFactory => ({ instance: 0, argument: 0, kind: 'property', property: 'priority', direction })
const low = { priority: -2, name: 'low' }
const mid = { priority: 3, name: 'mid' }
const high = { priority: 10, name: 'high' }

export const cases: ClassCase[] = [
  { name: 'Компаратор по умолчанию', instances: [[]], calls: [push(10), push(2), value('pop', 2), value('pop', 10), size(0)] },
  { name: 'Явное возрастание и правый потомок', instances: [[]], factories: [numeric('asc')], calls: [push(1), push(5), push(2), push(8), push(9), push(3), value('pop', 1), value('pop', 2), value('pop', 3), value('pop', 5), value('pop', 8), value('pop', 9), size(0)] },
  { name: 'Убывание, правый потомок и дубликаты', instances: [[]], factories: [numeric('desc')], calls: [push(9), push(5), push(8), push(1), push(0), push(7), value('pop', 9), value('peek', 8), push(8), value('pop', 8), value('pop', 8), value('pop', 7), value('pop', 5), value('pop', 1), value('pop', 0), size(0)] },
  { name: 'Пустая и одноэлементная max-heap', instances: [[]], factories: [numeric('desc')], calls: [empty('peek'), empty('pop'), size(0), push(-5), value('peek', -5), value('peek', -5), size(1), value('pop', -5), empty('pop'), size(0), push(0), value('pop', 0), empty('peek')] },
  { name: 'Объекты по возрастанию priority', instances: [[]], factories: [priority('asc')], calls: [push(high), push(low), push(mid), value('peek', low), size(3), value('pop', low), value('pop', mid), value('pop', high), empty('peek')] },
  { name: 'Объекты по убыванию priority', instances: [[]], factories: [priority('desc')], calls: [push(low), push(mid), push(high), value('peek', high), value('pop', high), value('pop', mid), value('pop', low), size(0)] },
  { name: 'Идентичные объекты с равным priority', instances: [[]], factories: [priority('asc')], calls: [push(mid), push(low), push(low), value('pop', low), value('peek', low), value('pop', low), value('pop', mid), empty('pop')] },
  { name: 'Независимые данные и компараторы', instances: [[], []], factories: [numeric('asc'), numeric('desc', 1)], calls: [push(1), push(8), push(1, 1), push(8, 1), value('peek', 1), value('peek', 8, 1), value('pop', 1), size(1), size(2, 1), value('pop', 8, 1), value('pop', 8), value('pop', 1, 1), empty('peek'), empty('peek', 1)] },
]
