# 🧠 Algo — подготовка к алгоритмическим секциям (Frontend / BigTech)

## Зачем это всё

Цель — **уверенно проходить и проводить алгоритмические собеседования**. Это не олимпиадное
программирование: акцент на том, как ты работаешь с базовыми структурами данных JavaScript
(`Array`, `String`, `Object`, `Map`, `Set`) и умеешь ли ты оптимизировать код по времени и памяти
(думать в терминах `O(N)`).

Чтобы проводить интервью, нужно сначала самому решать такие задачи «с закрытыми глазами».

## Как этим пользоваться

1. **Теория** — читаешь заметки по темам ниже. В каждой заметке есть один **эталонный разбор**
   задачи: условие → ментальная модель → ход мысли → решение → на что обратить внимание.
2. **Практика** — открываешь новый чат и просишь: _«дай задачу на sliding window»_. Решаешь сам,
   я проверяю и разбираю. «Голые» условия задач складываем в папку [`practice/`](practice/).
3. **Прогресс** — отмечаешь пройденное в [PROGRESS.md](PROGRESS.md).

> 💡 Начни с [00-how-to-solve.md](00-how-to-solve.md) — это общий фреймворк «как вообще
> подступиться к любой задаче» и как распознать нужный паттерн по условию.

## Оглавление

### 0. Как решать задачи
- [00-how-to-solve.md](00-how-to-solve.md) — фреймворк решения + таблица «паттерн по признакам условия»

### 1. Базовые концепции (начать отсюда)
- [01-basics/big-o.md](01-basics/big-o.md) — оценка сложности (Big O)
- [01-basics/data-structures.md](01-basics/data-structures.md) — Array / Object / Map / Set изнутри

### 2. Массивы и строки (≈70% задач FE-секций)
- [02-arrays-strings/two-pointers.md](02-arrays-strings/two-pointers.md) — Two Pointers
- [02-arrays-strings/sliding-window.md](02-arrays-strings/sliding-window.md) — Sliding Window
- [02-arrays-strings/frequency-counter.md](02-arrays-strings/frequency-counter.md) — Frequency Counter (Hash Map)
- [02-arrays-strings/prefix-sum.md](02-arrays-strings/prefix-sum.md) — Prefix Sum _(добавлено)_

### 3. Линейные структуры данных
- [03-linear-structures/linked-lists.md](03-linear-structures/linked-lists.md) — Linked Lists
- [03-linear-structures/stack-queue.md](03-linear-structures/stack-queue.md) — Stack & Queue

### 4. Поиск и сортировка
- [04-search-sort/binary-search.md](04-search-sort/binary-search.md) — Binary Search
- [04-search-sort/sorting.md](04-search-sort/sorting.md) — Sorting (sort / Quick / Merge)

### 5. Рекурсия и деревья
- [05-recursion-trees/recursion.md](05-recursion-trees/recursion.md) — Recursion & Call Stack
- [05-recursion-trees/binary-trees.md](05-recursion-trees/binary-trees.md) — Binary Trees (DFS / BFS)

## Структура заметки по теме

Каждая теоретическая заметка построена одинаково:

1. **🎯 Идея** — что это и когда применять.
2. **🧠 Как распознать** — признаки в условии, ментальная модель.
3. **⏱️ Сложность** — время и память.
4. **📝 Эталонный разбор** — одна задача с полным ходом мысли и решением.
5. **⚠️ Частые ошибки / чек-лист**.
6. **🏋️ Задачи для практики** — список условий (решаем в чате).
