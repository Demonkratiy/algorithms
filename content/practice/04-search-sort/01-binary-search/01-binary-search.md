# Binary Search (классический)

**Тема:** binary-search · **Сложность:** easy · **Приоритет:** 🔴 основная

> ⚠️ Разобрана в теории ([binary-search.md](../../../04-search-sort/01-binary-search.md)).
> Пиши **по памяти**. Цель — довести шаблон до автоматизма, чтобы на интервью тратить силы
> на задачу, а не на границы.

## Условие

Дан отсортированный по возрастанию массив `nums` **без дубликатов** и число `target`.
Верни индекс `target`, либо `-1`, если его нет.

Требуется `O(log N)`.

## Примеры

```
Вход:  nums = [-1, 0, 3, 5, 9, 12], target = 9    Выход: 4
Вход:  nums = [-1, 0, 3, 5, 9, 12], target = 2    Выход: -1
Вход:  nums = [5], target = 5                     Выход: 0
Вход:  nums = [5], target = -5                    Выход: -1
```

## Ограничения

- `1 <= nums.length <= 10^4`
- `-10^4 < nums[i], target < 10^4`
- все значения уникальны, массив отсортирован по возрастанию.

## 🎯 Цель по сложности

- Время **`O(log N)`**, память `O(1)`.

## 🧠 Ментальная модель

Область поиска `[left, right]` — **включительно с обеих сторон**. На каждом шаге сравниваем
`nums[mid]` с `target` и выбрасываем ту половину, где `target` быть не может, **вместе с самим
`mid`** (он уже проверен).

## ⚠️ Подводные камни именно этой задачи

1. **`right = nums.length - 1`, не `nums.length`.** Для включительной границы последний
   валидный индекс — `length - 1`.
2. **Условие `while (left <= right)`.** С `<` пропустишь случай `left === right` — а это
   отрезок из одного элемента, вполне возможный ответ. Проверь на `nums = [5], target = 5`:
   с `<` вернёшь `-1` ❌.
3. **`left = mid + 1` / `right = mid - 1`.** Без `±1` можно получить бесконечный цикл.
4. **`Math.floor`** обязателен: `(0 + 5) / 2 = 2.5`, а `nums[2.5]` — `undefined`.
5. **Не забудь `return -1`** после цикла.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — каркас</summary>

```js
let left = 0;
let right = nums.length - 1;
while (left <= right) {
  const mid = Math.floor((left + right) / 2);
  // три ветки: ===, <, >
}
return -1;
```

</details>

<details>
<summary>Подсказка 2 — как выбрать ветку</summary>

Если `nums[mid] < target` — цель правее → двигаем `left`.
Если `nums[mid] > target` — цель левее → двигаем `right`.

</details>

---

## ✍️ Моё решение

```js
function search(nums, target) {
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
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;

    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}
```

**Трассировка** `nums = [-1, 0, 3, 5, 9, 12]`, `target = 9`:

| шаг | left | right | mid | nums[mid] | действие |
|:---:|:----:|:-----:|:---:|:---------:|---|
| 1 | 0 | 5 | 2 | 3 | `3 < 9` → left = 3 |
| 2 | 3 | 5 | 4 | 9 | совпало → **вернуть 4** ✅ |

**Трассировка** `target = 2` (нет в массиве):

| шаг | left | right | mid | nums[mid] | действие |
|:---:|:----:|:-----:|:---:|:---------:|---|
| 1 | 0 | 5 | 2 | 3 | `3 > 2` → right = 1 |
| 2 | 0 | 1 | 0 | -1 | `-1 < 2` → left = 1 |
| 3 | 1 | 1 | 1 | 0 | `0 < 2` → left = 2 |
| 4 | left(2) > right(1) → выход | | | | `-1` ✅ |

Обрати внимание на шаг 3: отрезок из одного элемента был проверен **только** благодаря `<=`.

**Сложность:** время `O(log N)` — область уменьшается вдвое за итерацию.
Память `O(1)` — три числа.

</details>

<details>
<summary>Рекурсивный вариант (для полноты)</summary>

```js
function searchRecursive(nums, target, left = 0, right = nums.length - 1) {
  if (left > right) return -1;                        // база: пустой отрезок

  const mid = Math.floor((left + right) / 2);
  if (nums[mid] === target) return mid;

  return nums[mid] < target
    ? searchRecursive(nums, target, mid + 1, right)
    : searchRecursive(nums, target, left, mid - 1);
}
```

Время то же `O(log N)`, память `O(log N)` — глубина стека. Итеративный вариант предпочтительнее.

</details>

<details>
<summary>Самопроверка: 5 входов, на которых ломаются реализации</summary>

```js
search([5], 5)            // 0
search([5], -5)           // -1
search([1, 2], 2)         // 1   ← ловит ошибку с right = length
search([1, 2], 1)         // 0
search([], 1)             // -1  ← пустой массив: right = -1, цикл не запустится
```

Если все пять проходят — шаблон написан верно.

</details>
