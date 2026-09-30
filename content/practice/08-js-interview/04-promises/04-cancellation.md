# Отмена асинхронных операций (AbortController)

**Тема:** js-interview / async · **Сложность:** medium · **Приоритет:** ⚪ дополнительная

> Логическое продолжение `withTimeout`: там мы **переставали ждать**, здесь — **действительно
> отменяем**. Тема прикладная: ровно это решает гонку запросов в поиске и утечки в React.

## Условие

**A.** Реализуй `cancellable(promiseFactory)` — обёртку, возвращающую промис и функцию
`cancel()`. После вызова `cancel()` результат исходной операции должен игнорироваться, а
промис — отклоняться с ошибкой отмены.

**B.** Используй `AbortController`, чтобы **по-настоящему** прервать `fetch`.

**C.** Напиши `search(query)` для поля поиска так, чтобы при новом запросе предыдущий
отменялся, и в интерфейс никогда не попадал устаревший ответ.

## Примеры

```js
// A
const { promise, cancel } = cancellable(() => loadData());
cancel();
await promise;                    // → отклоняется с CancelledError

// B
const controller = new AbortController();
fetch('/api/data', { signal: controller.signal });
controller.abort();               // запрос реально прерывается, браузер закрывает соединение

// C
search('re');       // отменяется
search('rea');      // отменяется
search('react');    // только его результат попадает в UI
```

## 🎯 Требования

- `cancel()` после завершения операции ничего не ломает (идемпотентность).
- Отменённая операция не должна вызывать обновление интерфейса.
- Ошибку отмены нужно отличать от настоящей ошибки.

## 🧠 Ментальная модель

**Промис нельзя отменить** — это фундаментальное свойство: у него нет метода `cancel`, и после
перехода в финальное состояние оно не меняется. Поэтому «отмена» бывает двух уровней:

| Уровень | Что происходит | Инструмент |
|---|---|---|
| **Игнорирование результата** | операция продолжается, но ответ выбрасывается | флаг / `Promise.race` |
| **Настоящая отмена** | операция прерывается, соединение закрывается | `AbortController` |

`AbortController` — стандартный механизм: у него есть `signal`, который передаётся в API
(`fetch`, `addEventListener`, многие библиотеки), и метод `abort()`, переводящий сигнал в
состояние «отменено» и вызывающий подписчиков.

```js
const controller = new AbortController();
controller.signal.aborted;                          // false
controller.signal.addEventListener('abort', fn);    // подписка на отмену
controller.abort();                                 // → aborted: true, fn вызван
```

## ⚠️ Подводные камни именно этой задачи

1. **Отменённый `fetch` бросает `AbortError`** — это ошибка с `error.name === 'AbortError'`.
   Её нужно **отличать** от реальной сетевой ошибки, иначе пользователь увидит ложное
   «не удалось загрузить» при каждом наборе символа.
2. **Один `AbortController` — одна отмена.** Повторно использовать его нельзя: после `abort()`
   сигнал навсегда в состоянии «отменён». На каждый запрос создаётся новый.
3. **`Promise.race` не отменяет** исходную операцию — только перестаёт её ждать. Разница между
   «перестал ждать» и «отменил» — главный смысловой вопрос темы.
4. **Гонка ответов.** Даже с отменой стоит держать проверку актуальности (последний запрос
   побеждает): не все API поддерживают `signal`.
5. **Очистка.** В React отмена должна происходить в cleanup-функции `useEffect`, иначе получишь
   обновление состояния размонтированного компонента.
6. **`cancel()` после завершения** не должен бросать ошибку — просто ничего не делать.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — часть A</summary>

Флаг `isCancelled` в замыкании плюс `new Promise`: в `.then` проверяем флаг и, если отменено,
вызываем `reject` вместо `resolve`.

</details>

<details>
<summary>Подсказка 2 — часть B</summary>

```js
const controller = new AbortController();
const response = await fetch(url, { signal: controller.signal });
// ...
controller.abort();
```
Ошибку отмены ловим по `error.name === 'AbortError'`.

</details>

<details>
<summary>Подсказка 3 — часть C</summary>

Храни текущий контроллер в переменной модуля/замыкания. В начале каждого вызова: отменить
предыдущий, создать новый.

</details>

---

## ✍️ Моё решение

```js
function cancellable(promiseFactory) {
  // часть A
}

async function fetchWithAbort(url, controller) {
  // часть B
}

const search = (() => {
  // часть C — замыкание с текущим контроллером
})();
```

## 🧮 Самопроверка

- [ ] `cancel()` отклоняет промис
- [ ] `cancel()` после завершения безопасен
- [ ] `AbortError` отличается от сетевой ошибки
- [ ] в поиске побеждает последний запрос

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>A — cancellable через флаг</summary>

```js
class CancelledError extends Error {
  constructor(message = 'Cancelled') {
    super(message);
    this.name = 'CancelledError';
  }
}

function cancellable(promiseFactory) {
  let isCancelled = false;

  const promise = new Promise((resolve, reject) => {
    promiseFactory().then(
      (value) => (isCancelled ? reject(new CancelledError()) : resolve(value)),
      (error) => (isCancelled ? reject(new CancelledError()) : reject(error)),
    );
  });

  return {
    promise,
    cancel: () => {
      isCancelled = true;      // повторный вызов безвреден
    },
  };
}
```

**Что здесь важно понимать честно:** исходная операция **продолжает выполняться** — мы лишь
перестаём использовать её результат. Это «отмена» на уровне потребителя. Для настоящей отмены
нужен `AbortController` (часть B).

Собственный класс ошибки нужен, чтобы вызывающий код мог отличить отмену от сбоя:
```js
try {
  await promise;
} catch (error) {
  if (error.name === 'CancelledError') return;    // это не ошибка, а наше решение
  showError(error);
}
```

</details>

<details>
<summary>B — настоящая отмена через AbortController</summary>

```js
async function loadData(url, signal) {
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      return undefined;              // это не сбой — запрос отменили намеренно
    }
    throw error;                     // всё остальное пробрасываем
  }
}

const controller = new AbortController();
loadData('/api/data', controller.signal);
controller.abort();                  // соединение реально закрывается
```

**Отличие от части A:** браузер прерывает запрос — освобождается соединение, сервер видит
разрыв. При `Promise.race` или флаге запрос доехал бы до конца, впустую тратя сеть и батарею.

`AbortController` поддерживают: `fetch`, `addEventListener` (через `{ signal }`), стримы,
`axios` (через свой адаптер), многие современные библиотеки. Проверка внутри своей асинхронной
функции:

```js
async function longTask(signal) {
  for (const chunk of chunks) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    await processChunk(chunk);
  }
}
```

</details>

<details>
<summary>C — поиск без гонки запросов</summary>

```js
const search = (() => {
  let controller = null;
  let requestId = 0;

  return async function search(query) {
    controller?.abort();                     // отменяем предыдущий запрос
    controller = new AbortController();

    const current = ++requestId;             // страховка: последний запрос побеждает

    try {
      const results = await loadData(`/api/search?q=${encodeURIComponent(query)}`, controller.signal);

      if (current !== requestId) return;     // пришёл устаревший ответ — игнорируем
      render(results);
    } catch (error) {
      if (error.name === 'AbortError') return;
      showError(error);
    }
  };
})();
```

**Две защиты, а не одна.** `abort()` прерывает запрос, а счётчик `requestId` страхует на случай,
если ответ всё же успел прийти до отмены (или API не поддерживает `signal`). На проде обычно
используют обе.

**Полная связка для поля поиска** — отмена плюс debounce:
```js
const onInput = debounce((event) => search(event.target.value), 300);
```
`debounce` уменьшает **число** запросов, `AbortController` гарантирует **актуальность**
результата. Это разные задачи, и на интервью полезно назвать обе.

</details>

<details>
<summary>React: где это живёт в реальном коде</summary>

```jsx
useEffect(() => {
  const controller = new AbortController();

  loadData('/api/data', controller.signal)
    .then((data) => { if (data) setData(data); })
    .catch((error) => { if (error.name !== 'AbortError') setError(error); });

  return () => controller.abort();     // cleanup при размонтировании или смене зависимостей
}, [url]);
```

Cleanup-функция `useEffect` — это ровно тот же «cancel». Без неё получаешь два классических
бага: обновление состояния размонтированного компонента и гонку при быстрой смене зависимостей.

Если на интервью спросят «как бы вы это применили в React» — вот этот сниппет и есть ответ.

</details>
