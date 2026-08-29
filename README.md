# 🧠 Algo — подготовка к алгоритмическим секциям (Frontend / BigTech)

## Зачем это всё

Цель — **уверенно проходить и проводить алгоритмические собеседования**. Это не олимпиадное
программирование: акцент на том, как ты работаешь с базовыми структурами данных JavaScript
(`Array`, `String`, `Object`, `Map`, `Set`) и умеешь ли ты оптимизировать код по времени и памяти
(думать в терминах `O(N)`).

Чтобы проводить интервью, нужно сначала самому решать такие задачи «с закрытыми глазами».

## Как этим пользоваться

1. **Теория** — читаешь заметки по темам ниже. В каждой заметке есть **эталонный разбор**
   задачи (условие → ментальная модель → ход мысли → решение → на что обратить внимание),
   чек-лист частых ошибок и **мини-опрос для самопроверки** с ответами под спойлером.
2. **Практика** — в папке [`practice/`](practice/) лежат условия задач. Решаешь сам, затем
   открываешь блок «🔍 Разбор» **только после своей попытки**. Задачи помечены
   🔴 (основные, обязательно) и ⚪ (дополнительные, если есть время).
3. **Прогресс** — отмечаешь пройденное в [PROGRESS.md](PROGRESS.md) (там же чек-лист всех задач).

> 💡 Начни с [00-how-to-solve.md](00-how-to-solve.md) — это общий фреймворк «как вообще
> подступиться к любой задаче» и как распознать нужный паттерн по условию.

### 🎒 Офлайн-режим

Материал самодостаточен: теория, задачи, подсказки по нарастанию, разборы под спойлером и
опросы с ответами. Порядок тем — сверху вниз по оглавлению. Рекурсию проходи **до** деревьев.


## Оглавление

### 0. Как решать задачи
- [00-how-to-solve.md](00-how-to-solve.md) — фреймворк решения + таблица «паттерн по признакам условия»

### 1. Базовые концепции (начать отсюда)
- [01-basics/01-big-o.md](01-basics/01-big-o.md) — оценка сложности (Big O)
- [01-basics/02-data-structures.md](01-basics/02-data-structures.md) — Array / Object / Map / Set изнутри

### 2. Массивы и строки (≈70% задач FE-секций)
- [02-arrays-strings/01-two-pointers.md](02-arrays-strings/01-two-pointers.md) — Two Pointers
- [02-arrays-strings/02-sliding-window.md](02-arrays-strings/02-sliding-window.md) — Sliding Window
- [02-arrays-strings/03-frequency-counter.md](02-arrays-strings/03-frequency-counter.md) — Frequency Counter (Hash Map)
- [02-arrays-strings/04-prefix-sum.md](02-arrays-strings/04-prefix-sum.md) — Prefix Sum
- [02-arrays-strings/05-matrix.md](02-arrays-strings/05-matrix.md) — Matrix / 2D Arrays

### 3. Линейные структуры данных
- [03-linear-structures/01-linked-lists.md](03-linear-structures/01-linked-lists.md) — Linked Lists
- [03-linear-structures/02-stack-queue.md](03-linear-structures/02-stack-queue.md) — Stack & Queue

### 4. Поиск и сортировка
- [04-search-sort/01-binary-search.md](04-search-sort/01-binary-search.md) — Binary Search
- [04-search-sort/02-sorting.md](04-search-sort/02-sorting.md) — Sorting (sort / Quick / Merge)
- [04-search-sort/03-heap.md](04-search-sort/03-heap.md) — Heap / Priority Queue

### 5. Рекурсия и деревья
- [05-recursion-trees/01-recursion.md](05-recursion-trees/01-recursion.md) — Recursion & Call Stack
- [05-recursion-trees/02-binary-trees.md](05-recursion-trees/02-binary-trees.md) — Binary Trees (DFS / BFS)

### 6. Графы
- [06-graphs/01-graph-traversal.md](06-graphs/01-graph-traversal.md) — BFS / DFS, обход сетки, компоненты связности
- [06-graphs/02-topological-sort.md](06-graphs/02-topological-sort.md) — топологическая сортировка, поиск цикла

### 7. Динамическое программирование и жадные алгоритмы
- [07-dynamic-programming/01-dp-basics.md](07-dynamic-programming/01-dp-basics.md) — DP: состояние, переход, база
- [07-dynamic-programming/02-greedy.md](07-dynamic-programming/02-greedy.md) — Greedy и когда он ломается

### 8. JS-задачи для FE-секций
- [08-js-interview/01-function-utils.md](08-js-interview/01-function-utils.md) — debounce, throttle, curry, memoize
- [08-js-interview/02-objects.md](08-js-interview/02-objects.md) — ссылочная модель, deep clone, EventEmitter
- [08-js-interview/03-event-loop.md](08-js-interview/03-event-loop.md) — микро/макрозадачи, async/await, «что выведется»
- [08-js-interview/04-promises.md](08-js-interview/04-promises.md) — комбинаторы, параллелизм, таймауты, отмена

> 💡 Разделы 6-8 добавлены для полноты покрытия BigTech-секции. Разделы 1-5 — фундамент,
> проходить строго по порядку. Раздел 8 — не алгоритмы, но на FE-интервью спрашивают не реже.


## Структура заметки по теме

Каждая теоретическая заметка построена одинаково:

1. **🎯 Идея** — что это и когда применять.
2. **🧠 Как распознать** — признаки в условии, ментальная модель.
3. **⏱️ Сложность** — время и память.
4. **📝 Эталонный разбор** — одна задача с полным ходом мысли и решением.
5. **⚠️ Частые ошибки / чек-лист**.
6. **🏋️ Задачи для практики** — ссылки на файлы в `practice/`, разделённые на 🔴 и ⚪.
7. **✅ Мини-опрос для самопроверки** — вопросы с ответами под спойлером.

