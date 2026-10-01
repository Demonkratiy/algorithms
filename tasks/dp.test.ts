import { isDeepStrictEqual } from 'node:util';
import { describe, expect, it } from 'vitest';
import { climbingStairsTask } from './climbing-stairs/task';
import { houseRobberTask } from './house-robber/task';
import { houseRobberIITask } from './house-robber-ii/task';
import { coinChangeTask } from './coin-change/task';
import { coinChangeIITask } from './coin-change-ii/task';
import { longestIncreasingSubsequenceTask } from './longest-increasing-subsequence/task';
import { uniquePathsTask } from './unique-paths/task';
import { uniquePathsIITask } from './unique-paths-ii/task';
import type { FunctionCase, FunctionRunner, JsonValue, TaskDefinition } from './types';
import { dpSolutions, dpWrongSolutions } from '../tests/fixtures/dp';

const tasks = [climbingStairsTask, houseRobberTask, houseRobberIITask, coinChangeTask,
  coinChangeIITask, longestIncreasingSubsequenceTask, uniquePathsTask, uniquePathsIITask];
const signatures = [
  'climbStairs(n)', 'rob(nums)', 'robCircular(nums)', 'coinChange(coins, amount)',
  'change(amount, coins)', 'lengthOfLIS(nums)', 'uniquePaths(m, n)',
  'uniquePathsWithObstacles(obstacleGrid)',
];
const safe = BigInt(Number.MAX_SAFE_INTEGER);

// Only trusted local fixtures/starters are evaluated; no registry or application runner dependency.
const load = (source: string, entryPoint: string) =>
  new Function(`${source}; return ${entryPoint};`)() as (...args: unknown[]) => unknown;

function runnerFor(task: TaskDefinition): FunctionRunner {
  if (task.runner.kind !== 'function') throw new Error(`Not a scalar function: ${task.id}`);
  return task.runner;
}

function passes(source: string, runner: FunctionRunner, sample: FunctionCase): boolean {
  const args = structuredClone(sample.args);
  const result = load(source, runner.entryPoint)(...args);
  return typeof result === 'number' && Number.isSafeInteger(result)
    && result === sample.expected
    && !runner.preserveArgs?.some(i => !isDeepStrictEqual(args[i], sample.args[i]));
}

function choose(n: number, k: number): bigint {
  let value = 1n;
  for (let i = 1; i <= k; i++) value = value * BigInt(n - i + 1) / BigInt(i);
  return value;
}

function stairsOracle(n: number): number {
  let ways = 0n;
  for (let twos = 0; twos <= Math.floor(n / 2); twos++) ways += choose(n - twos, twos);
  return Number(ways);
}

function robberyOracle(nums: number[], circular: boolean): number {
  const memo = new Map<string, number>();
  function search(i: number, previousTaken: boolean, firstTaken: boolean): number {
    if (i === nums.length) return 0;
    const key = `${i}:${previousTaken}:${firstTaken}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    let result = search(i + 1, false, firstTaken);
    if (!previousTaken && !(circular && nums.length > 1 && i === nums.length - 1 && firstTaken)) {
      result = Math.max(result, nums[i] + search(i + 1, true, firstTaken || i === 0));
    }
    memo.set(key, result);
    return result;
  }
  return search(0, false, false);
}

// Breadth-first search of reachable sums, not the fixture's minimum DP recurrence.
function minimumCoinsOracle(coins: number[], amount: number): number {
  const queue: [number, number][] = [[0, 0]];
  const seen = new Set([0]);
  for (let i = 0; i < queue.length; i++) {
    const [sum, count] = queue[i];
    if (sum === amount) return count;
    for (const coin of coins) {
      const next = sum + coin;
      if (next <= amount && !seen.has(next)) {
        seen.add(next);
        queue.push([next, count + 1]);
      }
    }
  }
  return -1;
}

// Enumerate multiplicities, not orders. The final denomination has at most one valid multiplicity.
function combinationsOracle(amount: number, coins: number[]): number {
  function enumerate(i: number, rest: number): bigint {
    if (i === coins.length) return rest === 0 ? 1n : 0n;
    if (i === coins.length - 1) return rest % coins[i] === 0 ? 1n : 0n;
    let count = 0n;
    for (let used = 0; used * coins[i] <= rest; used++) {
      count += enumerate(i + 1, rest - used * coins[i]);
    }
    return count;
  }
  return Number(enumerate(0, amount));
}

// Independent of the O(N²) fixture, including strict lower-bound handling of duplicates.
function lisOracle(nums: number[]): number {
  const tails: number[] = [];
  for (const value of nums) {
    let left = 0, right = tails.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] >= value) right = mid;
      else left = mid + 1;
    }
    tails[left] = value;
  }
  return tails.length;
}

function gridCounts(grid: number[][]): { answer: bigint; states: bigint[] } {
  const memo = new Map<string, bigint>();
  function count(r: number, c: number): bigint {
    if (r < 0 || c < 0 || grid[r][c] === 1) return 0n;
    if (r === 0 && c === 0) return 1n;
    const key = `${r}:${c}`;
    if (!memo.has(key)) memo.set(key, count(r - 1, c) + count(r, c - 1));
    return memo.get(key)!;
  }
  const states = grid.flatMap((row, r) => row.map((_, c) => count(r, c)));
  return { answer: states[states.length - 1], states };
}

function oracle(id: string, args: JsonValue[]): number {
  switch (id) {
    case 'climbing-stairs': return stairsOracle(args[0] as number);
    case 'house-robber': return robberyOracle(args[0] as number[], false);
    case 'house-robber-ii': return robberyOracle(args[0] as number[], true);
    case 'coin-change': return minimumCoinsOracle(args[0] as number[], args[1] as number);
    case 'coin-change-ii': return combinationsOracle(args[0] as number, args[1] as number[]);
    case 'longest-increasing-subsequence': return lisOracle(args[0] as number[]);
    case 'unique-paths': return Number(choose((args[0] as number) + (args[1] as number) - 2, (args[0] as number) - 1));
    case 'unique-paths-ii': return Number(gridCounts(args[0] as number[][]).answer);
    default: throw new Error(`Missing oracle: ${id}`);
  }
}

function integer(value: unknown, min: number, max: number): void {
  expect(typeof value).toBe('number');
  expect(Number.isSafeInteger(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

function integerArray(value: JsonValue, minLength: number, maxLength: number, min: number, max: number): void {
  expect(Array.isArray(value)).toBe(true);
  const nums = value as number[];
  integer(nums.length, minLength, maxLength);
  for (let i = 0; i < nums.length; i++) {
    expect(Object.hasOwn(nums, i)).toBe(true);
    integer(nums[i], min, max);
  }
}

function assertDomain(id: string, args: JsonValue[]): void {
  expect(JSON.parse(JSON.stringify(args))).toEqual(args);
  expect(args).toHaveLength(['coin-change', 'coin-change-ii', 'unique-paths'].includes(id) ? 2 : 1);
  if (id === 'climbing-stairs') {
    integer(args[0], 1, 45);
  } else if (id === 'house-robber' || id === 'house-robber-ii') {
    integerArray(args[0], 1, 100, 0, 400);
  } else if (id === 'longest-increasing-subsequence') {
    integerArray(args[0], 1, 2500, -10000, 10000);
  } else if (id === 'coin-change') {
    integerArray(args[0], 1, 12, 1, 2147483647);
    integer(args[1], 0, 10000);
  } else if (id === 'coin-change-ii') {
    integer(args[0], 0, 5000);
    integerArray(args[1], 0, 100, 1, Number.MAX_SAFE_INTEGER);
    const coins = args[1] as number[], amount = args[0] as number;
    expect(new Set(coins).size).toBe(coins.length);
    const counts = Array<bigint>(amount + 1).fill(0n);
    counts[0] = 1n;
    for (const coin of coins) {
      for (let sum = coin; sum <= amount; sum++) {
        counts[sum] += counts[sum - coin];
        expect(counts[sum] <= safe).toBe(true);
      }
    }
  } else if (id === 'unique-paths') {
    integer(args[0], 1, 100);
    integer(args[1], 1, 100);
    expect(choose((args[0] as number) + (args[1] as number) - 2, (args[0] as number) - 1) <= 2147483647n).toBe(true);
  } else if (id === 'unique-paths-ii') {
    expect(Array.isArray(args[0])).toBe(true);
    const grid = args[0] as number[][];
    integer(grid.length, 1, 100);
    integer(grid[0].length, 1, 100);
    for (const row of grid) integerArray(row, grid[0].length, grid[0].length, 0, 1);
    expect(gridCounts(grid).states.every(count => count >= 0n && count <= safe)).toBe(true);
  } else {
    throw new Error(`Missing domain: ${id}`);
  }
}

function* arrays(length: number, alphabet: number[]): Generator<number[]> {
  if (length === 0) { yield []; return; }
  for (const prefix of arrays(length - 1, alphabet)) {
    for (const value of alphabet) yield [...prefix, value];
  }
}

function robberyBrute(nums: number[], circular: boolean): number {
  let best = 0;
  for (let mask = 0; mask < 2 ** nums.length; mask++) {
    if ((mask & (mask << 1)) !== 0) continue;
    if (circular && nums.length > 1 && (mask & 1) && (mask & (1 << (nums.length - 1)))) continue;
    let sum = 0;
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) sum += nums[i];
    best = Math.max(best, sum);
  }
  return best;
}

function lisBrute(nums: number[]): number {
  let best = 0;
  for (let mask = 1; mask < 2 ** nums.length; mask++) {
    const selected = nums.filter((_, i) => mask & (1 << i));
    if (selected.every((n, i) => i === 0 || selected[i - 1] < n)) best = Math.max(best, selected.length);
  }
  return best;
}

function pathsBrute(grid: number[][], r = 0, c = 0): number {
  if (r >= grid.length || c >= grid[0].length || grid[r][c]) return 0;
  if (r === grid.length - 1 && c === grid[0].length - 1) return 1;
  return pathsBrute(grid, r + 1, c) + pathsBrute(grid, r, c + 1);
}

describe('DP task contracts and named cases', () => {
  it('exports exactly the eight fixture keys matching task ids', () => {
    const ids = tasks.map(task => task.id).sort();
    expect(new Set(ids).size).toBe(8);
    expect(Object.keys(dpSolutions).sort()).toEqual(ids);
    expect(Object.keys(dpWrongSolutions).sort()).toEqual(ids);
  });

  tasks.forEach((task, index) => {
    const runner = runnerFor(task);
    describe(task.id, () => {
      it('has the exact scalar signature, TODO-only starter, and scoped complexity choices', () => {
        expect(task.starter.replace(/\r\n/g, '\n').trim()).toBe(`function ${signatures[index]} {\n  // TODO: напиши решение.\n}`);
        expect(runner.entryPoint).toBe(signatures[index].split('(')[0]);
        expect(runner.output).toEqual({ kind: 'return' });
        expect(runner.comparison).toBe('exact');
        expect(runner.preserveArgs).toEqual(task.id === 'unique-paths-ii' ? [0] : undefined);
        expect(runner.freshArray).toBeUndefined();
        expect(runner.tolerance).toBeUndefined();
        expect(runner.cases.length).toBeGreaterThanOrEqual(6);
        expect(new Set(runner.cases.map(sample => sample.name)).size).toBe(runner.cases.length);
        const options = task.complexity.options.map(option => option.id);
        expect(new Set(options).size).toBe(options.length);
        expect(task.complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space']);
        for (const criterion of task.complexity.criteria) {
          for (const choice of [criterion.expected, ...criterion.accepted ?? []]) expect(options).toContain(choice);
          expect(criterion.explanation.length).toBeGreaterThan(20);
        }
        expect(task.complexity.variables).toContain('O(1)');
        expect(load(task.starter, runner.entryPoint)(...structuredClone(runner.cases[0].args))).toBeUndefined();
      });

      it.each(runner.cases)('$name: valid domain, independent expected value, exact result', sample => {
        assertDomain(task.id, sample.args);
        integer(sample.expected, task.id === 'coin-change' ? -1 : 0, Number.MAX_SAFE_INTEGER);
        expect(sample.expectedUndefined).toBeUndefined();
        expect(sample.expected).toBe(oracle(task.id, sample.args));
        expect(passes(dpSolutions[task.id], runner, sample)).toBe(true);
      });

      dpWrongSolutions[task.id].forEach((source, i) => {
        it(`rejects bounded conceptual mutant ${i + 1}`, () => {
          const outcomes = runner.cases.map(sample => passes(source, runner, sample));
          expect(outcomes).toContain(false);
        });
      });
    });
  });
});

describe('independent exhaustive small domains', () => {
  it('enumerates all ordered step sequences for n = 1…18', () => {
    const climb = load(dpSolutions['climbing-stairs'], 'climbStairs');
    function enumerate(rest: number): number {
      if (rest === 0) return 1;
      if (rest < 0) return 0;
      return enumerate(rest - 1) + enumerate(rest - 2);
    }
    for (let n = 1; n <= 18; n++) {
      const expected = enumerate(n);
      expect(stairsOracle(n)).toBe(expected);
      expect(climb(n)).toBe(expected);
    }
  });

  for (const circular of [false, true]) {
    it(`enumerates all house subsets, circular = ${circular}`, () => {
      const id = circular ? 'house-robber-ii' : 'house-robber';
      const solve = load(dpSolutions[id], circular ? 'robCircular' : 'rob');
      for (let n = 1; n <= 7; n++) {
        for (const nums of arrays(n, [0, 1, 2])) {
          const expected = robberyBrute(nums, circular);
          expect(robberyOracle(nums, circular)).toBe(expected);
          expect(solve([...nums])).toBe(expected);
        }
      }
    });
  }

  it('checks minimum coins by BFS for every nonempty subset of denominations 1…5', () => {
    const solve = load(dpSolutions['coin-change'], 'coinChange');
    for (let mask = 1; mask < 32; mask++) {
      const coins = [1, 2, 3, 4, 5].filter((_, i) => mask & (1 << i));
      for (let amount = 0; amount <= 20; amount++) {
        const expected = minimumCoinsOracle(coins, amount);
        expect(solve([...coins], amount)).toBe(expected);
        expect(solve([...coins].reverse(), amount)).toBe(expected);
      }
    }
  });

  it('enumerates coin multiplicities including the empty denomination set', () => {
    const solve = load(dpSolutions['coin-change-ii'], 'change');
    for (let mask = 0; mask < 32; mask++) {
      const coins = [1, 2, 3, 4, 5].filter((_, i) => mask & (1 << i));
      for (let amount = 0; amount <= 20; amount++) {
        const expected = combinationsOracle(amount, coins);
        expect(solve(amount, [...coins])).toBe(expected);
        expect(solve(amount, [...coins].reverse())).toBe(expected);
      }
    }
  });

  it('enumerates every subsequence of all short ternary arrays', () => {
    const solve = load(dpSolutions['longest-increasing-subsequence'], 'lengthOfLIS');
    for (let n = 1; n <= 7; n++) {
      for (const nums of arrays(n, [-1, 0, 1])) {
        const expected = lisBrute(nums);
        expect(lisOracle(nums)).toBe(expected);
        expect(solve([...nums])).toBe(expected);
      }
    }
  });

  it('enumerates monotone paths on every small rectangle', () => {
    const solve = load(dpSolutions['unique-paths'], 'uniquePaths');
    for (let m = 1; m <= 6; m++) {
      for (let n = 1; n <= 6; n++) {
        const expected = pathsBrute(Array.from({ length: m }, () => Array(n).fill(0)));
        expect(oracle('unique-paths', [m, n])).toBe(expected);
        expect(solve(m, n)).toBe(expected);
      }
    }
  });

  it('enumerates every obstacle mask for all rectangles up to 3 × 3', () => {
    const solve = load(dpSolutions['unique-paths-ii'], 'uniquePathsWithObstacles');
    for (let m = 1; m <= 3; m++) {
      for (let n = 1; n <= 3; n++) {
        for (let mask = 0; mask < 2 ** (m * n); mask++) {
          const grid = Array.from({ length: m }, (_, r) =>
            Array.from({ length: n }, (_, c) => (mask >> (r * n + c)) & 1));
          const expected = pathsBrute(grid);
          const original = structuredClone(grid);
          expect(Number(gridCounts(grid).answer)).toBe(expected);
          expect(solve(grid)).toBe(expected);
          expect(grid).toEqual(original);
        }
      }
    }
  });
});

// Legitimate alternatives remain test-only, including mutation where the statement permits it.
const alternatives: Record<string, string> = {
  'climbing-stairs': `function climbStairs(n) {
    const table = [1, 1];
    for (let i = 2; i <= n; i++) table[i] = table[i - 1] + table[i - 2];
    return table[n];
  }`,
  'house-robber': `function rob(nums) {
    for (let i = 1; i < nums.length; i++) nums[i] = Math.max(nums[i - 1], nums[i] + (nums[i - 2] || 0));
    return nums[nums.length - 1];
  }`,
  'house-robber-ii': `function robCircular(nums) {
    if (nums.length === 1) return nums[0];
    function rob(row) {
      const dp = [0, row[0]];
      for (let i = 2; i <= row.length; i++) dp[i] = Math.max(dp[i - 1], dp[i - 2] + row[i - 1]);
      return dp[row.length];
    }
    return Math.max(rob(nums.slice(1)), rob(nums.slice(0, -1)));
  }`,
  'coin-change': `function coinChange(coins, amount) {
    coins.sort((a, b) => a - b);
    const dp = Array(amount + 1).fill(Infinity); dp[0] = 0;
    for (const c of coins) for (let s = c; s <= amount; s++) dp[s] = Math.min(dp[s], dp[s - c] + 1);
    return Number.isFinite(dp[amount]) ? dp[amount] : -1;
  }`,
  'coin-change-ii': `function change(amount, coins) {
    const table = Array.from({ length: coins.length + 1 }, () => Array(amount + 1).fill(0));
    for (const row of table) row[0] = 1;
    for (let i = 1; i <= coins.length; i++) {
      for (let s = 1; s <= amount; s++) {
        table[i][s] = table[i - 1][s] + (s >= coins[i - 1] ? table[i][s - coins[i - 1]] : 0);
      }
    }
    return table[coins.length][amount];
  }`,
  'longest-increasing-subsequence': `function lengthOfLIS(nums) {
    const tails = [];
    for (const value of nums) {
      let l = 0, r = tails.length;
      while (l < r) {
        const mid = Math.floor((l + r) / 2);
        if (tails[mid] < value) l = mid + 1; else r = mid;
      }
      tails[l] = value;
    }
    return tails.length;
  }`,
  'unique-paths': `function uniquePaths(m, n) {
    let result = 1;
    const k = Math.min(m - 1, n - 1);
    for (let i = 1; i <= k; i++) result = result * (m + n - 2 - k + i) / i;
    return Math.round(result);
  }`,
  'unique-paths-ii': `function uniquePathsWithObstacles(grid) {
    const dp = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(0));
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c]) continue;
        dp[r][c] = r === 0 && c === 0 ? 1 : (r > 0 ? dp[r - 1][c] : 0) + (c > 0 ? dp[r][c - 1] : 0);
      }
    }
    return dp[grid.length - 1][grid[0].length - 1];
  }`,
};

describe('legitimate algorithm and space alternatives', () => {
  for (const task of tasks) {
    it(`${task.id}: accepts an alternative from the stated contract`, () => {
      for (const sample of runnerFor(task).cases) {
        expect(passes(alternatives[task.id], runnerFor(task), sample)).toBe(true);
      }
    });
  }

  it('accepts LIS baseline and bonus, and table versus optimized space', () => {
    expect(longestIncreasingSubsequenceTask.complexity.criteria[0]).toMatchObject({
      expected: 'quadratic', accepted: ['linearithmic'],
    });
    expect(uniquePathsTask.complexity.criteria[0].accepted).toContain('minimum');
    expect(uniquePathsTask.complexity.criteria[1].accepted).toContain('constant');
    expect(uniquePathsIITask.complexity.criteria[1].accepted).not.toContain('constant');
    for (const task of [climbingStairsTask, houseRobberTask, houseRobberIITask]) {
      expect(task.complexity.criteria[1]).toMatchObject({ expected: 'constant', accepted: ['linear'] });
    }
  });
});
