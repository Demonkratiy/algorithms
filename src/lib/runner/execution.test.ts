import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import source from './sandbox-worker.js?raw';
import type { ClassRunner, FunctionRunner, LinkedListRunner, TaskDefinition } from '../../../tasks/types';
import type { RunResult } from './types';
import { isRunResult } from './protocol';

// Node executes only these fixed fixtures; learner code executes exclusively in a browser Worker.
function execute(code: string, runner: TaskDefinition['runner']) {
  let result: RunResult | undefined;
  const endpoint: {
    postMessage: (message: { result: RunResult }) => void;
    onmessage?: ((event: { data: { code: string; runner: TaskDefinition['runner'] } }) => void) | null;
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
  it('ignores unspecified method returns but checks their state effects', () => {
    const runner: ClassRunner = { kind: 'class', entryPoint: 'Counter', cases: [{
      name: 'void calls', instances: [[2]], calls: [
        { instance: 0, method: 'add', args: [3], ignoreReturn: true },
        { instance: 0, method: 'peek', args: [], expected: 5 },
      ],
    }] };
    const correct = 'class Counter { constructor(n) { this.n = n; } add(x) { this.n += x; return "ignored"; } peek() { return this.n; } }';
    expect(execute(correct, runner).status).toBe('passed');
    expect(execute(correct.replace('this.n += x;', ''), runner).status).toBe('failed');
  });
  it('reads class properties and distinguishes required undefined from null', () => {
    const runner: ClassRunner = { kind: 'class', entryPoint: 'Box', cases: [{
      name: 'property and undefined', instances: [[]], calls: [
        { instance: 0, property: 'size', expected: 0 },
        { instance: 0, method: 'peek', args: [], expectedUndefined: true },
        { instance: 0, method: 'push', args: [3], ignoreReturn: true },
        { instance: 0, property: 'size', expected: 1 },
        { instance: 0, method: 'peek', args: [], expected: 3 },
      ],
    }] };
    const source = 'class Box { constructor(){this.values=[];} get size(){return this.values.length;} push(n){this.values.push(n);} peek(){return this.values[0];} }';
    expect(execute(source, runner).status).toBe('passed');
    expect(execute(source.replace('this.values[0];', 'this.values[0] ?? null;'), runner).status).toBe('failed');
  });
  it('injects comparator callbacks from trusted descriptors for independent instances', () => {
    const runner: ClassRunner = { kind: 'class', entryPoint: 'Ordered', cases: [{
      name: 'comparators', instances: [[], []],
      factories: [
        { instance: 0, argument: 0, kind: 'number', direction: 'desc' },
        { instance: 1, argument: 0, kind: 'property', property: 'priority', direction: 'asc' },
      ],
      calls: [
        { instance: 0, method: 'push', args: [1], ignoreReturn: true },
        { instance: 0, method: 'push', args: [7], ignoreReturn: true },
        { instance: 0, method: 'pop', args: [], expected: 7 },
        { instance: 1, method: 'push', args: [{ priority: 9 }], ignoreReturn: true },
        { instance: 1, method: 'push', args: [{ priority: 1 }], ignoreReturn: true },
        { instance: 1, method: 'pop', args: [], expected: { priority: 1 } },
      ],
    }] };
    expect(execute('class Ordered { constructor(compare){this.compare=compare;this.values=[];} push(n){this.values.push(n);this.values.sort(this.compare);} pop(){return this.values.shift();} }', runner).status).toBe('passed');
  });
  it('constructs through a static factory and guards retained input aliases', () => {
    const runner: ClassRunner = { kind: 'class', entryPoint: 'Box', factoryMethod: 'from', preserveArgs: [0], cases: [{
      name: 'factory copies input', instances: [[[3, 1]], [[9]]], calls: [
        { instance: 0, property: 'size', expected: 2 },
        { instance: 0, method: 'pop', args: [], expected: 3 },
        { instance: 1, method: 'pop', args: [], expected: 9 },
        { instance: 0, property: 'size', expected: 1 },
      ],
    }] };
    const source = 'class Box { static from(a) { const result = new this(); result.values = [...a]; return result; } get size(){return this.values.length;} pop(){return this.values.shift();} }';
    expect(execute(source, runner).status).toBe('passed');
    const alias = execute(source.replace('[...a]', 'a'), runner);
    expect(alias.status).toBe('failed');
    expect(alias.cases[0].feedback).toContain('Исходные данные');
  });
  it('unordered tuples preserve coordinate or interval endpoint order', () => {
    const runner: FunctionRunner = { ...base, comparison: 'unordered-tuples', cases: [
      { name: 'tuples', args: [], expected: [[1, 2], [3, 4]] },
    ] };
    expect(execute('const solve = () => [[3,4],[1,2]];', runner).status).toBe('passed');
    expect(execute('const solve = () => [[2,1],[3,4]];', runner).status).toBe('failed');
  });
  it('closest-points accepts boundary ties but not missing nearer points or fabricated duplicates', () => {
    const runner: FunctionRunner = { ...base, comparison: 'closest-points', cases: [
      { name: 'tie', args: [[[0, 0], [1, 0], [-1, 0]], 2], expected: [[0, 0], [1, 0]] },
    ] };
    expect(execute('const solve = () => [[-1,0],[0,0]];', runner).status).toBe('passed');
    expect(execute('const solve = () => [[1,0],[-1,0]];', runner).status).toBe('failed');
    expect(execute('const solve = () => [[0,0],[0,1]];', runner).status).toBe('failed');
    expect(execute('const solve = () => [[0,0],[0,0]];', runner).status).toBe('failed');
    expect(execute('const solve = () => [["0",0],[1,0]];', runner).status).toBe('failed');
  });
  it('closest-points respects repeated input points and does not swap coordinates', () => {
    const duplicate: FunctionRunner = { ...base, comparison: 'closest-points', cases: [
      { name: 'duplicates', args: [[[1, 0], [1, 0], [3, 0]], 2], expected: [[1, 0], [1, 0]] },
    ] };
    expect(execute('const solve = () => [[1,0],[1,0]];', duplicate).status).toBe('passed');
    const coordinate: FunctionRunner = { ...base, comparison: 'closest-points', cases: [
      { name: 'coordinates', args: [[[1, 3]], 1], expected: [[1, 3]] },
    ] };
    expect(execute('const solve = () => [[3,1]];', coordinate).status).toBe('failed');
  });
});

describe('linked-list execution contract', () => {
  const runner: LinkedListRunner = {
    kind: 'linked-list', entryPoint: 'solve', cases: [
      { name: 'original node', lists: [{ values: [7, 7, 7] }], expected: { kind: 'node', node: { list: 0, index: 1 } } },
    ],
  };
  it('passes real nodes and compares node identity instead of equal values', () => {
    expect(execute('function solve(head) { return head.next; }', runner).status).toBe('passed');
    expect(execute('function solve(head) { return new ListNode(head.next.val, head.next.next); }', runner).status).toBe('failed');
    expect(execute('function solve(head) { return head; }', runner).status).toBe('failed');
  });
  it('constructs a cycle and checks two entry points in one task', () => {
    const cycle: LinkedListRunner = { kind: 'linked-list', entryPoint: 'hasCycle', cases: [
      { name: 'A', lists: [{ values: [3, 2, 0], cycleAt: 1 }], expected: { kind: 'value', value: true } },
      { name: 'B', entryPoint: 'detectCycle', lists: [{ values: [3, 2, 0], cycleAt: 1 }], expected: { kind: 'node', node: { list: 0, index: 1 } } },
    ] };
    const partA = 'function hasCycle(head) { return head.next.next.next === head.next; }';
    expect(execute(partA + ' function detectCycle(head) { return head.next; }', cycle).status).toBe('passed');
    const incomplete = execute(partA, cycle);
    expect(incomplete.status).toBe('error');
    expect(incomplete.cases[0].passed).toBe(true);
    expect(incomplete.cases[1].error?.message).toContain('detectCycle');
  });
  it('distinguishes null from missing return on empty input', () => {
    const empty: LinkedListRunner = { ...runner, cases: [
      { name: 'null', lists: [{ values: [] }], expected: { kind: 'node', node: null } },
      { name: 'empty list', lists: [{ values: [] }], expected: { kind: 'list', values: [] } },
    ] };
    expect(execute('function solve(head) { return head; }', empty).status).toBe('passed');
    expect(execute('function solve() {}', empty).status).toBe('failed');
  });
  it('detects malformed or cyclic returned lists without unbounded traversal', () => {
    const single: LinkedListRunner = { ...runner, cases: [
      { name: 'list', lists: [{ values: [1] }], expected: { kind: 'list', values: [1] } },
    ] };
    const cycle = execute('function solve(head) { head.next = head; return head; }', single);
    expect(cycle.status).toBe('failed');
    expect(cycle.cases[0].feedback).toContain('цикл');
    expect(execute('function solve() { return [1]; }', single).status).toBe('failed');
    const extra = execute('function solve(head) { head.next = new ListNode(2); return head; }', single);
    expect(extra.status).toBe('failed');
    expect(extra.cases[0].feedback).toContain('длиннее');
  });
  it('checks node order when the task explicitly requires link rewiring', () => {
    const reverse: LinkedListRunner = { ...runner, cases: [
      { name: 'links', lists: [{ values: [1, 2] }], expected: { kind: 'list', values: [2, 1], reuseNodes: true, nodeOrder: [{ list: 0, index: 1 }, { list: 0, index: 0 }] } },
    ] };
    expect(execute('function solve(head) { const next = head.next; head.next = null; next.next = head; return next; }', reverse).status).toBe('passed');
    const copiedValues = execute('function solve(head) { head.val = 2; head.next.val = 1; return head; }', reverse);
    expect(copiedValues.status).toBe('failed');
    const copiedNodes = execute('function solve() { return new ListNode(2, new ListNode(1)); }', reverse);
    expect(copiedNodes.status).toBe('failed');
  });
  it('enforces input preservation only when declared', () => {
    const marked = 'function solve(head) { head.next.visited = true; return head.next; }';
    expect(execute(marked, runner).status).toBe('passed');
    const preserved = execute(marked, { ...runner, preserveInputs: true });
    expect(preserved.status).toBe('failed');
    expect(preserved.cases[0].feedback).toContain('неизменными');
  });
});
