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
import { linkedListCycleEntryTask } from './linked-list-cycle-entry/task';
import { mergeTwoSortedListsTask } from './merge-two-sorted-lists/task';
import { removeNthFromEndTask } from './remove-nth-from-end/task';
import { palindromeLinkedListTask } from './palindrome-linked-list/task';
import { validParenthesesTask } from './valid-parentheses/task';
import { minStackTask } from './min-stack/task';
import { dailyTemperaturesTask } from './daily-temperatures/task';
import { evaluateRpnTask } from './evaluate-rpn/task';
import { queueViaStacksTask } from './queue-via-stacks/task';
import { binarySearchBasicTask } from './binary-search-basic/task';
import { searchInsertPositionTask } from './search-insert-position/task';
import { firstLastPositionTask } from './first-last-position/task';
import { kokoEatingBananasTask } from './koko-eating-bananas/task';
import { searchRotatedArrayTask } from './search-rotated-array/task';
import { sqrtTask } from './sqrt/task';
import { rotateImageTask } from './rotate-image/task';
import { spiralMatrixTask } from './spiral-matrix/task';
import { setMatrixZeroesTask } from './set-matrix-zeroes/task';
import { sortColorsTask } from './sort-colors/task';
import { mergeIntervalsTask } from './merge-intervals/task';
import { kthLargestTask } from './kth-largest/task';
import { meetingRoomsTask } from './meeting-rooms/task';
import { meetingRoomsIITask } from './meeting-rooms-ii/task';
import { mergeSortImplementationTask } from './merge-sort-implementation/task';
import { implementMinHeapTask } from './implement-min-heap/task';
import { heapComparatorTask } from './heap-comparator/task';
import { heapifyTask } from './heapify/task';
import { kClosestPointsTask } from './k-closest-points/task';
import { fibonacciMemoTask } from './fibonacci-memo/task';
import { powerTask } from './power-and-reverse/task';
import { reverseStringTask } from './reverse-string/task';
import { subsetsTask } from './subsets/task';
import { permutationsTask } from './permutations/task';
import { flattenNestedTask } from './flatten-nested/task';
import { countCommentsTask } from './count-comments/task';
import { deepGetTask } from './deep-get/task';
import { maxDepthTask } from './max-depth/task';
import { minDepthTask } from './min-depth/task';
import { invertTreeTask } from './invert-tree/task';
import { levelOrderTask } from './level-order/task';
import { validateBstTask } from './validate-bst/task';
import { diameterTask } from './diameter/task';
import { lowestCommonAncestorTask } from './lowest-common-ancestor/task';
import { lowestCommonAncestorBinaryTreeTask } from './lowest-common-ancestor-binary-tree/task';
import { numberOfIslandsTask } from './number-of-islands/task';
import { rottingOrangesTask } from './rotting-oranges/task';
import { cloneGraphTask } from './clone-graph/task';
import { wordSearchTask } from './word-search/task';
import { courseScheduleTask } from './course-schedule/task';
import { courseScheduleIITask } from './course-schedule-ii/task';
import { validateTask } from './validate';
import type { TaskDefinition } from './types';

export const taskDefinitions: readonly TaskDefinition[] = [
  validPalindromeTask, moveZeroesTask, mergeSortedArraysTask,
  minSubarraySumTask, maxVowelsTask, longestSubstringTask,
  firstUniqueCharTask, validAnagramTask, groupAnagramsTask, topKFrequentTask,
  rangeSumTask, subarraySumKTask, pivotIndexTask, productExceptSelfTask, subarraySumsDivisibleByKTask,
  rotateImageTask, spiralMatrixTask, setMatrixZeroesTask,
  reverseLinkedListTask, middleOfListTask, linkedListCycleTask, linkedListCycleEntryTask, mergeTwoSortedListsTask, removeNthFromEndTask, palindromeLinkedListTask,
  validParenthesesTask, minStackTask, dailyTemperaturesTask, evaluateRpnTask, queueViaStacksTask,
  binarySearchBasicTask, searchInsertPositionTask, firstLastPositionTask, kokoEatingBananasTask, searchRotatedArrayTask, sqrtTask,
  sortColorsTask, mergeIntervalsTask, kthLargestTask, meetingRoomsTask, meetingRoomsIITask, mergeSortImplementationTask,
  implementMinHeapTask, heapComparatorTask, heapifyTask, kClosestPointsTask,
  fibonacciMemoTask, powerTask, reverseStringTask, subsetsTask, permutationsTask, flattenNestedTask, countCommentsTask, deepGetTask,
  maxDepthTask, minDepthTask, invertTreeTask, levelOrderTask, validateBstTask, diameterTask, lowestCommonAncestorTask, lowestCommonAncestorBinaryTreeTask,
  numberOfIslandsTask, rottingOrangesTask, cloneGraphTask, wordSearchTask, courseScheduleTask, courseScheduleIITask,
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
