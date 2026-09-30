import type { ClassCall, ClassCase, ComparatorFactory, JsonValue } from '../types'

const push = (item: JsonValue, instance = 0): ClassCall => ({ instance, method: 'push', args: [item], ignoreReturn: true })
const size = (expected: number, instance = 0): ClassCall => ({ instance, property: 'size', expected })
const value = (method: 'peek' | 'pop', expected: JsonValue, instance = 0): ClassCall => ({ instance, method, args: [], expected })
const empty = (method: 'peek' | 'pop', instance = 0): ClassCall => ({ instance, method, args: [], expectedUndefined: true })
const numeric = (direction: 'asc' | 'desc', instance = 0): ComparatorFactory => ({ instance, argument: 1, kind: 'number', direction })
const priority = (direction: 'asc' | 'desc'): ComparatorFactory => ({ instance: 0, argument: 1, kind: 'property', property: 'priority', direction })
const low = { priority: -2, name: 'low' }
const mid = { priority: 3, name: 'mid' }
const high = { priority: 10, name: 'high' }

export const cases: ClassCase[] = [
  { name: 'Пустой вход и последующая вставка', instances: [[[]]], calls: [size(0), empty('peek'), empty('pop'), push(4), value('pop', 4), size(0), empty('pop')] },
  { name: 'Один элемент и неизменяемый вход', instances: [[[0]]], calls: [size(1), value('peek', 0), value('peek', 0), value('pop', 0), size(0), empty('peek'), push(-1), value('pop', -1)] },
  { name: 'Все внутренние узлы и правый потомок', instances: [[[9, 8, 7, 6, 5, 4, 1, 3, 2]]], calls: [size(9), value('peek', 1), ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => value('pop', n)), size(0), empty('pop')] },
  { name: 'Повторяющиеся минимумы', instances: [[[5, -2, 5, -2, 0]]], calls: [size(5), value('pop', -2), value('peek', -2), value('pop', -2), value('pop', 0), value('pop', 5), value('pop', 5), size(0)] },
  { name: 'Явное возрастание и чередование операций', instances: [[[3, 1, 2]]], factories: [numeric('asc')], calls: [value('pop', 1), push(-4), value('peek', -4), size(3), value('pop', -4), push(10), value('pop', 2), value('pop', 3), value('pop', 10), empty('peek')] },
  { name: 'Max-heap и новые элементы', instances: [[[1, 8, 2, 9, 0, 7]]], factories: [numeric('desc')], calls: [size(6), value('peek', 9), value('pop', 9), push(10), value('pop', 10), ...[8, 7, 2, 1, 0].map(n => value('pop', n)), empty('pop')] },
  { name: 'Объекты по возрастанию с идентичными повторами', instances: [[[high, low, mid, low]]], factories: [priority('asc')], calls: [size(4), value('peek', low), value('pop', low), value('pop', low), push(low), value('pop', low), value('pop', mid), value('pop', high), size(0)] },
  { name: 'Объекты по убыванию priority', instances: [[[low, high, mid]]], factories: [priority('desc')], calls: [value('peek', high), value('pop', high), push(high), value('pop', high), value('pop', mid), value('pop', low), empty('peek')] },
  { name: 'Два независимых результата с разными компараторами', instances: [[[4, 1, 7]], [[4, 1, 7]]], factories: [numeric('asc'), numeric('desc', 1)], calls: [value('peek', 1), value('peek', 7, 1), value('pop', 1), push(9, 1), size(2), size(4, 1), value('pop', 9, 1), value('pop', 4), value('pop', 7), size(0), value('pop', 7, 1), value('pop', 4, 1), value('pop', 1, 1), empty('peek', 1)] },
]
