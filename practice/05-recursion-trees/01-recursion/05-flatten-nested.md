# Flatten Nested Structures (рекурсия по данным)

**Тема:** recursion (рекурсивные структуры данных) · **Сложность:** easy → medium · **Приоритет:** ⚪ дополнительная

> Самая «фронтендерская» рекурсия: вложенные массивы, деревья комментариев, DOM, JSON-конфиги.
> На FE-интервью такие задачи встречаются **чаще**, чем академические — и их же используют
> как разминку перед деревьями.

## Задача A: `flatten(arr, depth)`

Разверни вложенный массив. Второй аргумент `depth` — максимальная глубина разворачивания
(по умолчанию `Infinity`). Встроенным `Array.prototype.flat()` пользоваться нельзя.

```
flatten([1, [2, [3, [4]], 5]])          → [1, 2, 3, 4, 5]
flatten([1, [2, [3, [4]], 5]], 1)       → [1, 2, [3, [4]], 5]
flatten([])                             → []
flatten([[], [[]]])                     → []
```

## Задача B: `countComments(comments)`

Дерево комментариев: у каждого комментария есть `replies` — массив таких же комментариев
(возможно пустой или отсутствующий). Посчитай **общее** число комментариев.

```js
const thread = [
  { id: 1, replies: [
      { id: 2, replies: [] },
      { id: 3, replies: [{ id: 4, replies: [] }] },
  ]},
  { id: 5 },                       // replies может отсутствовать
];
countComments(thread);             // 5
```

## Задача C (бонус): `deepGet(obj, path)`

Достань значение по строковому пути, безопасно возвращая `undefined`, если путь оборвался.

```
deepGet({ a: { b: { c: 42 } } }, 'a.b.c')    → 42
deepGet({ a: { b: {} } }, 'a.b.c')           → undefined
deepGet({}, 'a.b.c')                          → undefined
```

## 🎯 Цель по сложности

- `flatten`: время `O(N)`, где `N` — общее число элементов на всех уровнях; память
  `O(глубина)` на стек + `O(N)` на результат.
- `countComments`: время `O(N)`, память `O(глубина)`.

## 🧠 Ментальная модель

Структура **рекурсивна по природе**: элемент массива может быть массивом; ответ на комментарий
— такой же комментарий. Значит, и обработка рекурсивна.

Контракт для `flatten`: «если вложенный вызов правильно разворачивает подмассив, мне остаётся
приклеить результат к аккумулятору».

Контракт для `countComments`: «если рекурсия правильно считает потомков, ответ = 1 (я сам) +
сумма по всем `replies`».

> 💡 Задача B — это фактически **обход дерева** (DFS), только дерево не бинарное, а с
> произвольным числом потомков. Ты уже стоишь на пороге раздела
> [Binary Trees](../../../05-recursion-trees/02-binary-trees.md) — рекурсивный контракт там точно такой же.

## ⚠️ Подводные камни этих задач

1. **Проверка «это массив?» — только `Array.isArray()`.** `typeof []` возвращает `'object'`, а
   `instanceof Array` ломается между iframe/realm. Помни это как JS-факт, его любят спрашивать.
2. **`depth` уменьшается на каждом уровне** и проверяется **до** спуска: `if (Array.isArray(item)
   && depth > 0)`. Забыть `depth - 1` → бесконечное разворачивание вместо частичного.
3. **`push(...items)` со спредом на огромных массивах** может дать `RangeError: Maximum call
   stack size exceeded` (аргументы кладутся на стек, лимит ~100k). Безопаснее `for...of` +
   `push` по одному, или `result = result.concat(sub)`.
4. **`replies` может отсутствовать.** `comment.replies` → `undefined`, и `for...of undefined`
   бросит `TypeError`. Нужен `comment.replies ?? []` или проверка.
5. **`null` — это `object`.** В `deepGet` проверка `typeof current === 'object'` пропустит
   `null`, а `null.c` бросит ошибку. Нужно `current == null → return undefined`.
6. **Глубина стека.** Для очень глубоко вложенных структур (тысячи уровней) рекурсия упадёт —
   тогда переписывают на явный стек. Реальный кейс для DOM-обходов.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — flatten</summary>

```js
function flatten(arr, depth = Infinity) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      for (const sub of flatten(item, depth - 1)) result.push(sub);
    } else {
      result.push(item);
    }
  }
  return result;
}
```

</details>

<details>
<summary>Подсказка 2 — countComments</summary>

`1` за сам комментарий плюс сумма по его `replies`. Для массива верхнего уровня — сумма по всем.

</details>

---

## ✍️ Моё решение

```js
function flatten(arr, depth = Infinity) {
  // пиши здесь
}

function countComments(comments) {
  // пиши здесь
}

function deepGet(obj, path) {
  // пиши здесь
}
```

## 🧮 Моя оценка сложности

flatten: время O(?) · память O(?)
countComments: время O(?) · память O(?)

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>flatten</summary>

```js
function flatten(arr, depth = Infinity) {
  const result = [];

  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      const inner = flatten(item, depth - 1);          // доверяем контракту
      for (const sub of inner) result.push(sub);       // без спреда — безопаснее
    } else {
      result.push(item);
    }
  }

  return result;
}
```

**Проверка `depth`:** `flatten([1, [2, [3]]], 1)` — на верхнем уровне `depth = 1 > 0`, входим в
`[2, [3]]` с `depth = 0`; там `[3]` — массив, но `depth > 0` уже ложно, поэтому кладём его как
есть → `[1, 2, [3]]` ✅

**Сложность:** время `O(N)` — каждый элемент обрабатывается один раз (`N` — суммарное число
элементов на всех уровнях). Память `O(D)` на стек, где `D` — глубина вложенности, плюс `O(N)`
на результат.

**Итеративная версия (без рекурсии, полная глубина):**
```js
function flattenIterative(arr) {
  const stack = [...arr];
  const result = [];

  while (stack.length > 0) {
    const item = stack.pop();
    if (Array.isArray(item)) stack.push(...item);
    else result.push(item);
  }

  return result.reverse();     // pop даёт обратный порядок
}
```
Стек вместо рекурсии — приём, к которому прибегают при риске переполнения. Обрати внимание на
`reverse()` в конце: это цена использования `pop()`.

</details>

<details>
<summary>countComments</summary>

```js
function countComments(comments) {
  let total = 0;

  for (const comment of comments) {
    total += 1;                                        // сам комментарий
    total += countComments(comment.replies ?? []);     // + все ответы
  }

  return total;
}
```

**Проверка на примере:** верхний уровень — комментарии `1` и `5`.
`1` даёт `1 + countComments([2, 3])` = `1 + (1 + 1 + 1)` = `4` (это `2`, `3` и вложенный `4`).
`5` даёт `1 + countComments([])` = `1`. Итого `5` ✅

`?? []` (nullish coalescing) корректно обрабатывает и `undefined`, и `null`, в отличие от
`|| []`, который сработал бы ещё и на пустой строке или `0` (здесь неважно, но привычка полезная).

**Сложность:** время `O(N)` — каждый узел посещается один раз.
Память `O(D)` — глубина дерева комментариев.

</details>

<details>
<summary>deepGet</summary>

```js
function deepGet(obj, path) {
  const keys = path.split('.');

  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;    // == ловит и null, и undefined
    current = current[key];
  }

  return current;
}
```

Здесь рекурсия не нужна — цикла достаточно. **Это важный вывод:** не всякая работа с вложенной
структурой требует рекурсии. Рекурсия нужна, когда ветвление **заранее неизвестно** (много
потомков), а не когда путь линейный.

Рекурсивный вариант для сравнения:
```js
function deepGetRecursive(obj, path) {
  if (obj == null) return undefined;

  const [head, ...rest] = Array.isArray(path) ? path : path.split('.');
  if (rest.length === 0) return obj[head];

  return deepGetRecursive(obj[head], rest);
}
```

`current == null` с **двойным** равенством — редкий случай, когда `==` уместен и является
идиомой: он проверяет одновременно `null` и `undefined`. В остальных случаях используй `===`.

</details>

<details>
<summary>Почему эта задача — мостик к деревьям</summary>

`countComments` — это обход дерева в глубину (DFS) для дерева с произвольным ветвлением.
В следующем разделе появятся **бинарные** деревья, где у узла ровно два потомка (`left` и
`right`), и контракт станет ещё проще:

```js
function count(node) {
  if (node === null) return 0;                       // база: пустое поддерево
  return 1 + count(node.left) + count(node.right);   // я + левые + правые
}
```

Сравни с `countComments` — это буквально одна и та же мысль. Если ты понял её здесь, деревья
дадутся легко.

</details>
