import { describe, expect, it } from 'vitest'
import { firstUniqueCharTask } from './first-unique-char/task'
import { validAnagramTask } from './valid-anagram/task'
import { groupAnagramsTask } from './group-anagrams/task'
import { topKFrequentTask } from './top-k-frequent/task'
import { subarraySumKTask } from './subarray-sum-k/task'
import { pivotIndexTask } from './pivot-index/task'
import { productExceptSelfTask } from './product-except-self/task'
import { subarraySumsDivisibleByKTask } from './subarray-sums-divisible-by-k/task'
import type { Comparison, JsonValue } from './types'
import { counterPrefixSolutions, counterPrefixWrongSolutions } from '../tests/fixtures/counter-prefix'

const tasks = [
  firstUniqueCharTask, validAnagramTask, groupAnagramsTask, topKFrequentTask,
  subarraySumKTask, pivotIndexTask, productExceptSelfTask, subarraySumsDivisibleByKTask,
]

// This pure harness executes only checked-in trusted fixtures, never learner input.
function execute(source: string, entryPoint: string, args: JsonValue[]): unknown {
  return new Function(`${source}; return ${entryPoint};`)()(...structuredClone(args))
}

function canonical(value: unknown, comparison: Comparison): string | undefined {
  if (comparison === 'unordered' && Array.isArray(value)) return JSON.stringify(value.map(item => JSON.stringify(item)).sort())
  if (comparison === 'nested-unordered' && Array.isArray(value)) {
    return JSON.stringify(value.map(group => Array.isArray(group)
      ? JSON.stringify(group.map(item => JSON.stringify(item)).sort())
      : JSON.stringify(group)).sort())
  }
  // JSON numeric semantics intentionally treat -0 and 0 as the same result.
  return JSON.stringify(value)
}

function bruteSubarrays(nums: number[], predicate: (sum: number) => boolean): number {
  let count = 0
  for (let left = 0; left < nums.length; left++) {
    let sum = 0
    for (let right = left; right < nums.length; right++) {
      sum += nums[right]
      if (predicate(sum)) count++
    }
  }
  return count
}

function independentExpected(id: string, args: JsonValue[]): unknown {
  const nums = args[0] as number[]
  const k = args[1] as number
  switch (id) {
    case 'first-unique-char': {
      const s = args[0] as string
      return [...s].findIndex(ch => s.indexOf(ch) === s.lastIndexOf(ch))
    }
    case 'valid-anagram':
      return [...args[0] as string].sort().join('') === [...args[1] as string].sort().join('')
    case 'group-anagrams': {
      const groups: Record<string, string[]> = Object.create(null)
      for (const word of args[0] as string[]) {
        const key = [...word].sort().join('')
        ;(groups[key] ??= []).push(word)
      }
      return Object.values(groups)
    }
    case 'top-k-frequent':
      return [...new Set(nums)].sort((a, b) =>
        nums.filter(n => n === b).length - nums.filter(n => n === a).length).slice(0, k)
    case 'subarray-sum-k':
      return bruteSubarrays(nums, sum => sum === k)
    case 'pivot-index':
      return nums.findIndex((_, i) =>
        nums.slice(0, i).reduce((a, b) => a + b, 0) === nums.slice(i + 1).reduce((a, b) => a + b, 0))
    case 'product-except-self':
      return nums.map((_, i) => nums.reduce((product, value, j) => i === j ? product : product * value, 1))
    case 'subarray-sums-divisible-by-k':
      return bruteSubarrays(nums, sum => sum % k === 0)
    default:
      throw new Error(`Missing oracle: ${id}`)
  }
}

function assertIntegerArray(nums: number[], minLength: number, maxLength: number, min?: number, max?: number) {
  expect(nums.length).toBeGreaterThanOrEqual(minLength)
  expect(nums.length).toBeLessThanOrEqual(maxLength)
  expect(nums.every(n => Number.isSafeInteger(n) && (min === undefined || n >= min) && (max === undefined || n <= max))).toBe(true)
}

function assertDomain(id: string, args: JsonValue[]) {
  if (id === 'first-unique-char' || id === 'valid-anagram') {
    for (const s of args as string[]) {
      expect(s).toMatch(/^[a-z]+$/)
      expect(s.length).toBeLessThanOrEqual(id === 'first-unique-char' ? 100000 : 50000)
    }
    return
  }
  if (id === 'group-anagrams') {
    const words = args[0] as string[]
    expect(words.length).toBeGreaterThanOrEqual(1)
    expect(words.length).toBeLessThanOrEqual(10000)
    expect(words.every(word => /^[a-z]*$/.test(word) && word.length <= 100)).toBe(true)
    return
  }
  const nums = args[0] as number[]
  const k = args[1] as number
  if (id === 'top-k-frequent') {
    assertIntegerArray(nums, 1, 100000)
    const frequencies = [...new Set(nums)].map(n => nums.filter(value => value === n).length).sort((a, b) => b - a)
    expect(Number.isInteger(k)).toBe(true)
    expect(k).toBeGreaterThanOrEqual(1)
    expect(k).toBeLessThanOrEqual(frequencies.length)
    if (k < frequencies.length) expect(frequencies[k - 1]).toBeGreaterThan(frequencies[k])
  } else if (id === 'subarray-sum-k') {
    assertIntegerArray(nums, 1, 20000, -1000, 1000)
    expect(Number.isInteger(k) && Math.abs(k) <= 10000000).toBe(true)
  } else if (id === 'pivot-index') {
    assertIntegerArray(nums, 1, 10000, -1000, 1000)
  } else if (id === 'product-except-self') {
    assertIntegerArray(nums, 2, 100000)
    for (const values of [nums, [...nums].reverse()]) {
      let product = 1n
      for (const n of values) {
        product *= BigInt(n)
        expect(product >= -2147483648n && product <= 2147483647n).toBe(true)
      }
    }
  } else {
    assertIntegerArray(nums, 1, 30000, -10000, 10000)
    expect(Number.isInteger(k) && k >= 2 && k <= 10000).toBe(true)
  }
}

describe.each(tasks)('$id', task => {
  const runner = task.runner
  if (runner.kind !== 'function') throw new Error('Expected a function task')

  it('has neutral starter, task-local cases and selectable complexity criteria', () => {
    expect(runner.cases.length).toBeGreaterThanOrEqual(6)
    expect(new Set(runner.cases.map(item => item.name)).size).toBe(runner.cases.length)
    expect(task.starter).toContain(`function ${runner.entryPoint}(`)
    expect(task.starter).toContain('TODO')
    expect(task.starter).not.toMatch(/\breturn\b/)
    expect(task.complexity.criteria.map(item => item.id)).toEqual(['time', 'space'])
    const optionIds = task.complexity.options.map(item => item.id)
    expect(optionIds).toContain('unknown')
    for (const criterion of task.complexity.criteria) {
      for (const id of [criterion.expected, ...criterion.accepted ?? []]) {
        expect(optionIds).toContain(id)
        expect(id).not.toBe('unknown')
      }
    }
  })

  for (const sample of runner.cases) {
    it(`${sample.name}: valid domain, independently verified answer and reference`, () => {
      assertDomain(task.id, sample.args)
      expect(canonical(independentExpected(task.id, sample.args), runner.comparison))
        .toBe(canonical(sample.expected, runner.comparison))
      expect(canonical(execute(counterPrefixSolutions[task.id], runner.entryPoint, sample.args), runner.comparison))
        .toBe(canonical(sample.expected, runner.comparison))
    })
  }

  it('rejects every typical wrong fixture on at least one case', () => {
    expect(counterPrefixWrongSolutions[task.id].length).toBeGreaterThan(0)
    for (const source of counterPrefixWrongSolutions[task.id]) {
      expect(runner.cases.some(sample =>
        canonical(execute(source, runner.entryPoint, sample.args), runner.comparison)
          !== canonical(sample.expected, runner.comparison))).toBe(true)
    }
  })
})

it.each([firstUniqueCharTask, validAnagramTask])('$id accepts both fixed-alphabet and distinct-symbol space', task => {
  const criterion = task.complexity.criteria.find(item => item.id === 'space')
  expect(criterion).toBeDefined()
  expect(criterion?.expected).toBe('constant')
  expect(criterion?.accepted).toContain('distinct-symbols')
})

it('keeps unordered comparison local to the two tasks that permit it', () => {
  for (const task of tasks) {
    if (task.runner.kind !== 'function') throw new Error('Expected function runner')
    expect(task.runner.comparison).toBe(task.id === 'group-anagrams'
      ? 'nested-unordered' : task.id === 'top-k-frequent' ? 'unordered' : 'exact')
  }
  expect(canonical([['ab', 'ba'], ['x']], 'nested-unordered'))
    .toBe(canonical([['x'], ['ba', 'ab']], 'nested-unordered'))
  expect(canonical([['ab', 'ab']], 'nested-unordered'))
    .not.toBe(canonical([['ab']], 'nested-unordered'))
  expect(canonical([['ab'], ['ba']], 'nested-unordered'))
    .not.toBe(canonical([['ab', 'ba']], 'nested-unordered'))
})
