# Fetch with AbortController

**Тема:** js-interview / async · **Сложность:** medium · **Приоритет:** ⚪ дополнительная

В [cancellable](04-cancellation.md) игнорируется результат. Здесь попроси API реально прервать операцию.

## Условие

Реализуй `fetchWithAbort(url, controller)`: вызови fetch с `controller.signal`, проверь HTTP-статус и верни JSON. Неуспешный статус → `Error("HTTP " + status)`. Отмену (`AbortError`), сетевые ошибки и ошибки JSON **пробрасывай** вызывающему коду. Контроллер создаёт и отменяет вызывающая сторона.

```js
const controller = new AbortController();
const pending = fetchWithAbort('/api/data', controller);
controller.abort();
await pending; // AbortError
```

## 🎯 Цель по сложности

Обвязка — `O(1)` служебной памяти/работы; чтение и разбор ответа размера `B` требуют порядка `O(B)` времени и памяти. Время сети отдельно от вычислительной сложности.

## 🧠 Ментальная модель

AbortController содержит signal; API подписывается на него. abort переводит signal в состояние отмены и оповещает подписчиков. Отмена кооперативна: API должно поддерживать signal.

## ⚠️ Подводные камни именно этой задачи

Один AbortController — одна отмена: сигнал необратим. Для нового запроса создай новый контроллер. Не превращай AbortError в успешный undefined внутри этой функции: вызывающий код должен различать отмену и результат. Остановка клиента не гарантирует откат работы на сервере.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка — signal</summary>

Передай controller.signal вторым аргументом fetch и не проглоти его отклонение.

</details>

<details>
<summary>Подсказка — HTTP</summary>

fetch не отклоняется автоматически на 404/500: проверь response.ok до response.json().

</details>

---

## ✍️ Моё решение

```js
async function fetchWithAbort(url, controller) {
  // пиши здесь
}
```

## 🧮 Моя оценка сложности

Время: O(?) · Память: O(?)

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Решение и обработка отмены на стороне потребителя</summary>

```js
async function fetchWithAbort(url, controller) {
  const response = await fetch(url, { signal: controller.signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}
```

```js
const controller = new AbortController();
fetchWithAbort('/api/data', controller).catch((error) => {
  if (error.name === 'AbortError') return; // намеренная отмена
  showError(error);
});
controller.abort();
```

**Отличие от [логической отмены](04-cancellation.md):** браузер прерывает запрос — освобождается соединение, сервер видит
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
<summary>React: где это живёт в реальном коде</summary>

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetchWithAbort(url, controller)
    .then((data) => { if (data) setData(data); })
    .catch((error) => { if (error.name !== 'AbortError') setError(error); });

  return () => controller.abort();     // cleanup при размонтировании или смене зависимостей
}, [url]);
```

Cleanup-функция `useEffect` — это ровно тот же «cancel». Без неё получаешь два классических
бага: обновление состояния размонтированного компонента и гонку при быстрой смене зависимостей.

Если на интервью спросят «как бы вы это применили в React» — вот этот сниппет и есть ответ.

</details>
