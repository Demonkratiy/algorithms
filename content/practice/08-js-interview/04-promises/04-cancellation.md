# cancellable — логическая отмена операции

**Тема:** js-interview / async · **Сложность:** medium · **Приоритет:** ⚪ дополнительная

Продолжение [withTimeout](01-b-with-timeout.md): здесь явно отменяется ожидание потребителя. Для реального прерывания fetch — [отдельная задача](04-b-fetch-with-abort.md).

## Условие

Реализуй `cancellable(promiseFactory)`, возвращающую `{ promise, cancel }`. Вызови фабрику один раз; её значение/промис/ошибка передаются наружу. До завершения внешнего промиса `cancel()` **сразу** отклоняет его с ошибкой `name === "CancelledError"`, даже если исходная операция никогда не завершится. После завершения и при повторном вызове cancel ничего не делает.

Исходная операция продолжает выполняться, но её поздний результат игнорируется; поздняя ошибка не должна давать unhandled rejection.

```js
const { promise, cancel } = cancellable(() => loadData());
cancel();
await promise; // отклоняется с CancelledError
```

## 🎯 Цель по сложности

Служебная работа и память `O(1)` на обёртку, без учёта фабрики и исходной операции. Время её выполнения не ограничено.

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

Промис нельзя вернуть из финального состояния. Проверяй идемпотентность. Один флаг без сохранённого reject **не завершит** внешний промис, если исходный завис. Не выдавай логическую отмену за прерывание сети.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка — момент отмены</summary>

Сохрани reject внешнего промиса, чтобы cancel не ждал завершения внутренней операции.

</details>

<details>
<summary>Подсказка — одно завершение</summary>

Общее состояние завершённости должно использоваться и обработчиками фабрики, и cancel.

</details>

---

## ✍️ Моё решение

```js
function cancellable(promiseFactory) {
  // пиши здесь
}
```

## 🧮 Моя оценка сложности

Время: O(?) · Память: O(?)

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Логическая отмена с немедленным reject</summary>

```js
class CancelledError extends Error {
  constructor(message = 'Cancelled') {
    super(message);
    this.name = 'CancelledError';
  }
}

function cancellable(promiseFactory) {
  let settled = false;
  let rejectOuter;
  const promise = new Promise((resolve, reject) => {
    rejectOuter = reject;
    try {
      Promise.resolve(promiseFactory()).then(
        (value) => {
          if (settled) return;
          settled = true;
          resolve(value);
        },
        (error) => {
          if (settled) return;
          settled = true;
          reject(error);
        },
      );
    } catch (error) {
      settled = true;
      reject(error);
    }
  });
  return {
    promise,
    cancel() {
      if (settled) return;
      settled = true;
      rejectOuter(new CancelledError());
    },
  };
}
```

**Что здесь важно понимать честно:** исходная операция **продолжает выполняться** — мы лишь
перестаём использовать её результат. Это «отмена» на уровне потребителя. Для настоящей отмены
нужен [AbortController](04-b-fetch-with-abort.md).

Собственный класс ошибки нужен, чтобы вызывающий код мог отличить отмену от сбоя:
```js
try {
  await promise;
} catch (error) {
  if (error.name === 'CancelledError') return;    // это не ошибка, а наше решение
  showError(error);
}
```

Обработчик отклонения исходного промиса остаётся подписанным и после cancel. В отличие от версии, проверяющей флаг только в then, это решение завершает ожидание даже у зависшей операции.

</details>
