import { describe, expect, it } from 'vitest';
import { bestTimeToBuySellStockTask } from './best-time-to-buy-sell-stock/task';
import { stockIITask } from './stock-ii/task';
import { jumpGameTask } from './jump-game/task';
import { jumpGameIITask } from './jump-game-ii/task';
import { nonOverlappingIntervalsTask } from './non-overlapping-intervals/task';
import type { FunctionCase, FunctionRunner, JsonValue, TaskDefinition } from './types';
import { greedySolutions, greedyWrongSolutions } from '../tests/fixtures/greedy';

const tasks = [bestTimeToBuySellStockTask, stockIITask, jumpGameTask, jumpGameIITask, nonOverlappingIntervalsTask];
const signatures: Record<string, string> = {
  'best-time-to-buy-sell-stock': 'maxProfit(prices)',
  'stock-ii': 'maxProfitMultiple(prices)',
  'jump-game': 'canJump(nums)',
  'jump-game-ii': 'jump(nums)',
  'non-overlapping-intervals': 'eraseOverlapIntervals(intervals)',
};

// Only trusted local fixtures and neutral starters; no registry or shared runner.
const load = (source: string, name: string) =>
  new Function(`${source}; return ${name};`)() as (...args: unknown[]) => unknown;

function runnerFor(task: TaskDefinition): FunctionRunner {
  if (task.runner.kind !== 'function') throw new Error(`Unexpected runner: ${task.id}`);
  return task.runner;
}

function stockOracle(prices: number[], multiple: boolean): number {
  if (!multiple) {
    let best = 0;
    for (let buy = 0; buy < prices.length; buy++) {
      for (let sell = buy + 1; sell < prices.length; sell++) {
        best = Math.max(best, prices[sell] - prices[buy]);
      }
    }
    return best;
  }
  // Enumerate every possible next trade, caching the optimal suffix.
  const suffix = new Array<number>(prices.length + 1).fill(0);
  for (let buy = prices.length - 1; buy >= 0; buy--) {
    suffix[buy] = suffix[buy + 1];
    for (let sell = buy + 1; sell < prices.length; sell++) {
      suffix[buy] = Math.max(suffix[buy], prices[sell] - prices[buy] + suffix[sell + 1]);
    }
  }
  // Selling and rebuying on the same day is equivalent to holding across that day.
  return suffix[0];
}

function jumpOracle(nums: number[]): number {
  const distance = new Array<number>(nums.length).fill(Infinity);
  distance[nums.length - 1] = 0;
  for (let i = nums.length - 2; i >= 0; i--) {
    for (let next = i + 1; next < nums.length && next <= i + nums[i]; next++) {
      distance[i] = Math.min(distance[i], 1 + distance[next]);
    }
  }
  return distance[0];
}

function intervalOracle(intervals: number[][]): number {
  if (intervals.length <= 12) {
    let mostKept = 0;
    for (let mask = 0; mask < 2 ** intervals.length; mask++) {
      const chosen = intervals.filter((_, index) => (mask & (1 << index)) !== 0);
      const compatible = chosen.every(([start, end], i) =>
        chosen.slice(i + 1).every(([otherStart, otherEnd]) => end <= otherStart || otherEnd <= start));
      if (compatible) mostKept = Math.max(mostKept, chosen.length);
    }
    return intervals.length - mostKept;
  }
  // For the moderate large sample, use longest-chain DP, not greedy selection.
  const ordered = structuredClone(intervals).sort((a, b) => a[0] - b[0]);
  const chain = new Array<number>(ordered.length).fill(1);
  for (let i = 0; i < ordered.length; i++) {
    for (let j = 0; j < i; j++) {
      if (ordered[j][1] <= ordered[i][0]) chain[i] = Math.max(chain[i], chain[j] + 1);
    }
  }
  return intervals.length - Math.max(...chain);
}

function oracle(id: string, args: JsonValue[]): number | boolean {
  if (id === 'non-overlapping-intervals') return intervalOracle(args[0] as number[][]);
  const numbers = args[0] as number[];
  if (id === 'jump-game') return Number.isFinite(jumpOracle(numbers));
  if (id === 'jump-game-ii') return jumpOracle(numbers);
  return stockOracle(numbers, id === 'stock-ii');
}

function checkDomain(id: string, sample: FunctionCase): void {
  expect(sample.args).toHaveLength(1);
  expect(sample.expectedUndefined).toBeUndefined();
  const input = sample.args[0] as number[] | number[][];
  expect(Array.isArray(input)).toBe(true);
  const jumping = id === 'jump-game' || id === 'jump-game-ii';
  expect(input.length).toBeGreaterThanOrEqual(1);
  expect(input.length).toBeLessThanOrEqual(jumping ? 10000 : 100000);
  if (id === 'non-overlapping-intervals') {
    for (const pair of input as number[][]) {
      expect(pair).toHaveLength(2);
      expect(pair.every(Number.isInteger)).toBe(true);
      expect(pair[0]).toBeGreaterThanOrEqual(-50000);
      expect(pair[0]).toBeLessThan(pair[1]);
      expect(pair[1]).toBeLessThanOrEqual(50000);
    }
  } else {
    expect((input as number[]).every(value => Number.isInteger(value) && value >= 0
      && value <= (jumping ? 100000 : 10000))).toBe(true);
    if (id === 'jump-game-ii') expect(Number.isFinite(jumpOracle(input as number[]))).toBe(true);
  }
  if (id === 'jump-game') expect(typeof sample.expected).toBe('boolean');
  else {
    expect(Number.isInteger(sample.expected)).toBe(true);
    expect(sample.expected).toBeGreaterThanOrEqual(0);
    if (jumping || id === 'non-overlapping-intervals') expect(sample.expected).toBeLessThan(input.length);
  }
}

function* arrays(alphabetSize: number, maxLength: number): Generator<number[]> {
  for (let length = 1; length <= maxLength; length++) {
    for (let encoding = 0; encoding < alphabetSize ** length; encoding++) {
      let rest = encoding;
      yield Array.from({ length }, () => {
        const value = rest % alphabetSize;
        rest = Math.floor(rest / alphabetSize);
        return value;
      });
    }
  }
}

it('fixtures and legacy IDs correspond exactly to the five distinct tasks', () => {
  const ids = Object.keys(signatures).sort();
  expect(tasks.map(task => task.id).sort()).toEqual(ids);
  expect(Object.keys(greedySolutions).sort()).toEqual(ids);
  expect(Object.keys(greedyWrongSolutions).sort()).toEqual(ids);
});

for (const task of tasks) {
  const runner = runnerFor(task);
  describe(task.id, () => {
    it('defines an exact returned value, neutral signature, complexity and named cases', () => {
      expect(runner.output).toEqual({ kind: 'return' });
      expect(runner.comparison).toBe('exact');
      expect(runner.preserveArgs).toBeUndefined();
      expect(runner.freshArray).toBeUndefined();
      expect(signatures[task.id].startsWith(`${runner.entryPoint}(`)).toBe(true);
      expect(task.starter.replace(/\r\n/g, '\n').trim()).toBe(`function ${signatures[task.id]} {\n  // TODO: реализуй функцию\n}`);
      expect(runner.cases).toHaveLength(12);
      expect(runner.cases.every(sample => sample.name.trim().length > 0)).toBe(true);
      expect(new Set(runner.cases.map(sample => sample.name)).size).toBe(runner.cases.length);
      expect(task.verificationNote).toBeTruthy();
      expect(task.complexity.variables).toBeTruthy();
      const options = task.complexity.options.map(option => option.id);
      expect(options).toContain('unknown');
      expect(task.complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space']);
      expect(task.complexity.criteria.find(criterion => criterion.id === 'time')?.expected)
        .toBe(task.id === 'non-overlapping-intervals' ? 'linearithmic' : 'linear');
      expect(task.complexity.criteria.find(criterion => criterion.id === 'space')?.expected)
        .toBe(task.id === 'non-overlapping-intervals' ? 'linear' : 'constant');
      for (const criterion of task.complexity.criteria) {
        expect(criterion.explanation).toBeTruthy();
        for (const answer of [criterion.expected, ...criterion.accepted ?? []]) {
          expect(options).toContain(answer);
          expect(answer).not.toBe('unknown');
        }
      }
    });

    for (const sample of runner.cases) {
      it(`${sample.name}: valid domain, independent oracle and reference result`, () => {
        checkDomain(task.id, sample);
        expect(sample.expected).toBe(oracle(task.id, sample.args));
        const execute = load(greedySolutions[task.id], runner.entryPoint);
        expect(execute(...structuredClone(sample.args))).toBe(sample.expected);
      });
    }

    it('the neutral starter is callable and cannot pass a case', () => {
      const execute = load(task.starter, runner.entryPoint);
      for (const sample of runner.cases) {
        expect(execute(...structuredClone(sample.args))).not.toBe(sample.expected);
      }
    });

    it('rejects every bounded wrong variant using named cases', () => {
      expect(greedyWrongSolutions[task.id].length).toBeGreaterThanOrEqual(4);
      for (const source of greedyWrongSolutions[task.id]) {
        const execute = load(source, runner.entryPoint);
        expect(runner.cases.some(sample => {
          try { return execute(...structuredClone(sample.args)) !== sample.expected; }
          catch { return true; }
        })).toBe(true);
      }
    });

    it('agrees with exhaustive small-input oracles (Jump II only on reachable inputs)', () => {
      const execute = load(greedySolutions[task.id], runner.entryPoint);
      const intervals = [[-1, 0], [-1, 1], [-1, 2], [0, 1], [0, 2], [1, 2]];
      const inputArrays = task.id === 'non-overlapping-intervals' ? arrays(intervals.length, 4) : arrays(4, 6);
      let checked = 0;
      for (const values of inputArrays) {
        const args: JsonValue[] = [task.id === 'non-overlapping-intervals'
          ? values.map(index => [...intervals[index]]) : values];
        const expected = oracle(task.id, args);
        if (task.id === 'jump-game-ii' && expected === Infinity) continue;
        expect(execute(...structuredClone(args))).toBe(expected);
        checked++;
      }
      expect(checked).toBeGreaterThan(1000);
    });
  });
}
