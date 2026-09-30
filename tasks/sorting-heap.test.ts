import { describe, expect, it } from 'vitest'
import { sortColorsTask } from './sort-colors/task'
import { mergeIntervalsTask } from './merge-intervals/task'
import { kthLargestTask } from './kth-largest/task'
import { meetingRoomsTask } from './meeting-rooms/task'
import { meetingRoomsIITask } from './meeting-rooms-ii/task'
import { mergeSortImplementationTask } from './merge-sort-implementation/task'
import { implementMinHeapTask } from './implement-min-heap/task'
import { heapComparatorTask } from './heap-comparator/task'
import { heapifyTask } from './heapify/task'
import { kClosestPointsTask } from './k-closest-points/task'
import type { ClassCase, ClassRunner, ComparatorFactory, FunctionCase, FunctionRunner, JsonValue } from './types'
import { sortingHeapSolutions, sortingHeapWrongSolutions } from '../tests/fixtures/sorting-heap'

const tasks = [sortColorsTask, mergeIntervalsTask, kthLargestTask, meetingRoomsTask, meetingRoomsIITask,
  mergeSortImplementationTask, implementMinHeapTask, heapComparatorTask, kClosestPointsTask, heapifyTask]

// Evaluate only trusted fixture/starter source, never serialized comparator strings.
const load = (source: string, entryPoint: string) => new Function(`${source}; return ${entryPoint};`)()
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const unorderedTuples = (a: unknown[]) => a.map(item => JSON.stringify(item)).sort()
const distance = (point: number[]) => point[0] ** 2 + point[1] ** 2

function closestAnswer(actual: unknown, args: JsonValue[]) {
  const [points, k] = args as [number[][], number]
  if (!Array.isArray(actual) || actual.length !== k) return false
  const available = points.map(point => [...point])
  const selected: number[] = []
  for (const point of actual) {
    if (!Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite)) return false
    const i = available.findIndex(candidate => equal(candidate, point))
    if (i < 0) return false
    available.splice(i, 1)
    selected.push(distance(point))
  }
  return available.every(point => selected.every(d => d <= distance(point)))
}

function answerMatches(runner: FunctionRunner, actual: unknown, sample: FunctionCase) {
  if (runner.comparison === 'closest-points') return closestAnswer(actual, sample.args)
  if (runner.comparison === 'unordered-tuples') {
    return Array.isArray(actual) && equal(unorderedTuples(actual), unorderedTuples(sample.expected as JsonValue[]))
  }
  return equal(actual, sample.expected)
}

function functionPasses(source: string, runner: FunctionRunner, sample: FunctionCase) {
  const args = structuredClone(sample.args)
  const result = load(source, runner.entryPoint)(...args)
  if (runner.preserveArgs?.some(index => !equal(args[index], sample.args[index]))) return false
  if (runner.freshArray && (!Array.isArray(result) || args.some(arg => arg === result))) return false
  return answerMatches(runner, runner.output.kind === 'return' ? result : args[runner.output.index], sample)
}

function makeComparator(factory?: ComparatorFactory) {
  return (a: JsonValue, b: JsonValue): number => {
    const read = (value: JsonValue) => factory?.kind === 'property'
      ? (value as Record<string, number>)[factory.property] : value as number
    return (factory?.direction === 'desc' ? -1 : 1) * (read(a) - read(b))
  }
}

function classPasses(source: string, runner: ClassRunner, sample: ClassCase) {
  const Constructor = load(source, runner.entryPoint)
  const args: unknown[][] = structuredClone(sample.instances)
  for (const factory of sample.factories ?? []) args[factory.instance][factory.argument] = makeComparator(factory)
  const preserved = () => args.every((values, instance) =>
    (runner.preserveArgs ?? []).every(index => equal(values[index], sample.instances[instance][index])))
  const instances = args.map(values => runner.factoryMethod
    ? Constructor[runner.factoryMethod](...values) : new Constructor(...values))
  if (!preserved()) return false
  return sample.calls.every(call => {
    const instance = instances[call.instance]
    const actual = call.property !== undefined ? instance[call.property] : instance[call.method](...structuredClone(call.args))
    return preserved() && (call.ignoreReturn === true || (call.expectedUndefined === true ? actual === undefined : equal(actual, call.expected)))
  })
}

function functionOracle(id: string, args: JsonValue[]): unknown {
  if (id === 'sort-colors') return [0, 1, 2].flatMap(color => (args[0] as number[]).filter(value => value === color))
  if (id === 'merge-sort-implementation') return [...args[0] as number[]].sort((a, b) => a - b)
  if (id === 'kth-largest') {
    const [nums, k] = args as [number[], number]
    return nums.find(value => nums.filter(x => x > value).length < k && nums.filter(x => x >= value).length >= k)
  }
  const intervals = structuredClone(args[0]) as number[][]
  if (id === 'meeting-rooms') {
    return intervals.every(([a, b], i) => intervals.every(([c, d], j) => i === j || a >= d || c >= b))
  }
  if (id === 'meeting-rooms-ii') {
    return intervals.reduce((best, [start]) => Math.max(best, intervals.filter(([a, b]) => a <= start && start < b).length), 0)
  }
  if (id === 'merge-intervals') {
    for (;;) {
      let changed = false
      outer: for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
          const a = intervals[i], b = intervals[j]
          if (a[0] <= b[1] && b[0] <= a[1]) {
            intervals[i] = [Math.min(a[0], b[0]), Math.max(a[1], b[1])]
            intervals.splice(j, 1)
            changed = true
            break outer
          }
        }
      }
      if (!changed) return intervals
    }
  }
  throw new Error(`No scalar oracle for ${id}`)
}

function assertFunctionDomain(id: string, args: JsonValue[]) {
  const isRank = id === 'kth-largest' || id === 'k-closest-points'
  expect(args).toHaveLength(isRank ? 2 : 1)
  const input = args[0] as JsonValue[]
  expect(Array.isArray(input)).toBe(true)
  expect(input.length).toBeGreaterThanOrEqual(['meeting-rooms', 'meeting-rooms-ii', 'merge-sort-implementation'].includes(id) ? 0 : 1)
  expect(input.length).toBeLessThanOrEqual(id === 'sort-colors' ? 300 : id === 'kth-largest' ? 100000 : 10000)
  if (isRank) {
    expect(Number.isInteger(args[1])).toBe(true)
    expect(args[1]).toBeGreaterThanOrEqual(1)
    expect(args[1]).toBeLessThanOrEqual(input.length)
  }
  for (const item of input) {
    if (id === 'sort-colors') expect([0, 1, 2]).toContain(item)
    else if (id === 'kth-largest' || id === 'merge-sort-implementation') {
      expect(typeof item === 'number' && Number.isFinite(item)).toBe(true)
      if (id === 'kth-largest') {
        expect(Number.isInteger(item)).toBe(true)
        expect(Math.abs(item as number)).toBeLessThanOrEqual(10000)
      }
    } else {
      expect(item).toHaveLength(2)
      const [a, b] = item as number[]
      expect(Number.isInteger(a) && Number.isInteger(b)).toBe(true)
      if (id === 'k-closest-points') {
        expect(Math.max(Math.abs(a), Math.abs(b))).toBeLessThanOrEqual(10000)
      } else {
        expect(a).toBeGreaterThanOrEqual(0)
        expect(b).toBeLessThanOrEqual(id === 'merge-intervals' ? 10000 : 1000000)
        expect(id === 'merge-intervals' ? a <= b : a < b).toBe(true)
      }
    }
  }
}

function assertClassModel(id: string, sample: ClassCase) {
  const isHeapify = id === 'heapify'
  const states: JsonValue[][] = sample.instances.map(args => isHeapify ? structuredClone(args[0]) as JsonValue[] : [])
  expect(states.length).toBeGreaterThan(0)
  sample.instances.forEach(args => {
    if (isHeapify) {
      expect(args).toHaveLength(1)
      expect(Array.isArray(args[0])).toBe(true)
    } else expect(args).toEqual([])
  })
  if (id === 'implement-min-heap') expect(sample.factories).toBeUndefined()
  const factories = sample.factories ?? []
  expect(new Set(factories.map(f => `${f.instance}:${f.argument}`)).size).toBe(factories.length)
  for (const factory of factories) {
    expect(Number.isInteger(factory.instance) && factory.instance >= 0 && factory.instance < states.length).toBe(true)
    expect(factory.argument).toBe(isHeapify ? 1 : 0)
    expect(['asc', 'desc']).toContain(factory.direction)
    expect(['number', 'property']).toContain(factory.kind)
    if (factory.kind === 'property') expect(factory.property).toBe('priority')
  }
  states.forEach((state, instance) => {
    const factory = factories.find(f => f.instance === instance)
    for (const item of state) {
      if (factory?.kind === 'property') {
        const priority = (item as Record<string, JsonValue>).priority
        expect(typeof priority === 'number' && Number.isFinite(priority)).toBe(true)
        for (const other of state) if (makeComparator(factory)(item, other) === 0) expect(item).toEqual(other)
      } else expect(typeof item === 'number' && Number.isFinite(item)).toBe(true)
    }
  })
  for (const call of sample.calls) {
    expect(Number.isInteger(call.instance) && call.instance >= 0 && call.instance < states.length).toBe(true)
    expect([call.ignoreReturn === true, call.expectedUndefined === true, 'expected' in call].filter(Boolean)).toHaveLength(1)
    const state = states[call.instance]
    const factory = factories.find(f => f.instance === call.instance)
    const compare = makeComparator(factory)
    let actual: unknown
    if (call.property !== undefined) {
      expect(call.property).toBe('size')
      expect(call.args).toBeUndefined()
      actual = state.length
    } else {
      expect(['push', 'pop', 'peek']).toContain(call.method)
      expect(call.args).toHaveLength(call.method === 'push' ? 1 : 0)
      if (call.method === 'push') {
        expect(call.ignoreReturn).toBe(true)
        const item = call.args[0]
        if (factory?.kind === 'property') {
          const priority = (item as Record<string, JsonValue>).priority
          expect(typeof priority === 'number' && Number.isFinite(priority)).toBe(true)
          for (const stored of state) if (compare(stored, item) === 0) expect(stored).toEqual(item)
        } else expect(typeof item === 'number' && Number.isFinite(item)).toBe(true)
        state.push(structuredClone(item))
        continue
      }
      const best = state.reduce<number>((winner, value, i) => winner < 0 || compare(value, state[winner]) < 0 ? i : winner, -1)
      actual = best < 0 ? undefined : state[best]
      if (call.method === 'pop' && best >= 0) state.splice(best, 1)
    }
    expect(call.ignoreReturn).toBeUndefined()
    if (actual === undefined) expect(call.expectedUndefined).toBe(true)
    else {
      expect(call.expectedUndefined).toBeUndefined()
      expect(equal(actual, call.expected)).toBe(true)
    }
  }
}

describe.each(tasks)('$id', task => {
  it('has named valid cases, neutral starter and explicit complexity goals', () => {
    const runner = task.runner
    expect(runner.cases.length).toBeGreaterThanOrEqual(6)
    expect(new Set(runner.cases.map(c => c.name)).size).toBe(runner.cases.length)
    expect(runner.cases.every(c => c.name.trim().length > 0)).toBe(true)
    expect(task.starter).toContain('TODO')
    expect(task.starter).not.toMatch(/\breturn\b/)
    expect(typeof load(task.starter, runner.entryPoint)).toBe('function')
    const ids = task.complexity.options.map(option => option.id)
    expect(ids).toContain('unknown')
    expect(new Set(ids).size).toBe(ids.length)
    expect(task.complexity.criteria.some(c => c.id.includes('time'))).toBe(true)
    expect(task.complexity.criteria.some(c => c.id === 'space')).toBe(true)
    for (const criterion of task.complexity.criteria) {
      for (const option of [criterion.expected, ...(criterion.accepted ?? [])]) {
        expect(ids).toContain(option)
        expect(option).not.toBe('unknown')
      }
      expect(criterion.explanation.length).toBeGreaterThan(0)
    }
    expect(task.verificationNote).toBeTruthy()
  })

  const runner = task.runner
  if (runner.kind === 'function') {
    for (const sample of runner.cases) {
      it(`${sample.name}: domain, independent oracle, trusted fixture`, () => {
        assertFunctionDomain(task.id, sample.args)
        if (runner.comparison === 'closest-points') expect(closestAnswer(sample.expected, sample.args)).toBe(true)
        else expect(answerMatches(runner, functionOracle(task.id, sample.args), sample)).toBe(true)
        expect(functionPasses(sortingHeapSolutions[task.id], runner, sample)).toBe(true)
      })
    }
  } else if (runner.kind === 'class') {
    for (const sample of runner.cases) {
      it(`${sample.name}: valid operations, independent model, trusted fixture`, () => {
        assertClassModel(task.id, sample)
        expect(classPasses(sortingHeapSolutions[task.id], runner, sample)).toBe(true)
      })
    }
  }

  for (const [index, source] of sortingHeapWrongSolutions[task.id].entries()) {
    it(`rejects wrong variant ${index + 1}`, () => {
      const failures = runner.cases.filter(sample => {
        try {
          if (runner.kind === 'function') return !functionPasses(source, runner, sample as FunctionCase)
          if (runner.kind === 'class') return !classPasses(source, runner, sample as ClassCase)
          throw new Error('Unexpected runner')
        } catch { return true }
      })
      expect(failures.length).toBeGreaterThan(0)
    })
  }
})

describe('local contract checks, independent of registry and runtime', () => {
  it('uses the static heapify factory, preserves input and accepts a correct slower builder', () => {
    const runner = heapifyTask.runner as ClassRunner
    expect(runner.factoryMethod).toBe('heapify')
    expect(runner.preserveArgs).toEqual([0])
    expect(heapifyTask.starter).toContain('static heapify(array, compare = (a, b) => a - b)')
    const pushBased = `${sortingHeapSolutions.heapify}
      MinHeap.heapify = function(array, compare = (a,b) => a-b) {
        const heap = new MinHeap(compare);
        for (const value of array) heap.push(value);
        return heap;
      };`
    for (const sample of runner.cases) expect(classPasses(pushBased, runner, sample)).toBe(true)
  })

  it('detects input aliasing that only becomes visible after heap operations', () => {
    const runner = heapifyTask.runner as ClassRunner
    const alias = sortingHeapSolutions.heapify.replace('heap.items = [...array];', 'heap.items = array;')
    const sample: ClassCase = {
      name: 'Already ordered input is still not heap storage',
      instances: [[[1, 2, 3]]],
      calls: [{ instance: 0, method: 'pop', args: [], expected: 1 }],
    }
    expect(classPasses(alias, runner, sample)).toBe(false)
  })

  it('separates base and bonus heap contracts', () => {
    expect(implementMinHeapTask.starter).not.toContain('compare')
    expect(heapComparatorTask.starter).toContain('constructor(compare = (a, b) => a - b)')
    expect(meetingRoomsTask.starter).not.toContain('minMeetingRooms')
    expect(meetingRoomsIITask.starter).not.toContain('canAttendMeetings')
    expect(mergeSortImplementationTask.starter).toContain('function merge(a, b)')
    expect(mergeSortImplementationTask.runner.entryPoint).toBe('mergeSort')
  })

  it('accepts alternate boundary ties but enforces membership, multiplicity and nearest distances', () => {
    const args: JsonValue[] = [[[0, 0], [1, 0], [1, 0], [-1, 0], [0, 1], [3, 3]], 3]
    expect(closestAnswer([[0, 1], [-1, 0], [0, 0]], args)).toBe(true)
    expect(closestAnswer([[1, 0], [0, 0], [1, 0]], args)).toBe(true)
    expect(closestAnswer([[1, 0], [1, 0], [1, 0]], args)).toBe(false)
    expect(closestAnswer([[0, 0], [1, 0], [0, -1]], args)).toBe(false)
    expect(closestAnswer([[0, 0], [1, 0], [3, 3]], args)).toBe(false)
    expect(closestAnswer([[1, 0], [-1, 0], [0, 1]], args)).toBe(false)
    expect(closestAnswer([[0, 0]], args)).toBe(false)
  })

  it('compares interval outer order only', () => {
    const runner = mergeIntervalsTask.runner as FunctionRunner
    const sample: FunctionCase = { name: 'local', args: [[[1, 2], [5, 6]]], expected: [[1, 2], [5, 6]] }
    expect(answerMatches(runner, [[5, 6], [1, 2]], sample)).toBe(true)
    expect(answerMatches(runner, [[2, 1], [5, 6]], sample)).toBe(false)
  })
})
