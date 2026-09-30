import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import source from './sandbox-worker.js?raw';
import type { ClassRunner, FunctionRunner } from '../../../tasks/types';
import type { RunResult } from './types';
import { isRunResult } from './protocol';

// Node executes only these fixed fixtures; learner code executes exclusively in a browser Worker.
function execute(code: string, runner: FunctionRunner | ClassRunner) {
  let result: RunResult | undefined;
  const endpoint: {
    postMessage: (message: { result: RunResult }) => void;
    onmessage?: ((event: { data: { code: string; runner: FunctionRunner | ClassRunner } }) => void) | null;
  } = { postMessage: message => { result = message.result; } };
  runInNewContext(source, { self: endpoint, performance, structuredClone }, { timeout: 1000 });
  endpoint.onmessage?.({ data: { code, runner } });
  if (!result) throw new Error('Worker fixture did not respond');
  expect(isRunResult(result, runner.cases.length)).toBe(true);
  return result;
}
const base: FunctionRunner = {
  kind: 'function', entryPoint: 'solve', output: { kind: 'return' }, comparison: 'exact',
  cases: [{ name: 'strict value', args: [2], expected: 2 }],
};

describe('generic worker execution', () => {
  it('supports function declarations and const functions with strict output types', () => {
    expect(execute('const solve = n => n;', base).status).toBe('passed');
    expect(execute('function solve(n) { return String(n); }', base).status).toBe('failed');
    expect(execute('function unrelated() {}', base).error?.name).toBe('TypeError');
  });
  it('compares the selected mutated argument, not the return value', () => {
    const runner: FunctionRunner = { ...base, output: { kind: 'argument', index: 0 }, cases: [
      { name: 'mutation', args: [[1, 2]], expected: [1, 2, 3] },
    ] };
    expect(execute('function solve(a) { a.push(3); return "ignored"; }', runner).status).toBe('passed');
    expect(execute('function solve(a) { return [...a, 3]; }', runner).status).toBe('failed');
    expect(runner.cases[0].args).toEqual([[1, 2]]);
  });
  it('checks mutation and aliasing contracts even when output values match', () => {
    const runner: FunctionRunner = { ...base, preserveArgs: [0], freshArray: true, cases: [
      { name: 'fresh output', args: [[1, 2]], expected: [1, 2] },
    ] };
    expect(execute('function solve(a) { return [...a]; }', runner).status).toBe('passed');
    const alias = execute('function solve(a) { return a; }', runner);
    expect(alias.status).toBe('failed');
    expect(alias.cases[0].feedback).toContain('новый массив');
    const mutated = execute('function solve(a) { a.pop(); return [1, 2]; }', runner);
    expect(mutated.status).toBe('failed');
    expect(mutated.cases[0].feedback).toContain('Изменён входной аргумент');
  });
  it('unordered comparison preserves multiplicity and primitive types', () => {
    const runner: FunctionRunner = { ...base, comparison: 'unordered', cases: [
      { name: 'values', args: [], expected: [1, 2, 2] },
    ] };
    expect(execute('function solve() { return [2, 1, 2]; }', runner).status).toBe('passed');
    expect(execute('function solve() { return [1, 1, 2]; }', runner).status).toBe('failed');
    expect(execute('function solve() { return ["2", "1", "2"]; }', runner).status).toBe('failed');
  });
  it('nested unordered comparison retains groups, duplicates and empty strings', () => {
    const runner: FunctionRunner = { ...base, comparison: 'nested-unordered', cases: [
      { name: 'groups', args: [], expected: [['ab', 'ba', 'ab'], ['', '']] },
    ] };
    expect(execute('const solve = () => [["", ""], ["ba", "ab", "ab"]];', runner).status).toBe('passed');
    expect(execute('const solve = () => [[""], ["ab", "ba"]];', runner).status).toBe('failed');
    expect(execute('const solve = () => [["ab", ""], ["ba", "ab", ""]];', runner).status).toBe('failed');
  });
  it('generic class methods retain instance state and use explicit argument lists', () => {
    const runner: ClassRunner = { kind: 'class', entryPoint: 'Counter', cases: [{
      name: 'independent instances', instances: [[2], [10]], calls: [
        { instance: 0, method: 'add', args: [3], expected: 5 },
        { instance: 1, method: 'add', args: [-1], expected: 9 },
        { instance: 0, method: 'add', args: [1], expected: 6 },
      ],
    }] };
    expect(execute('class Counter { constructor(n) { this.n = n; } add(x) { return this.n += x; } }', runner).status).toBe('passed');
  });
});
