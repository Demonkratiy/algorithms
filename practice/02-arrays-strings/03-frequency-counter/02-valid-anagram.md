# Valid Anagram

**Тема:** frequency-counter · **Сложность:** easy

## Условие

Даны две строки `s` и `t`. Верни `true`, если `t` — **анаграмма** строки `s`, иначе `false`.

Анаграмма — строка, составленная из тех же символов в том же количестве, но, возможно, в
другом порядке. Порядок символов не важен, важен **состав** (какие символы и сколько раз).

## Примеры

```
Вход:  s = "anagram", t = "nagaram"
Выход: true

Вход:  s = "rat", t = "car"
Выход: false

Вход:  s = "a", t = "ab"
Выход: false   // разная длина
```

## Ограничения

- `1 <= s.length, t.length <= 5 * 10^4`
- `s` и `t` состоят из строчных латинских букв.

## 🎯 Цель по сложности

- Время: `O(N)`
- Память: `O(K)` (K — число различных символов; для латиницы фактически `O(1)`).

> ⚠️ Соблазн: `s.split('').sort().join('') === t.split('').sort().join('')`. Это работает,
> но сортировка даёт `O(N log N)`. Задача проверяет именно частотный подход за `O(N)`.
> (Про sort-вариант можно упомянуть вслух как альтернативу.)

## 🧠 Ментальная модель

1. Разная длина → сразу `false` (быстрый выход + защита от «лишних» символов).
2. Посчитай частоты символов `s` в `Map` (ключ → счётчик).
3. Пройди по `t`, **вычитая** счётчики: если символа нет или счётчик уже `0` → `false`.
4. Дошёл до конца → `true`.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — ранний выход</summary>

`if (s.length !== t.length) return false;`

</details>

<details>
<summary>Подсказка 2 — счёт и вычитание</summary>

Первый проход по `s`: `counts.set(ch, (counts.get(ch) || 0) + 1);`
Второй проход по `t`: возьми `current = counts.get(ch) || 0`; если `current === 0` → `false`;
иначе `counts.set(ch, current - 1);`

</details>

---

## ✍️ Моё решение

```js
function isAnagram(s, t) {
  if (s.length !== t.length) return false;

  let charsMap = new Map();

  for (let i = 0; i < s.length; i++) {
    charsMap.set(s[i], (charsMap.get(s[i]) || 0) + 1);
  }

  for (let i = 0; i < t.length; i++) {
    // без `|| 0`: charsMap.get(t[j]) вернет undefined и дальнейшие сравнения будут идти с undefined
    const currentCharCount = charsMap.get(t[i]) || 0;
    if (currentCharCount === 0) return false;
    charsMap.set(t[i], currentCharCount - 1);
  }
  return true;
}
```

## 🧮 Моя оценка сложности

Время: O(N) · Память: O(K)
