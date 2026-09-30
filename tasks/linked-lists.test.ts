import { describe, expect, it } from 'vitest';
import { reverseLinkedListTask } from './reverse-linked-list/task';
import { middleOfListTask } from './middle-of-list/task';
import { linkedListCycleTask } from './linked-list-cycle/task';
import { linkedListCycleEntryTask } from './linked-list-cycle-entry/task';
import { mergeTwoSortedListsTask } from './merge-two-sorted-lists/task';
import { removeNthFromEndTask } from './remove-nth-from-end/task';
import { palindromeLinkedListTask } from './palindrome-linked-list/task';
import type { LinkedListCase, LinkedListRunner, ListExpectation, TaskDefinition } from './types';
import { linkedListSolutions, linkedListWrongSolutions } from '../tests/fixtures/linked-lists';

const tasks = [
  reverseLinkedListTask, middleOfListTask, linkedListCycleTask, linkedListCycleEntryTask,
  mergeTwoSortedListsTask, removeNthFromEndTask, palindromeLinkedListTask,
];

class ListNode {
  constructor(public val = 0, public next: ListNode | null = null) {}
}

function runnerFor(task: TaskDefinition): LinkedListRunner {
  if (task.runner.kind !== 'linked-list') throw new Error('Expected linked-list runner');
  return task.runner;
}

function buildLists(sample: LinkedListCase) {
  const lists = sample.lists.map(({ values, cycleAt }) => {
    const nodes = values.map(value => new ListNode(value));
    nodes.forEach((node, index) => { node.next = nodes[index + 1] ?? null; });
    if (nodes.length !== 0 && cycleAt !== undefined && cycleAt !== -1) {
      nodes[nodes.length - 1].next = nodes[cycleAt];
    }
    return nodes;
  });
  return { lists, heads: lists.map(nodes => nodes[0] ?? null) };
}

// This bounded-output harness executes checked-in trusted fixtures only, never learner code.
function execute(source: string, runner: LinkedListRunner, sample: LinkedListCase) {
  const { lists, heads } = buildLists(sample);
  const original = lists.flat();
  const snapshots = original.map(node => ({ node, val: node.val, next: node.next }));
  const entry = new Function('ListNode', `${source}; return ${sample.entryPoint ?? runner.entryPoint};`)(ListNode);
  const output: unknown = entry(...heads, ...structuredClone(sample.args ?? []));
  if (runner.preserveInputs) {
    for (const snapshot of snapshots) {
      expect(snapshot.node.val).toBe(snapshot.val);
      expect(snapshot.node.next).toBe(snapshot.next);
    }
  }
  const expected = sample.expected;
  if (expected.kind === 'value') {
    expect(output).toEqual(expected.value);
  } else if (expected.kind === 'node') {
    expect(output).toBe(expected.node === null ? null : lists[expected.node.list][expected.node.index]);
  } else {
    const nodes: ListNode[] = [];
    const seen = new Set<unknown>();
    let node = output;
    while (node !== null) {
      if (typeof node !== 'object' || !('val' in node) || !('next' in node)) throw new Error('Expected ListNode or null');
      if (seen.has(node)) throw new Error('Cyclic output');
      if (nodes.length >= expected.values.length) throw new Error('Output is too long');
      seen.add(node);
      nodes.push(node as ListNode);
      node = node.next;
    }
    expect(nodes.map(item => item.val)).toEqual(expected.values);
    if (expected.reuseNodes) {
      const inputs = new Set(original);
      expect(nodes.every(item => inputs.has(item))).toBe(true);
    }
    if (expected.nodeOrder) {
      expect(nodes.length).toBe(expected.nodeOrder.length);
      expected.nodeOrder.forEach((reference, index) => {
        expect(nodes[index]).toBe(lists[reference.list][reference.index]);
      });
    }
  }
  return { lists, snapshots, output };
}

function independentExpected(taskId: string, runner: LinkedListRunner, sample: LinkedListCase): ListExpectation {
  const values = sample.lists[0].values;
  switch (taskId) {
    case 'reverse-linked-list':
      return {
        kind: 'list', values: [...values].reverse(), reuseNodes: true,
        nodeOrder: values.map((_, index) => ({ list: 0, index: values.length - index - 1 })),
      };
    case 'middle-of-list':
      return { kind: 'node', node: { list: 0, index: Math.floor(values.length / 2) } };
    case 'linked-list-cycle':
    case 'linked-list-cycle-entry': {
      const cycleAt = sample.lists[0].cycleAt;
      const hasCycle = cycleAt !== undefined && cycleAt >= 0;
      return taskId === 'linked-list-cycle'
        ? { kind: 'value', value: hasCycle }
        : { kind: 'node', node: hasCycle ? { list: 0, index: cycleAt } : null };
    }
    case 'merge-two-sorted-lists':
      return { kind: 'list', values: sample.lists.flatMap(list => list.values).sort((a, b) => a - b), reuseNodes: true };
    case 'remove-nth-from-end': {
      const removed = values.length - (sample.args![0] as number);
      return {
        kind: 'list', values: values.filter((_, index) => index !== removed), reuseNodes: true,
        nodeOrder: values.map((_, index) => ({ list: 0, index })).filter(node => node.index !== removed),
      };
    }
    case 'palindrome-linked-list':
      return { kind: 'value', value: values.join(',') === [...values].reverse().join(',') };
    default:
      throw new Error(`Missing oracle: ${taskId}`);
  }
}

function assertDomain(taskId: string, sample: LinkedListCase) {
  expect(sample.lists).toHaveLength(taskId === 'merge-two-sorted-lists' ? 2 : 1);
  for (const list of sample.lists) {
    expect(list.values.every(Number.isSafeInteger)).toBe(true);
    if (taskId === 'linked-list-cycle' || taskId === 'linked-list-cycle-entry') {
      expect(list.values.length).toBeLessThanOrEqual(10000);
      if (list.cycleAt !== undefined) {
        expect(Number.isInteger(list.cycleAt)).toBe(true);
        expect(list.cycleAt).toBeGreaterThanOrEqual(-1);
        expect(list.cycleAt).toBeLessThan(list.values.length);
      }
    } else {
      expect(list.cycleAt).toBeUndefined();
      const bounds: Record<string, [number, number]> = {
        'reverse-linked-list': [0, 5000], 'middle-of-list': [1, 100],
        'merge-two-sorted-lists': [0, 50], 'remove-nth-from-end': [1, 30],
        'palindrome-linked-list': [1, 100000],
      };
      const [min, max] = bounds[taskId];
      expect(list.values.length).toBeGreaterThanOrEqual(min);
      expect(list.values.length).toBeLessThanOrEqual(max);
      if (taskId === 'reverse-linked-list') expect(list.values.every(value => Math.abs(value) <= 5000)).toBe(true);
      if (taskId === 'palindrome-linked-list') expect(list.values.every(value => value >= 0 && value <= 9)).toBe(true);
      if (taskId === 'merge-two-sorted-lists') expect(list.values).toEqual([...list.values].sort((a, b) => a - b));
    }
  }
  if (taskId === 'remove-nth-from-end') {
    expect(sample.args).toHaveLength(1);
    const n = sample.args![0] as number;
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(sample.lists[0].values.length);
  } else {
    expect(sample.args ?? []).toEqual([]);
  }
}

describe.each(tasks)('$id', task => {
  const runner = runnerFor(task);
  it('has a neutral starter, selectable complexity criteria and meaningful local cases', () => {
    expect(runner.cases.length).toBeGreaterThanOrEqual(6);
    expect(new Set(runner.cases.map(sample => sample.name)).size).toBe(runner.cases.length);
    expect(task.starter).toContain('ListNode(val = 0, next = null)');
    expect(task.starter).toContain('не массив');
    expect(task.starter).toContain(`function ${runner.entryPoint}(`);
    expect(task.starter).toContain('TODO');
    expect(task.starter).not.toMatch(/\breturn\b|\b(?:while|for)\s*\(/);
    expect(task.complexity.criteria.map(criterion => criterion.id)).toEqual(['time', 'space']);
    const options = task.complexity.options.map(option => option.id);
    expect(options).toContain('unknown');
    for (const criterion of task.complexity.criteria) {
      for (const id of [criterion.expected, ...criterion.accepted ?? []]) {
        expect(options).toContain(id);
        expect(id).not.toBe('unknown');
      }
    }
  });
  for (const sample of runner.cases) {
    it(`${sample.name}: valid domain, independent expectation and trusted reference`, () => {
      assertDomain(task.id, sample);
      expect(sample.expected).toEqual(independentExpected(task.id, runner, sample));
      execute(linkedListSolutions[task.id], runner, sample);
    });
  }
  linkedListWrongSolutions[task.id].forEach((source, index) => {
    it(`rejects typical bug ${index + 1}`, () => {
      expect(runner.cases.some(sample => {
        try {
          execute(source, runner, sample);
          return false;
        } catch {
          return true;
        }
      })).toBe(true);
    });
  });
});

describe('linked-list contracts', () => {
  it('keeps cycle detection and entry in independent tasks', () => {
    expect(linkedListCycleTask.starter).toContain('function hasCycle(head)');
    expect(linkedListCycleTask.starter).not.toContain('detectCycle');
    expect(linkedListCycleEntryTask.starter).toContain('function detectCycle(head)');
    expect(linkedListCycleEntryTask.starter).not.toContain('hasCycle');
    expect(runnerFor(linkedListCycleTask).cases).toHaveLength(10);
    expect(runnerFor(linkedListCycleEntryTask).cases).toHaveLength(10);
  });

  it('constructs distinct nodes for equal values, independent lists and fresh executions', () => {
    const sample: LinkedListCase = {
      name: 'builder', lists: [{ values: [7, 7] }, { values: [7, 7] }],
      expected: { kind: 'value', value: null },
    };
    const first = buildLists(sample);
    const second = buildLists(sample);
    expect(new Set([...first.lists.flat(), ...second.lists.flat()]).size).toBe(8);
    expect(first.heads[0]).toBe(first.lists[0][0]);
    expect(first.heads[0]!.next).toBe(first.lists[0][1]);
    expect(first.lists[0][1].next).toBe(null);
  });

  it('builds self-cycles, non-head cycles and explicit -1 termination', () => {
    const sample: LinkedListCase = {
      name: 'builder cycles',
      lists: [{ values: [1], cycleAt: 0 }, { values: [1, 2, 3], cycleAt: 1 }, { values: [1], cycleAt: -1 }, { values: [] }],
      expected: { kind: 'value', value: null },
    };
    const { lists, heads } = buildLists(sample);
    expect(lists[0][0].next).toBe(lists[0][0]);
    expect(lists[1][2].next).toBe(lists[1][1]);
    expect(lists[2][0].next).toBe(null);
    expect(heads[3]).toBe(null);
  });

  it('accepts either source list first when merged values tie', () => {
    const runner = runnerFor(mergeTwoSortedListsTask);
    const rightFirst = linkedListSolutions[mergeTwoSortedListsTask.id].replace('list1.val <= list2.val', 'list1.val < list2.val');
    for (const sample of runner.cases) {
      expect(sample.expected.kind === 'list' && sample.expected.nodeOrder === undefined).toBe(true);
      execute(rightFirst, runner, sample);
    }
  });

  it('permits palindrome mutation without requiring restoration', () => {
    const runner = runnerFor(palindromeLinkedListTask);
    expect(runner.preserveInputs).not.toBe(true);
    const sample = runner.cases.find(item => item.name === 'Чётный палиндром')!;
    const { snapshots } = execute(linkedListSolutions[palindromeLinkedListTask.id], runner, sample);
    expect(snapshots.some(snapshot => snapshot.node.next !== snapshot.next)).toBe(true);
  });

  it('does not claim that functional correctness certifies constant memory', () => {
    const runner = runnerFor(linkedListCycleTask);
    const source = `function hasCycle(head) {
      const seen = new Set();
      while (head !== null) {
        if (seen.has(head)) return true;
        seen.add(head);
        head = head.next;
      }
      return false;
    }
    function detectCycle(head) {
      const seen = new Set();
      while (head !== null) {
        if (seen.has(head)) return head;
        seen.add(head);
        head = head.next;
      }
      return null;
    }`;
    for (const sample of runner.cases) execute(source, runner, sample);
    expect(linkedListCycleTask.complexity.criteria.find(criterion => criterion.id === 'space')!.expected).toBe('constant');
  });

  it('rejects cyclic list output without unbounded traversal', () => {
    const runner = runnerFor(reverseLinkedListTask);
    expect(() => execute('function reverseList(head) { head.next = head; return head; }', runner, runner.cases[1]))
      .toThrow('Cyclic output');
  });
});
