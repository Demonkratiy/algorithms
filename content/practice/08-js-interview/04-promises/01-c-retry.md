# retry — повторение асинхронной операции

**Тема:** js-interview / async · **Сложность:** medium · **Приоритет:** 🔴 основная

Можно переиспользовать свою [sleep](01-sleep-retry-timeout.md); это зависимость, а не вторая задача в этом файле.

## Условие

Реализуй `retry(fn, { attempts = 3, delay = 300 } = {})`. `fn(attempt)` — фабрика новой попытки (нумерация с 1); она может вернуть промис/значение или бросить синхронно. Успех сразу завершает retry; при ошибке повторяй, но не больше `attempts` вызовов. Между неуспешными попытками жди `delay`; после последней пауза не нужна. Если все провалились — отклоняй **последней причиной**, даже если это не Error.

`attempts` — положительное целое, `delay` — неотрицательное конечное число. Вход валиден.

Опции того же алгоритма: `backoff = 1` (множитель задержки; `2` удваивает её) и `shouldRetry = () => true` (ложь прекращает повторы и пробрасывает текущую ошибку). Предполагаем допустимые значения и задержки в диапазоне таймера.

```js
const data = await retry(() => fetch('/api').then((r) => r.json()), { attempts: 3, delay: 500 });
```

## 🎯 Цель по сложности

Для `A` фактических попыток служебная работа `O(A)`, дополнительная память обёртки `O(1)` (без состояния fn и таймерной среды). Wall-clock время = длительности попыток + паузы; backoff меняет сумму пауз, а не число итераций.

## 🧠 Ментальная модель

**`retry`** — цикл с `try/catch` и `await sleep(delay)` между попытками. Не рекурсия: цикл
проще читается и не растит стек.

Backoff и фильтр ошибок — варианты одной retry-операции, не самостоятельные функции.

## ⚠️ Подводные камни именно этой задачи

1. `attempts: 3` — всего 3 вызова, не 4.
2. После последней ошибки не спи.
3. Нужна **функция**, а не уже запущенный промис: `retry(fetch(...))` не умеет повторить запрос.
4. Не глотай последнюю ошибку и не возвращай undefined вместо неё.
5. Внутри try нужен await, чтобы catch увидел асинхронное отклонение.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка — цикл</summary>

Оборачивай каждый вызов fn в try/catch. При успехе заверши retry сразу; при ошибке сначала реши, есть ли следующая попытка.

</details>

<details>
<summary>Подсказка — пауза</summary>

Жди только между попытками. Для backoff обновляй задержку после ожидания; shouldRetry проверяй до него.

</details>

---

## ✍️ Моё решение

```js
async function retry(fn, { attempts = 3, delay = 300, backoff = 1, shouldRetry = () => true } = {}) {
  // пиши здесь; свою sleep можно объявить выше
}
```

## 🧮 Моя оценка сложности

Время: O(?) · Память: O(?)

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>retry — решение</summary>

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
// retry: считаем попытки
let calls = 0;
retry(() => { calls++; return Promise.reject(new Error('fail ' + calls)); }, { attempts: 3, delay: 50 })
  .catch((e) => console.log(e.message, '| всего вызовов:', calls));     // "fail 3 | всего вызовов: 3"

// retry: успех со второй попытки
let n = 0;
retry(() => (++n < 2 ? Promise.reject(new Error('x')) : Promise.resolve('ok')), { attempts: 3 })
  .then((r) => console.log(r, '| вызовов:', n));                        // "ok | вызовов: 2"
```

Тест со счётчиком calls ловит off-by-one в числе попыток.

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

Используй свои [sleep](01-sleep-retry-timeout.md) и [withTimeout](01-b-with-timeout.md).

Каждая попытка ограничена тремя секундами, между попытками растущая пауза. Именно так устроены
клиенты HTTP в проде — и именно такой follow-up («а если запрос ещё и виснет?») любят задавать
после `retry`.

</details>
