import { isDeepStrictEqual } from 'node:util';
import { describe, expect, it } from 'vitest';
import { fibonacciMemoTask } from './fibonacci-memo/task';
import { powerTask } from './power-and-reverse/task';
import { reverseStringTask } from './reverse-string/task';
import { subsetsTask } from './subsets/task';
import { permutationsTask } from './permutations/task';
import { flattenNestedTask } from './flatten-nested/task';
import { countCommentsTask } from './count-comments/task';
import { deepGetTask } from './deep-get/task';
import type { FunctionCase, FunctionRunner, JsonValue, TaskDefinition } from './types';
import { recursionSolutions, recursionWrongSolutions } from '../tests/fixtures/recursion';

const tasks = [fibonacciMemoTask, powerTask, reverseStringTask, subsetsTask, permutationsTask,
  flattenNestedTask, countCommentsTask, deepGetTask];

// Only trusted local fixture/starter code runs here; no registry or application runner import.
const load = (source: string, entryPoint: string) =>
  new Function(`${source}; return ${entryPoint};`)() as (...args: unknown[]) => unknown;

function functionRunner(task: TaskDefinition): FunctionRunner {
  if (task.runner.kind !== 'function') throw new Error(`Not a function: ${task.id}`);
  return task.runner;
}

function canonicalRows(value: unknown, sortInside: boolean): string[] | undefined {
  if (!Array.isArray(value) || !value.every(row => Array.isArray(row)
    && row.every(item => typeof item === 'number' && Number.isFinite(item)))) return undefined;
  return value.map((row: number[]) => JSON.stringify(sortInside ? [...row].sort((a, b) => a - b) : row)).sort();
}

function matches(runner: FunctionRunner, actual: unknown, sample: FunctionCase): boolean {
  if (sample.expectedUndefined === true) return actual === undefined;
  if (runner.comparison === 'approximate') {
    if (typeof actual !== 'number' || !Number.isFinite(actual)
      || typeof sample.expected !== 'number' || !Number.isFinite(sample.expected)) return false;
    const tolerance = runner.tolerance ?? { absolute: 1e-9, relative: 1e-9 };
    return Math.abs(actual - sample.expected) <= Math.max(tolerance.absolute, tolerance.relative * Math.abs(sample.expected));
  }
  if (runner.comparison === 'nested-unordered' || runner.comparison === 'unordered-tuples') {
    const actualRows = canonicalRows(actual, runner.comparison === 'nested-unordered');
    return actualRows !== undefined && isDeepStrictEqual(actualRows,
      canonicalRows(sample.expected, runner.comparison === 'nested-unordered'));
  }
  return isDeepStrictEqual(actual, sample.expected);
}

function passes(source: string, runner: FunctionRunner, sample: FunctionCase): boolean {
  const args = structuredClone(sample.args);
  const result = load(source, runner.entryPoint)(...args);
  if (runner.preserveArgs?.some(index => !isDeepStrictEqual(args[index], sample.args[index]))) return false;
  if (runner.freshArray && (!Array.isArray(result) || args.some(arg => arg === result))) return false;
  return matches(runner, runner.output.kind === 'return' ? result : args[runner.output.index], sample);
}

const factorial = (n: number) => {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

function flattenOracle(input: JsonValue, depth: number): unknown[] {
  if (!Array.isArray(input)) throw new Error('Flatten requires an array');
  // Widen before flat: its recursive conditional type otherwise expands JsonValue indefinitely.
  const elements: unknown[] = input;
  return elements.flat(depth);
}

function oracle(id: string, args: JsonValue[]): unknown {
  if (id === 'fibonacci-memo') {
    let previous = 0n, current = 1n;
    for (let i = 0; i < (args[0] as number); i++) [previous, current] = [current, previous + current];
    return Number(previous);
  }
  if (id === 'power-and-reverse') return Math.pow(args[0] as number, args[1] as number);
  if (id === 'reverse-string') {
    const input = args[0] as string;
    return Array.from({ length: input.length }, (_, i) => input[input.length - i - 1]).join('');
  }
  if (id === 'subsets') {
    let rows: number[][] = [[]];
    for (const value of args[0] as number[]) rows = rows.concat(rows.map(row => [...row, value]));
    return rows;
  }
  if (id === 'permutations') {
    const nums = args[0] as number[];
    // Factorial-number-system unranking, independent of backtracking and case insertion.
    return Array.from({ length: factorial(nums.length) }, (_, rank) => {
      const available = [...nums], tuple = [];
      while (available.length) {
        const block = factorial(available.length - 1);
        tuple.push(available.splice(Math.floor(rank / block), 1)[0]);
        rank %= block;
      }
      return tuple;
    });
  }
  if (id === 'flatten-nested') return flattenOracle(args[0], typeof args[1] === 'number' ? args[1] : Infinity);
  if (id === 'count-comments') {
    type Comment = { replies?: Comment[] | null };
    const queue = [...args[0] as unknown as Comment[]];
    for (let i = 0; i < queue.length; i++) queue.push(...(queue[i].replies ?? []));
    return queue.length;
  }
  if (id === 'deep-get') {
    return (args[1] as string).split('.').reduce<unknown>((current, key) =>
      current == null ? undefined : Object(current)[key], args[0]);
  }
  throw new Error(`No oracle for ${id}`);
}

function assertJson(value: unknown, ancestors = new Set<object>()): void {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return;
  if (typeof value === 'number') { expect(Number.isFinite(value)).toBe(true); return; }
  expect(typeof value).toBe('object');
  expect(value).not.toBeUndefined();
  expect(ancestors.has(value as object)).toBe(false);
  const next = new Set(ancestors).add(value as object);
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      expect(Object.hasOwn(value, i)).toBe(true);
      assertJson(value[i], next);
    }
  } else {
    for (const child of Object.values(value as object)) assertJson(child, next);
  }
}

function assertDomain(id: string, args: JsonValue[]): void {
  assertJson(args);
  if (id === 'fibonacci-memo') {
    expect(args).toHaveLength(1);
    expect(Number.isInteger(args[0])).toBe(true);
    expect(args[0]).toBeGreaterThanOrEqual(0);
    expect(args[0]).toBeLessThanOrEqual(50);
  } else if (id === 'power-and-reverse') {
    expect(args).toHaveLength(2);
    expect(typeof args[0]).toBe('number');
    expect(Number.isInteger(args[1]) && (args[1] as number) >= 0).toBe(true);
    expect(Number.isFinite(Math.pow(args[0] as number, args[1] as number))).toBe(true);
  } else if (id === 'reverse-string') {
    expect(args).toHaveLength(1);
    expect(typeof args[0]).toBe('string');
    expect([...(args[0] as string)].every(char => char.charCodeAt(0) <= 127)).toBe(true);
  } else if (id === 'subsets' || id === 'permutations') {
    expect(args).toHaveLength(1);
    const nums = args[0] as number[];
    expect(Array.isArray(nums)).toBe(true);
    expect(nums.every(n => typeof n === 'number' && Number.isFinite(n))).toBe(true);
    expect(new Set(nums).size).toBe(nums.length);
    expect(nums.length).toBeGreaterThanOrEqual(id === 'subsets' ? 0 : 1);
    expect(nums.length).toBeLessThanOrEqual(id === 'subsets' ? 10 : 6);
  } else if (id === 'flatten-nested') {
    expect([1, 2]).toContain(args.length);
    expect(Array.isArray(args[0])).toBe(true);
    if (args.length === 2) expect(Number.isInteger(args[1]) && (args[1] as number) >= 0).toBe(true);
  } else if (id === 'count-comments') {
    expect(args).toHaveLength(1);
    const seen = new Set<JsonValue>();
    const visit = (comments: JsonValue) => {
      expect(Array.isArray(comments)).toBe(true);
      for (const comment of comments as JsonValue[]) {
        expect(comment !== null && typeof comment === 'object' && !Array.isArray(comment)).toBe(true);
        expect(seen.has(comment)).toBe(false);
        seen.add(comment);
        const replies = (comment as Record<string, JsonValue>).replies;
        if (replies != null) visit(replies);
      }
    };
    visit(args[0]);
  } else {
    expect(id).toBe('deep-get');
    expect(args).toHaveLength(2);
    expect(typeof args[1]).toBe('string');
    expect((args[1] as string).split('.').every(key => key.length > 0 && !/[\[\]]/.test(key))).toBe(true);
  }
}

describe('recursion task contracts', () => {
  it('exports eight distinct single-goal tasks and matching fixture dictionaries', () => {
    const ids = tasks.map(task => task.id);
    expect(new Set(ids).size).toBe(8);
    expect(Object.keys(recursionSolutions).sort()).toEqual([...ids].sort());
    expect(Object.keys(recursionWrongSolutions).sort()).toEqual([...ids].sort());
    expect(tasks.map(task => functionRunner(task).entryPoint)).toEqual([
      'fibMemo', 'power', 'reverseString', 'subsets', 'permute', 'flatten', 'countComments', 'deepGet',
    ]);
    expect(tasks.map(task => functionRunner(task).comparison)).toEqual([
      'exact', 'approximate', 'exact', 'nested-unordered', 'unordered-tuples', 'exact', 'exact', 'exact',
    ]);
    expect(powerTask.id).toBe('power-and-reverse');
    expect(powerTask.starter).not.toMatch(/reverseString|fastPower/);
    expect(fibonacciMemoTask.starter).not.toMatch(/fibNaive|fibIterative/);
    expect(fibonacciMemoTask.starter).toContain('fibMemo(n, memo = new Map())');
    expect(flattenNestedTask.starter).toContain('flatten(arr, depth = Infinity)');
    for (const task of [flattenNestedTask, countCommentsTask, deepGetTask]) {
      expect(functionRunner(task).preserveArgs).toEqual([0]);
    }
    expect(functionRunner(flattenNestedTask).freshArray).toBe(true);
  });

  for (const task of tasks) describe(task.id, () => {
    const runner = functionRunner(task);
    it('has neutral runnable starter and coherent complexity metadata', () => {
      expect(runner.cases.length).toBeGreaterThanOrEqual(6);
      expect(new Set(runner.cases.map(sample => sample.name)).size).toBe(runner.cases.length);
      expect(runner.output).toEqual({ kind: 'return' });
      expect(task.starter).toMatch(/TODO/);
      const starter = load(task.starter, runner.entryPoint);
      expect(typeof starter).toBe('function');
      expect(starter(...structuredClone(runner.cases[0].args))).toBeUndefined();
      expect(task.verificationNote).toBeTruthy();
      expect(task.complexity.variables).toBeTruthy();
      const options = task.complexity.options.map(option => option.id);
      expect(new Set(options).size).toBe(options.length);
      expect(task.complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space']);
      for (const criterion of task.complexity.criteria) {
        expect(options).toContain(criterion.expected);
        expect(criterion.explanation).toBeTruthy();
        for (const accepted of criterion.accepted ?? []) expect(options).toContain(accepted);
      }
    });

    for (const sample of runner.cases) it(sample.name, () => {
      assertDomain(task.id, sample.args);
      if (sample.expectedUndefined === true) {
        expect(Object.hasOwn(sample, 'expected')).toBe(false);
      } else {
        expect(Object.hasOwn(sample, 'expectedUndefined')).toBe(false);
        assertJson(sample.expected);
      }
      expect(matches(runner, oracle(task.id, structuredClone(sample.args)), sample)).toBe(true);
      expect(passes(recursionSolutions[task.id], runner, sample)).toBe(true);
    });

    for (const [index, source] of recursionWrongSolutions[task.id].entries()) {
      it(`rejects terminating wrong fixture ${index + 1}`, () => {
        expect(runner.cases.some(sample => {
          try { return !passes(source, runner, sample); }
          catch { return true; }
        })).toBe(true);
      });
    }
  });
});

describe('independent comparison and domain regressions', () => {
  it('distinguishes permutation tuple order from subset member order and retains multiplicity', () => {
    const subsets = functionRunner(subsetsTask), permutations = functionRunner(permutationsTask);
    const sample: FunctionCase = { name: 'order', args: [[1, 2]], expected: [[1, 2], [2, 1]] };
    expect(matches(permutations, [[2, 1], [1, 2]], sample)).toBe(true);
    expect(matches(permutations, [[1, 2], [1, 2]], sample)).toBe(false);
    const setSample: FunctionCase = { name: 'set order', args: [[1, 2]], expected: [[], [1], [2], [1, 2]] };
    expect(matches(subsets, [[2, 1], [2], [], [1]], setSample)).toBe(true);
    expect(matches(subsets, [[], [1], [2], [1, 2], [2, 1]], setSample)).toBe(false);
    expect(matches(subsets, [[], [1], [2], [1, 1]], setSample)).toBe(false);
  });

  it('accepts finite floating roundoff but rejects nonnumeric, nonfinite and wrong answers', () => {
    const runner = functionRunner(powerTask);
    const sample: FunctionCase = { name: 'roundoff', args: [1.1, 3], expected: 1.331 };
    expect(matches(runner, 1.3310000000000004, sample)).toBe(true);
    for (const value of [NaN, Infinity, -Infinity, undefined, null, '1.331', [1.331], 1.33]) {
      expect(matches(runner, value, sample)).toBe(false);
    }
    expect(matches(runner, 0, { name: 'small', args: [0.1, 8], expected: 1e-8 })).toBe(false);
    expect(matches(runner, 1e100 * (1 + 1e-12), { name: 'large', args: [10, 100], expected: 1e100 })).toBe(true);
  });

  it('keeps undefined separate from every falsy JSON value', () => {
    const runner = functionRunner(deepGetTask);
    const absent: FunctionCase = { name: 'absent', args: [{}, 'a'], expectedUndefined: true };
    expect(matches(runner, undefined, absent)).toBe(true);
    for (const value of [0, false, '', null]) {
      expect(matches(runner, value, absent)).toBe(false);
      expect(matches(runner, undefined, { name: 'present', args: [{ a: value }, 'a'], expected: value })).toBe(false);
    }
  });

  it('checks all Fibonacci indices and a grid of valid nonnegative powers against independent oracles', () => {
    const fib = load(recursionSolutions['fibonacci-memo'], 'fibMemo');
    for (let n = 0; n <= 50; n++) expect(fib(n)).toBe(oracle('fibonacci-memo', [n]));
    const power = load(recursionSolutions['power-and-reverse'], 'power');
    for (const base of [-3, -0.5, 0, 0.1, 0.5, 1, 1.1, 2, 3]) {
      for (let exponent = 0; exponent <= 20; exponent++) {
        const sample: FunctionCase = { name: 'grid', args: [base, exponent], expected: Math.pow(base, exponent) };
        expect(matches(functionRunner(powerTask), power(base, exponent), sample)).toBe(true);
      }
    }
  });

  it('covers every ASCII code without imposing Unicode semantics', () => {
    const str = Array.from({ length: 128 }, (_, i) => String.fromCharCode(i)).join('');
    expect(load(recursionSolutions['reverse-string'], 'reverseString')(str)).toBe(oracle('reverse-string', [str]));
  });

  it('checks backtracking completeness, uniqueness and domain membership', () => {
    for (const task of [subsetsTask, permutationsTask]) {
      for (const sample of functionRunner(task).cases) {
        const nums = sample.args[0] as number[];
        const result = load(recursionSolutions[task.id], functionRunner(task).entryPoint)(nums) as number[][];
        expect(result.length).toBe(task.id === 'subsets' ? 2 ** nums.length : factorial(nums.length));
        expect(new Set(canonicalRows(result, task.id === 'subsets')).size).toBe(result.length);
        for (const row of result) {
          expect(new Set(row).size).toBe(row.length);
          expect(row.every(value => nums.includes(value))).toBe(true);
          if (task.id === 'permutations') expect(row.length).toBe(nums.length);
        }
      }
    }
  });

  it('checks depth limits, new arrays, and input preservation on generated nested data', () => {
    const flatten = load(recursionSolutions['flatten-nested'], 'flatten');
    let nested: JsonValue[] = [0, false, null, { a: [1, 2] }];
    for (let nesting = 0; nesting < 8; nesting++) {
      nested = [nesting, nested, [], [nesting]];
      for (let depth = 0; depth <= 9; depth++) {
        const input = structuredClone(nested);
        const result = flatten(input, depth);
        expect(result).toEqual(flattenOracle(nested, depth));
        expect(input).toEqual(nested);
        expect(result).not.toBe(input);
      }
    }
  });

  it('counts generated branching trees without treating repeated ids as shared nodes', () => {
    let tree: JsonValue[] = [{ id: 0, replies: null }];
    for (let depth = 0; depth < 6; depth++) {
      tree = [{ id: 0, replies: structuredClone(tree) }, { id: 0, replies: structuredClone(tree) }, { id: 0 }];
      const sample: FunctionCase = { name: 'branching', args: [tree], expected: oracle('count-comments', [tree]) as number };
      expect(passes(recursionSolutions['count-comments'], functionRunner(countCommentsTask), sample)).toBe(true);
    }
  });

  it('uses ordinary property access and distinguishes missing intermediates from final values', () => {
    const deepGet = load(recursionSolutions['deep-get'], 'deepGet');
    const input = Object.create({ inherited: { value: 7 } });
    input.present = undefined;
    expect(deepGet(input, 'inherited.value')).toBe(7);
    expect(deepGet(input, 'present')).toBeUndefined();
    expect(deepGet(input, 'present.child')).toBeUndefined();
    expect(deepGet(undefined, 'a')).toBeUndefined();
    const fn = () => { throw new Error('Must not call properties'); };
    expect(deepGet({ fn }, 'fn')).toBe(fn);
    expect(deepGet({ a: { b: false } }, 'a.b')).toBe(false);
  });
});
