# practice/ — задачи для самостоятельного решения

Здесь лежат **условия задач** и нейтральные заготовки. В приложении решай в редакторе:
попытки сохраняются в твоём браузере, а не в общих Markdown-файлах.
Для офлайн-работы используй личную копию файла и блок «✍️ Моё решение».
Прежние заполненные попытки владельца сохранены в
[архиве](../../personal/solutions/practice/); он публичный в репозитории, но не загружается приложением.

## Как пользоваться (важно!)

Порядок работы с каждым файлом:

1. Прочитай **условие**, примеры и ограничения.
2. Прочитай **🎯 цель по сложности** и **🧠 ментальную модель** — они направляют, но не решают.
3. Прочитай **⚠️ подводные камни** — там собраны ошибки, свойственные именно этой задаче.
4. **Реши сам.** Пиши код в блоке «✍️ Моё решение» и обязательно заполни «🧮 Мою оценку
   сложности» — по времени **и** по памяти.
5. Застрял? Открывай **💡 подсказки по очереди**, не все сразу.
6. **Только после своей попытки** открывай блок «🔍 Разбор». Там эталонное решение,
   трассировка и объяснение, почему именно так.
7. В приложении прогресс сохраняется локально в твоём браузере. При офлайн-работе
   отмечай решённые задачи в личном чек-листе.

> ⚠️ Разбор, открытый заранее, убивает пользу задачи. Даже неудачная попытка даёт больше, чем
> прочитанное решение: на интервью ты вспоминаешь не текст, а **свой опыт вывода**.

## Приоритеты

- 🔴 **основная** — обязательно. Покрывает ядро паттерна; такие задачи реально спрашивают.
- ⚪ **дополнительная** — если есть время. Вариации паттерна и «продвинутые» вопросы.

Сначала проходи все 🔴 по теме, потом возвращайся к ⚪.

## Одна задача — один самостоятельный результат

Независимые функции, части A/B с разными контрактами и содержательные дополнительные
упражнения хранятся отдельно. Например, обнаружение цикла и поиск его входа — две задачи;
DFS и BFS для одной максимальной глубины — два подхода внутри одной задачи.
Примеры, тест-кейсы, необходимые вспомогательные функции и варианты опций одной утилиты
не создают отдельные задачи. Поэтому Async Traps остаётся одним упражнением по code review,
а Fibonacci — одной задачей с тремя алгоритмами.

После разделения первая часть сохраняет прежние ID и путь; остальные идут сразу за ней
в каталоге и используют суффиксы `-b-`, `-c-` в имени файла. Поле `previousTaskId` в каталоге
связывает новую часть с прежним общим черновиком: оно не означает автоматический перенос
решения или статуса. Архив личных попыток не переписывается.

## Структура и именование

Путь к любой задаче: `practice/<NN-раздел>/<NN-тема>/<NN-задача>.md`

Нумерация сквозная и **задаёт рекомендуемый порядок**: разделы совпадают с теорией
(`02-arrays-strings` → `02-arrays-strings/`), темы внутри раздела идут от базовых к тем, что
на них опираются, а задачи внутри темы — по нарастанию сложности.

Иди по номерам — это и есть учебный маршрут.

## Полный список задач

### [Массивы и строки](02-arrays-strings/)

| Тема | Задачи |
|---|---|
| [Two Pointers](02-arrays-strings/01-two-pointers/) | 🔴 [Valid Palindrome](02-arrays-strings/01-two-pointers/01-valid-palindrome.md) · 🔴 [Move Zeroes](02-arrays-strings/01-two-pointers/02-move-zeroes.md) · 🔴 [Merge Two Sorted Arrays](02-arrays-strings/01-two-pointers/03-merge-sorted-arrays.md) |
| [Sliding Window](02-arrays-strings/02-sliding-window/) | 🔴 [Minimum Size Subarray Sum](02-arrays-strings/02-sliding-window/01-min-subarray-sum.md) · 🔴 [Maximum Number of Vowels in a Substring of Length K](02-arrays-strings/02-sliding-window/02-max-vowels.md) · 🔴 [Longest Substring Without Repeating Characters](02-arrays-strings/02-sliding-window/03-longest-substring.md) |
| [Frequency Counter (Hash Map)](02-arrays-strings/03-frequency-counter/) | 🔴 [First Unique Character in a String](02-arrays-strings/03-frequency-counter/01-first-unique-char.md) · 🔴 [Valid Anagram](02-arrays-strings/03-frequency-counter/02-valid-anagram.md) · 🔴 [Group Anagrams](02-arrays-strings/03-frequency-counter/03-group-anagrams.md) · 🔴 [Top K Frequent Elements](02-arrays-strings/03-frequency-counter/04-top-k-frequent.md) |
| [Prefix Sum (префиксные суммы)](02-arrays-strings/04-prefix-sum/) | 🔴 [Range Sum Query — Immutable](02-arrays-strings/04-prefix-sum/01-range-sum-query.md) · 🔴 [Subarray Sum Equals K](02-arrays-strings/04-prefix-sum/02-subarray-sum-k.md) · 🔴 [Find Pivot Index](02-arrays-strings/04-prefix-sum/03-pivot-index.md) · ⚪ [Product of Array Except Self](02-arrays-strings/04-prefix-sum/04-product-except-self.md) · ⚪ [Subarray Sums Divisible by K](02-arrays-strings/04-prefix-sum/05-subarray-sums-divisible-by-k.md) |
| [Matrix / 2D Arrays](02-arrays-strings/05-matrix/) | ⚪ [Rotate Image](02-arrays-strings/05-matrix/01-rotate-image.md) · ⚪ [Spiral Matrix](02-arrays-strings/05-matrix/02-spiral-matrix.md) · ⚪ [Set Matrix Zeroes](02-arrays-strings/05-matrix/03-set-matrix-zeroes.md) |

### [Линейные структуры](03-linear-structures/)

| Тема | Задачи |
|---|---|
| [Linked Lists (связные списки)](03-linear-structures/01-linked-lists/) | 🔴 [Reverse Linked List](03-linear-structures/01-linked-lists/01-reverse-linked-list.md) · 🔴 [Middle of the Linked List](03-linear-structures/01-linked-lists/02-middle-of-list.md) · 🔴 [Linked List Cycle](03-linear-structures/01-linked-lists/03-linked-list-cycle.md) · 🔴 [Linked List Cycle II — вход в цикл](03-linear-structures/01-linked-lists/03-b-linked-list-cycle-entry.md) · 🔴 [Merge Two Sorted Lists](03-linear-structures/01-linked-lists/04-merge-two-sorted-lists.md) · ⚪ [Remove Nth Node From End of List](03-linear-structures/01-linked-lists/05-remove-nth-from-end.md) · ⚪ [Palindrome Linked List](03-linear-structures/01-linked-lists/06-palindrome-linked-list.md) |
| [Stack & Queue](03-linear-structures/02-stack-queue/) | 🔴 [Valid Parentheses](03-linear-structures/02-stack-queue/01-valid-parentheses.md) · 🔴 [Min Stack](03-linear-structures/02-stack-queue/02-min-stack.md) · 🔴 [Daily Temperatures](03-linear-structures/02-stack-queue/03-daily-temperatures.md) · ⚪ [Evaluate Reverse Polish Notation](03-linear-structures/02-stack-queue/04-evaluate-rpn.md) · ⚪ [Implement Queue using Stacks](03-linear-structures/02-stack-queue/05-queue-via-stacks.md) |

### [Поиск и сортировка](04-search-sort/)

| Тема | Задачи |
|---|---|
| [Binary Search](04-search-sort/01-binary-search/) | 🔴 [Binary Search (классический)](04-search-sort/01-binary-search/01-binary-search.md) · 🔴 [Search Insert Position](04-search-sort/01-binary-search/02-search-insert-position.md) · 🔴 [Find First and Last Position](04-search-sort/01-binary-search/03-first-last-position.md) · 🔴 [Koko Eating Bananas](04-search-sort/01-binary-search/04-koko-eating-bananas.md) · ⚪ [Search in Rotated Sorted Array](04-search-sort/01-binary-search/05-search-rotated-array.md) · ⚪ [Sqrt(x)](04-search-sort/01-binary-search/06-sqrt.md) |
| [Sorting](04-search-sort/02-sorting/) | 🔴 [Sort Colors](04-search-sort/02-sorting/01-sort-colors.md) · 🔴 [Merge Intervals](04-search-sort/02-sorting/02-merge-intervals.md) · 🔴 [Kth Largest Element in an Array](04-search-sort/02-sorting/03-kth-largest.md) · ⚪ [Meeting Rooms I](04-search-sort/02-sorting/04-meeting-rooms.md) · ⚪ [Meeting Rooms II](04-search-sort/02-sorting/04-b-meeting-rooms-ii.md) · ⚪ [Реализовать Merge Sort](04-search-sort/02-sorting/05-merge-sort-implementation.md) |
| [Heap / Priority Queue](04-search-sort/03-heap/) | 🔴 [Реализовать Min-Heap](04-search-sort/03-heap/01-implement-min-heap.md) · ⚪ [Heap Comparator (дополнительно)](04-search-sort/03-heap/01-b-heap-comparator.md) · ⚪ [Heapify за O(N) (дополнительно)](04-search-sort/03-heap/01-c-heapify.md) · ⚪ [K Closest Points to Origin](04-search-sort/03-heap/02-k-closest-points.md) |

### [Рекурсия и деревья](05-recursion-trees/)

| Тема | Задачи |
|---|---|
| [Recursion & Call Stack](05-recursion-trees/01-recursion/) | 🔴 [Fibonacci с мемоизацией](05-recursion-trees/01-recursion/01-fibonacci-memo.md) · 🔴 [Power — рекурсивное возведение в степень](05-recursion-trees/01-recursion/02-power-and-reverse.md) · 🔴 [Reverse String](05-recursion-trees/01-recursion/02-b-reverse-string.md) · 🔴 [Subsets](05-recursion-trees/01-recursion/03-subsets.md) · ⚪ [Permutations](05-recursion-trees/01-recursion/04-permutations.md) · ⚪ [Flatten Nested Array](05-recursion-trees/01-recursion/05-flatten-nested.md) · ⚪ [Count Comments](05-recursion-trees/01-recursion/05-b-count-comments.md) · ⚪ [Deep Get (дополнительно)](05-recursion-trees/01-recursion/05-c-deep-get.md) |
| [Binary Trees (DFS / BFS)](05-recursion-trees/02-binary-trees/) | 🔴 [Maximum Depth of Binary Tree](05-recursion-trees/02-binary-trees/01-max-depth.md) · ⚪ [Minimum Depth of Binary Tree](05-recursion-trees/02-binary-trees/01-b-min-depth.md) · 🔴 [Invert Binary Tree](05-recursion-trees/02-binary-trees/02-invert-tree.md) · 🔴 [Binary Tree Level Order Traversal](05-recursion-trees/02-binary-trees/03-level-order.md) · 🔴 [Validate Binary Search Tree](05-recursion-trees/02-binary-trees/04-validate-bst.md) · ⚪ [Diameter of Binary Tree](05-recursion-trees/02-binary-trees/05-diameter.md) · ⚪ [Lowest Common Ancestor — BST](05-recursion-trees/02-binary-trees/06-lowest-common-ancestor.md) · ⚪ [Lowest Common Ancestor — Binary Tree](05-recursion-trees/02-binary-trees/06-b-lowest-common-ancestor-binary-tree.md) |

### [Графы](06-graphs/)

| Тема | Задачи |
|---|---|
| [Graph Traversal (BFS / DFS)](06-graphs/01-graph-traversal/) | 🔴 [Number of Islands](06-graphs/01-graph-traversal/01-number-of-islands.md) · 🔴 [Rotting Oranges](06-graphs/01-graph-traversal/02-rotting-oranges.md) · 🔴 [Clone Graph](06-graphs/01-graph-traversal/03-clone-graph.md) · ⚪ [Word Search](06-graphs/01-graph-traversal/04-word-search.md) |
| [Topological Sort](06-graphs/02-topological-sort/) | 🔴 [Course Schedule](06-graphs/02-topological-sort/01-course-schedule.md) · ⚪ [Course Schedule II](06-graphs/02-topological-sort/02-course-schedule-ii.md) |

### [Dynamic Programming и Greedy](07-dynamic-programming/)

| Тема | Задачи |
|---|---|
| [Dynamic Programming](07-dynamic-programming/01-dp-basics/) | 🔴 [Climbing Stairs](07-dynamic-programming/01-dp-basics/01-climbing-stairs.md) · 🔴 [House Robber](07-dynamic-programming/01-dp-basics/02-house-robber.md) · ⚪ [House Robber II](07-dynamic-programming/01-dp-basics/02-b-house-robber-ii.md) · 🔴 [Coin Change](07-dynamic-programming/01-dp-basics/03-coin-change.md) · ⚪ [Coin Change II](07-dynamic-programming/01-dp-basics/03-b-coin-change-ii.md) · ⚪ [Longest Increasing Subsequence](07-dynamic-programming/01-dp-basics/04-longest-increasing-subsequence.md) · ⚪ [Unique Paths](07-dynamic-programming/01-dp-basics/05-unique-paths.md) · ⚪ [Unique Paths II](07-dynamic-programming/01-dp-basics/05-b-unique-paths-ii.md) |
| [Greedy](07-dynamic-programming/02-greedy/) | 🔴 [Best Time to Buy and Sell Stock I](07-dynamic-programming/02-greedy/01-best-time-to-buy-sell-stock.md) · 🔴 [Best Time to Buy and Sell Stock II](07-dynamic-programming/02-greedy/01-b-stock-ii.md) · 🔴 [Jump Game](07-dynamic-programming/02-greedy/02-jump-game.md) · 🔴 [Jump Game II](07-dynamic-programming/02-greedy/02-b-jump-game-ii.md) · ⚪ [Non-overlapping Intervals](07-dynamic-programming/02-greedy/03-non-overlapping-intervals.md) |

### [JS Interview](08-js-interview/)

| Тема | Задачи |
|---|---|
| [JS Function Utils](08-js-interview/01-function-utils/) | 🔴 [Debounce](08-js-interview/01-function-utils/01-debounce.md) · 🔴 [Throttle](08-js-interview/01-function-utils/02-throttle.md) · 🔴 [Throttle — leading + trailing](08-js-interview/01-function-utils/02-b-throttle-trailing.md) · ⚪ [Curry](08-js-interview/01-function-utils/03-curry.md) · ⚪ [Memoize](08-js-interview/01-function-utils/04-memoize.md) |
| [JS: объекты и структуры](08-js-interview/02-objects/) | 🔴 [Deep Clone](08-js-interview/02-objects/01-deep-clone.md) · 🔴 [EventEmitter](08-js-interview/02-objects/02-event-emitter.md) |
| [Event Loop и асинхронность](08-js-interview/03-event-loop/) | 🔴 [«Что выведется?» — порядок выполнения](08-js-interview/03-event-loop/01-output-order.md) · 🔴 [Найди и исправь баг в асинхронном коде](08-js-interview/03-event-loop/02-async-traps.md) |
| [JS: промисы на практике](08-js-interview/04-promises/) | 🔴 [sleep — неблокирующая пауза](08-js-interview/04-promises/01-sleep-retry-timeout.md) · 🔴 [withTimeout](08-js-interview/04-promises/01-b-with-timeout.md) · 🔴 [retry](08-js-interview/04-promises/01-c-retry.md) · 🔴 [Promise Pool](08-js-interview/04-promises/02-promise-pool.md) · ⚪ [Свой Promise.all](08-js-interview/04-promises/03-promise-all.md) · ⚪ [Свой Promise.allSettled](08-js-interview/04-promises/03-b-promise-all-settled.md) · ⚪ [Свой Promise.race](08-js-interview/04-promises/03-c-promise-race.md) · ⚪ [Свой Promise.any](08-js-interview/04-promises/03-d-promise-any.md) · ⚪ [cancellable — логическая отмена](08-js-interview/04-promises/04-cancellation.md) · ⚪ [Fetch with AbortController](08-js-interview/04-promises/04-b-fetch-with-abort.md) · ⚪ [Latest Search — поиск без гонки](08-js-interview/04-promises/04-c-latest-search.md) |


## Шаблон файла задачи

```md
# <Название задачи>

**Тема:** <тема> · **Сложность:** easy/medium/hard · **Приоритет:** 🔴 основная / ⚪ дополнительная

## Условие
## Примеры
## Ограничения
## 🎯 Цель по сложности
## 🧠 Ментальная модель
## ⚠️ Подводные камни именно этой задачи
## 💡 Подсказки (открывай по очереди)

---
## ✍️ Моё решение
## 🧮 Моя оценка сложности

---
## 🔍 Разбор — открывай ТОЛЬКО после своей попытки
```
