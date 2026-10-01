import { getTaskDefinition, getQuizDefinition } from '../tasks';
import { getTaskPriority, type TaskPriority } from './priorities';

export type CourseTask = {
  id: string;
  title: string;
  path: string;
  runnable: boolean;
  priority: TaskPriority;
  activity?: 'code' | 'quiz' | 'reading';
  previousTaskId?: string;
};

export type Topic = {
  id: string;
  title: string;
  section: string;
  theoryPath: string;
  tasks: CourseTask[];
};

// IDs are persisted in browser progress. Keep them when renaming/reordering files.
function task(id: string, title: string, path: string, previousTaskId?: string): CourseTask {
  const code = getTaskDefinition(id) !== undefined;
  const quiz = getQuizDefinition(id) !== undefined;
  return { id, title, path, priority: getTaskPriority(path), runnable: code || quiz, activity: quiz ? 'quiz' : code ? 'code' : 'reading', ...(previousTaskId ? { previousTaskId } : {}) };
}

export const topics: Topic[] = [
  {
    id: 'big-o', title: 'Big O — оценка сложности', section: '01. Основы',
    theoryPath: '01-basics/01-big-o.md', tasks: [],
  },
  {
    id: 'data-structures', title: 'Структуры данных JS (Array / Object / Map / Set)', section: '01. Основы',
    theoryPath: '01-basics/02-data-structures.md', tasks: [],
  },
  {
    id: 'two-pointers', title: 'Two Pointers', section: '02. Массивы и строки',
    theoryPath: '02-arrays-strings/01-two-pointers.md',
    tasks: [
      task('valid-palindrome', 'Valid Palindrome', 'practice/02-arrays-strings/01-two-pointers/01-valid-palindrome.md'),
      task('move-zeroes', 'Move Zeroes', 'practice/02-arrays-strings/01-two-pointers/02-move-zeroes.md'),
      task('merge-sorted-arrays', 'Merge Two Sorted Arrays', 'practice/02-arrays-strings/01-two-pointers/03-merge-sorted-arrays.md'),
    ],
  },
  {
    id: 'sliding-window', title: 'Sliding Window', section: '02. Массивы и строки',
    theoryPath: '02-arrays-strings/02-sliding-window.md',
    tasks: [
      task('min-subarray-sum', 'Minimum Size Subarray Sum', 'practice/02-arrays-strings/02-sliding-window/01-min-subarray-sum.md'),
      task('max-vowels', 'Maximum Number of Vowels in a Substring of Length K', 'practice/02-arrays-strings/02-sliding-window/02-max-vowels.md'),
      task('longest-substring', 'Longest Substring Without Repeating Characters', 'practice/02-arrays-strings/02-sliding-window/03-longest-substring.md'),
    ],
  },
  {
    id: 'frequency-counter', title: 'Frequency Counter (Hash Map)', section: '02. Массивы и строки',
    theoryPath: '02-arrays-strings/03-frequency-counter.md',
    tasks: [
      task('first-unique-char', 'First Unique Character in a String', 'practice/02-arrays-strings/03-frequency-counter/01-first-unique-char.md'),
      task('valid-anagram', 'Valid Anagram', 'practice/02-arrays-strings/03-frequency-counter/02-valid-anagram.md'),
      task('group-anagrams', 'Group Anagrams', 'practice/02-arrays-strings/03-frequency-counter/03-group-anagrams.md'),
      task('top-k-frequent', 'Top K Frequent Elements', 'practice/02-arrays-strings/03-frequency-counter/04-top-k-frequent.md'),
    ],
  },
  {
    id: 'prefix-sum', title: 'Prefix Sum (префиксные суммы)', section: '02. Массивы и строки',
    theoryPath: '02-arrays-strings/04-prefix-sum.md',
    tasks: [
      task('range-sum-query', 'Range Sum Query — Immutable', 'practice/02-arrays-strings/04-prefix-sum/01-range-sum-query.md'),
      task('subarray-sum-k', 'Subarray Sum Equals K', 'practice/02-arrays-strings/04-prefix-sum/02-subarray-sum-k.md'),
      task('pivot-index', 'Find Pivot Index', 'practice/02-arrays-strings/04-prefix-sum/03-pivot-index.md'),
      task('product-except-self', 'Product of Array Except Self', 'practice/02-arrays-strings/04-prefix-sum/04-product-except-self.md'),
      task('subarray-sums-divisible-by-k', 'Subarray Sums Divisible by K', 'practice/02-arrays-strings/04-prefix-sum/05-subarray-sums-divisible-by-k.md'),
    ],
  },
  {
    id: 'matrix', title: 'Matrix / 2D Arrays', section: '02. Массивы и строки',
    theoryPath: '02-arrays-strings/05-matrix.md',
    tasks: [
      task('rotate-image', 'Rotate Image', 'practice/02-arrays-strings/05-matrix/01-rotate-image.md'),
      task('spiral-matrix', 'Spiral Matrix', 'practice/02-arrays-strings/05-matrix/02-spiral-matrix.md'),
      task('set-matrix-zeroes', 'Set Matrix Zeroes', 'practice/02-arrays-strings/05-matrix/03-set-matrix-zeroes.md'),
    ],
  },
  {
    id: 'linked-lists', title: 'Linked Lists (связные списки)', section: '03. Линейные структуры',
    theoryPath: '03-linear-structures/01-linked-lists.md',
    tasks: [
      task('reverse-linked-list', 'Reverse Linked List', 'practice/03-linear-structures/01-linked-lists/01-reverse-linked-list.md'),
      task('middle-of-list', 'Middle of the Linked List', 'practice/03-linear-structures/01-linked-lists/02-middle-of-list.md'),
      task('linked-list-cycle', 'Linked List Cycle', 'practice/03-linear-structures/01-linked-lists/03-linked-list-cycle.md'),
      task('linked-list-cycle-entry', 'Linked List Cycle II — вход в цикл', 'practice/03-linear-structures/01-linked-lists/03-b-linked-list-cycle-entry.md', 'linked-list-cycle'),
      task('merge-two-sorted-lists', 'Merge Two Sorted Lists', 'practice/03-linear-structures/01-linked-lists/04-merge-two-sorted-lists.md'),
      task('remove-nth-from-end', 'Remove Nth Node From End of List', 'practice/03-linear-structures/01-linked-lists/05-remove-nth-from-end.md'),
      task('palindrome-linked-list', 'Palindrome Linked List', 'practice/03-linear-structures/01-linked-lists/06-palindrome-linked-list.md'),
    ],
  },
  {
    id: 'stack-queue', title: 'Stack & Queue', section: '03. Линейные структуры',
    theoryPath: '03-linear-structures/02-stack-queue.md',
    tasks: [
      task('valid-parentheses', 'Valid Parentheses', 'practice/03-linear-structures/02-stack-queue/01-valid-parentheses.md'),
      task('min-stack', 'Min Stack', 'practice/03-linear-structures/02-stack-queue/02-min-stack.md'),
      task('daily-temperatures', 'Daily Temperatures', 'practice/03-linear-structures/02-stack-queue/03-daily-temperatures.md'),
      task('evaluate-rpn', 'Evaluate Reverse Polish Notation', 'practice/03-linear-structures/02-stack-queue/04-evaluate-rpn.md'),
      task('queue-via-stacks', 'Implement Queue using Stacks', 'practice/03-linear-structures/02-stack-queue/05-queue-via-stacks.md'),
    ],
  },
  {
    id: 'binary-search', title: 'Binary Search', section: '04. Поиск и сортировка',
    theoryPath: '04-search-sort/01-binary-search.md',
    tasks: [
      task('binary-search-basic', 'Binary Search (классический)', 'practice/04-search-sort/01-binary-search/01-binary-search.md'),
      task('search-insert-position', 'Search Insert Position', 'practice/04-search-sort/01-binary-search/02-search-insert-position.md'),
      task('first-last-position', 'Find First and Last Position', 'practice/04-search-sort/01-binary-search/03-first-last-position.md'),
      task('koko-eating-bananas', 'Koko Eating Bananas', 'practice/04-search-sort/01-binary-search/04-koko-eating-bananas.md'),
      task('search-rotated-array', 'Search in Rotated Sorted Array', 'practice/04-search-sort/01-binary-search/05-search-rotated-array.md'),
      task('sqrt', 'Sqrt(x)', 'practice/04-search-sort/01-binary-search/06-sqrt.md'),
    ],
  },
  {
    id: 'sorting', title: 'Sorting', section: '04. Поиск и сортировка',
    theoryPath: '04-search-sort/02-sorting.md',
    tasks: [
      task('sort-colors', 'Sort Colors', 'practice/04-search-sort/02-sorting/01-sort-colors.md'),
      task('merge-intervals', 'Merge Intervals', 'practice/04-search-sort/02-sorting/02-merge-intervals.md'),
      task('kth-largest', 'Kth Largest Element in an Array', 'practice/04-search-sort/02-sorting/03-kth-largest.md'),
      task('meeting-rooms', 'Meeting Rooms I', 'practice/04-search-sort/02-sorting/04-meeting-rooms.md'),
      task('meeting-rooms-ii', 'Meeting Rooms II', 'practice/04-search-sort/02-sorting/04-b-meeting-rooms-ii.md', 'meeting-rooms'),
      task('merge-sort-implementation', 'Реализовать Merge Sort', 'practice/04-search-sort/02-sorting/05-merge-sort-implementation.md'),
    ],
  },
  {
    id: 'heap', title: 'Heap / Priority Queue', section: '04. Поиск и сортировка',
    theoryPath: '04-search-sort/03-heap.md',
    tasks: [
      task('implement-min-heap', 'Реализовать Min-Heap', 'practice/04-search-sort/03-heap/01-implement-min-heap.md'),
      task('heap-comparator', 'Heap Comparator (дополнительно)', 'practice/04-search-sort/03-heap/01-b-heap-comparator.md', 'implement-min-heap'),
      task('heapify', 'Heapify за O(N) (дополнительно)', 'practice/04-search-sort/03-heap/01-c-heapify.md', 'implement-min-heap'),
      task('k-closest-points', 'K Closest Points to Origin', 'practice/04-search-sort/03-heap/02-k-closest-points.md'),
    ],
  },
  {
    id: 'recursion', title: 'Recursion & Call Stack', section: '05. Рекурсия и деревья',
    theoryPath: '05-recursion-trees/01-recursion.md',
    tasks: [
      task('fibonacci-memo', 'Fibonacci с мемоизацией', 'practice/05-recursion-trees/01-recursion/01-fibonacci-memo.md'),
      task('power-and-reverse', 'Power — рекурсивное возведение в степень', 'practice/05-recursion-trees/01-recursion/02-power-and-reverse.md'),
      task('reverse-string', 'Reverse String', 'practice/05-recursion-trees/01-recursion/02-b-reverse-string.md', 'power-and-reverse'),
      task('subsets', 'Subsets', 'practice/05-recursion-trees/01-recursion/03-subsets.md'),
      task('permutations', 'Permutations', 'practice/05-recursion-trees/01-recursion/04-permutations.md'),
      task('flatten-nested', 'Flatten Nested Array', 'practice/05-recursion-trees/01-recursion/05-flatten-nested.md'),
      task('count-comments', 'Count Comments', 'practice/05-recursion-trees/01-recursion/05-b-count-comments.md', 'flatten-nested'),
      task('deep-get', 'Deep Get (дополнительно)', 'practice/05-recursion-trees/01-recursion/05-c-deep-get.md', 'flatten-nested'),
    ],
  },
  {
    id: 'binary-trees', title: 'Binary Trees (DFS / BFS)', section: '05. Рекурсия и деревья',
    theoryPath: '05-recursion-trees/02-binary-trees.md',
    tasks: [
      task('max-depth', 'Maximum Depth of Binary Tree', 'practice/05-recursion-trees/02-binary-trees/01-max-depth.md'),
      task('min-depth', 'Minimum Depth of Binary Tree', 'practice/05-recursion-trees/02-binary-trees/01-b-min-depth.md', 'max-depth'),
      task('invert-tree', 'Invert Binary Tree', 'practice/05-recursion-trees/02-binary-trees/02-invert-tree.md'),
      task('level-order', 'Binary Tree Level Order Traversal', 'practice/05-recursion-trees/02-binary-trees/03-level-order.md'),
      task('validate-bst', 'Validate Binary Search Tree', 'practice/05-recursion-trees/02-binary-trees/04-validate-bst.md'),
      task('diameter', 'Diameter of Binary Tree', 'practice/05-recursion-trees/02-binary-trees/05-diameter.md'),
      task('lowest-common-ancestor', 'Lowest Common Ancestor — BST', 'practice/05-recursion-trees/02-binary-trees/06-lowest-common-ancestor.md'),
      task('lowest-common-ancestor-binary-tree', 'Lowest Common Ancestor — Binary Tree', 'practice/05-recursion-trees/02-binary-trees/06-b-lowest-common-ancestor-binary-tree.md', 'lowest-common-ancestor'),
    ],
  },
  {
    id: 'graph-traversal', title: 'Graph Traversal (BFS / DFS)', section: '06. Графы',
    theoryPath: '06-graphs/01-graph-traversal.md',
    tasks: [
      task('number-of-islands', 'Number of Islands', 'practice/06-graphs/01-graph-traversal/01-number-of-islands.md'),
      task('rotting-oranges', 'Rotting Oranges', 'practice/06-graphs/01-graph-traversal/02-rotting-oranges.md'),
      task('clone-graph', 'Clone Graph', 'practice/06-graphs/01-graph-traversal/03-clone-graph.md'),
      task('word-search', 'Word Search', 'practice/06-graphs/01-graph-traversal/04-word-search.md'),
    ],
  },
  {
    id: 'topological-sort', title: 'Topological Sort', section: '06. Графы',
    theoryPath: '06-graphs/02-topological-sort.md',
    tasks: [
      task('course-schedule', 'Course Schedule', 'practice/06-graphs/02-topological-sort/01-course-schedule.md'),
      task('course-schedule-ii', 'Course Schedule II', 'practice/06-graphs/02-topological-sort/02-course-schedule-ii.md'),
    ],
  },
  {
    id: 'dp-basics', title: 'Dynamic Programming', section: '07. Dynamic Programming и Greedy',
    theoryPath: '07-dynamic-programming/01-dp-basics.md',
    tasks: [
      task('climbing-stairs', 'Climbing Stairs', 'practice/07-dynamic-programming/01-dp-basics/01-climbing-stairs.md'),
      task('house-robber', 'House Robber', 'practice/07-dynamic-programming/01-dp-basics/02-house-robber.md'),
      task('house-robber-ii', 'House Robber II', 'practice/07-dynamic-programming/01-dp-basics/02-b-house-robber-ii.md', 'house-robber'),
      task('coin-change', 'Coin Change', 'practice/07-dynamic-programming/01-dp-basics/03-coin-change.md'),
      task('coin-change-ii', 'Coin Change II', 'practice/07-dynamic-programming/01-dp-basics/03-b-coin-change-ii.md', 'coin-change'),
      task('longest-increasing-subsequence', 'Longest Increasing Subsequence', 'practice/07-dynamic-programming/01-dp-basics/04-longest-increasing-subsequence.md'),
      task('unique-paths', 'Unique Paths', 'practice/07-dynamic-programming/01-dp-basics/05-unique-paths.md'),
      task('unique-paths-ii', 'Unique Paths II', 'practice/07-dynamic-programming/01-dp-basics/05-b-unique-paths-ii.md', 'unique-paths'),
    ],
  },
  {
    id: 'greedy', title: 'Greedy', section: '07. Dynamic Programming и Greedy',
    theoryPath: '07-dynamic-programming/02-greedy.md',
    tasks: [
      task('best-time-to-buy-sell-stock', 'Best Time to Buy and Sell Stock I', 'practice/07-dynamic-programming/02-greedy/01-best-time-to-buy-sell-stock.md'),
      task('stock-ii', 'Best Time to Buy and Sell Stock II', 'practice/07-dynamic-programming/02-greedy/01-b-stock-ii.md', 'best-time-to-buy-sell-stock'),
      task('jump-game', 'Jump Game', 'practice/07-dynamic-programming/02-greedy/02-jump-game.md'),
      task('jump-game-ii', 'Jump Game II', 'practice/07-dynamic-programming/02-greedy/02-b-jump-game-ii.md', 'jump-game'),
      task('non-overlapping-intervals', 'Non-overlapping Intervals', 'practice/07-dynamic-programming/02-greedy/03-non-overlapping-intervals.md'),
    ],
  },
  {
    id: 'function-utils', title: 'JS Function Utils', section: '08. JS Interview',
    theoryPath: '08-js-interview/01-function-utils.md',
    tasks: [
      task('debounce', 'Debounce', 'practice/08-js-interview/01-function-utils/01-debounce.md'),
      task('throttle', 'Throttle', 'practice/08-js-interview/01-function-utils/02-throttle.md'),
      task('throttle-trailing', 'Throttle — leading + trailing', 'practice/08-js-interview/01-function-utils/02-b-throttle-trailing.md', 'throttle'),
      task('curry', 'Curry', 'practice/08-js-interview/01-function-utils/03-curry.md'),
      task('memoize', 'Memoize', 'practice/08-js-interview/01-function-utils/04-memoize.md'),
    ],
  },
  {
    id: 'objects', title: 'JS: объекты и структуры', section: '08. JS Interview',
    theoryPath: '08-js-interview/02-objects.md',
    tasks: [
      task('deep-clone', 'Deep Clone', 'practice/08-js-interview/02-objects/01-deep-clone.md'),
      task('event-emitter', 'EventEmitter', 'practice/08-js-interview/02-objects/02-event-emitter.md'),
    ],
  },
  {
    id: 'event-loop', title: 'Event Loop и асинхронность', section: '08. JS Interview',
    theoryPath: '08-js-interview/03-event-loop.md',
    tasks: [
      task('output-order', '«Что выведется?» — порядок выполнения', 'practice/08-js-interview/03-event-loop/01-output-order.md'),
      task('async-traps', 'Найди и исправь баг в асинхронном коде', 'practice/08-js-interview/03-event-loop/02-async-traps.md'),
    ],
  },
  {
    id: 'promises', title: 'JS: промисы на практике', section: '08. JS Interview',
    theoryPath: '08-js-interview/04-promises.md',
    tasks: [
      task('sleep-retry-timeout', 'sleep — неблокирующая пауза', 'practice/08-js-interview/04-promises/01-sleep-retry-timeout.md'),
      task('with-timeout', 'withTimeout', 'practice/08-js-interview/04-promises/01-b-with-timeout.md', 'sleep-retry-timeout'),
      task('retry', 'retry', 'practice/08-js-interview/04-promises/01-c-retry.md', 'sleep-retry-timeout'),
      task('promise-pool', 'Promise Pool', 'practice/08-js-interview/04-promises/02-promise-pool.md'),
      task('promise-all', 'Свой Promise.all', 'practice/08-js-interview/04-promises/03-promise-all.md'),
      task('promise-all-settled', 'Свой Promise.allSettled', 'practice/08-js-interview/04-promises/03-b-promise-all-settled.md', 'promise-all'),
      task('promise-race', 'Свой Promise.race', 'practice/08-js-interview/04-promises/03-c-promise-race.md', 'promise-all'),
      task('promise-any', 'Свой Promise.any', 'practice/08-js-interview/04-promises/03-d-promise-any.md', 'promise-all'),
      task('cancellation', 'cancellable — логическая отмена', 'practice/08-js-interview/04-promises/04-cancellation.md'),
      task('fetch-with-abort', 'Fetch with AbortController', 'practice/08-js-interview/04-promises/04-b-fetch-with-abort.md', 'cancellation'),
      task('latest-search', 'Latest Search — поиск без гонки', 'practice/08-js-interview/04-promises/04-c-latest-search.md', 'cancellation'),
    ],
  },
];
