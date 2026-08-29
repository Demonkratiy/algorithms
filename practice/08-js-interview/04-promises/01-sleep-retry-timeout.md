# sleep, withTimeout, retry

**Тема:** js-interview / async · **Сложность:** medium · **Приоритет:** 🔴 основная

> Три утилиты, которые просят написать чаще всего после debounce. Все три — про **промисы,
> таймеры и обработку ошибок**, и все три реально нужны в проде.

## Условие

**A. `sleep(ms)`** — промис, который выполняется через `ms` миллисекунд.

```js
await sleep(1000);
console.log('прошла секунда');
```

**B. `withTimeout(promise, ms)`** — оборачивает промис: если он не завершился за `ms`,
результирующий промис **отклоняется** с ошибкой таймаута. Если успел — отдаёт его результат.

```js
await withTimeout(fetch('/api/slow'), 3000);   // упадёт через 3 сек, если /api/slow тормозит
```

**C. `retry(fn, { attempts, delay })`** — повторяет асинхронную `fn` при ошибке.
`attempts` — сколько всего попыток, `delay` — пауза между ними.
Если все попытки провалились — отклоняется **последней** ошибкой.

**Бонус:** экспоненциальный backoff (задержка удваивается) и `shouldRetry(error)` — повторять
только определённые ошибки.

```js
const data = await retry(() => fetch('/api').then((r) => r.json()), { attempts: 3, delay: 500 });
```

## 🎯 Требования

- `sleep` не блокирует поток.
- `withTimeout` не «съедает» результат успевшего промиса и умеет чистить таймер.
- `retry` делает ровно `attempts` попыток, не больше.
- Все три работают с любым промисом, не только с `fetch`.

## 🧠 Ментальная модель

**`sleep`** — единственный легитимный случай, когда `new Promise` действительно нужен: мы
оборачиваем **колбэчный** API (`setTimeout`) в промис.

**`withTimeout`** — это `Promise.race` между «полезным» промисом и промисом-таймером, который
всегда отклоняется. Кто первый — тот и определяет результат.

```
race( [ работа ], [ таймер, который reject через ms ] )
        └── успела → результат        └── не успела → ошибка
```

**`retry`** — цикл с `try/catch` и `await sleep(delay)` между попытками. Не рекурсия: цикл
проще читается и не растит стек.

## ⚠️ Подводные камни этих задач

1. **`sleep` через `while (Date.now() - start < ms) {}`** — это **блокирующая** пауза, которая
   вешает вкладку. Классическая проверка на понимание однопоточности.
2. **`withTimeout` не отменяет исходную операцию.** `Promise.race` лишь игнорирует опоздавший
   результат — запрос продолжит выполняться. Настоящая отмена требует `AbortController`
   (см. [04-cancellation](04-cancellation.md)). Обязательно **проговори это** на интервью:
   разница между «перестать ждать» и «отменить» — любимый уточняющий вопрос.
3. **Чистить таймер.** Если промис успел, таймер `withTimeout` всё ещё «висит» до срабатывания.
   В Node это удержит процесс живым. Нужен `clearTimeout` в `finally`.
4. **`retry` и число попыток.** `attempts: 3` — это 3 вызова (1 основной + 2 повтора), а не 4.
   Уточни семантику вслух: off-by-one здесь классическая ошибка.
5. **Пауза после последней попытки не нужна** — иначе функция подвиснет на лишний `delay` перед
   тем, как бросить ошибку.
6. **`fn` должна быть функцией, а не промисом.** `retry(fetch('/api'))` бессмысленно: запрос
   уже стартовал, повторить его нельзя. Именно поэтому сигнатура — `retry(() => ...)`.
7. **Не глотать ошибку.** Если все попытки провалились, надо пробросить **последнюю** ошибку,
   а не вернуть `undefined`.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — sleep</summary>

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
```
Обрати внимание: `setTimeout(resolve, ms)` — передаём саму функцию, а не `() => resolve()`.

</details>

<details>
<summary>Подсказка 2 — withTimeout</summary>

`Promise.race([promise, timeoutPromise])`, где `timeoutPromise` отклоняется через `ms`.

</details>

<details>
<summary>Подсказка 3 — retry</summary>

```js
for (let attempt = 1; attempt <= attempts; attempt++) {
  try { return await fn(); }
  catch (error) { /* последняя попытка? бросаем. иначе — await sleep(delay) */ }
}
```

</details>

---

## ✍️ Моё решение

```js
function sleep(ms) {
  // пиши здесь
}

function withTimeout(promise, ms) {
  // пиши здесь
}

async function retry(fn, { attempts = 3, delay = 300 } = {}) {
  // пиши здесь
}
```

## 🧮 Самопроверка

- [ ] `sleep` не блокирует (во время паузы другой код выполняется)
- [ ] `withTimeout` отдаёт результат, если промис успел
- [ ] `withTimeout` отклоняется, если не успел
- [ ] `retry` делает ровно `attempts` попыток
- [ ] `retry` бросает последнюю ошибку

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>A — sleep</summary>

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
```

**Почему `new Promise` здесь уместен.** Обычно оборачивать что-то в `new Promise` — антипаттерн,
но `setTimeout` — колбэчный API, у которого нет промис-версии. Это как раз тот случай, для
которого конструктор и предназначен.

Проверка на «неблокирующесть»:
```js
sleep(1000).then(() => console.log('готово'));
console.log('это выведется сразу');       // сначала эта строка
```

⚠️ Блокирующий вариант, который **нельзя** предлагать:
```js
function badSleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}     // вешает вкладку: ни рендера, ни событий
}
```

</details>

<details>
<summary>B — withTimeout</summary>

```js
function withTimeout(promise, ms, message = `Timeout after ${ms}ms`) {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}
```

**Разбор:**
- `Promise.race` завершается первым **завершившимся** промисом — успехом или ошибкой;
- `_` в `(_, reject)` — договорённость «первый аргумент не нужен»;
- `.finally(() => clearTimeout(timeoutId))` снимает таймер в обоих исходах. Без этого в Node
  процесс не завершится, пока таймер не сработает, а в браузере останется лишняя работа.
- `finally` **прозрачен**: он не меняет ни значение, ни ошибку — именно поэтому его можно
  спокойно вешать в конец.

**Что сказать про отмену:**
> _«Race только перестаёт ждать — исходный запрос продолжает выполняться и его результат
> просто игнорируется. Если нужна настоящая отмена, я передал бы AbortController в fetch»._

</details>

<details>
<summary>C — retry</summary>

```js
async function retry(fn, { attempts = 3, delay = 300, backoff = 1, shouldRetry = () => true } = {}) {
  let lastError;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);                    // успех — выходим сразу
    } catch (error) {
      lastError = error;

      if (attempt === attempts || !shouldRetry(error)) break;   // пауза перед выходом не нужна

      await sleep(currentDelay);
      currentDelay *= backoff;                     // backoff = 2 → 300, 600, 1200...
    }
  }

  throw lastError;
}
```

**Ключевые решения:**

| Строка | Зачем |
|---|---|
| `return await fn(attempt)` | `await` внутри `try` обязателен, иначе `catch` не поймает отклонение |
| `attempt === attempts` → `break` | не спим после последней попытки |
| `shouldRetry(error)` | не повторять то, что не имеет смысла (например, `4xx`) |
| `throw lastError` | пробрасываем причину, а не абстрактное «не получилось» |

**Про `return await` внутри `try`.** Вне `try/catch` конструкция `return await x` избыточна
(можно `return x`), но **внутри `try` она обязательна**: без `await` функция вернёт промис
раньше, чем он отклонится, и `catch` его не увидит.

**Про `shouldRetry`.** На практике повторять стоит только сетевые сбои и `5xx`:
```js
await retry(loadUser, {
  attempts: 4,
  delay: 200,
  backoff: 2,                                        // 200, 400, 800
  shouldRetry: (e) => e.status === undefined || e.status >= 500,
});
```
Повторять `401` или `404` бессмысленно — результат не изменится.

</details>

<details>
<summary>Как проверить себя офлайн</summary>

```js
// sleep не блокирует
const t0 = Date.now();
sleep(300).then(() => console.log('sleep:', Date.now() - t0, 'мс'));   // ~300
console.log('строка сразу после sleep');                                // печатается ПЕРВОЙ

// withTimeout: успел
withTimeout(sleep(100).then(() => 'ok'), 500).then(console.log);        // "ok"

// withTimeout: не успел
withTimeout(sleep(1000), 200).catch((e) => console.log(e.message));     // "Timeout after 200ms"

// retry: считаем попытки
let calls = 0;
retry(() => { calls++; return Promise.reject(new Error('fail ' + calls)); }, { attempts: 3, delay: 50 })
  .catch((e) => console.log(e.message, '| всего вызовов:', calls));     // "fail 3 | всего вызовов: 3"

// retry: успех со второй попытки
let n = 0;
retry(() => (++n < 2 ? Promise.reject(new Error('x')) : Promise.resolve('ok')), { attempts: 3 })
  .then((r) => console.log(r, '| вызовов:', n));                        // "ok | вызовов: 2"
```

Тест со счётчиком `calls` — главный: он ловит off-by-one в числе попыток.

</details>

<details>
<summary>Бонус: комбинация всех трёх</summary>

```js
const loadWithRetryAndTimeout = () =>
  retry(() => withTimeout(fetch('/api/data'), 3000), {
    attempts: 3,
    delay: 500,
    backoff: 2,
  });
```

Каждая попытка ограничена тремя секундами, между попытками растущая пауза. Именно так устроены
клиенты HTTP в проде — и именно такой follow-up («а если запрос ещё и виснет?») любят задавать
после `retry`.

</details>
