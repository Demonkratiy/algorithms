# Найди и исправь баг в асинхронном коде

**Тема:** js-interview / async · **Сложность:** medium · **Приоритет:** 🔴 основная

> Формат «code review»: тебе показывают работающий на вид код, а ты должен объяснить, **что
> именно** не так и как починить. На интервью это встречается и как отдельный вопрос, и как
> follow-up после реализации.
>
> Для каждого сниппета ответь на три вопроса: **что не так → почему → как исправить.**
> Записывай свои ответы в блоке ниже, потом сверяйся.

---

## Сниппет 1

```js
async function loadAll(ids) {
  const users = [];

  ids.forEach(async (id) => {
    const user = await fetchUser(id);
    users.push(user);
  });

  return users;
}
```

## Сниппет 2

```js
async function loadAll(ids) {
  const users = [];

  for (const id of ids) {
    users.push(await fetchUser(id));
  }

  return users;
}
```
*(здесь код корректен — вопрос в другом: что с ним не так с точки зрения производительности и
когда он, наоборот, правильный?)*

## Сниппет 3

```js
function getUser(id) {
  return new Promise((resolve, reject) => {
    fetchUser(id)
      .then((user) => resolve(user))
      .catch((error) => reject(error));
  });
}
```

## Сниппет 4

```js
function save(data) {
  try {
    api.post('/save', data);          // возвращает промис
  } catch (error) {
    console.error('Ошибка сохранения', error);
  }
}
```

## Сниппет 5

```js
async function handleClick() {
  setLoading(true);
  const data = await loadData();
  setLoading(false);
  render(data);
}
```

## Сниппет 6

```js
const results = [];

for (let i = 0; i < 3; i++) {
  setTimeout(() => results.push(i), 0);
}

console.log(results);
```

---

## ✍️ Мои ответы

```
1:
2:
3:
4:
5:
6:
```

---

## 🔍 Разбор — открывай ТОЛЬКО после своих ответов

<details>
<summary>Сниппет 1 — forEach не ждёт промисы</summary>

**Что не так:** `loadAll` вернёт **пустой массив**.

**Почему:** `forEach` вызывает колбэк и сразу переходит к следующему элементу, полностью
игнорируя возвращённый промис. К моменту `return users` ни один `await` ещё не завершился.
Массив заполнится позже — когда его уже никто не ждёт.

**Как исправить** — зависит от того, нужна ли параллельность:

```js
// параллельно (обычно то, что нужно) — все запросы стартуют сразу
async function loadAll(ids) {
  return Promise.all(ids.map((id) => fetchUser(id)));
}

// последовательно — если важен порядок обращений или есть rate limit
async function loadAll(ids) {
  const users = [];
  for (const id of ids) {
    users.push(await fetchUser(id));
  }
  return users;
}
```

**Правило:** `forEach`, `map`, `filter`, `reduce` **не умеют ждать**. Единственный
«асинхронный» цикл — `for...of` с `await` (и `for await...of` для асинхронных итераторов).
`map` работает только потому, что мы отдаём массив промисов в `Promise.all`.

</details>

<details>
<summary>Сниппет 2 — корректно, но медленно</summary>

**Что не так:** код **правильный**, но выполняется **последовательно**: `N` запросов по `T` мс
займут `N · T`, тогда как параллельно — примерно `T`.

**Как исправить (если параллельность допустима):**
```js
const users = await Promise.all(ids.map(fetchUser));
```

**Когда последовательный вариант нужен намеренно:**
- каждый следующий запрос зависит от результата предыдущего;
- сервер ограничивает частоту (rate limit) и параллельные запросы приведут к `429`;
- важен порядок побочных эффектов (например, последовательная запись).

**Компромисс** — ограниченный параллелизм: см.
[Promise Pool](../04-promises/02-promise-pool.md).

> 💬 На интервью это идеальный ответ: _«код рабочий, но последовательный. Если запросы
> независимы — Promise.all; если сервер лимитирует — пул с ограничением параллелизма»_.

</details>

<details>
<summary>Сниппет 3 — Promise constructor antipattern</summary>

**Что не так:** обёртка `new Promise` полностью лишняя — `fetchUser` **уже** возвращает промис.

**Почему это плохо:**
- лишний код и лишний объект-промис;
- легко потерять ошибку: если забыть `.catch`, отклонение просто исчезнет, а внешний промис
  зависнет навсегда в состоянии `pending`;
- синхронное исключение внутри `fetchUser` (например, невалидный аргумент) не попадёт в
  `reject` при неаккуратной записи.

**Как исправить:**
```js
function getUser(id) {
  return fetchUser(id);
}
```

**Когда `new Promise` действительно нужен:** только для оборачивания **колбэчного** API, у
которого нет промис-версии:
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readFile = (path) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => (err ? reject(err) : resolve(data)));
  });
```

</details>

<details>
<summary>Сниппет 4 — try/catch не ловит асинхронную ошибку</summary>

**Что не так:** `catch` **никогда не сработает**, а при ошибке будет unhandled rejection.

**Почему:** синхронный `try/catch` ловит только то, что бросается **во время выполнения блока**.
`api.post` возвращает промис немедленно, а его отклонение происходит позже — блок `try` к тому
моменту давно завершён.

**Как исправить** — двумя способами:

```js
// 1. async/await
async function save(data) {
  try {
    await api.post('/save', data);          // await делает ошибку "синхронной" для try
  } catch (error) {
    console.error('Ошибка сохранения', error);
  }
}

// 2. .catch()
function save(data) {
  return api.post('/save', data).catch((error) => {
    console.error('Ошибка сохранения', error);
  });
}
```

**Общее правило:** `try/catch` работает с промисами **только вместе с `await`**. Забытый `await`
превращает обработку ошибок в фикцию — это же объясняет, почему в
[retry](../04-promises/01-sleep-retry-timeout.md) внутри `try` обязательно `return await fn()`.

</details>

<details>
<summary>Сниппет 5 — нет обработки ошибок и гонка состояний</summary>

**Две проблемы:**

**1. При ошибке `loadData` строка `setLoading(false)` не выполнится** — интерфейс навсегда
останется в состоянии загрузки. Ошибка уйдёт в unhandled rejection.

```js
async function handleClick() {
  setLoading(true);
  try {
    const data = await loadData();
    render(data);
  } catch (error) {
    showError(error);
  } finally {
    setLoading(false);      // выполнится в любом случае
  }
}
```

**2. Гонка при повторных кликах (race condition).** Два быстрых клика — два запроса; если первый
ответит **позже** второго, на экране окажутся устаревшие данные.

```js
let requestId = 0;

async function handleClick() {
  const current = ++requestId;
  setLoading(true);
  try {
    const data = await loadData();
    if (current !== requestId) return;      // пришёл ответ на устаревший запрос — игнорируем
    render(data);
  } finally {
    if (current === requestId) setLoading(false);
  }
}
```

Более правильное решение — отменять предыдущий запрос через `AbortController`, см.
[Отмена операций](../04-promises/04-cancellation.md). В React ту же роль играет cleanup в `useEffect`.

> 💡 Гонка запросов — **самый частый реальный баг** в асинхронном FE-коде. Умение назвать её
> самому, без наводящего вопроса, сильно поднимает оценку.

</details>

<details>
<summary>Сниппет 6 — не баг замыкания, а порядок выполнения</summary>

**Что выведется:** `[]` — пустой массив.

**Почему:** `console.log(results)` выполняется **синхронно**, а все три колбэка `setTimeout` —
макрозадачи, которые запустятся только после завершения синхронного кода.

Это **не** классическая проблема `var` в цикле: с `let` каждая итерация получает свою
переменную, и в `results` в итоге попадёт `[0, 1, 2]` — но **позже**.

**Как получить результат:**
```js
const results = await Promise.all(
  [0, 1, 2].map((i) => new Promise((resolve) => setTimeout(() => resolve(i), 0))),
);
console.log(results);      // [0, 1, 2]
```

**Для сравнения — тот самый баг с `var`:**
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);       // 3, 3, 3 — одна общая переменная
}

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);       // 0, 1, 2 — своя переменная на итерацию
}
```

Стоит уметь различать две разные проблемы: **область видимости** (`var` vs `let`) и **момент
выполнения** (синхронно vs макрозадача). Их часто путают.

</details>

<details>
<summary>Итоговый чек-лист по асинхронному коду</summary>

Пробегай по нему, когда ревьюишь (или пишешь) асинхронный код:

- [ ] Есть ли `await`/`.then` там, где вызывается асинхронная функция?
- [ ] `forEach`/`map` не используется вместо `for...of` + `await` или `Promise.all`?
- [ ] Ошибки обрабатываются — `try/catch` **с `await`** или `.catch()`?
- [ ] Состояние загрузки сбрасывается в `finally`?
- [ ] Учтена гонка при повторных вызовах?
- [ ] Запросы, которые могут идти параллельно, идут параллельно?
- [ ] Нет лишнего `new Promise` вокруг уже существующего промиса?
- [ ] Таймеры и подписки очищаются?

</details>
