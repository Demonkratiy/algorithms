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
import { validateTask } from './validate';
import type { TaskDefinition } from './types';

export const taskDefinitions: readonly TaskDefinition[] = [
  validPalindromeTask, moveZeroesTask, mergeSortedArraysTask,
  minSubarraySumTask, maxVowelsTask, longestSubstringTask,
  firstUniqueCharTask, validAnagramTask, groupAnagramsTask, topKFrequentTask,
  rangeSumTask, subarraySumKTask, pivotIndexTask, productExceptSelfTask, subarraySumsDivisibleByKTask,
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
