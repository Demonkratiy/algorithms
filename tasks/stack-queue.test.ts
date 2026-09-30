import { describe, expect, it } from 'vitest'
import { validParenthesesTask } from './valid-parentheses/task'
import { minStackTask } from './min-stack/task'
import { dailyTemperaturesTask } from './daily-temperatures/task'
import { evaluateRpnTask } from './evaluate-rpn/task'
import { queueViaStacksTask } from './queue-via-stacks/task'
import type { ClassCase, ClassRunner, FunctionRunner, JsonValue } from './types'
import { stackQueueSolutions, stackQueueWrongSolutions } from '../tests/fixtures/stack-queue'

const tasks = [validParenthesesTask, minStackTask, dailyTemperaturesTask, evaluateRpnTask, queueViaStacksTask]

// Runs only trusted fixtures, independently of the app runner and registry.
function load(source: string, entryPoint: string) {
  return new Function(`${source}; return ${entryPoint};`)()
}

function equal(actual: unknown, expected: unknown) {
  // JSON number semantics: -0 and 0 are the same answer.
  return JSON.stringify(actual) === JSON.stringify(expected)
}

function functionOracle(id: string, args: JsonValue[]): unknown {
  if (id === 'valid-parentheses') {
    let text = args[0] as string
    for (;;) {
      const reduced = text.replace(/\(\)|\[\]|\{\}/g, '')
      if (reduced === text) return text.length === 0
      text = reduced
    }
  }
  if (id === 'daily-temperatures') {
    const temperatures = args[0] as number[]
    return temperatures.map((temperature, i) => {
      const next = temperatures.findIndex((value, j) => j > i && value > temperature)
      return next < 0 ? 0 : next - i
    })
  }
  const expression: (number | string)[] = (args[0] as string[]).map(token =>
    /^-?\d+$/.test(token) ? Number(token) : token)
  while (expression.length > 1) {
    const i = expression.findIndex(item => typeof item === 'string')
    const a = expression[i - 2] as number
    const b = expression[i - 1] as number
    const op = expression[i]
    const value = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b
      : Math.sign(a / b) * Math.floor(Math.abs(a / b))
    expression.splice(i - 2, 3, value)
  }
  return expression[0]
}

function assertFunctionDomain(id: string, args: JsonValue[]) {
  expect(args).toHaveLength(1)
  if (id === 'valid-parentheses') {
    expect(args[0]).toMatch(/^[()[\]{}]*$/)
    expect((args[0] as string).length).toBeLessThanOrEqual(10000)
  } else if (id === 'daily-temperatures') {
    const temperatures = args[0] as number[]
    expect(temperatures.length).toBeGreaterThanOrEqual(1)
    expect(temperatures.length).toBeLessThanOrEqual(100000)
    expect(temperatures.every(value => Number.isInteger(value) && value >= 30 && value <= 100)).toBe(true)
  } else {
    const tokens = args[0] as string[]
    expect(tokens.length).toBeGreaterThanOrEqual(1)
    expect(tokens.length).toBeLessThanOrEqual(10000)
    const operands: number[] = []
    for (const token of tokens) {
      if (/^-?\d+$/.test(token)) {
        const value = Number(token)
        expect(Number.isInteger(value) && value >= -200 && value <= 200).toBe(true)
        operands.push(value)
      } else {
        expect(['+', '-', '*', '/']).toContain(token)
        expect(operands.length).toBeGreaterThanOrEqual(2)
        const b = operands.pop()!
        const a = operands.pop()!
        if (token === '/') expect(b).not.toBe(0)
        const value = token === '+' ? a + b : token === '-' ? a - b : token === '*' ? a * b : Math.trunc(a / b)
        expect(Number.isSafeInteger(value)).toBe(true)
        operands.push(value)
      }
    }
    expect(operands).toHaveLength(1)
  }
}

function verifyClassModel(id: string, sample: ClassCase) {
  const isStack = id === 'min-stack'
  expect(sample.instances.length).toBeGreaterThan(0)
  sample.instances.forEach(args => expect(args).toEqual([]))
  expect(sample.calls.some(call => 'expected' in call)).toBe(true)
  expect(sample.calls.length).toBeLessThanOrEqual(isStack ? 30000 : 100)
  const states = sample.instances.map(() => [] as number[])
  for (const call of sample.calls) {
    if (call.property !== undefined) throw new Error('Stack/Queue fixtures use methods, not property reads.')
    expect(Number.isInteger(call.instance) && call.instance >= 0 && call.instance < states.length).toBe(true)
    expect(isStack ? ['push', 'pop', 'top', 'getMin'] : ['push', 'pop', 'peek', 'empty']).toContain(call.method)
    const state = states[call.instance]
    const ignored = call.method === 'push' || (isStack && call.method === 'pop')
    expect(call.ignoreReturn === true).toBe(ignored)
    expect('expected' in call).toBe(!ignored)
    if (call.method === 'push') {
      expect(call.args).toHaveLength(1)
      const value = call.args[0] as number
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(isStack ? -2147483648 : 1)
      expect(value).toBeLessThanOrEqual(isStack ? 2147483647 : 9)
      state.push(value)
      continue
    }
    expect(call.args).toEqual([])
    if (call.method !== 'empty') expect(state.length).toBeGreaterThan(0)
    let actual: unknown
    switch (call.method) {
      case 'pop': actual = isStack ? state.pop() : state.shift(); break
      case 'top': actual = state.at(-1); break
      case 'getMin': actual = Math.min(...state); break
      case 'peek': actual = state[0]; break
      case 'empty': actual = state.length === 0; break
    }
    if (!ignored) expect(equal(actual, call.expected)).toBe(true)
  }
}

function classPasses(source: string, runner: ClassRunner, sample: ClassCase) {
  const Constructor = load(source, runner.entryPoint)
  const instances = sample.instances.map(args => new Constructor(...structuredClone(args)))
  return sample.calls.every(call => {
    const actual = call.property !== undefined ? instances[call.instance][call.property]
      : instances[call.instance][call.method](...structuredClone(call.args))
    return call.ignoreReturn === true || (call.expectedUndefined ? actual === undefined : equal(actual, call.expected))
  })
}

function functionPasses(source: string, runner: FunctionRunner, args: JsonValue[], expected: JsonValue) {
  return equal(load(source, runner.entryPoint)(...structuredClone(args)), expected)
}

describe.each(tasks)('$id', task => {
  it('provides named cases, neutral signatures and goal-only complexity', () => {
    const runner = task.runner
    expect(runner.cases.length).toBeGreaterThanOrEqual(6)
    expect(new Set(runner.cases.map(sample => sample.name)).size).toBe(runner.cases.length)
    expect(runner.cases.every(sample => sample.name.trim().length > 0)).toBe(true)
    expect(task.starter).toContain('TODO')
    expect(task.starter).not.toMatch(/\breturn\b/)
    expect(task.starter).toContain(`${runner.kind === 'class' ? 'class' : 'function'} ${runner.entryPoint}`)
    expect(typeof load(task.starter, runner.entryPoint)).toBe('function')
    const ids = task.complexity.options.map(option => option.id)
    expect(ids).toContain('unknown')
    expect(new Set(ids).size).toBe(ids.length)
    for (const criterion of task.complexity.criteria) {
      expect(ids).toContain(criterion.expected)
      expect(criterion.expected).not.toBe('unknown')
      expect(criterion.accepted ?? []).toEqual([])
      expect(criterion.explanation.length).toBeGreaterThan(0)
    }
    if (runner.kind === 'function') {
      expect(task.complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space'])
      expect(task.complexity.criteria.map(criterion => criterion.expected)).toEqual(['linear', 'linear'])
      expect(runner.output).toEqual({ kind: 'return' })
      expect(runner.comparison).toBe('exact')
    }
  })

  const runner = task.runner
  if (runner.kind === 'function') {
    for (const sample of runner.cases) {
      it(`${sample.name}: domain, independent answer and reference`, () => {
        assertFunctionDomain(task.id, sample.args)
        expect(equal(functionOracle(task.id, sample.args), sample.expected)).toBe(true)
        expect(functionPasses(stackQueueSolutions[task.id], runner, sample.args, sample.expected)).toBe(true)
      })
    }
  } else if (runner.kind === 'class') {
    for (const sample of runner.cases) {
      it(`${sample.name}: valid operations, independent state model and reference`, () => {
        verifyClassModel(task.id, sample)
        expect(classPasses(stackQueueSolutions[task.id], runner, sample)).toBe(true)
      })
    }
  }

  it('rejects every typical wrong fixture', () => {
    expect(stackQueueWrongSolutions[task.id].length).toBeGreaterThan(0)
    for (const source of stackQueueWrongSolutions[task.id]) {
      const rejected = runner.cases.some(sample => {
        try {
          if (runner.kind === 'function' && 'args' in sample && 'expected' in sample) {
            return !functionPasses(source, runner, sample.args as JsonValue[], sample.expected as JsonValue)
          }
          if (runner.kind === 'class' && 'calls' in sample) return !classPasses(source, runner, sample)
          throw new Error('Unexpected task kind')
        } catch {
          return true
        }
      })
      expect(rejected).toBe(true)
    }
  })
})

it.each([minStackTask, queueViaStacksTask])('$id accepts harmless unspecified returns', task => {
  if (task.runner.kind !== 'class') throw new Error('Expected a class')
  const source = stackQueueSolutions[task.id]
  const returning = task.id === 'min-stack'
    ? source.replace('this.values.pop();', 'return this.values.pop();')
      .replace('this.mins.push(Math.min(val, this.mins.at(-1) ?? Infinity));', 'return this.mins.push(Math.min(val, this.mins.at(-1) ?? Infinity));')
    : source.replace('this.input.push(x);', 'return this.input.push(x);')
  for (const sample of task.runner.cases) expect(classPasses(returning, task.runner, sample)).toBe(true)
})

it('distinguishes amortized queue cost from the worst individual call', () => {
  const goals = Object.fromEntries(queueViaStacksTask.complexity.criteria.map(c => [c.id, c.expected]))
  expect(goals).toEqual({
    'push-time': 'constant', 'pop-amortized': 'constant', 'peek-amortized': 'constant',
    'pop-worst': 'linear', 'peek-worst': 'linear', 'empty-time': 'constant', space: 'linear',
  })
  expect(minStackTask.complexity.criteria.map(c => [c.id, c.expected])).toEqual([
    ['push-time', 'constant'], ['pop-time', 'constant'], ['top-time', 'constant'],
    ['min-time', 'constant'], ['space', 'linear'],
  ])
})
