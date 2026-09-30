import { isDeepStrictEqual } from 'node:util';
import { describe, expect, it } from 'vitest';
import { binarySearchBasicTask } from './binary-search-basic/task';
import { searchInsertPositionTask } from './search-insert-position/task';
import { firstLastPositionTask } from './first-last-position/task';
import { kokoEatingBananasTask } from './koko-eating-bananas/task';
import { searchRotatedArrayTask } from './search-rotated-array/task';
import { sqrtTask } from './sqrt/task';
import { rotateImageTask } from './rotate-image/task';
import { spiralMatrixTask } from './spiral-matrix/task';
import { setMatrixZeroesTask } from './set-matrix-zeroes/task';
import type { FunctionCase, FunctionRunner, JsonValue, TaskDefinition } from './types';
import { searchMatrixSolutions, searchMatrixWrongSolutions } from '../tests/fixtures/search-matrix';

const tasks = [
  binarySearchBasicTask, searchInsertPositionTask, firstLastPositionTask,
  kokoEatingBananasTask, searchRotatedArrayTask, sqrtTask,
  rotateImageTask, spiralMatrixTask, setMatrixZeroesTask,
];
const contracts: Record<string, { entryPoint: string; signature: string; time: string; large: number }> = {
  'binary-search-basic': { entryPoint: 'search', signature: 'nums, target', time: 'O(log N)', large: 1024 },
  'search-insert-position': { entryPoint: 'searchInsert', signature: 'nums, target', time: 'O(log N)', large: 1024 },
  'first-last-position': { entryPoint: 'searchRange', signature: 'nums, target', time: 'O(log N)', large: 4096 },
  'koko-eating-bananas': { entryPoint: 'minEatingSpeed', signature: 'piles, h', time: 'O(N log M)', large: 512 },
  'search-rotated-array': { entryPoint: 'search', signature: 'nums, target', time: 'O(log N)', large: 1024 },
  'sqrt': { entryPoint: 'mySqrt', signature: 'x', time: 'O(log x)', large: 2_147_483_647 },
  'rotate-image': { entryPoint: 'rotate', signature: 'matrix', time: 'O(N²)', large: 400 },
  'spiral-matrix': { entryPoint: 'spiralOrder', signature: 'matrix', time: 'O(M × N)', large: 100 },
  'set-matrix-zeroes': { entryPoint: 'setZeroes', signature: 'matrix', time: 'O(M × N)', large: 768 },
};
const inPlaceIds = ['rotate-image', 'set-matrix-zeroes'];
const matrixIds = [...inPlaceIds, 'spiral-matrix'];

function functionRunner(task: TaskDefinition): FunctionRunner {
  if (task.runner.kind !== 'function') throw new Error('Expected function runner');
  return task.runner;
}

function execute(source: string, runner: FunctionRunner, testCase: FunctionCase) {
  const args = structuredClone(testCase.args);
  const implementation = new Function(`"use strict"; ${source}; return ${runner.entryPoint};`) as () => (...args: JsonValue[]) => unknown;
  const returned = implementation()(...args);
  const output = runner.output.kind === 'return' ? returned : args[runner.output.index];
  return { returned, output, passed: isDeepStrictEqual(output, testCase.expected) };
}

function expectInteger(value: unknown, min: number, max: number) {
  expect(Number.isSafeInteger(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

function expectLength(value: unknown[], min: number, max: number) {
  expect(Array.isArray(value)).toBe(true);
  expect(value.length).toBeGreaterThanOrEqual(min);
  expect(value.length).toBeLessThanOrEqual(max);
}

function expectDomain(id: string, args: JsonValue[]) {
  if (id === 'sqrt') {
    expect(args).toHaveLength(1);
    expectInteger(args[0], 0, 2_147_483_647);
    return;
  }
  if (matrixIds.includes(id)) {
    expect(args).toHaveLength(1);
    const matrix = args[0] as number[][];
    const maxSize = id === 'rotate-image' ? 20 : id === 'spiral-matrix' ? 10 : 200;
    const minValue = id === 'rotate-image' ? -1000 : id === 'spiral-matrix' ? -100 : -2_147_483_648;
    const maxValue = id === 'rotate-image' ? 1000 : id === 'spiral-matrix' ? 100 : 2_147_483_647;
    expectLength(matrix, 1, maxSize);
    for (const row of matrix) {
      expectLength(row, 1, maxSize);
      expect(row.length).toBe(matrix[0].length);
      if (id === 'rotate-image') expect(row.length).toBe(matrix.length);
      row.forEach(value => expectInteger(value, minValue, maxValue));
    }
    return;
  }
  expect(args).toHaveLength(2);
  const nums = args[0] as number[], target = args[1] as number;
  if (id === 'koko-eating-bananas') {
    expectLength(nums, 1, 10_000);
    expectInteger(target, nums.length, 1_000_000_000);
    nums.forEach(value => expectInteger(value, 1, 1_000_000_000));
    return;
  }
  const range = id === 'first-last-position';
  expectLength(nums, range ? 0 : 1, range ? 100_000 : id === 'search-rotated-array' ? 5000 : 10_000);
  const limit = range ? 1_000_000_000 : id === 'binary-search-basic' ? 9999 : 10_000;
  expectInteger(target, -limit, limit);
  nums.forEach(value => expectInteger(value, -limit, limit));
  if (!range) expect(new Set(nums).size).toBe(nums.length);
  if (id === 'search-rotated-array') {
    // Every legal rotation of distinct sorted values has one cyclic descent (except N = 1).
    const descents = nums.filter((value, index) => value > nums[(index + 1) % nums.length]).length;
    expect(descents).toBe(nums.length === 1 ? 0 : 1);
  } else {
    for (let i = 1; i < nums.length; i++) expect(nums[i]).toBeGreaterThanOrEqual(nums[i - 1]);
  }
}

// These intentionally simple oracles differ from the trusted binary-search/in-place implementations.
function expectIndependentResult(id: string, { args, expected }: FunctionCase) {
  if (id === 'sqrt') {
    expectInteger(expected, 0, 46340);
    const x = BigInt(args[0] as number), root = BigInt(expected as number);
    expect(root * root <= x).toBe(true);
    expect((root + 1n) * (root + 1n) > x).toBe(true);
    return;
  }
  if (id === 'koko-eating-bananas') {
    const piles = args[0] as number[], h = args[1] as number, speed = expected as number;
    expectInteger(speed, 1, Math.max(...piles));
    // Integer quotient/remainder verifies feasibility and minimality without searching for k.
    const hours = (k: number) => piles.reduce((sum, pile) => sum + Math.trunc(pile / k) + (pile % k === 0 ? 0 : 1), 0);
    expect(hours(speed)).toBeLessThanOrEqual(h);
    if (speed > 1) expect(hours(speed - 1)).toBeGreaterThan(h);
    return;
  }
  if (matrixIds.includes(id)) {
    const matrix = args[0] as number[][], rows = matrix.length, cols = matrix[0].length;
    if (id === 'rotate-image') {
      const result = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) result[c][rows - 1 - r] = matrix[r][c];
      expect(expected).toEqual(result);
    } else if (id === 'set-matrix-zeroes') {
      const zeroRows = new Set<number>(), zeroCols = new Set<number>();
      matrix.forEach((row, r) => row.forEach((value, c) => {
        if (value === 0) { zeroRows.add(r); zeroCols.add(c); }
      }));
      expect(expected).toEqual(matrix.map((row, r) => row.map((value, c) => zeroRows.has(r) || zeroCols.has(c) ? 0 : value)));
    } else {
      const visited = new Set<string>(), result: number[] = [];
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      let r = 0, c = 0, direction = 0;
      for (let step = 0; step < rows * cols; step++) {
        result.push(matrix[r][c]);
        visited.add(`${r},${c}`);
        const nr = r + directions[direction][0], nc = c + directions[direction][1];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || visited.has(`${nr},${nc}`)) direction = (direction + 1) % 4;
        r += directions[direction][0];
        c += directions[direction][1];
      }
      expect(expected).toEqual(result);
      expect(expected as number[]).toHaveLength(rows * cols);
    }
    return;
  }
  const nums = args[0] as number[], target = args[1] as number;
  if (id === 'search-insert-position') {
    expect(expected).toBe(nums.filter(value => value < target).length);
  } else if (id === 'first-last-position') {
    expect(expected).toEqual([nums.indexOf(target), nums.lastIndexOf(target)]);
  } else {
    expect(expected).toBe(nums.indexOf(target));
  }
}

describe('Binary Search and Matrix task definitions (independent of registry)', () => {
  it('exports exactly nine unique task IDs and matching fixture records', () => {
    const ids = tasks.map(task => task.id).sort();
    expect(ids).toEqual(Object.keys(contracts).sort());
    expect(Object.keys(searchMatrixSolutions).sort()).toEqual(ids);
    expect(Object.keys(searchMatrixWrongSolutions).sort()).toEqual(ids);
  });

  describe.each(tasks)('$id', task => {
    const runner = functionRunner(task), contract = contracts[task.id];

    it('uses the documented signature, exact comparison and a neutral TODO starter', () => {
      expect(runner.entryPoint).toBe(contract.entryPoint);
      expect(runner.comparison).toBe('exact');
      expect(task.starter.replace(/\r\n/g, '\n').trim()).toBe(`function ${contract.entryPoint}(${contract.signature}) {\n  // TODO: напиши своё решение.\n}`);
      expect(runner.output).toEqual(inPlaceIds.includes(task.id) ? { kind: 'argument', index: 0 } : { kind: 'return' });
      for (const testCase of runner.cases) expect(testCase).not.toHaveProperty('entryPoint');
    });

    it('has at least six distinct named cases and a moderate larger boundary', () => {
      expect(runner.cases.length).toBeGreaterThanOrEqual(6);
      expect(new Set(runner.cases.map(testCase => testCase.name)).size).toBe(runner.cases.length);
      expect(runner.cases.every(testCase => testCase.name.trim().length > 0)).toBe(true);
      const size = (testCase: FunctionCase) => {
        if (task.id === 'sqrt') return testCase.args[0] as number;
        if (matrixIds.includes(task.id)) return (testCase.args[0] as number[][]).flat().length;
        return (testCase.args[0] as number[]).length;
      };
      expect(Math.max(...runner.cases.map(size))).toBeGreaterThanOrEqual(contract.large);
    });

    it('offers time and auxiliary-space targets, variables, unknown and no preselection', () => {
      const complexity = task.complexity;
      expect(complexity.variables).toMatch(/[NMx]/);
      expect(complexity.variables).toMatch(/дополнительн/i);
      expect(complexity.options.some(option => option.id === 'unknown')).toBe(true);
      expect(new Set(complexity.options.map(option => option.id)).size).toBe(complexity.options.length);
      expect(complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space']);
      for (const value of [complexity, ...complexity.options, ...complexity.criteria]) {
        for (const key of ['selected', 'default', 'defaultChoices']) expect(value).not.toHaveProperty(key);
      }
      for (const criterion of complexity.criteria) {
        expect(criterion.explanation).toMatch(/[а-яё]/i);
        for (const choice of [criterion.expected, ...(criterion.accepted ?? [])]) {
          expect(choice).not.toBe('unknown');
          expect(complexity.options.some(option => option.id === choice)).toBe(true);
        }
        expect(complexity.options.find(option => option.id === criterion.expected)?.label)
          .toBe(criterion.id === 'time' ? contract.time : 'O(1)');
      }
      expect(task.verificationNote).toMatch(/не доказывают|требуют ревью/);
    });

    it.each(runner.cases)('valid domain and independent expected result: $name', testCase => {
      expectDomain(task.id, testCase.args);
      expectIndependentResult(task.id, testCase);
    });

    it.each(runner.cases)('trusted fixture obeys output contract: $name', testCase => {
      const before = structuredClone(testCase);
      const result = execute(searchMatrixSolutions[task.id], runner, testCase);
      expect(result.passed).toBe(true);
      if (inPlaceIds.includes(task.id)) expect(result.returned).toBeUndefined();
      expect(testCase).toEqual(before);
    });

    it.each(searchMatrixWrongSolutions[task.id].map((source, index) => ({ source, index })))('rejects incorrect variant $index', ({ source }) => {
      expect(runner.cases.some(testCase => !execute(source, runner, testCase).passed)).toBe(true);
    });

    it('does not pass the starter and has multiple distinct incorrect variants', () => {
      expect(runner.cases.some(testCase => !execute(task.starter, runner, testCase).passed)).toBe(true);
      const variants = searchMatrixWrongSolutions[task.id];
      expect(variants.length).toBeGreaterThanOrEqual(2);
      expect(new Set(variants).size).toBe(variants.length);
      expect(variants).not.toContain(searchMatrixSolutions[task.id]);
    });
  });

  it.each([rotateImageTask, setMatrixZeroesTask])('$id rejects a correct returned copy without mutation', task => {
    const runner = functionRunner(task), testCase = runner.cases[0];
    const source = searchMatrixWrongSolutions[task.id][0];
    const result = execute(source, runner, testCase);
    expect(result.returned).toEqual(testCase.expected);
    expect(result.output).toEqual(testCase.args[0]);
    expect(result.passed).toBe(false);
  });

  it('documents output-excluded space for Spiral Matrix and operation restrictions for Sqrt', () => {
    expect(spiralMatrixTask.complexity.variables).toMatch(/не включает.*массив-результат/);
    expect(sqrtTask.verificationNote).toContain('Math.sqrt, Math.pow и ** запрещены');
    expect(searchMatrixSolutions.sqrt).not.toMatch(/Math\.(sqrt|pow)|\*\*/);
  });

  it('keeps all Koko cases feasible instead of inventing an impossible-input return value', () => {
    for (const testCase of functionRunner(kokoEatingBananasTask).cases) {
      const piles = testCase.args[0] as number[], h = testCase.args[1] as number;
      expect(h).toBeGreaterThanOrEqual(piles.length);
    }
  });
});
