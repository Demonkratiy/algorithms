# EventEmitter

**Тема:** js-interview / дизайн структуры · **Сложность:** medium · **Приоритет:** 🔴 основная

> ⚠️ Разобрана в теории ([02-objects.md](../../../08-js-interview/02-objects.md)).
> Пиши **по памяти**. Задача на **проектирование** — оценивают не только код, но и выбор
> структур данных и обработку краевых случаев.

## Условие

Реализуй класс `EventEmitter` с методами:

- `on(event, handler)` — подписаться;
- `off(event, handler)` — отписаться;
- `once(event, handler)` — подписаться на **один** вызов;
- `emit(event, ...args)` — вызвать всех подписчиков события с переданными аргументами.

## Примеры

```js
const emitter = new EventEmitter();

const handler = (a, b) => console.log('got', a, b);
emitter.on('data', handler);
emitter.emit('data', 1, 2);      // "got 1 2"

emitter.off('data', handler);
emitter.emit('data', 3, 4);      // ничего

emitter.once('init', () => console.log('once!'));
emitter.emit('init');            // "once!"
emitter.emit('init');            // ничего
```

## 🎯 Требования

- `emit` несуществующего события не должен падать.
- Двойная подписка одного и того же обработчика — обсуждаемое поведение (см. подводные камни).
- Обработчик может отписаться **во время** `emit` — это не должно ломать обход.

## 🧠 Ментальная модель

Хранилище: `Map` (событие → коллекция обработчиков).

```
listeners:  'data'  → Set { handlerA, handlerB }
            'error' → Set { handlerC }
```

`once` — это обычная подписка **обёрткой**, которая сначала снимает саму себя, потом вызывает
исходный обработчик.

## ⚠️ Подводные камни именно этой задачи

1. **Итерация по живой коллекции в `emit`.** Обработчик может вызвать `off` (именно так работает
   `once`), и модификация `Set` во время цикла даёт непредсказуемый результат. Решение —
   обходить **копию**: `for (const h of [...handlers])`. **Это главное, что проверяют.**
2. **В `once` отписка должна идти ДО вызова** `handler` — иначе рекурсивный `emit` внутри
   обработчика вызовет его повторно.
3. **`off` для `once` не сработает по исходной ссылке**, потому что подписана обёртка.
   Решение: хранить ссылку на оригинал в свойстве обёртки (`wrapper.original = handler`) и
   учитывать это в `off`, либо возвращать функцию отписки из `once`.
4. **`Map` + `Set`, а не объект + массив.** Объект приводит ключи к строкам и конфликтует с
   прототипом (`constructor`, `__proto__`); массив даёт `O(N)` удаление.
5. **Чистить пустые `Set`** после `off` — иначе `Map` будет расти именами событий, на которые
   никто не подписан. Мелочь, но её замечают.
6. **`emit` несуществующего события** — тихо вернуть `false`, не бросать ошибку.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — хранилище</summary>

`this.listeners = new Map();` — значение по ключу события — `Set` обработчиков.

</details>

<details>
<summary>Подсказка 2 — once</summary>

Оберни `handler` в функцию, которая сначала вызывает `this.off(event, wrapper)`, а затем
`handler(...args)`.

</details>

<details>
<summary>Подсказка 3 — emit</summary>

`for (const handler of [...handlers])` — копия защищает от изменения во время обхода.

</details>

---

## ✍️ Моё решение

```js
class EventEmitter {
  constructor() {
    // пиши здесь
  }

  on(event, handler) {}

  off(event, handler) {}

  once(event, handler) {}

  emit(event, ...args) {}
}
```

## 🧮 Самопроверка

- [ ] `emit` вызывает всех подписчиков с аргументами
- [ ] `off` действительно отписывает
- [ ] `once` срабатывает ровно один раз
- [ ] `emit` неизвестного события не падает
- [ ] отписка внутри обработчика не ломает `emit`

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Решение + объяснение</summary>

```js
class EventEmitter {
  constructor() {
    this.listeners = new Map();                  // событие → Set обработчиков
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);

    return () => this.off(event, handler);       // функция отписки — удобно и современно
  }

  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (!handlers) return false;

    const removed = handlers.delete(handler);
    if (handlers.size === 0) this.listeners.delete(event);   // не копим пустые события

    return removed;
  }

  once(event, handler) {
    const wrapper = (...args) => {
      this.off(event, wrapper);                  // СНАЧАЛА отписка
      handler(...args);                          // потом вызов
    };

    wrapper.original = handler;                  // чтобы off(event, handler) тоже работал
    return this.on(event, wrapper);
  }

  emit(event, ...args) {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.size === 0) return false;

    for (const handler of [...handlers]) {       // КОПИЯ на момент события
      handler(...args);
    }

    return true;
  }
}
```

**Почему копия в `emit` обязательна.** Разберём `once`:

```js
emitter.once('x', fn);
emitter.emit('x');
```

Во время обхода `wrapper` вызывает `off`, который удаляет элемент из того самого `Set`, по
которому мы итерируем. Спецификация `Set` допускает такую модификацию, но полагаться на это
поведение нельзя, а при удалении **нескольких** обработчиков подряд легко получить пропуски.
Копия `[...handlers]` фиксирует список подписчиков на момент события — это и семантически
правильно: подписчик, добавленный во время `emit`, не должен получить текущее событие.

**Зачем `wrapper.original`.** Пользователь может написать:
```js
emitter.once('x', fn);
emitter.off('x', fn);        // ожидает, что отписка сработает
```
Но подписан-то `wrapper`, а не `fn`. Чтобы это учесть, `off` дополняют поиском по `original`:

```js
off(event, handler) {
  const handlers = this.listeners.get(event);
  if (!handlers) return false;

  for (const h of handlers) {
    if (h === handler || h.original === handler) {
      handlers.delete(h);
      break;
    }
  }
  if (handlers.size === 0) this.listeners.delete(event);
  return true;
}
```

**Сложность:** `on` / `off` — `O(1)` (в базовой версии `off`), `emit` — `O(K)` по числу
подписчиков события.

</details>

<details>
<summary>Как проверить себя офлайн</summary>

```js
const e = new EventEmitter();

// 1. базовое
const h = (...a) => console.log('h', ...a);
e.on('x', h);
e.emit('x', 1, 2);            // "h 1 2"

// 2. off
e.off('x', h);
e.emit('x');                  // тишина

// 3. once
e.once('y', () => console.log('once'));
e.emit('y');                  // "once"
e.emit('y');                  // тишина

// 4. отписка во время emit (главный тест!)
const e2 = new EventEmitter();
const a = () => { console.log('a'); e2.off('z', b); };
const b = () => console.log('b');
e2.on('z', a);
e2.on('z', b);
e2.emit('z');                 // должно вывести "a" и "b" — b ещё был подписан на момент emit

// 5. несуществующее событие
e.emit('nothing');            // false, без ошибок
```

Четвёртый тест — тот самый, ради которого и делается копия.

</details>

<details>
<summary>Возможные follow-up вопросы</summary>

- **«Что если обработчик бросит исключение?»** В текущей реализации остальные не будут вызваны.
  Варианты: обернуть каждый вызов в `try/catch` и собрать ошибки, либо документировать
  fail-fast поведение. Node.js EventEmitter, например, для события `'error'` без подписчиков
  **бросает** исключение — осознанное решение дизайна.
- **«Как добавить приоритеты?»** Заменить `Set` на отсортированный массив пар
  `{handler, priority}` — ценой `O(log N)` вставки.
- **«Асинхронные обработчики?»** `emit` может собирать промисы и возвращать
  `Promise.all(results)` — но тогда нужно решить, ждать ли последовательно или параллельно.
- **«Утечки памяти?»** Подписки держат ссылки на обработчики (а те — на замыкания и DOM).
  Отсюда правило: всегда отписываться в `useEffect`-cleanup / `disconnectedCallback`.

</details>
