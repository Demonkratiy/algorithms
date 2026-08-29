# Course Schedule (обнаружение цикла)

**Тема:** graphs / topological sort · **Сложность:** medium · **Приоритет:** 🔴 основная

## Условие

Всего `numCourses` курсов, пронумерованных `0 .. numCourses - 1`.
Дан массив `prerequisites`, где `prerequisites[i] = [a, b]` означает:
**чтобы пройти курс `a`, надо сначала пройти курс `b`.**

Верни `true`, если можно пройти все курсы, иначе `false`.

## Примеры

```
Вход:  numCourses = 2, prerequisites = [[1, 0]]
Выход: true        // 0 → 1

Вход:  numCourses = 2, prerequisites = [[1, 0], [0, 1]]
Выход: false       // взаимная зависимость — цикл

Вход:  numCourses = 3, prerequisites = []
Выход: true        // зависимостей нет

Вход:  numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
Выход: true
```

## Ограничения

- `1 <= numCourses <= 2000`
- `0 <= prerequisites.length <= 5000`
- пары в `prerequisites` уникальны.

## 🎯 Цель по сложности

- Время **`O(V + E)`** (`V = numCourses`, `E = prerequisites.length`), память `O(V + E)`.

## 🧠 Ментальная модель

Задача сформулирована про курсы, но по сути вопрос один:

> **Есть ли цикл в ориентированном графе?**

Если цикла нет — топологический порядок существует, значит все курсы можно пройти.

Алгоритм Кана: считаем `in-degree` (сколько ещё невыполненных зависимостей у курса), берём в
очередь курсы с нулём, «проходим» их и уменьшаем счётчик у зависимых. Если в конце пройдено
меньше курсов, чем есть, — оставшиеся заперты в цикле.

## ⚠️ Подводные камни именно этой задачи

1. **Направление ребра.** `[a, b]` = «для `a` нужен `b`», значит ребро **`b → a`**
   (`graph[b].push(a)`, `inDegree[a]++`). Перепутать направление — самая частая ошибка: код
   отработает и вернёт правдоподобный, но неверный ответ на несимметричных входах.
   Проверь себя на `[[1, 0]]`: сначала курс `0`, потом `1`.
2. **`Array.from({length: n}, () => [])`**, а не `new Array(n).fill([])` — иначе все курсы
   разделят один массив соседей.
3. **Финальная проверка — по количеству обработанных**, а не по пустоте очереди (очередь и так
   опустеет).
4. **`shift()` — `O(N)`**; на 2000 вершин уже заметно. Используй указатель головы.
5. **Курсы без зависимостей** тоже должны попасть в очередь на старте — их `in-degree` равен
   нулю, цикл инициализации обязан их найти.
6. Пустой `prerequisites` → `true`. Проверь, что код не падает.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — что построить</summary>

Список смежности `graph` и массив `inDegree` длиной `numCourses`.

</details>

<details>
<summary>Подсказка 2 — разбери направление на примере</summary>

`[1, 0]` — «для курса 1 нужен курс 0». Значит после прохождения `0` открывается `1`:
ребро `0 → 1`. В коде: `graph[0].push(1)` и `inDegree[1]++`.

</details>

<details>
<summary>Подсказка 3 — критерий ответа</summary>

Считай, сколько курсов «прошёл». В конце: `return completed === numCourses;`

</details>

---

## ✍️ Моё решение

```js
function canFinish(numCourses, prerequisites) {
  // пиши здесь
}
```

## 🧮 Моя оценка сложности

Время: O(?) · Память: O(?)

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Решение (алгоритм Кана) + объяснение</summary>

```js
function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);        // сначала prereq, потом course
    inDegree[course]++;
  }

  const queue = [];
  for (let course = 0; course < numCourses; course++) {
    if (inDegree[course] === 0) queue.push(course);
  }

  let completed = 0;

  for (let head = 0; head < queue.length; head++) {
    const course = queue[head];
    completed++;

    for (const next of graph[course]) {
      inDegree[next]--;                          // одна зависимость закрыта
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  return completed === numCourses;
}
```

**Обрати внимание на деструктуризацию `[course, prereq]`** — имена сразу задают смысл пары и
защищают от путаницы с направлением. Это дешёвый способ не ошибиться.

**Трассировка** `numCourses = 4`, `prerequisites = [[1,0],[2,0],[3,1],[3,2]]`:

`graph = [[1,2], [3], [3], []]`, `inDegree = [0, 1, 1, 2]`

| шаг | берём | inDegree после | completed |
|:---:|:---:|---|:---:|
| старт | — | `[0,1,1,2]`, очередь `[0]` | 0 |
| 1 | 0 | `[0,0,0,2]`, очередь `[0,1,2]` | 1 |
| 2 | 1 | `[0,0,0,1]` | 2 |
| 3 | 2 | `[0,0,0,0]`, очередь `[0,1,2,3]` | 3 |
| 4 | 3 | — | 4 |

`completed === numCourses` → **true** ✅

**Трассировка цикла** `[[1,0],[0,1]]`: `inDegree = [1, 1]`, ни один курс не попадает в стартовую
очередь → цикл не выполняется → `completed = 0 !== 2` → **false** ✅

**Сложность:** время `O(V + E)` — каждая вершина в очереди один раз, каждое ребро
просматривается один раз. Память `O(V + E)`.

</details>

<details>
<summary>Альтернатива: DFS с тремя состояниями</summary>

```js
function canFinishDFS(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) graph[prereq].push(course);

  const state = new Array(numCourses).fill(0);   // 0 не был, 1 в обработке, 2 завершён

  function hasCycle(node) {
    if (state[node] === 1) return true;          // вернулись в вершину текущего пути
    if (state[node] === 2) return false;         // уже проверена, циклов нет

    state[node] = 1;
    for (const next of graph[node]) {
      if (hasCycle(next)) return true;
    }
    state[node] = 2;

    return false;
  }

  for (let course = 0; course < numCourses; course++) {
    if (hasCycle(course)) return false;
  }

  return true;
}
```

**Почему трёх состояний, а не `visited`.** Обычный `visited` пометил бы вершину «посещена», и
при повторном заходе из **другой** ветки алгоритм ошибочно решил бы, что нашёл цикл. Состояние
`1` («серый») означает именно «мы прямо сейчас внутри этой вершины», и только возврат в неё
является циклом.

Та же сложность `O(V + E)`, но `O(V)` на стек рекурсии и риск переполнения на глубоком графе.
На интервью назови оба способа; Кан обычно предпочтительнее.

</details>

<details>
<summary>Как понять, что задача про топологическую сортировку</summary>

Слова-маркеры: «prerequisites», «зависимости», «сначала нужно», «порядок выполнения»,
«можно ли завершить все».

Формулировка «можно ли завершить все X» почти всегда переводится в «нет ли цикла», а
«в каком порядке» — в «выведи топологический порядок» (см.
[Course Schedule II](02-course-schedule-ii.md)).

</details>
