# 📊 Progress Tracker

Отмечай статус по каждой теме. Легенда: ⬜ не начато · 🟨 в процессе · ✅ разобрано уверенно.

## Теория

| # | Тема | Статус | Заметка прочитана | Эталонный разбор понят |
|---|------|:------:|:-----------------:|:----------------------:|
| 1 | Big O | ✅ | да | да (опрос сдан) |
| 2 | Data structures (Array/Object/Map/Set) | ✅ | да | да (опрос сдан) |
| 3 | Two Pointers | ✅ | да | ✅ (3 разновидности) |
| 4 | Sliding Window | ✅ | да | ✅ (dynamic + fixed + Set) |
| 5 | Frequency Counter | ✅ | да | ✅ (счётчик + сравнение + составной ключ) |
| 6 | Prefix Sum | 🟨 | да | — |
| 7 | Linked Lists | ⬜ | | |
| 8 | Stack & Queue | ⬜ | | |
| 9 | Binary Search | ⬜ | | |
| 10 | Sorting | ⬜ | | |
| 11 | Recursion | ⬜ | | |
| 12 | Binary Trees | ⬜ | | |

## Решённые задачи

| Дата | Тема | Задача | Сам / с подсказкой | Сложность (O) верна? | Заметки |
|------|------|--------|:------------------:|:--------------------:|---------|
| 2026-07-05 | two-pointers | Valid Palindrome | с подсказками (индексы, проверка символов) | ✅ O(N)/O(1) | опечатки + инверсия условия — починил |
| 2026-07-05 | two-pointers | Move Zeroes (fast/slow, 2 прохода) | с подсказками | ✅ O(N)/O(1) | off-by-one в границе + JS не поддерживает a<x<b |
| 2026-07-05 | two-pointers | Merge Two Sorted Arrays (два массива) | сам | ✅ O(N+M)/O(N+M) | забыл return + опечатка let; логика верна |
| 2026-07-06 | sliding-window | Minimum Size Subarray Sum (dynamic) | с подсказками | ✅ O(N)/O(1) | for с запятой вместо ; + старт 0 вместо Infinity; понял амортизацию |
| 2026-07-06 | sliding-window | Max Vowels in Substring of Length K (fixed) | с подсказками | ✅ O(N)/O(1) | сам понял симметрию add/remove; нейминг currentMax→count |
| 2026-07-09 | sliding-window | Longest Substring Without Repeating Chars (Set) | с подсказками | ✅ O(N)/O(min(N,k)) | if вместо while (дубликат внутри окна); синтаксис has()/add() |
| 2026-07-11 | frequency-counter | First Unique Character (Map) | с подсказками | ✅ O(N)/O(K) | приоритет ||/+ (нужны скобки); перебор по индексам строки для индекса |
| 2026-07-11 | frequency-counter | Valid Anagram (счётчик +/−) | сам (по памяти) | ✅ O(N)/O(K) | место скобок в (get()||0)+1; !== vs !===; new Map() |
| 2026-07-29 | frequency-counter | Group Anagrams (Map + составной ключ) | сам | ✅ O(N·K log K)/O(N·K) | for...of по Map даёт пары, не ключи; values() |
| 2026-07-29 | frequency-counter | Top K Frequent Elements (счётчик + sort) | сам (чисто!) | ✅ O(N + M log M)/O(N) | разбирали метод подсчёта сложности построчно |
