# Longest Substring Without Repeating Characters

**Тема:** sliding-window (dynamic) + Set/Map · **Сложность:** medium

## Условие

Дана строка `s`. Найди **длину** самой длинной подстроки, в которой **нет повторяющихся
символов**.

Подстрока — непрерывный участок строки (символы идут подряд).

## Примеры

```
Вход:  s = "abcabcbb"
Выход: 3
Пояснение: самая длинная — "abc" (длина 3).

Вход:  s = "bbbbb"
Выход: 1
Пояснение: самая длинная — "b".

Вход:  s = "pwwkew"
Выход: 3
Пояснение: "wke" (длина 3). Обрати внимание: "pwke" — НЕ подстрока (не подряд).

Вход:  s = ""
Выход: 0
```

## Ограничения

- `0 <= s.length <= 5 * 10^4`
- `s` состоит из букв, цифр, символов и пробелов.

## 🎯 Цель по сложности

- Время: `O(N)`
- Память: `O(min(N, alphabet))` — окно хранит уникальные символы.

> ⚠️ Наивно: перебрать все подстроки и проверять уникальность → `O(N²)` или хуже.
> Sliding Window + хэш-структура → `O(N)`.

## 🧠 Ментальная модель (dynamic window)

Окно `[left .. right]` содержит подстроку **без повторов**. Расширяем `right`; если новый
символ уже есть в окне — сжимаем слева, пока дубликат не уйдёт. На каждом шаге обновляем
максимальную длину.

Есть **два подхода** — попробуй оба, если хватит сил:

1. **Set + сжатие по одному:** храни символы окна в `Set`. Пока `s[right]` уже в Set —
   удаляй `s[left]` и двигай `left++`. Потом добавь `s[right]`.
2. **Map (символ → последний индекс) + прыжок:** храни последний индекс каждого символа.
   Встретив повтор, `left` можно **перепрыгнуть** сразу за прошлую позицию этого символа
   (без пошагового сжатия). Чуть эффективнее по числу операций.

Длина окна = `right - left + 1`.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — каркас (подход Set)</summary>

`const seen = new Set(); let left = 0, best = 0;`
Внешний `for (right ...)`.
Внутренний `while (seen.has(s[right])) { seen.delete(s[left]); left++; }`
Затем `seen.add(s[right]); best = Math.max(best, right - left + 1);`

</details>

<details>
<summary>Подсказка 2 — почему сжимаем ДО добавления</summary>

Если сначала добавить `s[right]`, дубликат окажется в Set дважды по смыслу. Сначала
освобождаем место (убираем повтор слева), потом добавляем новый символ.

</details>

<details>
<summary>Подсказка 3 — подход Map с прыжком</summary>

`const last = new Map(); let left = 0, best = 0;`
Для каждого `right`: если `last.has(s[right]) && last.get(s[right]) >= left`,
то `left = last.get(s[right]) + 1`. Затем `last.set(s[right], right)` и обнови `best`.
Условие `>= left` важно — иначе прыгнёшь на старый индекс вне текущего окна.

</details>

---

## ✍️ Моё решение - через Set() - итерация внутренним массивом чтобы сдвигать left на совпадающий символ

```js
function lengthOfLongestSubstring(s) {
  let seen = new Set();
  let left = 0;
  let bestScore = 0;

  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    bestScore = Math.max(bestScore, right - left + 1);
  }
  return bestScore;
}
```

## 🧮 Моя оценка сложности

Время: O(N) · Память: O(min(N, k)) где k — размер алфавита. Или можно просто O(N) в худшем случае не привязываясь к размеру алфавита.

## ✍️ Моё решение через Map() - left сразу "прыгает" на совпадающий символ
Вход:  s = "abcbcbb"
Выход: 3
Пояснение: самая длинная — "abc" (длина 3).
```js
function lengthOfLongestSubstring2(s) {
  let bestScore = 0;
  let charLastIndexMap = new Map();
  let left = 0;

  for (let right = 0; right < s.length; right++){
    let char = s[right];
    if (charLastIndexMap.has(char) && charLastIndexMap.get(char) >= left){
      left = charLastIndexMap.get(char) + 1;
    }
    charLastIndexMap.set(char, right);
    bestScore = Math.max(bestScore, right - left + 1);
  }
  return bestScore;
}
```
