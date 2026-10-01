# Promise Pool (ограничение параллелизма)

**Тема:** js-interview / async · **Сложность:** medium · **Приоритет:** 🔴 основная

> Очень практичная задача: ровно с ней сталкиваешься, когда надо загрузить 500 файлов, не
> положив сервер. На интервью проверяет реальное понимание промисов, а не знание синтаксиса.

## Условие

Реализуй `promisePool(tasks, limit)`, где:
- `tasks` — массив **функций**, каждая возвращает промис (`() => Promise`);
- `limit` — максимальное число задач, выполняющихся **одновременно**.

Верни промис с массивом результатов **в исходном порядке** задач.

## Примеры

```js
const delay = (ms, value) => () =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const tasks = [delay(300, 'a'), delay(100, 'b'), delay(200, 'c'), delay(100, 'd')];

await promisePool(tasks, 2);
// ['a', 'b', 'c', 'd']  — порядок как во входе, а не по времени завершения
// при этом одновременно выполнялось не больше 2 задач
```

## 🎯 Требования

- Не более `limit` задач в работе одновременно.
- Результаты — **в порядке входного массива**.
- `tasks` может быть пустым.
- `limit` может быть больше длины массива.

## 🧠 Ментальная модель

**Почему задачи передаются функциями, а не промисами.** Промис начинает выполняться в момент
создания. Если бы на вход пришёл массив промисов, все запросы уже стартовали бы — ограничивать
было бы нечего. Функция откладывает старт до момента вызова.

**Схема «воркеров».** Запускаем `limit` независимых асинхронных циклов. Каждый берёт **следующую
свободную** задачу по общему индексу и выполняет её; закончил — берёт следующую. Общий индекс
живёт в замыкании.

```
tasks:   [0] [1] [2] [3] [4] [5]
         ────────────────────────
worker1:  0 ──→ 2 ──→ 4
worker2:  1 ──→ 3 ──→ 5
                        ↑ каждый берёт следующий свободный индекс
```

## ⚠️ Подводные камни именно этой задачи

1. **Запустить всё сразу.** `Promise.all(tasks.map((t) => t()))` игнорирует `limit` — это
   ошибка, ради которой задачу и дают. Внимательно: вызов `t()` **стартует** задачу.
2. **Порядок результатов.** Задачи завершаются в произвольном порядке, поэтому результат нужно
   класть по **индексу задачи** (`results[index] = ...`), а не `push`.
3. **Один общий индекс на всех воркеров.** Если у каждого будет свой счётчик, задачи
   продублируются. Индекс — переменная в замыкании `promisePool`, инкремент `index++` атомарен
   в однопоточном JS, поэтому гонки нет.
4. **`forEach` не умеет `await`.** `tasks.forEach(async (t) => await t())` вернёт управление
   мгновенно и ничего не дождётся. Нужны `for...of` внутри воркера или `Promise.all` по
   воркерам.
5. **Ошибка в задаче** остановит весь пул (`Promise.all` — fail-fast). Если нужно собрать все
   результаты, оборачивай в `try/catch` или используй `allSettled`-подход — уточни у
   интервьюера, какое поведение нужно.
6. `limit <= 0` — вырожденный случай; договорись, что делать (бросать ошибку или считать `1`).

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — что такое воркер</summary>

Асинхронная функция с циклом: «пока есть незанятые задачи — бери следующую и жди её».

</details>

<details>
<summary>Подсказка 2 — каркас</summary>

```js
async function promisePool(tasks, limit) {
  const results = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const current = index++;              // «занимаем» задачу
      results[current] = await tasks[current]();
    }
  }

  await Promise.all(/* limit воркеров */);
  return results;
}
```

</details>

<details>
<summary>Подсказка 3 — запуск воркеров</summary>

`Array.from({ length: Math.min(limit, tasks.length) }, () => worker())`

</details>

---

## ✍️ Моё решение

```js
async function promisePool(tasks, limit) {
  // пиши здесь
}
```

## 🧮 Самопроверка

- [ ] одновременно не более `limit` задач
- [ ] результаты в исходном порядке
- [ ] пустой массив задач не ломает
- [ ] `limit` больше длины массива не ломает

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Решение (воркеры) + объяснение</summary>

```js
async function promisePool(tasks, limit) {
  const results = new Array(tasks.length);
  let index = 0;                                    // общий курсор на все воркеры

  async function worker() {
    while (index < tasks.length) {
      const current = index++;                      // «занимаем» задачу до await
      results[current] = await tasks[current]();    // кладём по индексу — порядок сохранён
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker(),
  );

  await Promise.all(workers);
  return results;
}
```

**Почему `const current = index++` до `await`.** Инкремент выполняется **синхронно**, поэтому
воркер «застолбил» индекс до того, как отдал управление. Другой воркер, проснувшись, увидит уже
увеличенный `index` и возьмёт следующую задачу. Если бы мы читали `index` после `await`, два
воркера могли бы взять одну задачу.

**Почему `Math.min(limit, tasks.length)`.** Создавать 100 воркеров на 3 задачи бессмысленно —
97 из них сразу завершатся, но лишние промисы будут созданы.

**Трассировка** `tasks = [300мс, 100мс, 200мс, 100мс]`, `limit = 2`:

| время | worker1 | worker2 | index |
|:---:|---|---|:---:|
| 0 | взял 0 (300мс) | взял 1 (100мс) | 2 |
| 100 | работает | закончил, взял 2 (200мс) | 3 |
| 300 | закончил, взял 3 (100мс) | работает | 4 |
| 400 | закончил | закончил | — |

Одновременно всегда ровно 2 задачи ✅ Результаты лежат в `results[0..3]` в правильном порядке ✅

**Сложность:** время — определяется задачами; накладные расходы `O(N)`. Память `O(N)` под
результаты плюс `O(limit)` под воркеры.

</details>

<details>
<summary>Альтернатива: «пул активных промисов»</summary>

```js
async function promisePoolRace(tasks, limit) {
  const results = new Array(tasks.length);
  const executing = new Set();

  for (let i = 0; i < tasks.length; i++) {
    const promise = tasks[i]().then((value) => {
      results[i] = value;
      executing.delete(promise);
    });

    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);       // ждём освобождения любого слота
    }
  }

  await Promise.all(executing);
  return results;
}
```

Идея другая: запускаем задачи по одной и, когда активных становится `limit`, ждём завершения
**любой** через `Promise.race`. Тоже рабочее решение; воркеры обычно читаются проще, но знать
приём с `race` полезно — он часто встречается в чужом коде.

</details>

<details>
<summary>Обработка ошибок</summary>

```js
async function worker() {
  while (index < tasks.length) {
    const current = index++;
    try {
      results[current] = { status: 'fulfilled', value: await tasks[current]() };
    } catch (error) {
      results[current] = { status: 'rejected', reason: error };
    }
  }
}
```

Так пул ведёт себя как `Promise.allSettled`: одна упавшая задача не останавливает остальные.
По умолчанию (без `try/catch`) ошибка «вылетит» из `worker`, и `Promise.all(workers)` отклонится
— поведение как у `Promise.all`.

**Обязательно уточни у интервьюера**, какое поведение нужно: fail-fast или «собрать всё».
Сам факт вопроса — плюс к оценке.

</details>

<details>
<summary>Как проверить ограничение параллелизма офлайн</summary>

```js
let active = 0;
let maxActive = 0;

const makeTask = (ms) => () => {
  active++;
  maxActive = Math.max(maxActive, active);
  return new Promise((r) => setTimeout(() => { active--; r(ms); }, ms));
};

const tasks = [500, 100, 200, 100, 300, 50].map(makeTask);

promisePool(tasks, 2).then((res) => {
  console.log('results:', res);        // [500, 100, 200, 100, 300, 50]
  console.log('maxActive:', maxActive); // должно быть 2, не больше
});
```

Счётчик `maxActive` — самый честный способ убедиться, что ограничение реально работает, а не
«кажется, работает».

</details>
