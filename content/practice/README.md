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

### [02. Массивы и строки](02-arrays-strings/)

| Тема | Задачи |
|---|---|
| [01-two-pointers](02-arrays-strings/01-two-pointers/) | 🔴 [01 Valid Palindrome](02-arrays-strings/01-two-pointers/01-valid-palindrome.md) · 🔴 [02 Move Zeroes](02-arrays-strings/01-two-pointers/02-move-zeroes.md) · 🔴 [03 Merge Sorted Arrays](02-arrays-strings/01-two-pointers/03-merge-sorted-arrays.md) |
| [02-sliding-window](02-arrays-strings/02-sliding-window/) | 🔴 [01 Min Subarray Sum](02-arrays-strings/02-sliding-window/01-min-subarray-sum.md) · 🔴 [02 Max Vowels](02-arrays-strings/02-sliding-window/02-max-vowels.md) · 🔴 [03 Longest Substring](02-arrays-strings/02-sliding-window/03-longest-substring.md) |
| [03-frequency-counter](02-arrays-strings/03-frequency-counter/) | 🔴 [01 First Unique Char](02-arrays-strings/03-frequency-counter/01-first-unique-char.md) · 🔴 [02 Valid Anagram](02-arrays-strings/03-frequency-counter/02-valid-anagram.md) · 🔴 [03 Group Anagrams](02-arrays-strings/03-frequency-counter/03-group-anagrams.md) · 🔴 [04 Top K Frequent](02-arrays-strings/03-frequency-counter/04-top-k-frequent.md) |
| [04-prefix-sum](02-arrays-strings/04-prefix-sum/) | 🔴 [01 Range Sum Query](02-arrays-strings/04-prefix-sum/01-range-sum-query.md) · 🔴 [02 Subarray Sum = K](02-arrays-strings/04-prefix-sum/02-subarray-sum-k.md) · 🔴 [03 Pivot Index](02-arrays-strings/04-prefix-sum/03-pivot-index.md) · ⚪ [04 Product Except Self](02-arrays-strings/04-prefix-sum/04-product-except-self.md) · ⚪ [05 Subarray Sums Divisible by K](02-arrays-strings/04-prefix-sum/05-subarray-sums-divisible-by-k.md) |
| [05-matrix](02-arrays-strings/05-matrix/) | ⚪ [01 Rotate Image](02-arrays-strings/05-matrix/01-rotate-image.md) · ⚪ [02 Spiral Matrix](02-arrays-strings/05-matrix/02-spiral-matrix.md) · ⚪ [03 Set Matrix Zeroes](02-arrays-strings/05-matrix/03-set-matrix-zeroes.md) |

### [03. Линейные структуры](03-linear-structures/)

| Тема | Задачи |
|---|---|
| [01-linked-lists](03-linear-structures/01-linked-lists/) | 🔴 [01 Reverse List](03-linear-structures/01-linked-lists/01-reverse-linked-list.md) · 🔴 [02 Middle of List](03-linear-structures/01-linked-lists/02-middle-of-list.md) · 🔴 [03 Cycle Detection](03-linear-structures/01-linked-lists/03-linked-list-cycle.md) · 🔴 [Linked List Cycle II — вход в цикл](03-linear-structures/01-linked-lists/03-b-linked-list-cycle-entry.md) · 🔴 [04 Merge Two Sorted](03-linear-structures/01-linked-lists/04-merge-two-sorted-lists.md) · ⚪ [05 Remove Nth From End](03-linear-structures/01-linked-lists/05-remove-nth-from-end.md) · ⚪ [06 Palindrome List](03-linear-structures/01-linked-lists/06-palindrome-linked-list.md) |
| [02-stack-queue](03-linear-structures/02-stack-queue/) | 🔴 [01 Valid Parentheses](03-linear-structures/02-stack-queue/01-valid-parentheses.md) · 🔴 [02 Min Stack](03-linear-structures/02-stack-queue/02-min-stack.md) · 🔴 [03 Daily Temperatures](03-linear-structures/02-stack-queue/03-daily-temperatures.md) · ⚪ [04 Evaluate RPN](03-linear-structures/02-stack-queue/04-evaluate-rpn.md) · ⚪ [05 Queue via Stacks](03-linear-structures/02-stack-queue/05-queue-via-stacks.md) |

### [04. Поиск и сортировка](04-search-sort/)

| Тема | Задачи |
|---|---|
| [01-binary-search](04-search-sort/01-binary-search/) | 🔴 [01 Binary Search](04-search-sort/01-binary-search/01-binary-search.md) · 🔴 [02 Search Insert Position](04-search-sort/01-binary-search/02-search-insert-position.md) · 🔴 [03 First & Last Position](04-search-sort/01-binary-search/03-first-last-position.md) · 🔴 [04 Koko Eating Bananas](04-search-sort/01-binary-search/04-koko-eating-bananas.md) · ⚪ [05 Search Rotated](04-search-sort/01-binary-search/05-search-rotated-array.md) · ⚪ [06 Sqrt](04-search-sort/01-binary-search/06-sqrt.md) |
| [02-sorting](04-search-sort/02-sorting/) | 🔴 [01 Sort Colors](04-search-sort/02-sorting/01-sort-colors.md) · 🔴 [02 Merge Intervals](04-search-sort/02-sorting/02-merge-intervals.md) · 🔴 [03 Kth Largest](04-search-sort/02-sorting/03-kth-largest.md) · ⚪ [Meeting Rooms I](04-search-sort/02-sorting/04-meeting-rooms.md) · ⚪ [Meeting Rooms II](04-search-sort/02-sorting/04-b-meeting-rooms-ii.md) · ⚪ [05 Merge Sort](04-search-sort/02-sorting/05-merge-sort-implementation.md) |
| [03-heap](04-search-sort/03-heap/) | 🔴 [01 Implement Min-Heap](04-search-sort/03-heap/01-implement-min-heap.md) · ⚪ [Heap Comparator (дополнительно)](04-search-sort/03-heap/01-b-heap-comparator.md) · ⚪ [Heapify за O(N) (дополнительно)](04-search-sort/03-heap/01-c-heapify.md) · ⚪ [02 K Closest Points](04-search-sort/03-heap/02-k-closest-points.md) |

### [05. Рекурсия и деревья](05-recursion-trees/)

| Тема | Задачи |
|---|---|
| [01-recursion](05-recursion-trees/01-recursion/) | 🔴 [01 Fibonacci + Memo](05-recursion-trees/01-recursion/01-fibonacci-memo.md) · 🔴 [Power — рекурсивное возведение в степень](05-recursion-trees/01-recursion/02-power-and-reverse.md) · 🔴 [Reverse String](05-recursion-trees/01-recursion/02-b-reverse-string.md) · 🔴 [03 Subsets](05-recursion-trees/01-recursion/03-subsets.md) · ⚪ [04 Permutations](05-recursion-trees/01-recursion/04-permutations.md) · ⚪ [Flatten Nested Array](05-recursion-trees/01-recursion/05-flatten-nested.md) · ⚪ [Count Comments](05-recursion-trees/01-recursion/05-b-count-comments.md) · ⚪ [Deep Get (дополнительно)](05-recursion-trees/01-recursion/05-c-deep-get.md) |
| [02-binary-trees](05-recursion-trees/02-binary-trees/) | 🔴 [01 Max Depth](05-recursion-trees/02-binary-trees/01-max-depth.md) · ⚪ [Minimum Depth of Binary Tree](05-recursion-trees/02-binary-trees/01-b-min-depth.md) · 🔴 [02 Invert Tree](05-recursion-trees/02-binary-trees/02-invert-tree.md) · 🔴 [03 Level Order (BFS)](05-recursion-trees/02-binary-trees/03-level-order.md) · 🔴 [04 Validate BST](05-recursion-trees/02-binary-trees/04-validate-bst.md) · ⚪ [05 Diameter](05-recursion-trees/02-binary-trees/05-diameter.md) · ⚪ [06 LCA](05-recursion-trees/02-binary-trees/06-lowest-common-ancestor.md) · ⚪ [Lowest Common Ancestor — Binary Tree](05-recursion-trees/02-binary-trees/06-b-lowest-common-ancestor-binary-tree.md) |

### [06. Графы](06-graphs/)

| Тема | Задачи |
|---|---|
| [01-graph-traversal](06-graphs/01-graph-traversal/) | 🔴 [01 Number of Islands](06-graphs/01-graph-traversal/01-number-of-islands.md) · 🔴 [02 Rotting Oranges](06-graphs/01-graph-traversal/02-rotting-oranges.md) · 🔴 [03 Clone Graph](06-graphs/01-graph-traversal/03-clone-graph.md) · ⚪ [04 Word Search](06-graphs/01-graph-traversal/04-word-search.md) |
| [02-topological-sort](06-graphs/02-topological-sort/) | 🔴 [01 Course Schedule](06-graphs/02-topological-sort/01-course-schedule.md) · ⚪ [02 Course Schedule II](06-graphs/02-topological-sort/02-course-schedule-ii.md) |

### [07. Динамическое программирование и greedy](07-dynamic-programming/)

| Тема | Задачи |
|---|---|
| [01-dp-basics](07-dynamic-programming/01-dp-basics/) | 🔴 [01 Climbing Stairs](07-dynamic-programming/01-dp-basics/01-climbing-stairs.md) · 🔴 [02 House Robber](07-dynamic-programming/01-dp-basics/02-house-robber.md) · ⚪ [House Robber II](07-dynamic-programming/01-dp-basics/02-b-house-robber-ii.md) · 🔴 [03 Coin Change](07-dynamic-programming/01-dp-basics/03-coin-change.md) · ⚪ [Coin Change II](07-dynamic-programming/01-dp-basics/03-b-coin-change-ii.md) · ⚪ [04 LIS](07-dynamic-programming/01-dp-basics/04-longest-increasing-subsequence.md) · ⚪ [05 Unique Paths](07-dynamic-programming/01-dp-basics/05-unique-paths.md) · ⚪ [Unique Paths II](07-dynamic-programming/01-dp-basics/05-b-unique-paths-ii.md) |
| [02-greedy](07-dynamic-programming/02-greedy/) | 🔴 [Best Time to Buy and Sell Stock I](07-dynamic-programming/02-greedy/01-best-time-to-buy-sell-stock.md) · 🔴 [Best Time to Buy and Sell Stock II](07-dynamic-programming/02-greedy/01-b-stock-ii.md) · 🔴 [02 Jump Game](07-dynamic-programming/02-greedy/02-jump-game.md) · 🔴 [Jump Game II](07-dynamic-programming/02-greedy/02-b-jump-game-ii.md) · ⚪ [03 Non-overlapping Intervals](07-dynamic-programming/02-greedy/03-non-overlapping-intervals.md) |

### [08. JS-задачи для FE-секций](08-js-interview/)

| Тема | Задачи |
|---|---|
| [01-function-utils](08-js-interview/01-function-utils/) | 🔴 [01 Debounce](08-js-interview/01-function-utils/01-debounce.md) · 🔴 [02 Throttle](08-js-interview/01-function-utils/02-throttle.md) · ⚪ [03 Curry](08-js-interview/01-function-utils/03-curry.md) · ⚪ [04 Memoize](08-js-interview/01-function-utils/04-memoize.md) |
| [02-objects](08-js-interview/02-objects/) | 🔴 [01 Deep Clone](08-js-interview/02-objects/01-deep-clone.md) · 🔴 [02 EventEmitter](08-js-interview/02-objects/02-event-emitter.md) |
| [03-event-loop](08-js-interview/03-event-loop/) | 🔴 [01 Что выведется](08-js-interview/03-event-loop/01-output-order.md) · 🔴 [02 Найди баг](08-js-interview/03-event-loop/02-async-traps.md) |
| [04-promises](08-js-interview/04-promises/) | 🔴 [sleep — неблокирующая пауза](08-js-interview/04-promises/01-sleep-retry-timeout.md) · 🔴 [withTimeout](08-js-interview/04-promises/01-b-with-timeout.md) · 🔴 [retry](08-js-interview/04-promises/01-c-retry.md) · 🔴 [02 Promise Pool](08-js-interview/04-promises/02-promise-pool.md) · ⚪ [03 Свой Promise.all](08-js-interview/04-promises/03-promise-all.md) · ⚪ [Свой Promise.allSettled](08-js-interview/04-promises/03-b-promise-all-settled.md) · ⚪ [Свой Promise.race](08-js-interview/04-promises/03-c-promise-race.md) · ⚪ [Свой Promise.any](08-js-interview/04-promises/03-d-promise-any.md) · ⚪ [cancellable — логическая отмена](08-js-interview/04-promises/04-cancellation.md) · ⚪ [Fetch with AbortController](08-js-interview/04-promises/04-b-fetch-with-abort.md) · ⚪ [Latest Search — поиск без гонки](08-js-interview/04-promises/04-c-latest-search.md) |


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
