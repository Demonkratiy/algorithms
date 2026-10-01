# Course Schedule II (вернуть порядок)

**Тема:** graphs / topological sort · **Сложность:** medium · **Приоритет:** ⚪ дополнительная

> Продолжение [Course Schedule](01-course-schedule.md). Код почти тот же — меняется только то,
> что возвращаем. Полезно решить сразу после первой, пока алгоритм свежий.

## Условие

Всего `numCourses` курсов. `prerequisites[i] = [a, b]` означает: чтобы пройти `a`, нужно сначала
пройти `b`.

Верни **любой валидный порядок** прохождения всех курсов. Если пройти все курсы невозможно —
верни пустой массив `[]`.

## Примеры

```
Вход:  numCourses = 2, prerequisites = [[1, 0]]
Выход: [0, 1]

Вход:  numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
Выход: [0,1,2,3]  или  [0,2,1,3]     — оба валидны

Вход:  numCourses = 1, prerequisites = []
Выход: [0]

Вход:  numCourses = 2, prerequisites = [[1,0],[0,1]]
Выход: []          // цикл
```

## Ограничения

- `1 <= numCourses <= 2000`, `0 <= prerequisites.length <= numCourses * (numCourses - 1)`

## 🎯 Цель по сложности

- Время `O(V + E)`, память `O(V + E)`.

## 🧠 Ментальная модель

Тот же алгоритм Кана, но вместо счётчика `completed` копим сам массив порядка. Очередь
обработки **и есть** топологический порядок — достаточно её вернуть.

## ⚠️ Подводные камни именно этой задачи

1. **Ответов много, и это нормально.** Не пытайся получить «тот же, что в примере». Если
   проверяешь себя вручную — валидируй ответ, а не сравнивай построчно (см. разбор).
2. **При цикле вернуть `[]`, а не частичный порядок.** Проверка — `order.length === numCourses`.
3. Направление ребра — то же, что в первой задаче: `[a, b]` → ребро `b → a`.
4. **Пустой `prerequisites`** → порядок `[0, 1, ..., n-1]`, а не `[]`. Легко ошибиться, если
   класть в очередь только вершины, встретившиеся в рёбрах.
5. В DFS-версии не забыть `reverse()` — post-order даёт обратный порядок.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — минимальная правка</summary>

Возьми решение Course Schedule и замени `completed++` на `order.push(course)`.
В конце: `return order.length === numCourses ? order : [];`

</details>

---

## ✍️ Моё решение

```js
function findOrder(numCourses, prerequisites) {
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
function findOrder(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course]++;
  }

  const order = [];
  for (let course = 0; course < numCourses; course++) {
    if (inDegree[course] === 0) order.push(course);      // очередь = результат
  }

  for (let head = 0; head < order.length; head++) {
    for (const next of graph[order[head]]) {
      inDegree[next]--;
      if (inDegree[next] === 0) order.push(next);
    }
  }

  return order.length === numCourses ? order : [];
}
```

**Изящная деталь:** здесь очередь и результат — **один и тот же массив**. Указатель `head`
играет роль «головы очереди», а весь массив к концу работы оказывается искомым порядком.
Отдельная переменная `order` не нужна.

**Трассировка** `numCourses = 4`, `[[1,0],[2,0],[3,1],[3,2]]`:
`inDegree = [0,1,1,2]` → стартовый массив `[0]`.
Обрабатываем `0` → `inDegree = [0,0,0,2]`, массив `[0,1,2]`.
Обрабатываем `1` → `inDegree[3] = 1`. Обрабатываем `2` → `inDegree[3] = 0`, массив `[0,1,2,3]`.
Длина `4 === numCourses` → возвращаем `[0,1,2,3]` ✅

**Сложность:** время `O(V + E)`, память `O(V + E)`.

</details>

<details>
<summary>Как проверить свой ответ офлайн (валидатор)</summary>

Раз валидных порядков много, сравнивать с эталоном бессмысленно. Проверяй **свойство**:

```js
function isValidOrder(numCourses, prerequisites, order) {
  if (order.length !== numCourses) return false;

  const position = new Map();
  order.forEach((course, i) => position.set(course, i));

  // каждая зависимость должна стоять РАНЬШЕ зависимого курса
  return prerequisites.every(([course, prereq]) =>
    position.get(prereq) < position.get(course)
  );
}
```

Это полезная привычка вообще: для задач с неоднозначным ответом пиши **валидатор свойства**, а
не сравнение с образцом. Тот же подход применим к перестановкам, комбинациям и любым «верните
любой подходящий вариант».

</details>

<details>
<summary>DFS-версия</summary>

```js
function findOrderDFS(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) graph[prereq].push(course);

  const state = new Array(numCourses).fill(0);
  const order = [];
  let hasCycle = false;

  function dfs(node) {
    if (state[node] === 1) { hasCycle = true; return; }
    if (state[node] === 2) return;

    state[node] = 1;
    for (const next of graph[node]) dfs(next);
    state[node] = 2;

    order.push(node);                     // post-order
  }

  for (let course = 0; course < numCourses && !hasCycle; course++) dfs(course);

  return hasCycle ? [] : order.reverse();  // разворачиваем!
}
```

Вершина добавляется **после** всех, кто от неё зависит, поэтому массив получается «наоборот» —
отсюда `reverse()`. Забыть его — вернуть строго обратный порядок, что даёт неверный ответ на
любом непустом входе.

</details>
