import { describe, expect, it } from 'vitest';
import { maxDepthTask } from './max-depth/task';
import { minDepthTask } from './min-depth/task';
import { invertTreeTask } from './invert-tree/task';
import { levelOrderTask } from './level-order/task';
import { validateBstTask } from './validate-bst/task';
import { diameterTask } from './diameter/task';
import { lowestCommonAncestorTask } from './lowest-common-ancestor/task';
import { lowestCommonAncestorBinaryTreeTask } from './lowest-common-ancestor-binary-tree/task';
import type { BinaryTreeCase, BinaryTreeRunner, TaskDefinition, TreeExpectation } from './types';
import { binaryTreeSolutions, binaryTreeAlternativeSolutions, binaryTreeWrongSolutions } from '../tests/fixtures/binary-trees';

const tasks = [
  maxDepthTask, minDepthTask, invertTreeTask, levelOrderTask,
  validateBstTask, diameterTask, lowestCommonAncestorTask, lowestCommonAncestorBinaryTreeTask,
];

class TreeNode {
  constructor(
    public val = 0,
    public left: TreeNode | null = null,
    public right: TreeNode | null = null,
  ) {}
}

function runnerFor(task: TaskDefinition): BinaryTreeRunner {
  if (task.runner.kind !== 'binary-tree') throw new Error('Expected binary-tree runner');
  return task.runner;
}

function buildTree(values: (number | null)[]) {
  const tokens = values.map(value => value === null ? null : new TreeNode(value));
  const root = tokens[0] ?? null;
  const queue = root === null ? [] : [root];
  let cursor = 1;
  for (let head = 0; head < queue.length && cursor < tokens.length; head++) {
    const parent = queue[head];
    for (const side of ['left', 'right'] as const) {
      if (cursor >= tokens.length) break;
      const child = tokens[cursor++];
      parent[side] = child;
      if (child !== null) queue.push(child);
    }
  }
  if (cursor < tokens.length) throw new Error('Unreachable serialization tokens');
  return { root, tokens, nodes: tokens.filter((node): node is TreeNode => node !== null) };
}

function selectedNode(tokens: (TreeNode | null)[], index: number): TreeNode {
  const node = tokens[index];
  if (!Number.isInteger(index) || node === null || node === undefined) throw new Error('Invalid node token index');
  return node;
}

function trimNulls(values: (number | null)[]) {
  while (values.length > 0 && values[values.length - 1] === null) values.pop();
  return values;
}

// This bounded-output harness executes trusted fixtures only, never learner code.
function execute(source: string, runner: BinaryTreeRunner, sample: BinaryTreeCase) {
  const { root, tokens, nodes } = buildTree(sample.tree);
  const snapshots = nodes.map(node => ({ node, val: node.val, left: node.left, right: node.right }));
  const selected = (sample.nodeArgs ?? []).map(index => selectedNode(tokens, index));
  const entry = new Function('TreeNode', `${source}; return ${runner.entryPoint};`)(TreeNode);
  const output: unknown = entry(root, ...selected, ...structuredClone(sample.args ?? []));
  if (runner.preserveInput) {
    for (const snapshot of snapshots) {
      expect(snapshot.node.val).toBe(snapshot.val);
      expect(snapshot.node.left).toBe(snapshot.left);
      expect(snapshot.node.right).toBe(snapshot.right);
    }
  }
  const expected = sample.expected;
  if (expected.kind === 'value') {
    expect(output).toEqual(expected.value);
  } else if (expected.kind === 'node') {
    expect(output).toBe(expected.index === null ? null : selectedNode(tokens, expected.index));
  } else {
    const queue: unknown[] = [output], values: (number | null)[] = [];
    const seen = new Set<unknown>(), original = new Set<unknown>(nodes);
    const limit = expected.values.filter(value => value !== null).length;
    for (let head = 0; head < queue.length; head++) {
      const node = queue[head];
      if (node === null) { values.push(null); continue; }
      if (typeof node !== 'object' || !('val' in node) || !('left' in node) || !('right' in node)) {
        throw new Error('Expected TreeNode or null');
      }
      if (seen.has(node)) throw new Error('Cycle or shared output node');
      if (seen.size >= limit) throw new Error('Too many output nodes');
      seen.add(node);
      if (typeof node.val !== 'number') throw new Error('Expected numeric node value');
      values.push(node.val);
      queue.push(node.left, node.right);
    }
    expect(trimNulls(values)).toEqual(trimNulls([...expected.values]));
    if (expected.reuseNodes) {
      expect(seen.size).toBe(original.size);
      expect([...seen].every(node => original.has(node))).toBe(true);
    }
  }
  return { root, tokens, nodes, snapshots, output };
}

function inspect(root: TreeNode | null) {
  const entries: { node: TreeNode; depth: number; parent: TreeNode | null }[] =
    root === null ? [] : [{ node: root, depth: 1, parent: null }];
  for (let i = 0; i < entries.length; i++) {
    const { node, depth } = entries[i];
    for (const child of [node.left, node.right]) {
      if (child !== null) entries.push({ node: child, depth: depth + 1, parent: node });
    }
  }
  return entries;
}

function inorderValues(root: TreeNode | null): number[] {
  const result: number[] = [], stack: TreeNode[] = [];
  let node = root;
  while (node !== null || stack.length > 0) {
    while (node !== null) { stack.push(node); node = node.left; }
    node = stack.pop()!;
    result.push(node.val);
    node = node.right;
  }
  return result;
}

function independentExpected(taskId: string, sample: BinaryTreeCase): TreeExpectation {
  const { root, tokens, nodes } = buildTree(sample.tree);
  const entries = inspect(root);
  switch (taskId) {
    case 'max-depth':
      return { kind: 'value', value: Math.max(0, ...entries.map(entry => entry.depth)) };
    case 'min-depth': {
      const leafDepths = entries.filter(({ node }) => node.left === null && node.right === null).map(entry => entry.depth);
      return { kind: 'value', value: leafDepths.length === 0 ? 0 : Math.min(...leafDepths) };
    }
    case 'level-order': {
      const levels: number[][] = [];
      const stack: [TreeNode, number][] = root === null ? [] : [[root, 0]];
      while (stack.length > 0) {
        const [node, depth] = stack.pop()!;
        (levels[depth] ??= []).push(node.val);
        if (node.right !== null) stack.push([node.right, depth + 1]);
        if (node.left !== null) stack.push([node.left, depth + 1]);
      }
      return { kind: 'value', value: levels };
    }
    case 'invert-tree': {
      const queue = [root], mirrored: (number | null)[] = [];
      for (let i = 0; i < queue.length; i++) {
        const node = queue[i];
        mirrored.push(node?.val ?? null);
        if (node !== null) queue.push(node.right, node.left);
      }
      return { kind: 'tree', values: trimNulls(mirrored), reuseNodes: true };
    }
    case 'validate-bst': {
      const values = inorderValues(root);
      return { kind: 'value', value: values.every((value, index) => index === 0 || values[index - 1] < value) };
    }
    case 'diameter': {
      const edges = new Map(nodes.map(node => [node, [] as TreeNode[]]));
      for (const { node, parent } of entries) {
        if (parent !== null) { edges.get(node)!.push(parent); edges.get(parent)!.push(node); }
      }
      let longest = 0;
      for (const start of nodes) {
        const seen = new Set([start]), queue: [TreeNode, number][] = [[start, 0]];
        for (let i = 0; i < queue.length; i++) {
          const [node, distance] = queue[i];
          longest = Math.max(longest, distance);
          for (const neighbor of edges.get(node)!) {
            if (!seen.has(neighbor)) { seen.add(neighbor); queue.push([neighbor, distance + 1]); }
          }
        }
      }
      return { kind: 'value', value: longest };
    }
    case 'lowest-common-ancestor':
    case 'lowest-common-ancestor-binary-tree': {
      const parents = new Map(entries.map(entry => [entry.node, entry.parent]));
      const path = (node: TreeNode | null) => {
        const result: TreeNode[] = [];
        while (node !== null) { result.push(node); node = parents.get(node)!; }
        return result.reverse();
      };
      const first = path(selectedNode(tokens, sample.nodeArgs![0]));
      const second = path(selectedNode(tokens, sample.nodeArgs![1]));
      let index = 0;
      while (index < first.length && index < second.length && first[index] === second[index]) index++;
      return { kind: 'node', index: tokens.indexOf(first[index - 1]) };
    }
    default:
      throw new Error(`Missing oracle: ${taskId}`);
  }
}

function assertDomain(taskId: string, sample: BinaryTreeCase) {
  const { root, nodes, tokens } = buildTree(sample.tree);
  const isLca = taskId.startsWith('lowest-common-ancestor');
  const maxima: Record<string, number> = {
    'max-depth': 10000, 'min-depth': 10000, 'invert-tree': 100, 'level-order': 2000,
    'validate-bst': 10000, 'diameter': 10000,
    'lowest-common-ancestor': 100000, 'lowest-common-ancestor-binary-tree': 100000,
  };
  expect(nodes.length).toBeGreaterThanOrEqual(isLca ? 2 : 0);
  expect(nodes.length).toBeLessThanOrEqual(maxima[taskId]);
  expect(nodes.every(node => Number.isSafeInteger(node.val))).toBe(true);
  expect(Math.max(0, ...inspect(root).map(entry => entry.depth))).toBeLessThanOrEqual(256);
  if (taskId === 'max-depth' || taskId === 'min-depth') {
    expect(nodes.every(node => Math.abs(node.val) <= 100)).toBe(true);
  }
  if (taskId === 'validate-bst') {
    expect(nodes.every(node => node.val >= -2147483648 && node.val <= 2147483647)).toBe(true);
  }
  if (isLca) {
    expect(new Set(nodes.map(node => node.val)).size).toBe(nodes.length);
    expect(sample.nodeArgs).toHaveLength(2);
    const selected = sample.nodeArgs!.map(index => selectedNode(tokens, index));
    expect(selected[0]).not.toBe(selected[1]);
    expect(sample.expected.kind).toBe('node');
    if (sample.expected.kind === 'node') {
      expect(sample.expected.index).not.toBeNull();
      selectedNode(tokens, sample.expected.index!);
    }
    if (taskId === 'lowest-common-ancestor') {
      const values = inorderValues(root);
      expect(values.every((value, index) => index === 0 || values[index - 1] < value)).toBe(true);
    }
  } else {
    expect(sample.nodeArgs ?? []).toEqual([]);
  }
  expect(sample.args ?? []).toEqual([]);
}

describe.each(tasks)('$id', task => {
  const runner = runnerFor(task);
  it('has neutral starter, selectable complexity criteria and valid coverage', () => {
    expect(runner.cases.length).toBeGreaterThanOrEqual(6);
    expect(new Set(runner.cases.map(sample => sample.name)).size).toBe(runner.cases.length);
    expect(task.starter).toContain('TreeNode(val = 0, left = null, right = null)');
    expect(task.starter).toContain('настоящ');
    expect(task.starter).toContain('не массив');
    expect(task.starter).toContain(`function ${runner.entryPoint}(`);
    expect(task.starter).toContain('TODO');
    expect(task.starter).not.toMatch(/\breturn\b|\b(?:while|for)\s*\(/);
    expect(task.complexity.variables).toMatch(/N —.*H —.*W —/);
    expect(task.complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space']);
    const options = task.complexity.options.map(option => option.id);
    expect(options).toContain('unknown');
    for (const criterion of task.complexity.criteria) {
      for (const id of [criterion.expected, ...criterion.accepted ?? []]) {
        expect(options).toContain(id);
        expect(id).not.toBe('unknown');
      }
    }
    expect(task.verificationNote).toMatch(/Тесты не доказывают|тесты не доказывают/);
    expect(runner.preserveInput).not.toBe(true);
    const sizes = runner.cases.map(sample => buildTree(sample.tree).nodes.length);
    expect(sizes.some(size => size > 0 && size % 2 === 0)).toBe(true);
    expect(sizes.some(size => size % 2 === 1)).toBe(true);
    expect(runner.cases.some(sample => sample.tree.slice(1, -1).includes(null))).toBe(true);
  });

  for (const sample of runner.cases) {
    it(`${sample.name}: valid domain, independent expectation and trusted reference`, () => {
      assertDomain(task.id, sample);
      expect(sample.expected).toEqual(independentExpected(task.id, sample));
      execute(binaryTreeSolutions[task.id], runner, sample);
    });
  }

  binaryTreeAlternativeSolutions[task.id].forEach((source, index) => {
    it(`accepts alternative traversal ${index + 1}`, () => {
      for (const sample of runner.cases) execute(source, runner, sample);
    });
  });

  binaryTreeWrongSolutions[task.id].forEach((source, index) => {
    it(`rejects finite typical bug ${index + 1}`, () => {
      expect(runner.cases.some(sample => {
        try { execute(source, runner, sample); return false; }
        catch { return true; }
      })).toBe(true);
    });
  });
});

describe('binary-tree contracts', () => {
  it('keeps split depth and LCA tasks independent', () => {
    expect(new Set(tasks.map(task => task.id)).size).toBe(8);
    expect(Object.keys(binaryTreeSolutions).sort()).toEqual(tasks.map(task => task.id).sort());
    expect(Object.keys(binaryTreeWrongSolutions).sort()).toEqual(tasks.map(task => task.id).sort());
    expect(maxDepthTask.starter).not.toContain('minDepth');
    expect(minDepthTask.starter).not.toContain('maxDepth');
    expect(lowestCommonAncestorTask.starter).toContain('function lowestCommonAncestorBST(root, p, q)');
    expect(lowestCommonAncestorBinaryTreeTask.starter).toContain('function lowestCommonAncestor(root, p, q)');
  });

  it('builds compact levels, not heap indexes, and uses original token positions', () => {
    const { root, tokens } = buildTree([1, null, 2, 3, 4, null, 5, 6]);
    expect(root).toBe(tokens[0]);
    expect(root!.left).toBeNull();
    expect(root!.right).toBe(tokens[2]);
    expect(tokens[2]!.left).toBe(tokens[3]);
    expect(tokens[2]!.right).toBe(tokens[4]);
    expect(tokens[3]!.left).toBeNull();
    expect(tokens[3]!.right).toBe(tokens[6]);
    expect(tokens[4]!.left).toBe(tokens[7]);
    expect(tokens[4]!.right).toBeNull();
    expect(tokens[1]).toBeNull();
    expect(tokens[5]).toBeNull();
  });

  it('normalizes empty trees and allocates distinct fresh nodes', () => {
    expect(buildTree([]).root).toBeNull();
    expect(buildTree([null]).root).toBeNull();
    const first = buildTree([7, 7, 7]), second = buildTree([7, 7, 7]);
    expect(new Set([...first.nodes, ...second.nodes]).size).toBe(6);
    expect(new TreeNode()).toEqual({ val: 0, left: null, right: null });
    expect(() => buildTree([null, 1])).toThrow('Unreachable');
    expect(() => buildTree([1, null, null, 2])).toThrow('Unreachable');
  });

  it('passes real node references before JSON arguments', () => {
    const runner: BinaryTreeRunner = { kind: 'binary-tree', entryPoint: 'probe', cases: [] };
    const sample: BinaryTreeCase = {
      name: 'arguments', tree: [1, null, 2, 3], nodeArgs: [3, 2], args: [9, { label: 'ok' }],
      expected: { kind: 'node', index: 3 },
    };
    execute(`function probe(root, p, q, count, meta) {
      if (q !== root.right || p !== q.left || count !== 9 || meta.label !== 'ok') throw Error('arguments');
      return p;
    }`, runner, sample);
    for (const index of [1, 4, -1, 1.5]) {
      expect(() => execute('function probe() { return null; }', runner, { ...sample, nodeArgs: [index] }))
        .toThrow('Invalid node token index');
    }
    execute('function probe() { return null; }', runner, { name: 'null identity', tree: [], expected: { kind: 'node', index: null } });
  });

  it('rejects values and clones even when the LCA value is correct', () => {
    for (const task of [lowestCommonAncestorTask, lowestCommonAncestorBinaryTreeTask]) {
      const runner = runnerFor(task), sample = runner.cases[0];
      for (const result of ['root.val', 'new TreeNode(root.val, root.left, root.right)']) {
        expect(() => execute(`function ${runner.entryPoint}(root) { return ${result}; }`, runner, sample)).toThrow();
      }
    }
  });

  it('checks mutation only when preserveInput is explicitly requested', () => {
    const runner: BinaryTreeRunner = { kind: 'binary-tree', entryPoint: 'probe', cases: [] };
    const sample: BinaryTreeCase = { name: 'mutation', tree: [1, 2, 3], expected: { kind: 'value', value: true } };
    const source = 'function probe(root) { root.left = null; root.val = 9; return true; }';
    execute(source, runner, sample);
    expect(() => execute(source, { ...runner, preserveInput: true }, sample)).toThrow();
  });

  it('compares tree structure and values and enforces explicitly requested reuse', () => {
    const runner = runnerFor(invertTreeTask), sample = runner.cases.find(item => item.name === 'Полное дерево')!;
    const clone = binaryTreeWrongSolutions['invert-tree'][3];
    expect(() => execute(clone, runner, sample)).toThrow();
    if (sample.expected.kind !== 'tree') throw new Error('Expected tree result');
    execute(clone, runner, { ...sample, expected: { ...sample.expected, reuseNodes: false } });
    const { snapshots } = execute(binaryTreeSolutions['invert-tree'], runner, sample);
    expect(snapshots.some(snapshot => snapshot.node.left !== snapshot.left)).toBe(true);
    expect(() => execute('function invertTree(root) { return root; }', runner, sample)).toThrow();
  });

  it('bounds malformed, cyclic, shared and oversized output traversal', () => {
    const runner = runnerFor(invertTreeTask);
    const sample: BinaryTreeCase = { name: 'bounded output', tree: [1, 2], expected: { kind: 'tree', values: [1, null, 2] } };
    const malformed = [
      'return undefined;', 'return 0;',
      'root.left = root; return root;',
      'root.right = root.left; return root;',
      'return new TreeNode(1, new TreeNode(2), new TreeNode(3));',
    ];
    for (const body of malformed) {
      expect(() => execute(`function invertTree(root) { ${body} }`, runner, sample)).toThrow();
    }
  });

  it('has ancestor, global BST violation and non-root diameter regressions', () => {
    const bst = runnerFor(validateBstTask).cases;
    const deepViolation = bst.find(sample => sample.name === 'Нарушение нижней границы предка')!;
    expect(independentExpected('validate-bst', deepViolation)).toEqual({ kind: 'value', value: false });
    const diameter = runnerFor(diameterTask);
    const notThroughRoot = diameter.cases.find(sample => sample.name === 'Диаметр не проходит через корень')!;
    expect(() => execute(binaryTreeWrongSolutions['diameter'][1], diameter, notThroughRoot)).toThrow();
    for (const task of [lowestCommonAncestorTask, lowestCommonAncestorBinaryTreeTask]) {
      const sample = runnerFor(task).cases.find(item => item.name === 'p — предок q')!;
      expect(sample.expected).toEqual({ kind: 'node', index: sample.nodeArgs![0] });
    }
    const general = runnerFor(lowestCommonAncestorBinaryTreeTask);
    const misleading = general.cases.find(sample => sample.name === 'Значения обманчиво указывают в одну сторону')!;
    expect(() => execute(binaryTreeWrongSolutions['lowest-common-ancestor-binary-tree'][0], general, misleading)).toThrow();
  });
});
