# 📊 Progress Tracker

Отмечай статус по каждой теме. Легенда: ⬜ не начато · 🟨 в процессе · ✅ разобрано уверенно.

## Теория

| # | Тема | Статус | Заметка прочитана | Эталонный разбор понят |
|---|------|:------:|:-----------------:|:----------------------:|
| 1 | Big O | ✅ | да | да (опрос сдан) |
| 2 | Data structures (Array/Object/Map/Set) | ✅ | да | да (опрос сдан) |
| 3 | Two Pointers | ✅ | да | ✅ (3 разновидности) |
| 4 | Sliding Window | ✅ | да | ✅ (dynamic + fixed + Set) |
| 5 | Frequency Counter | ⬜ | | |
| 6 | Prefix Sum | ⬜ | | |
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
