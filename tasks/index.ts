import { rangeSumTask } from './range-sum-query/task';
import { validPalindromeTask } from './valid-palindrome/task';
import { moveZeroesTask } from './move-zeroes/task';
import { mergeSortedArraysTask } from './merge-sorted-arrays/task';
import { minSubarraySumTask } from './min-subarray-sum/task';
import { maxVowelsTask } from './max-vowels/task';
import { longestSubstringTask } from './longest-substring/task';
import { firstUniqueCharTask } from './first-unique-char/task';
import { validAnagramTask } from './valid-anagram/task';
import { groupAnagramsTask } from './group-anagrams/task';
import { topKFrequentTask } from './top-k-frequent/task';
import { subarraySumKTask } from './subarray-sum-k/task';
import { pivotIndexTask } from './pivot-index/task';
import { productExceptSelfTask } from './product-except-self/task';
import { subarraySumsDivisibleByKTask } from './subarray-sums-divisible-by-k/task';
import { reverseLinkedListTask } from './reverse-linked-list/task';
import { middleOfListTask } from './middle-of-list/task';
import { linkedListCycleTask } from './linked-list-cycle/task';
import { mergeTwoSortedListsTask } from './merge-two-sorted-lists/task';
import { removeNthFromEndTask } from './remove-nth-from-end/task';
import { palindromeLinkedListTask } from './palindrome-linked-list/task';
import { validParenthesesTask } from './valid-parentheses/task';
import { minStackTask } from './min-stack/task';
import { dailyTemperaturesTask } from './daily-temperatures/task';
import { evaluateRpnTask } from './evaluate-rpn/task';
import { queueViaStacksTask } from './queue-via-stacks/task';
import { validateTask } from './validate';
import type { TaskDefinition } from './types';

export const taskDefinitions: readonly TaskDefinition[] = [
  validPalindromeTask, moveZeroesTask, mergeSortedArraysTask,
  minSubarraySumTask, maxVowelsTask, longestSubstringTask,
  firstUniqueCharTask, validAnagramTask, groupAnagramsTask, topKFrequentTask,
  rangeSumTask, subarraySumKTask, pivotIndexTask, productExceptSelfTask, subarraySumsDivisibleByKTask,
  reverseLinkedListTask, middleOfListTask, linkedListCycleTask, mergeTwoSortedListsTask, removeNthFromEndTask, palindromeLinkedListTask,
  validParenthesesTask, minStackTask, dailyTemperaturesTask, evaluateRpnTask, queueViaStacksTask,
];
const registry = new Map<string, TaskDefinition>();
for (const definition of taskDefinitions) {
  validateTask(definition);
  if (registry.has(definition.id)) throw new Error(`Повторяющийся ID задачи: ${definition.id}`);
  registry.set(definition.id, definition);
}
export function getTaskDefinition(id: string): TaskDefinition | undefined {
  return registry.get(id);
}
