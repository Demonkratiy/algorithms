import { isDeepStrictEqual } from 'node:util';
import { describe, expect, it } from 'vitest';
import { validPalindromeTask } from './valid-palindrome/task';
import { moveZeroesTask } from './move-zeroes/task';
import { mergeSortedArraysTask } from './merge-sorted-arrays/task';
import { minSubarraySumTask } from './min-subarray-sum/task';
import { maxVowelsTask } from './max-vowels/task';
import { longestSubstringTask } from './longest-substring/task';
import type { FunctionCase, FunctionRunner, JsonValue, TaskDefinition } from './types';
import { pointersWindowSolutions, pointersWindowWrongSolutions } from '../tests/fixtures/pointers-window';

const tasks = [
  validPalindromeTask, moveZeroesTask, mergeSortedArraysTask,
  minSubarraySumTask, maxVowelsTask, longestSubstringTask,
];

const contracts: Record<string, { entryPoint: string; signature: string; time: string; space: string }> = {
  'valid-palindrome': { entryPoint: 'isPalindrome', signature: 's', time: 'O(N)', space: 'O(1)' },
  'move-zeroes': { entryPoint: 'moveZeroes', signature: 'nums', time: 'O(N)', space: 'O(1)' },
  'merge-sorted-arrays': { entryPoint: 'mergeSorted', signature: 'a, b', time: 'O(N + M)', space: 'O(1)' },
  'min-subarray-sum': { entryPoint: 'minSubArrayLen', signature: 'target, nums', time: 'O(N)', space: 'O(1)' },
  'max-vowels': { entryPoint: 'maxVowels', signature: 's, k', time: 'O(N)', space: 'O(1)' },
  'longest-substring': { entryPoint: 'lengthOfLongestSubstring', signature: 's', time: 'O(N)', space: 'O(min(N, A))' },
};

function functionRunner(task: TaskDefinition): FunctionRunner {
  if (task.runner.kind !== 'function') throw new Error('Expected function runner');
  return task.runner;
}

function execute(source: string, runner: FunctionRunner, testCase: FunctionCase) {
  const args = structuredClone(testCase.args);
  const before = structuredClone(args);
  const implementation = new Function(`"use strict"; ${source}; return ${runner.entryPoint};`) as () => (...args: JsonValue[]) => unknown;
  const returned = implementation()(...args);
  const output = runner.output.kind === 'return' ? returned : args[runner.output.index];
  const preserved = (runner.preserveArgs ?? []).every(index => isDeepStrictEqual(args[index], before[index]));
  const fresh = !runner.freshArray || (Array.isArray(returned) && args.every(arg => returned !== arg));
  return { returned, output, passed: isDeepStrictEqual(output, testCase.expected) && preserved && fresh };
}

// Deliberately different, simple oracles verify the fixture data, not learner code.
function independentExpected(id: string, args: JsonValue[]): JsonValue {
  switch (id) {
    case 'valid-palindrome': {
      const cleaned = (args[0] as string).replace(/[^a-z0-9]/gi, '').toLowerCase();
      return cleaned === cleaned.split('').reverse().join('');
    }
    case 'move-zeroes': {
      const nums = args[0] as number[];
      return [...nums.filter(value => value !== 0), ...nums.filter(value => value === 0)];
    }
    case 'merge-sorted-arrays':
      return [...args[0] as number[], ...args[1] as number[]].sort((a, b) => a - b);
    case 'min-subarray-sum': {
      const target = args[0] as number;
      const nums = args[1] as number[];
      let best = Infinity;
      for (let start = 0; start < nums.length; start++) {
        let sum = 0;
        for (let end = start; end < nums.length; end++) {
          sum += nums[end];
          if (sum >= target) {
            best = Math.min(best, end - start + 1);
            break;
          }
        }
      }
      return best === Infinity ? 0 : best;
    }
    case 'max-vowels': {
      const s = args[0] as string, k = args[1] as number;
      let best = 0;
      for (let start = 0; start <= s.length - k; start++) {
        best = Math.max(best, (s.slice(start, start + k).match(/[aeiou]/g) ?? []).length);
      }
      return best;
    }
    case 'longest-substring': {
      const s = args[0] as string;
      let best = 0;
      for (let start = 0; start < s.length; start++) {
        const seen = new Set<string>();
        for (let end = start; end < s.length && !seen.has(s[end]); end++) {
          seen.add(s[end]);
          best = Math.max(best, end - start + 1);
        }
      }
      return best;
    }
    default: throw new Error(`Unknown task ${id}`);
  }
}

function expectLength(value: string | number[], min: number, max: number) {
  expect(value.length).toBeGreaterThanOrEqual(min);
  expect(value.length).toBeLessThanOrEqual(max);
}

function expectDomain(id: string, args: JsonValue[]) {
  switch (id) {
    case 'valid-palindrome':
      expect(args).toHaveLength(1);
      expect(typeof args[0]).toBe('string');
      expectLength(args[0] as string, 1, 200_000);
      expect(args[0]).toMatch(/^[\x20-\x7e]+$/);
      break;
    case 'move-zeroes':
      expect(args).toHaveLength(1);
      expect(Array.isArray(args[0])).toBe(true);
      expectLength(args[0] as number[], 1, 10_000);
      for (const value of args[0] as number[]) {
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(-2147483648);
        expect(value).toBeLessThanOrEqual(2147483647);
      }
      break;
    case 'merge-sorted-arrays':
      expect(args).toHaveLength(2);
      for (const arg of args) {
        expect(Array.isArray(arg)).toBe(true);
        expectLength(arg as number[], 0, 10_000);
        (arg as number[]).forEach((value, index, nums) => {
          expect(Number.isFinite(value)).toBe(true);
          if (index) expect(value).toBeGreaterThanOrEqual(nums[index - 1]);
        });
      }
      break;
    case 'min-subarray-sum':
      expect(args).toHaveLength(2);
      expect(typeof args[0]).toBe('number');
      expect(Number.isFinite(args[0])).toBe(true);
      expect(args[0]).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(args[1])).toBe(true);
      expectLength(args[1] as number[], 1, 100_000);
      for (const value of args[1] as number[]) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(1);
      }
      break;
    case 'max-vowels':
      expect(args).toHaveLength(2);
      expect(typeof args[0]).toBe('string');
      expectLength(args[0] as string, 1, 100_000);
      expect(args[0]).toMatch(/^[a-z]+$/);
      expect(Number.isInteger(args[1])).toBe(true);
      expect(args[1]).toBeGreaterThanOrEqual(1);
      expect(args[1]).toBeLessThanOrEqual((args[0] as string).length);
      break;
    case 'longest-substring':
      expect(args).toHaveLength(1);
      expect(typeof args[0]).toBe('string');
      expectLength(args[0] as string, 0, 50_000);
      break;
    default: throw new Error(`Unknown task ${id}`);
  }
}

describe('Two Pointers and Sliding Window task definitions', () => {
  it('exports exactly the six unique expected task IDs and fixture pairs', () => {
    const ids = tasks.map(task => task.id).sort();
    expect(ids).toEqual(Object.keys(contracts).sort());
    expect(Object.keys(pointersWindowSolutions).sort()).toEqual(ids);
    expect(Object.keys(pointersWindowWrongSolutions).sort()).toEqual(ids);
  });

  describe.each(tasks)('$id', task => {
    const runner = functionRunner(task);
    const contract = contracts[task.id];

    it('uses the statement signature, exact comparison and neutral starter only', () => {
      expect(runner.entryPoint).toBe(contract.entryPoint);
      expect(runner.comparison).toBe('exact');
      expect(task.starter.replace(/\r\n/g, '\n').trim()).toBe(`function ${contract.entryPoint}(${contract.signature}) {\n  // TODO: напиши своё решение.\n}`);
      expect(runner.output).toEqual(task.id === 'move-zeroes' ? { kind: 'argument', index: 0 } : { kind: 'return' });
      if (task.id === 'merge-sorted-arrays') {
        expect(runner.preserveArgs).toEqual([0, 1]);
        expect(runner.freshArray).toBe(true);
      }
    });

    it('has unique named cases including a moderate larger input', () => {
      expect(runner.cases.length).toBeGreaterThanOrEqual(6);
      expect(new Set(runner.cases.map(testCase => testCase.name)).size).toBe(runner.cases.length);
      expect(runner.cases.every(testCase => testCase.name.trim().length > 0)).toBe(true);
      expect(runner.cases.some(testCase => testCase.args.some(arg => (typeof arg === 'string' || Array.isArray(arg)) && arg.length >= 256))).toBe(true);
    });

    it('has time and auxiliary-space targets, uncertainty, and no preselected answer', () => {
      const { complexity } = task;
      expect(complexity.variables).toMatch(/дополнительн/i);
      expect(complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space']);
      expect(new Set(complexity.options.map(option => option.id)).size).toBe(complexity.options.length);
      expect(complexity.options.find(option => option.id === 'unknown')).toBeDefined();
      expect(complexity).not.toHaveProperty('selected');
      expect(complexity).not.toHaveProperty('defaultChoices');
      for (const option of complexity.options) {
        expect(option).not.toHaveProperty('selected');
        expect(option).not.toHaveProperty('default');
      }
      for (const criterion of complexity.criteria) {
        expect(criterion).not.toHaveProperty('selected');
        expect(criterion).not.toHaveProperty('default');
        expect(criterion.explanation).toMatch(/[а-яё]/i);
        for (const choice of [criterion.expected, ...(criterion.accepted ?? [])]) {
          expect(choice).not.toBe('unknown');
          expect(complexity.options.some(option => option.id === choice)).toBe(true);
        }
        expect(complexity.options.find(option => option.id === criterion.expected)?.label)
          .toBe(criterion.id === 'time' ? contract.time : contract.space);
      }
    });

    it.each(runner.cases)('valid domain and independently verified expectation: $name', testCase => {
      expectDomain(task.id, testCase.args);
      expect(independentExpected(task.id, testCase.args)).toEqual(testCase.expected);
    });

    it.each(runner.cases)('trusted implementation obeys output/mutation contract: $name', testCase => {
      const before = structuredClone(testCase);
      const result = execute(pointersWindowSolutions[task.id], runner, testCase);
      expect(result.passed).toBe(true);
      if (task.id === 'move-zeroes') expect(result.returned).toBeUndefined();
      expect(testCase).toEqual(before);
    });

    it('rejects the typical incorrect implementation', () => {
      expect(runner.cases.some(testCase => !execute(pointersWindowWrongSolutions[task.id], runner, testCase).passed)).toBe(true);
    });

    it('does not pass the neutral starter', () => {
      expect(runner.cases.some(testCase => !execute(task.starter, runner, testCase).passed)).toBe(true);
    });
  });

  it('accepts constant space for longest substring only with a fixed-alphabet explanation', () => {
    const space = longestSubstringTask.complexity.criteria.find(criterion => criterion.id === 'space');
    expect(space?.expected).toBe('alphabet-bound');
    expect(space?.accepted).toEqual(['constant']);
    expect(space?.explanation).toMatch(/алфавит фиксирован/);
  });

  it('rejects merge implementations that reuse either input even when values match', () => {
    const runner = functionRunner(mergeSortedArraysTask);
    expect(execute('function mergeSorted(a, b) { return a; }', runner, { name: 'alias a', args: [[1], []], expected: [1] }).passed).toBe(false);
    expect(execute('function mergeSorted(a, b) { return b; }', runner, { name: 'alias b', args: [[], [1]], expected: [1] }).passed).toBe(false);
  });

  it('rejects a fresh correct merge result if either input was changed', () => {
    const runner = functionRunner(mergeSortedArraysTask);
    const testCase = { name: 'preserve inputs', args: [[1], [2]], expected: [1, 2] };
    for (const input of ['a', 'b']) {
      const source = `function mergeSorted(a, b) { const result = [...a, ...b].sort((x, y) => x - y); ${input}.pop(); return result; }`;
      expect(execute(source, runner, testCase).passed).toBe(false);
    }
  });
});
