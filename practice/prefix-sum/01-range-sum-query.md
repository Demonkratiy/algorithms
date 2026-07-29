# Range Sum Query — Immutable

**Тема:** prefix-sum (базовый) · **Сложность:** easy

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
