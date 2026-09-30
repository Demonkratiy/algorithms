import { isDeepStrictEqual } from 'node:util';
import { describe, expect, it } from 'vitest';
import { numberOfIslandsTask } from './number-of-islands/task';
import { rottingOrangesTask } from './rotting-oranges/task';
import { cloneGraphTask } from './clone-graph/task';
import { wordSearchTask } from './word-search/task';
import { courseScheduleTask } from './course-schedule/task';
import { courseScheduleIITask } from './course-schedule-ii/task';
import type { FunctionCase, FunctionRunner, GraphCloneCase, JsonValue, TaskDefinition } from './types';
import { graphSolutions, graphWrongSolutions } from '../tests/fixtures/graphs';

const tasks = [
  numberOfIslandsTask, rottingOrangesTask, cloneGraphTask,
  wordSearchTask, courseScheduleTask, courseScheduleIITask,
];
const signatures: Record<string, string> = {
  'number-of-islands': 'numIslands(grid)',
  'rotting-oranges': 'orangesRotting(grid)',
  'clone-graph': 'cloneGraph(node)',
  'word-search': 'exist(board, word)',
  'course-schedule': 'canFinish(numCourses, prerequisites)',
  'course-schedule-ii': 'findOrder(numCourses, prerequisites)',
};
const complexityLabels: Record<string, [string, string]> = {
  'number-of-islands': ['O(R × C)', 'O(R × C)'],
  'rotting-oranges': ['O(R × C)', 'O(R × C)'],
  'clone-graph': ['O(V + E)', 'O(V)'],
  'word-search': ['O(R × C × 3^L)', 'O(L)'],
  'course-schedule': ['O(V + E)', 'O(V + E)'],
  'course-schedule-ii': ['O(V + E)', 'O(V + E)'],
};

class GraphNode {
  constructor(public val = 0, public neighbors: GraphNode[] = []) {}
}

function compile(source: string, entryPoint: string): (...args: unknown[]) => unknown {
  return new Function('Node', `"use strict"; ${source}; return ${entryPoint};`)(GraphNode);
}

function graphInput(testCase: GraphCloneCase) {
  const nodes = testCase.adjacency.map((_, i) => new GraphNode(testCase.values?.[i] ?? i + 1));
  testCase.adjacency.forEach((neighbors, i) => { nodes[i].neighbors = neighbors.map(position => nodes[position - 1]); });
  return { nodes, root: nodes[testCase.start ?? 0] ?? null };
}

function isNode(node: unknown): node is GraphNode {
  return node !== null && typeof node === 'object' &&
    'val' in node && typeof node.val === 'number' &&
    'neighbors' in node && Array.isArray(node.neighbors);
}

function validClone(testCase: GraphCloneCase, originals: GraphNode[], originalArrays: GraphNode[][], result: unknown) {
  if (originals.length === 0) return result === null;
  const values = testCase.values ?? testCase.adjacency.map((_, i) => i + 1);
  if (!isNode(result) || result.val !== values[testCase.start ?? 0]) return false;
  const originalNodes = new Set(originals), arrays = new Set(originalArrays);
  const copies = new Map<number, GraphNode>(), copyArrays = new Set<GraphNode[]>();
  const queue: unknown[] = [result];
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    if (!isNode(current) || originalNodes.has(current)) return false;
    if (copies.has(current.val)) {
      if (copies.get(current.val) !== current) return false;
      continue;
    }
    const index = values.indexOf(current.val);
    if (index < 0 || copies.size >= values.length || arrays.has(current.neighbors) || copyArrays.has(current.neighbors)) return false;
    copies.set(current.val, current);
    copyArrays.add(current.neighbors);
    if (!current.neighbors.every(isNode)) return false;
    const actualNeighbors = current.neighbors.map(node => node.val).sort((a, b) => a - b);
    const expectedNeighbors = testCase.adjacency[index].map(position => values[position - 1]).sort((a, b) => a - b);
    if (!isDeepStrictEqual(actualNeighbors, expectedNeighbors)) return false;
    queue.push(...current.neighbors);
  }
  return copies.size === values.length;
}

// Union-find checks components independently of the fixture's flood-fill traversal.
function islandsOracle(grid: string[][]) {
  const rows = grid.length, cols = grid[0].length;
  const parent = Array.from({ length: rows * cols }, (_, i) => i);
  function root(index: number): number {
    while (parent[index] !== index) {
      parent[index] = parent[parent[index]];
      index = parent[index];
    }
    return index;
  }
  let components = grid.flat().filter(cell => cell === '1').length;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c] !== '1') continue;
    for (const [nr, nc] of [[r - 1, c], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || grid[nr][nc] !== '1') continue;
      const a = root(r * cols + c), b = root(nr * cols + nc);
      if (a !== b) { parent[a] = b; components--; }
    }
  }
  return components;
}

// Synchronous full-grid snapshots simulate minutes, without BFS or a queue.
function orangesOracle(input: number[][]) {
  let grid = structuredClone(input), minutes = 0;
  while (grid.some(row => row.includes(1))) {
    let changed = false;
    const next = grid.map((row, r) => row.map((cell, c) => {
      if (cell === 1 && [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
        .some(([nr, nc]) => grid[nr]?.[nc] === 2)) {
        changed = true;
        return 2;
      }
      return cell;
    }));
    if (!changed) return -1;
    grid = next;
    minutes++;
  }
  return minutes;
}

// Enumerate paths using immutable bit masks rather than marking/restoring the board.
function wordOracle(board: string[][], word: string) {
  const rows = board.length, cols = board[0].length;
  const stack: { r: number; c: number; index: number; used: bigint }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) stack.push({ r, c, index: 0, used: 0n });
  while (stack.length) {
    const { r, c, index, used } = stack.pop()!;
    const bit = 1n << BigInt(r * cols + c);
    if ((used & bit) !== 0n || board[r][c] !== word[index]) continue;
    if (index === word.length - 1) return true;
    for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) stack.push({ r: nr, c: nc, index: index + 1, used: used | bit });
    }
  }
  return false;
}

// Iterative DFS colours detect cycles independently of the fixture's Kahn algorithm.
function acyclic(numCourses: number, prerequisites: number[][]) {
  const graph = Array.from({ length: numCourses }, () => [] as number[]);
  prerequisites.forEach(([course, prerequisite]) => graph[prerequisite].push(course));
  const state = Array<number>(numCourses).fill(0);
  for (let start = 0; start < numCourses; start++) {
    if (state[start] !== 0) continue;
    state[start] = 1;
    const stack = [{ node: start, next: 0 }];
    while (stack.length) {
      const frame = stack[stack.length - 1];
      if (frame.next === graph[frame.node].length) {
        state[frame.node] = 2;
        stack.pop();
        continue;
      }
      const next = graph[frame.node][frame.next++];
      if (state[next] === 1) return false;
      if (state[next] === 0) {
        state[next] = 1;
        stack.push({ node: next, next: 0 });
      }
    }
  }
  return true;
}

function validOrder(numCourses: number, prerequisites: number[][], result: unknown) {
  if (!Array.isArray(result)) return false;
  if (!acyclic(numCourses, prerequisites)) return result.length === 0;
  if (result.length !== numCourses || new Set(result).size !== numCourses ||
    !result.every(course => Number.isInteger(course) && course >= 0 && course < numCourses)) return false;
  const positions = new Map<number, number>(result.map((course: number, i: number) => [course, i]));
  return prerequisites.every(([course, prerequisite]) => positions.get(prerequisite)! < positions.get(course)!);
}

function independentExpected(id: string, args: JsonValue[]) {
  switch (id) {
    case 'number-of-islands': return islandsOracle(args[0] as string[][]);
    case 'rotting-oranges': return orangesOracle(args[0] as number[][]);
    case 'word-search': return wordOracle(args[0] as string[][], args[1] as string);
    case 'course-schedule': return acyclic(args[0] as number, args[1] as number[][]);
    default: throw new Error(`No scalar oracle for ${id}`);
  }
}

function executeFunction(source: string, runner: FunctionRunner, testCase: FunctionCase) {
  const args = structuredClone(testCase.args);
  const result = compile(source, runner.entryPoint)(...args);
  if (runner.preserveArgs?.some(index => !isDeepStrictEqual(args[index], testCase.args[index]))) return false;
  return runner.comparison === 'topological-order'
    ? validOrder(testCase.args[0] as number, testCase.args[1] as number[][], result)
    : isDeepStrictEqual(result, testCase.expected);
}

function accepts(source: string, task: TaskDefinition, index: number) {
  try {
    if (task.runner.kind === 'function') return executeFunction(source, task.runner, task.runner.cases[index]);
    if (task.runner.kind !== 'graph-clone') throw new Error('Unsupported runner');
    const testCase = task.runner.cases[index], { nodes, root } = graphInput(testCase);
    const arrays = nodes.map(node => node.neighbors);
    return validClone(testCase, nodes, arrays, compile(source, task.runner.entryPoint)(root));
  } catch {
    return false;
  }
}

function expectFunctionDomain(id: string, args: JsonValue[]) {
  if (id.startsWith('course-schedule')) {
    expect(args).toHaveLength(2);
    const n = args[0] as number, prerequisites = args[1] as number[][];
    expect(Number.isInteger(n) && n >= 1 && n <= 2000).toBe(true);
    expect(prerequisites.length).toBeLessThanOrEqual(id === 'course-schedule' ? 5000 : n * (n - 1));
    expect(prerequisites.every(pair => pair.length === 2 && pair.every(value => Number.isInteger(value) && value >= 0 && value < n))).toBe(true);
    expect(new Set(prerequisites.map(pair => pair.join(','))).size).toBe(prerequisites.length);
    return;
  }
  expect(args).toHaveLength(id === 'word-search' ? 2 : 1);
  const grid = args[0] as (string | number)[][];
  const max = id === 'number-of-islands' ? 300 : id === 'rotting-oranges' ? 10 : 6;
  expect(grid.length >= 1 && grid.length <= max).toBe(true);
  expect(grid[0].length >= 1 && grid[0].length <= max).toBe(true);
  expect(grid.every(row => row.length === grid[0].length)).toBe(true);
  expect(grid.flat().every(cell => id === 'number-of-islands' ? cell === '0' || cell === '1'
    : id === 'rotting-oranges' ? cell === 0 || cell === 1 || cell === 2
    : typeof cell === 'string' && /^[a-zA-Z]$/.test(cell))).toBe(true);
  if (id === 'word-search') expect(typeof args[1] === 'string' && /^[a-zA-Z]{1,15}$/.test(args[1])).toBe(true);
}

function expectGraphDomain(testCase: GraphCloneCase) {
  const { adjacency, values, start } = testCase, n = adjacency.length;
  expect(n).toBeLessThanOrEqual(100);
  if (values !== undefined) {
    expect(values).toHaveLength(n);
    expect(new Set(values).size).toBe(n);
    expect(values.every(value => Number.isInteger(value) && value >= 1 && value <= 100)).toBe(true);
  }
  if (n === 0) { expect(start).toBeUndefined(); return; }
  expect(start === undefined || (Number.isInteger(start) && start >= 0 && start < n)).toBe(true);
  adjacency.forEach((neighbors, i) => {
    expect(new Set(neighbors).size).toBe(neighbors.length);
    expect(neighbors.every(position => Number.isInteger(position) && position >= 1 && position <= n && position !== i + 1)).toBe(true);
    expect(neighbors.every(position => adjacency[position - 1].includes(i + 1))).toBe(true);
  });
  const seen = new Set([0]), queue = [0];
  for (let head = 0; head < queue.length; head++) for (const position of adjacency[queue[head]]) {
    if (!seen.has(position - 1)) { seen.add(position - 1); queue.push(position - 1); }
  }
  expect(seen.size).toBe(n);
}

for (const task of tasks) describe(task.id, () => {
  it('has a neutral starter, documented runner and both complexity criteria', () => {
    expect(task.starter).toContain(`function ${signatures[task.id]}`);
    expect(task.starter).toMatch(/\{\s*\/\/ TODO: напиши решение\.\s*\}\s*$/);
    expect(typeof compile(task.starter, task.runner.entryPoint)).toBe('function');
    expect(task.runner.cases.length).toBeGreaterThanOrEqual(6);
    expect(new Set(task.runner.cases.map(testCase => testCase.name)).size).toBe(task.runner.cases.length);
    expect(task.complexity.options.some(option => option.id === 'unknown')).toBe(true);
    expect(new Set(task.complexity.options.map(option => option.id)).size).toBe(task.complexity.options.length);
    expect(task.complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space']);
    task.complexity.criteria.forEach((criterion, i) => {
      expect(task.complexity.options.find(option => option.id === criterion.expected)?.label).toBe(complexityLabels[task.id][i]);
      expect(criterion.explanation.length).toBeGreaterThan(20);
    });
    if (task.id === 'clone-graph') {
      expect(task.runner.kind).toBe('graph-clone');
    } else {
      expect(task.runner.kind).toBe('function');
      if (task.runner.kind !== 'function') throw new Error('Expected function runner');
      expect(task.runner.output).toEqual({ kind: 'return' });
      expect(task.runner.comparison).toBe(task.id === 'course-schedule-ii' ? 'topological-order' : 'exact');
      expect(task.runner.preserveArgs).toEqual(task.id === 'word-search' ? [0] : undefined);
    }
  });

  task.runner.cases.forEach((testCase, index) => it(testCase.name, () => {
    if ('adjacency' in testCase) {
      expectGraphDomain(testCase);
    } else if ('args' in testCase && 'expected' in testCase) {
      const functionCase = testCase as FunctionCase;
      expectFunctionDomain(task.id, functionCase.args);
      if (task.id === 'course-schedule-ii') {
        expect(validOrder(functionCase.args[0] as number, functionCase.args[1] as number[][], functionCase.expected)).toBe(true);
      } else {
        expect(functionCase.expected).toEqual(independentExpected(task.id, functionCase.args));
      }
    } else throw new Error('Unsupported case');
    expect(accepts(graphSolutions[task.id], task, index)).toBe(true);
  }));

  graphWrongSolutions[task.id].forEach((source, index) => it(`rejects bounded wrong implementation ${index + 1}`, () => {
    expect(task.runner.cases.some((_, caseIndex) => !accepts(source, task, caseIndex))).toBe(true);
  }));
});

describe('independent graph contract regressions', () => {
  it('accepts alternative orders but rejects duplicates, missing courses, direction errors and partial cyclic output', () => {
    const diamond = [[1, 0], [2, 0], [3, 1], [3, 2]];
    expect(validOrder(4, diamond, [0, 1, 2, 3])).toBe(true);
    expect(validOrder(4, diamond, [0, 2, 1, 3])).toBe(true);
    expect(validOrder(3, [], [2, 1, 0])).toBe(true);
    for (const bad of [[0, 1, 1, 3], [0, 1, 2], [3, 2, 1, 0], [0, 1, 2, 4], [0, 1, 2, 3.5], ['0', 1, 2, 3], null]) {
      expect(validOrder(4, diamond, bad)).toBe(false);
    }
    expect(validOrder(3, [[1, 2], [2, 1]], [0])).toBe(false);
    expect(validOrder(3, [[1, 2], [2, 1]], [])).toBe(true);
    expect(validOrder(3, [], [])).toBe(false);
  });

  it('rejects original nodes, original neighbor arrays, duplicated identities, shared arrays and changed structure', () => {
    const testCase: GraphCloneCase = { name: 'diamond', adjacency: [[2, 3], [1, 4], [1, 4], [2, 3]], values: [9, 50, 3, 100], start: 1 };
    const { nodes, root } = graphInput(testCase), arrays = nodes.map(node => node.neighbors);
    const check = (result: unknown) => validClone(testCase, nodes, arrays, result);
    expect(check(root)).toBe(false);
    expect(check(new GraphNode(root!.val, root!.neighbors))).toBe(false);
    const good = () => compile(graphSolutions['clone-graph'], 'cloneGraph')(root) as GraphNode;
    expect(check(good())).toBe(true);
    const duplicate = good();
    duplicate.neighbors[0].neighbors[0] = new GraphNode(duplicate.val, duplicate.neighbors.slice());
    expect(check(duplicate)).toBe(false);
    const missingEdge = good();
    missingEdge.neighbors.pop();
    expect(check(missingEdge)).toBe(false);
    const multipleEdges = good();
    multipleEdges.neighbors.push(multipleEdges.neighbors[0]);
    expect(check(multipleEdges)).toBe(false);
    const selfLoop = good();
    selfLoop.neighbors[0] = selfLoop;
    expect(check(selfLoop)).toBe(false);
    const wrongRoot = good();
    expect(check(wrongRoot.neighbors[0])).toBe(false);
    const isolated: GraphCloneCase = { name: 'isolated', adjacency: [[]], values: [42] };
    const single = graphInput(isolated).nodes;
    expect(validClone(isolated, single, [single[0].neighbors], new GraphNode(42, single[0].neighbors))).toBe(false);
    const star: GraphCloneCase = { name: 'star', adjacency: [[2, 3], [1], [1]] };
    const originalStar = graphInput(star), center = new GraphNode(1);
    const shared = [center];
    center.neighbors = [new GraphNode(2, shared), new GraphNode(3, shared)];
    expect(validClone(star, originalStar.nodes, originalStar.nodes.map(node => node.neighbors), center)).toBe(false);
    expect(validClone({ name: 'empty', adjacency: [] }, [], [], undefined)).toBe(false);
  });

  it('checks Word Search restoration on both successful and failed searches', () => {
    if (wordSearchTask.runner.kind !== 'function') throw new Error('Expected function runner');
    const runner = wordSearchTask.runner;
    const leavesMutation = `${graphSolutions['word-search'].replace('function exist(', 'function search(')}
      function exist(board, word) { const found = search(board, word); board[0][0] = '#'; return found; }`;
    for (const testCase of [
      { name: 'success', args: [[['A']], 'A'], expected: true },
      { name: 'failure', args: [[['A']], 'B'], expected: false },
    ] satisfies FunctionCase[]) {
      expect(executeFunction(graphSolutions['word-search'], runner, testCase)).toBe(true);
      expect(executeFunction(leavesMutation, runner, testCase)).toBe(false);
    }
  });

  it('allows mutations in Islands and Oranges while checking scalar results', () => {
    const islands: JsonValue[] = [[['1']]], oranges: JsonValue[] = [[[2, 1]]];
    expect(compile(graphSolutions['number-of-islands'], 'numIslands')(...islands)).toBe(1);
    expect(islands).toEqual([[['0']]]);
    expect(compile(graphSolutions['rotting-oranges'], 'orangesRotting')(...oranges)).toBe(1);
    expect(oranges).toEqual([[[2, 2]]]);
  });

  it('agrees with independent oracles on every 2×2 binary island grid and ternary orange grid', () => {
    for (const task of [numberOfIslandsTask, rottingOrangesTask]) {
      if (task.runner.kind !== 'function') throw new Error('Expected function runner');
      const base = task.id === 'number-of-islands' ? 2 : 3;
      for (let encoded = 0; encoded < base ** 4; encoded++) {
        const cells = Array.from({ length: 4 }, (_, i) => Math.floor(encoded / base ** i) % base);
        const grid = [cells.slice(0, 2), cells.slice(2)].map(row => task.id === 'number-of-islands' ? row.map(String) : row);
        const args: JsonValue[] = [grid];
        expectFunctionDomain(task.id, args);
        const expected = independentExpected(task.id, args);
        expect(executeFunction(graphSolutions[task.id], task.runner, { name: String(encoded), args, expected })).toBe(true);
      }
    }
  });

  it('agrees on binary 2×2 boards and all binary words of lengths 1..4', () => {
    if (wordSearchTask.runner.kind !== 'function') throw new Error('Expected function runner');
    for (let encoded = 0; encoded < 16; encoded++) {
      const cells = Array.from({ length: 4 }, (_, i) => encoded & (1 << i) ? 'A' : 'B');
      const board = [cells.slice(0, 2), cells.slice(2)];
      for (let length = 1; length <= 4; length++) for (let bits = 0; bits < 2 ** length; bits++) {
        const word = Array.from({ length }, (_, i) => bits & (1 << i) ? 'A' : 'B').join('');
        const args: JsonValue[] = [board, word];
        expectFunctionDomain('word-search', args);
        expect(executeFunction(graphSolutions['word-search'], wordSearchTask.runner, {
          name: `${encoded}:${word}`, args, expected: wordOracle(board, word),
        })).toBe(true);
      }
    }
  });

  it('agrees on all 64 directed simple three-course graphs', () => {
    const edges = [[0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1]];
    for (let mask = 0; mask < 64; mask++) {
      const prerequisites = edges.filter((_, i) => mask & (1 << i));
      for (const task of [courseScheduleTask, courseScheduleIITask]) {
        if (task.runner.kind !== 'function') throw new Error('Expected function runner');
        const args: JsonValue[] = [3, prerequisites];
        expectFunctionDomain(task.id, args);
        const result = compile(graphSolutions[task.id], task.runner.entryPoint)(...structuredClone(args));
        if (task.id === 'course-schedule') expect(result).toBe(acyclic(3, prerequisites));
        else expect(validOrder(3, prerequisites, result)).toBe(true);
      }
    }
  });

  it('clones all connected simple four-node graphs from every possible root', () => {
    const edges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    let connected = 0;
    for (let mask = 0; mask < 64; mask++) {
      const adjacency = Array.from({ length: 4 }, () => [] as number[]);
      edges.forEach(([a, b], i) => { if (mask & (1 << i)) { adjacency[a].push(b + 1); adjacency[b].push(a + 1); } });
      const reachable = new Set([1]);
      for (let pass = 0; pass < 4; pass++) for (const position of reachable) {
        adjacency[position - 1].forEach(neighbor => reachable.add(neighbor));
      }
      if (reachable.size !== 4) continue;
      connected++;
      for (let start = 0; start < 4; start++) {
        const testCase = { name: `${mask}:${start}`, adjacency, values: [100, 2, 47, 18], start };
        expectGraphDomain(testCase);
        const { nodes, root } = graphInput(testCase), arrays = nodes.map(node => node.neighbors);
        expect(validClone(testCase, nodes, arrays, compile(graphSolutions['clone-graph'], 'cloneGraph')(root))).toBe(true);
      }
    }
    expect(connected).toBe(38);
  });
});
