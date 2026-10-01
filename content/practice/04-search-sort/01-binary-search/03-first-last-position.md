# Find First and Last Position of Element in Sorted Array

**Тема:** binary-search (lower / upper bound) · **Сложность:** medium · **Приоритет:** 🔴 основная

## Условие

Дан отсортированный массив `nums`, в котором **могут быть дубликаты**, и число `target`.
Верни `[первый индекс target, последний индекс target]`.
Если `target` отсутствует — верни `[-1, -1]`.

Требуется `O(log N)`.

## Примеры

```
Вход:  nums = [5, 7, 7, 8, 8, 10], target = 8     Выход: [3, 4]
Вход:  nums = [5, 7, 7, 8, 8, 10], target = 6     Выход: [-1, -1]
Вход:  nums = [], target = 0                      Выход: [-1, -1]
Вход:  nums = [2, 2], target = 2                  Выход: [0, 1]
```

## Ограничения

- `0 <= nums.length <= 10^5`
- массив отсортирован по неубыванию.

## 🎯 Цель по сложности

- Время **`O(log N)`**, память `O(1)`.
- ⚠️ Ловушка: найти любое вхождение бинарным поиском, а потом «разойтись» линейно влево и
  вправо. На входе `[8,8,8,...,8]` из `10^5` элементов это выродится в **`O(N)`** — решение
  формально неверное по требованию.

## 🧠 Ментальная модель

Два независимых бинарных поиска **границы**:

- **lower bound** — первый индекс, где `nums[i] >= target`;
- **upper bound** — первый индекс, где `nums[i] > target`.

```
nums:          [5, 7, 7, 8, 8, 10]     target = 8
индексы:        0  1  2  3  4   5
lower(8) = 3 ────────────↑
upper(8) = 5 ───────────────────↑
ответ: [lower, upper - 1] = [3, 4]
```

Полезное следствие: `upper - lower` = **количество вхождений** `target`. Если оно равно нулю —
элемента нет.

## ⚠️ Подводные камни именно этой задачи

1. **Проверка существования.** `lowerBound` всегда возвращает какой-то индекс, даже если
   `target` в массиве нет. Обязательна проверка:
   `if (first === nums.length || nums[first] !== target) return [-1, -1];`
   **Порядок условий важен**: сначала проверяем выход за границу, потом разыменовываем.
   Иначе `nums[nums.length]` даст `undefined` — здесь не упадёт, но привычка опасная.
2. **`upper - 1`, а не `upper`.** Upper bound указывает на **первый элемент строго больше**
   `target`, значит последнее вхождение — на позицию левее.
3. **Разница между `>=` и `>`** — единственное отличие двух функций. Одна опечатка меняет
   смысл; при отладке всегда проверяй на массиве с дубликатами.
4. **Пустой массив.** `left = right = 0`, цикл не выполняется, возвращается `0`, а
   `nums[0] === undefined !== target` → `[-1, -1]` ✅ Проверь, что твой код так и делает.
5. Линейное «расхождение» от найденного элемента — самая частая ошибка. Именно её ищет
   интервьюер в этой задаче.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — разбей на две функции</summary>

Напиши одну вспомогательную функцию с параметром-сравнением, либо две почти одинаковые:
`lowerBound(nums, target)` и `upperBound(nums, target)`.

</details>

<details>
<summary>Подсказка 2 — шаблон границы</summary>

```js
let left = 0, right = nums.length;
while (left < right) {
  const mid = Math.floor((left + right) / 2);
  if (/* условие */) right = mid;
  else left = mid + 1;
}
return left;
```
Для lower условие `nums[mid] >= target`, для upper — `nums[mid] > target`.

</details>

---

## ✍️ Моё решение

```js
function searchRange(nums, target) {
  // пиши здесь
}
```

## 🧮 Моя оценка сложности

Время: O(?) · Память: O(?)

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Решение + объяснение</summary>

```js
function lowerBound(nums, target) {           // первый индекс с nums[i] >= target
  let left = 0;
  let right = nums.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] >= target) right = mid;
    else left = mid + 1;
  }
  return left;
}

function upperBound(nums, target) {           // первый индекс с nums[i] > target
  let left = 0;
  let right = nums.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] > target) right = mid;
    else left = mid + 1;
  }
  return left;
}

function searchRange(nums, target) {
  const first = lowerBound(nums, target);

  if (first === nums.length || nums[first] !== target) return [-1, -1];

  const last = upperBound(nums, target) - 1;
  return [first, last];
}
```

**Трассировка `lowerBound([5,7,7,8,8,10], 8)`:**

| шаг | left | right | mid | nums[mid] | `>= 8`? | действие |
|:---:|:----:|:-----:|:---:|:---------:|:-------:|---|
| 1 | 0 | 6 | 3 | 8 | да | right = 3 |
| 2 | 0 | 3 | 1 | 7 | нет | left = 2 |
| 3 | 2 | 3 | 2 | 7 | нет | left = 3 |
| 4 | left === right = 3 → **3** ✅ | | | | | |

**Трассировка `upperBound([5,7,7,8,8,10], 8)`:**

| шаг | left | right | mid | nums[mid] | `> 8`? | действие |
|:---:|:----:|:-----:|:---:|:---------:|:------:|---|
| 1 | 0 | 6 | 3 | 8 | нет | left = 4 |
| 2 | 4 | 6 | 5 | 10 | да | right = 5 |
| 3 | 4 | 5 | 4 | 8 | нет | left = 5 |
| 4 | left === right = 5 → **5** ✅ | | | | | |

Ответ `[3, 5 - 1] = [3, 4]` ✅

**Сложность:** время `O(log N)` — два независимых бинарных поиска, `2 log N = O(log N)`.
Память `O(1)`.

</details>

<details>
<summary>Компактная версия с одной функцией</summary>

```js
function bound(nums, target, strict) {
  let left = 0;
  let right = nums.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const goLeft = strict ? nums[mid] > target : nums[mid] >= target;
    if (goLeft) right = mid;
    else left = mid + 1;
  }
  return left;
}

function searchRange(nums, target) {
  const first = bound(nums, target, false);
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  return [first, bound(nums, target, true) - 1];
}
```

Меньше дублирования, но флаг `strict` читается хуже. На интервью выбирай читаемость —
две явные функции обычно понятнее.

</details>

<details>
<summary>Бонус: посчитать количество вхождений</summary>

```js
const count = upperBound(nums, target) - lowerBound(nums, target);
```

`O(log N)` вместо `O(N)`. Именно так работает `std::equal_range` в C++. Приём часто нужен в
задачах вида «сколько элементов в диапазоне [a, b]»: `upperBound(b) - lowerBound(a)`.

</details>
