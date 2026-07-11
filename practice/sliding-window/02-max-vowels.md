# Maximum Number of Vowels in a Substring of Length K

**Тема:** sliding-window (fixed) · **Сложность:** medium

## Условие

Дана строка `s` (только строчные латинские буквы) и целое число `k`.
Верни **максимальное количество гласных** (`a`, `e`, `i`, `o`, `u`), которое может
содержаться в любой **подстроке длины ровно `k`**.

## Примеры

```
Вход:  s = "abciiidef", k = 3
Выход: 3
Пояснение: подстрока "iii" содержит 3 гласные.

Вход:  s = "aeiou", k = 2
Выход: 2
Пояснение: любая подстрока длины 2 состоит из гласных.

Вход:  s = "leetcode", k = 3
Выход: 2
Пояснение: "lee", "eet" и "ode" содержат по 2 гласные.

Вход:  s = "rhythms", k = 4
Выход: 0
Пояснение: в строке вообще нет гласных.
```

## Ограничения

- `1 <= k <= s.length <= 10^5`
- `s` состоит только из строчных латинских букв.

## 🎯 Цель по сложности

- Время: `O(N)`
- Память: `O(1)`

> ⚠️ Наивно: для каждой стартовой позиции пересчитывать гласные в окне длины `k` → `O(N·k)`.
> Fixed sliding window даёт `O(N)`.

## 🧠 Ментальная модель (fixed window — та же, что в эталонном разборе Max Sum)

Окно **фиксированного размера `k`**. Идея — не пересчитывать всё окно заново, а до-считывать
изменение при сдвиге:

- посчитай число гласных в первом окне `[0 .. k-1]`;
- скользя вправо: если **новый** правый символ — гласная, `count++`; если **ушедший** левый
  символ (`s[right - k]`) был гласной, `count--`;
- на каждом шаге обновляй максимум.

Подумай, как удобно проверять «гласная ли символ» за `O(1)` (вспомни структуры данных).

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — проверка на гласную за O(1)</summary>

Заведи `const vowels = new Set(['a','e','i','o','u']);` и проверяй `vowels.has(ch)`.

</details>

<details>
<summary>Подсказка 2 — первое окно</summary>

Сначала посчитай гласные в первых `k` символах отдельным циклом, сохрани в `count` и `maxCount`.

</details>

<details>
<summary>Подсказка 3 — скольжение</summary>

Для `right` от `k` до конца:
`if (vowels.has(s[right])) count++;`
`if (vowels.has(s[right - k])) count--;`
`maxCount = Math.max(maxCount, count);`

</details>

---

## ✍️ Моё решение

Вход: s = "abciiidef", k = 3
Выход: 3

```js
function maxVowels(s, k) {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  let maxCountVowels = 0;

  //найти изначальную сумму
  for (let i = 0; i < k; i++) {
    if (vowels.has(s[i])) maxCountVowels++;
  }

  let countVowels = maxCountVowels;

  for (let right = k; right < s.length; right++) {
    if (vowels.has(s[right])) countVowels++;
    if (vowels.has(s[right-k])) countVowels--;
    maxCountVowels = Math.max(maxCountVowels, countVowels);
  }
  return maxCountVowels;
}
```

## 🧮 Моя оценка сложности

Время: O(n) · Память: O(1)
