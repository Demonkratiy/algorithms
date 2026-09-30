# Deep Clone

**Тема:** js-interview / objects · **Сложность:** medium · **Приоритет:** 🔴 основная

> Проверяет сразу три вещи: понимание ссылочной модели JS, рекурсию по данным и знание
> ограничений `JSON.stringify`. Алгоритмически — это
> [Clone Graph](../../06-graphs/01-graph-traversal/03-clone-graph.md).

## Условие

Реализуй `deepClone(value)` — глубокую копию значения.

Требования по возрастанию:
- **A.** Объекты, массивы, примитивы, вложенность любой глубины.
- **B.** **Циклические ссылки** не должны приводить к бесконечной рекурсии.
- **C.** Специальные типы: `Date`, `Map`, `Set`, `RegExp`.

## Примеры

```js
const original = { a: 1, b: { c: [1, 2, { d: 3 }] } };
const copy = deepClone(original);

copy.b.c[2].d = 99;
original.b.c[2].d;        // 3 — оригинал не изменился ✅

// циклическая ссылка
const cyclic = { name: 'x' };
cyclic.self = cyclic;
const c2 = deepClone(cyclic);
c2.self === c2;           // true, и никакого переполнения стека ✅

// спецтипы
deepClone(new Date()) instanceof Date;      // true
deepClone(new Map([[1, 2]])) instanceof Map; // true
```

## 🎯 Требования

- Не мутировать оригинал.
- Не падать на `null`.
- Примитивы возвращаются как есть.

## 🧠 Ментальная модель

Рекурсия по структуре данных:

```
deepClone(value):
   примитив или null → вернуть как есть           (база рекурсии)
   уже копировали     → вернуть готовую копию      (обрыв цикла)
   создать пустой контейнер того же типа
   ЗАПИСАТЬ его в Map ДО обхода полей
   рекурсивно скопировать каждое поле
```

Ключ к части B — `Map` «оригинал → копия», ровно как в Clone Graph.

## ⚠️ Подводные камни именно этой задачи

1. **`typeof null === 'object'`.** Проверка `typeof value === 'object'` пропустит `null` в
   ветку копирования, и `Object.entries(null)` выбросит `TypeError`. Правильная база:
   `if (value === null || typeof value !== 'object') return value;`
2. **Запись в `Map` ДО рекурсии.** Иначе цикл не разорвётся: рекурсия вернётся в текущий объект,
   не найдёт его в кеше и начнёт копировать заново → бесконечность.
3. **`Array.isArray()`** — единственный надёжный способ отличить массив
   (`typeof [] === 'object'`).
4. **`JSON.parse(JSON.stringify())` — не ответ**, но назвать его нужно **вместе с
   ограничениями** (см. спойлер). Интервьюеры специально ждут, назовёшь ли ты их сам.
5. **Функции обычно не клонируют** — их копируют по ссылке, и это нормально. Проговори это
   решение вслух, а не молча пропусти.
6. **`Symbol`-ключи и неперечисляемые свойства** `Object.entries` не увидит. Для полноты нужен
   `Reflect.ownKeys` — упомянуть стоит, писать не обязательно.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — база</summary>

`if (value === null || typeof value !== 'object') return value;` — покрывает все примитивы,
`null`, функции.

</details>

<details>
<summary>Подсказка 2 — циклы</summary>

Второй параметр `seen = new Map()`. Проверяй `seen.has(value)` в начале, а `seen.set(value, copy)`
делай сразу после создания пустой копии.

</details>

<details>
<summary>Подсказка 3 — спецтипы</summary>

`value instanceof Date` → `new Date(value)`.
`value instanceof Map` → создать новую `Map` и рекурсивно скопировать ключи и значения.

</details>

---

## ✍️ Моё решение

```js
function deepClone(value) {
  // пиши здесь
}
```

## 🧮 Самопроверка

- [ ] вложенные объекты независимы
- [ ] массивы остаются массивами
- [ ] `null` не ломает
- [ ] циклическая ссылка не вешает
- [ ] `Date` / `Map` / `Set` сохраняют тип

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>A + B: объекты, массивы, циклы</summary>

```js
function deepClone(value, seen = new Map()) {
  if (value === null || typeof value !== 'object') return value;   // база
  if (seen.has(value)) return seen.get(value);                     // обрыв цикла

  const copy = Array.isArray(value) ? [] : {};
  seen.set(value, copy);                                           // ДО обхода полей!

  for (const [key, item] of Object.entries(value)) {
    copy[key] = deepClone(item, seen);
  }

  return copy;
}
```

**Почему порядок строк критичен.** Для `cyclic.self = cyclic`:
1. входим в `deepClone(cyclic)`, создаём `copy = {}`, кладём `seen = {cyclic → copy}`;
2. обходим поле `self`, значение — сам `cyclic`;
3. рекурсивный вызов находит его в `seen` и **сразу** возвращает `copy`;
4. `copy.self = copy` — структура воспроизведена, рекурсия завершилась ✅

Если бы `seen.set` стоял после цикла, шаг 3 начал бы копировать `cyclic` заново — и так до
переполнения стека.

**Сложность:** время `O(N)`, где `N` — общее число узлов структуры; память `O(N)` на копию
плюс `O(глубина)` на стек.

</details>

<details>
<summary>C: со специальными типами</summary>

```js
function deepClone(value, seen = new Map()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);

  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  if (value instanceof Map) {
    const copy = new Map();
    seen.set(value, copy);
    for (const [k, v] of value) copy.set(deepClone(k, seen), deepClone(v, seen));
    return copy;
  }

  if (value instanceof Set) {
    const copy = new Set();
    seen.set(value, copy);
    for (const v of value) copy.add(deepClone(v, seen));
    return copy;
  }

  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);

  for (const key of Reflect.ownKeys(value)) {          // включая Symbol-ключи
    copy[key] = deepClone(value[key], seen);
  }

  return copy;
}
```

`Date` и `RegExp` не содержат вложенных ссылок, поэтому их можно вернуть сразу, без записи в
`seen`. `Map` и `Set` — содержат, поэтому для них порядок «создать → записать → заполнить»
сохраняется.

`Object.create(Object.getPrototypeOf(value))` сохраняет прототип — копия экземпляра класса
останется его экземпляром. Для интервью это уже «сверх программы», но упомянуть полезно.

</details>

<details>
<summary>Что отвечать про JSON и structuredClone</summary>

```js
const copy = JSON.parse(JSON.stringify(obj));
```

Назови сам, **до** того как спросят:

| Ломается | Что происходит |
|---|---|
| `undefined`, функции, `Symbol` | молча исчезают (в массиве → `null`) |
| `Date` | становится строкой |
| `Map`, `Set`, `RegExp` | становятся `{}` |
| `NaN`, `Infinity` | становятся `null` |
| циклические ссылки | `TypeError: Converting circular structure to JSON` |
| прототипы, геттеры | теряются |

**`structuredClone(obj)`** (браузеры, Node 17+) — встроенная альтернатива: умеет циклы, `Date`,
`Map`, `Set`, `ArrayBuffer`. **Не умеет функции** (бросает `DataCloneError`), не копирует
прототипы классов.

Правильный ответ на интервью звучит так: _«в проде взял бы structuredClone или lodash.cloneDeep;
JSON-трюк годится только для простых данных, потому что теряет вот это; но давайте я напишу
реализацию руками»_.

</details>
