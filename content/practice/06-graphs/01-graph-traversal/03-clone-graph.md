# Clone Graph

**Тема:** graphs (обход + `Map` соответствий) · **Сложность:** medium · **Приоритет:** 🔴 основная

> Учит приёму «`Map`: оригинал → копия», который лежит в основе **deep clone** любых
> структур с циклами. Прямо связана с задачей
> [Deep Clone](../../08-js-interview/02-objects/01-deep-clone.md) из JS-раздела.

## Условие

Дана ссылка на узел связного **неориентированного** графа. Верни **глубокую копию** графа.

```js
class Node {
  constructor(val = 0, neighbors = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}
```

Каждый узел содержит значение и список соседей. Значения уникальны (`1..100`).

## Примеры

```
Вход:  adjList = [[2,4], [1,3], [2,4], [1,3]]

  1 --- 2
  |     |
  4 --- 3

Выход: точно такая же структура, но из НОВЫХ объектов

Вход:  [[]]      → один узел без соседей
Вход:  []        → null (пустой граф)
```

## Ограничения

- `0 <= число узлов <= 100`
- граф **связный**, без петель и кратных рёбер, но **с циклами** (см. пример выше).

## 🎯 Цель по сложности

- Время `O(V + E)`, память `O(V)`.

## 🧠 Ментальная модель

Наивная рекурсия «создай узел и склонируй всех соседей» уйдёт в **бесконечный цикл**: `1 → 2 →
1 → 2 → ...`, потому что граф неориентированный и рёбра ведут в обе стороны.

Решение — `Map`, где **ключ — оригинальный узел, значение — его копия**. Она играет сразу две
роли:

1. **`visited`** — если узел уже в `Map`, обход в него не идёт;
2. **справочник** — позволяет подставить **ту же самую** копию, когда на узел ссылаются из
   разных мест.

```
Map: { node1 → copy1, node2 → copy2, ... }

clone(node):
   если node уже в Map → вернуть готовую копию (обрыв цикла)
   создать copy, СРАЗУ положить в Map
   для каждого соседа: copy.neighbors.push(clone(сосед))
```

## ⚠️ Подводные камни именно этой задачи

1. **Класть копию в `Map` ДО обхода соседей.** Если сначала обойти соседей, а потом записать
   себя — рекурсия вернётся в текущий узел, не найдёт его в `Map` и создаст **второй** экземпляр
   → бесконечный цикл. Это ядро задачи.
2. **Ключ `Map` — сам узел (объект).** Это нормально: `Map` умеет объектные ключи, сравнивая их
   по ссылке — а нам ровно это и нужно. Использовать `node.val` как ключ можно только потому,
   что значения уникальны; на объект полагаться надёжнее.
3. **Копировать соседей, а не переиспользовать.** `copy.neighbors = node.neighbors` — это
   поверхностная копия: новый узел будет ссылаться на **оригинальные** соседей. Задача требует
   глубокой копии.
4. **`null` на входе** — вернуть `null`, а не упасть на `node.neighbors`.
5. Одиночный узел без соседей — валидный вход, копия с пустым массивом.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — структура</summary>

`const cloned = new Map();` — ключ оригинал, значение копия. Рекурсивная функция `clone(node)`.

</details>

<details>
<summary>Подсказка 2 — порядок действий</summary>

1. `if (cloned.has(node)) return cloned.get(node);`
2. создать `copy` **с пустым** списком соседей;
3. `cloned.set(node, copy);` ← **до** рекурсии;
4. заполнить `copy.neighbors` рекурсивными вызовами.

</details>

---

## ✍️ Моё решение

```js
function cloneGraph(node) {
  // пиши здесь
}
```

## 🧮 Моя оценка сложности

Время: O(?) · Память: O(?)

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Решение (DFS) + объяснение</summary>

```js
function cloneGraph(node) {
  if (node === null) return null;

  const cloned = new Map();          // оригинал → копия

  function clone(current) {
    if (cloned.has(current)) return cloned.get(current);    // обрыв цикла

    const copy = new Node(current.val);   // соседи пока пустые
    cloned.set(current, copy);            // ЗАПИСЬ ДО обхода соседей

    for (const neighbor of current.neighbors) {
      copy.neighbors.push(clone(neighbor));
    }

    return copy;
  }

  return clone(node);
}
```

**Трассировка** для `1 — 2` (двусторонняя связь):

| вызов | что в `Map` | действие |
|---|---|---|
| `clone(1)` | `{}` | создаёт `copy1`, кладёт `{1→copy1}`, идёт в соседа `2` |
| `clone(2)` | `{1→copy1}` | создаёт `copy2`, кладёт `{1→copy1, 2→copy2}`, идёт в соседа `1` |
| `clone(1)` | есть в `Map` | **сразу возвращает `copy1`** — цикл разорван ✅ |
| возврат | | `copy2.neighbors = [copy1]`, затем `copy1.neighbors = [copy2]` |

Если бы `cloned.set` стояла **после** цикла по соседям, третий вызов не нашёл бы узел `1` в
`Map` и начал бы клонировать его заново — бесконечная рекурсия.

**Сложность:** время `O(V + E)` — каждый узел создаётся один раз, каждое ребро проходится
дважды (граф неориентированный). Память `O(V)` на `Map` плюс `O(V)` на стек рекурсии.

</details>

<details>
<summary>Итеративная версия (BFS)</summary>

```js
function cloneGraphBFS(node) {
  if (node === null) return null;

  const cloned = new Map();
  cloned.set(node, new Node(node.val));

  const queue = [node];

  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];

    for (const neighbor of current.neighbors) {
      if (!cloned.has(neighbor)) {
        cloned.set(neighbor, new Node(neighbor.val));   // создаём копию при первой встрече
        queue.push(neighbor);
      }
      cloned.get(current).neighbors.push(cloned.get(neighbor));
    }
  }

  return cloned.get(node);
}
```

Логика та же: `Map` одновременно `visited` и справочник копий. Без рекурсии — не упрётся в стек
на большом графе.

</details>

<details>
<summary>Связь с deep clone (важно!)</summary>

Ровно этот приём нужен, чтобы корректно клонировать объект с **циклическими ссылками**:

```js
function deepClone(value, seen = new Map()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);      // ← тот же обрыв цикла

  const copy = Array.isArray(value) ? [] : {};
  seen.set(value, copy);                             // ← та же запись ДО обхода

  for (const [key, val] of Object.entries(value)) {
    copy[key] = deepClone(val, seen);
  }

  return copy;
}
```

Сравни построчно с решением этой задачи — это один и тот же алгоритм. Именно поэтому
`JSON.parse(JSON.stringify(obj))` падает с `Converting circular structure to JSON`:
там нет такого `Map`.

Подробный разбор — в задаче
[Deep Clone](../../08-js-interview/02-objects/01-deep-clone.md).

</details>
