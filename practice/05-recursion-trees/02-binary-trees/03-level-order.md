# Binary Tree Level Order Traversal (BFS)

**Тема:** binary-trees (BFS по уровням) · **Сложность:** medium · **Приоритет:** 🔴 основная

> Базовая задача на BFS. Приём «зафиксировать `levelSize`» из неё используется в доброй
> половине задач на обход по уровням.

## Условие

Дан корень бинарного дерева. Верни значения узлов, сгруппированные **по уровням**, сверху вниз
и слева направо.

## Примеры

```
Вход: [3, 9, 20, null, null, 15, 7]

        3
       / \
      9  20
        /  \
       15   7

Выход: [[3], [9, 20], [15, 7]]

Вход: [1]   →  [[1]]
Вход: []    →  []
```

## Ограничения

- `0 <= число узлов <= 2000`

## 🎯 Цель по сложности

- Время `O(N)`, память `O(w)` — где `w` — максимальная ширина уровня
  (для полного дерева последний уровень содержит ~`N/2` узлов → `O(N)`).

## 🧠 Ментальная модель

Очередь хранит узлы **текущего** уровня. Обрабатываем ровно столько узлов, сколько их было в
начале итерации, — и параллельно накапливаем следующий уровень.

```
queue = [3]                levelSize = 1  → level = [3],     queue = [9, 20]
queue = [9, 20]            levelSize = 2  → level = [9, 20], queue = [15, 7]
queue = [15, 7]            levelSize = 2  → level = [15, 7], queue = []
```

**`const levelSize = queue.length;` до внутреннего цикла — сердце приёма.**

## ⚠️ Подводные камни именно этой задачи

1. **Не зафиксировать `levelSize`.** Если писать `for (let i = 0; i < queue.length; i++)`,
   условие пересчитывается на каждой итерации, а очередь растёт — уровни склеятся в один
   список. **Главная ошибка задачи.**
2. **Проверять потомков на `null` перед добавлением.** `queue.push(node.left)` без проверки
   положит в очередь `null`, и на следующем шаге `node.val` упадёт.
3. **Пустое дерево** → вернуть `[]`, а не `[[]]`. Ранний выход обязателен.
4. **`shift()` — `O(N)`.** Для `N = 2000` терпимо, но правильнее указатель головы:
   `let head = 0; const node = queue[head++];`. Обязательно проговори это — тема Stack & Queue
   даёт тебе преимущество здесь.
5. Массив уровня создаётся **внутри** внешнего цикла, а не снаружи — иначе всё сольётся.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — каркас</summary>

```js
const result = [];
const queue = [root];
while (queue.length > 0) {
  const levelSize = queue.length;
  const level = [];
  for (let i = 0; i < levelSize; i++) { /* ... */ }
  result.push(level);
}
```

</details>

<details>
<summary>Подсказка 2 — тело внутреннего цикла</summary>

Снять узел, положить его значение в `level`, добавить существующих потомков в очередь.

</details>

---

## ✍️ Моё решение

```js
function levelOrder(root) {
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
function levelOrder(root) {
  if (root === null) return [];

  const result = [];
  const queue = [root];
  let head = 0;                                  // указатель головы вместо shift()

  while (head < queue.length) {
    const levelSize = queue.length - head;       // сколько узлов на текущем уровне
    const level = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue[head++];
      level.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}
```

Более привычная (и допустимая) версия с `shift()`:
```js
function levelOrderShift(root) {
  if (root === null) return [];

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;              // ФИКСИРУЕМ
    const level = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();                // O(N) — проговорить на интервью
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}
```

**Трассировка** `[3, 9, 20, null, null, 15, 7]`:

| итерация | levelSize | обработали | level | очередь после |
|:---:|:---:|---|---|---|
| 1 | 1 | `3` | `[3]` | `[9, 20]` |
| 2 | 2 | `9`, `20` | `[9, 20]` | `[15, 7]` |
| 3 | 2 | `15`, `7` | `[15, 7]` | `[]` |

Результат `[[3], [9,20], [15,7]]` ✅

**Сложность:** время `O(N)` — каждый узел один раз в очередь и один раз из неё.
Память `O(w)` — максимальная ширина уровня; для полного дерева `O(N)`.

</details>

<details>
<summary>Вариации, решаемые тем же шаблоном</summary>

Меняется буквально пара строк:

```js
// Right Side View — правый вид дерева: последний узел каждого уровня
if (i === levelSize - 1) result.push(node.val);

// Average of Levels — среднее по уровню
result.push(levelSum / levelSize);

// Zigzag Level Order — змейкой: разворачиваем каждый второй уровень
result.push(isLeftToRight ? level : level.reverse());
isLeftToRight = !isLeftToRight;

// Maximum Depth — просто считаем количество уровней
depth++;

// Level Order Bottom — снизу вверх
result.unshift(level);        // или result.reverse() в конце (дешевле)
```

Если в условии есть слова **«уровень», «слой», «вид сбоку», «по слоям»** — это BFS с
`levelSize`. Один выученный шаблон закрывает 6+ задач.

</details>

<details>
<summary>А можно ли решить DFS-ом?</summary>

Да — передавая глубину и складывая значения в соответствующий подмассив:

```js
function levelOrderDFS(root) {
  const result = [];

  function dfs(node, depth) {
    if (node === null) return;

    if (result[depth] === undefined) result[depth] = [];   // первый узел на этом уровне
    result[depth].push(node.val);

    dfs(node.left, depth + 1);
    dfs(node.right, depth + 1);
  }

  dfs(root, 0);
  return result;
}
```

Работает и даёт тот же ответ, память `O(h)` вместо `O(w)`. Но для задач вида «кратчайший путь»
DFS уже не подойдёт — там принципиально нужен BFS. Хорошая деталь для обсуждения: показать,
что понимаешь, где выбор обхода — вкус, а где — необходимость.

</details>
