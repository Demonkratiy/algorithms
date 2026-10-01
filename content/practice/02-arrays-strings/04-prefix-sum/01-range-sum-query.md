# Range Sum Query — Immutable

**Тема:** prefix-sum (базовый) · **Сложность:** easy · **Приоритет:** 🔴 основная

## Условие
Дан массив целых чисел `nums`, который **не меняется**. Нужно много раз отвечать на запрос:
«какова сумма элементов на диапазоне `[left, right]` **включительно**?»

Реализуй класс `NumArray`:
- `constructor(nums)` — получает массив и делает предподсчёт;
- `sumRange(left, right)` — возвращает сумму `nums[left] + ... + nums[right]`.

Смысл задачи: `sumRange` вызывается **много раз**, поэтому каждый вызов должен быть `O(1)`,
а не пробегать отрезок заново. Вся тяжёлая работа — один раз в конструкторе.

## Примеры
```
const na = new NumArray([-2, 0, 3, -5, 2, -1]);
na.sumRange(0, 2);  // -2 + 0 + 3 = 1
na.sumRange(2, 5);  // 3 + (-5) + 2 + (-1) = -1
na.sumRange(0, 5);  // сумма всего = -3
```

## Ограничения
- `1 <= nums.length <= 10^4`
- `-10^5 <= nums[i] <= 10^5`
- `0 <= left <= right < nums.length`
- вызовов `sumRange` может быть до `10^4`

## 🎯 Цель по сложности
- `constructor`: `O(N)` время, `O(N)` память (массив префиксов).
- `sumRange`: **`O(1)`** на запрос.

> ⚠️ Наивно: в `sumRange` каждый раз суммировать отрезок циклом → `O(N)` на запрос,
> при `Q` запросах — `O(N·Q)`. Prefix Sum убирает цикл из запроса.

## 🧠 Ментальная модель
Построй массив префиксов `prefix`, где `prefix[i]` = сумма первых `i` элементов:
- `prefix[0] = 0` (пустой префикс);
- `prefix[i] = prefix[i-1] + nums[i-1]`.

Тогда сумма `[left..right]` = `prefix[right + 1] - prefix[left]`.

Почему `right + 1`: `prefix` сдвинут на 1 (нулевой элемент — пустая сумма), поэтому «сумма до
и включая `right`» лежит в `prefix[right + 1]`.

## 💡 Подсказки (открывай по очереди)
<details>
<summary>Подсказка 1 — предподсчёт в конструкторе</summary>

`this.prefix = [0];`
`for (let i = 0; i < nums.length; i++) this.prefix.push(this.prefix[i] + nums[i]);`
</details>

<details>
<summary>Подсказка 2 — запрос</summary>

`sumRange(left, right) { return this.prefix[right + 1] - this.prefix[left]; }`
</details>

---
## ✍️ Моё решение
```js
class NumArray {
  constructor(nums) {
    // пиши здесь
  }

  sumRange(left, right) {
    // пиши здесь
  }
}
```

## 🧮 Моя оценка сложности
constructor: время O(?) · память O(?)
sumRange: время O(?)

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Решение + объяснение</summary>

```js
class NumArray {
  constructor(nums) {
    this.prefix = [0];                                 // prefix[0] — пустой префикс
    for (let i = 0; i < nums.length; i++) {
      this.prefix.push(this.prefix[i] + nums[i]);      // prefix[i+1] = prefix[i] + nums[i]
    }
  }

  sumRange(left, right) {
    return this.prefix[right + 1] - this.prefix[left];
  }
}
```

**Почему `push(this.prefix[i] + nums[i])` работает.** На шаге `i` в массиве `prefix` уже лежит
`i + 1` элемент, последний из них — `prefix[i]`. Прибавляем к нему `nums[i]` и кладём как
`prefix[i + 1]`. То есть `this.prefix[i]` — это всегда «последний добавленный», а не «текущий».

**Трассировка** для `nums = [-2, 0, 3, -5, 2, -1]`:

| i | nums[i] | prefix после шага |
|:-:|:-------:|-------------------|
| — | — | `[0]` |
| 0 | -2 | `[0, -2]` |
| 1 | 0 | `[0, -2, -2]` |
| 2 | 3 | `[0, -2, -2, 1]` |
| 3 | -5 | `[0, -2, -2, 1, -4]` |
| 4 | 2 | `[0, -2, -2, 1, -4, -2]` |
| 5 | -1 | `[0, -2, -2, 1, -4, -2, -3]` |

`sumRange(0, 2)` = `prefix[3] - prefix[0]` = `1 - 0` = **1** ✅
`sumRange(2, 5)` = `prefix[6] - prefix[2]` = `-3 - (-2)` = **-1** ✅

**Сложность:** `constructor` — время `O(N)`, память `O(N)`. `sumRange` — время `O(1)`, память `O(1)`.

При `Q` запросах суммарно `O(N + Q)` вместо наивных `O(N·Q)`.

</details>

<details>
<summary>Частые ошибки в этой задаче</summary>

- ❌ `prefix` начинают с `nums[0]`, а не с `0`. Тогда формула становится
  `prefix[right] - prefix[left - 1]`, и при `left = 0` вылезает `prefix[-1]` → `undefined` → `NaN`.
  Вот **почему** заводят фиктивный нулевой элемент: он убирает частный случай `left === 0`.
- ❌ Написать `prefix[right] - prefix[left]` (потеряешь `nums[right]`) или
  `prefix[right + 1] - prefix[left - 1]` (посчитаешь лишний элемент слева).
- ❌ Считать сумму циклом внутри `sumRange` — формально ответ верный, но цель задачи не достигнута.
- ❌ Забыть `this.` при обращении к полю класса — частая опечатка, `prefix is not defined`.

</details>

