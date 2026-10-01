# Debounce

**Тема:** js-interview / function-utils · **Сложность:** medium · **Приоритет:** 🔴 основная

> ⚠️ Разобрана в теории ([function-utils.md](../../../08-js-interview/01-function-utils.md)).
> Пиши **по памяти**. Самая частая «живая» задача на FE-секциях — её просят почти всегда.

## Условие

Реализуй `debounce(fn, delay)` — функцию-обёртку, которая откладывает вызов `fn` до тех пор,
пока не пройдёт `delay` миллисекунд **без новых вызовов**. Каждый новый вызов сбрасывает таймер.

Требования:
- **A.** Базовая версия: аргументы прокидываются, `this` сохраняется.
- **B.** Метод `cancel()` — отменить запланированный вызов.
- **C.** Опция `immediate` (leading edge): выполнить **сразу** при первом вызове, а последующие
  в течение `delay` игнорировать.

## Примеры

```js
const log = debounce((msg) => console.log(msg), 300);

log('a');            // t = 0
log('b');            // t = 100  → таймер сброшен
log('c');            // t = 200  → таймер сброшен
// t = 500: выводится 'c'   (только последний вызов)

// сохранение this
const obj = {
  name: 'test',
  greet: debounce(function () { console.log(this.name); }, 100),
};
obj.greet();         // через 100 мс → 'test'   (НЕ undefined)
```

## 🎯 Требования к реализации

- Обёртка **прозрачна**: принимает любые аргументы и передаёт их в `fn`.
- `this` сохраняется — работает и как метод объекта.
- Несколько независимо созданных debounce-функций **не мешают** друг другу.

## 🧠 Ментальная модель

Состояние (`timeoutId`) живёт в **замыкании** возвращаемой функции. Каждый вызов:
1. отменяет предыдущий таймер,
2. ставит новый.

```
вызовы:   |    |  |         (сбросы таймера)
                   └── delay ──→ ВЫПОЛНЕНИЕ
```

## ⚠️ Подводные камни именно этой задачи

1. **Обёртка — `function`, а не стрелка.** У стрелочной функции нет своего `this`, и
   `obj.method()` потеряет контекст. Внутренний колбэк в `setTimeout`, наоборот, **должен** быть
   стрелкой, чтобы унаследовать `this` обёртки. Это ровно то, что проверяет интервьюер.
2. **`fn.apply(this, args)`, а не `fn(...args)`.** Без `apply` контекст теряется, хотя на
   простых тестах разницы не видно.
3. **`clearTimeout` первым делом.** Забыть его — получить «выполнить всё с задержкой» вместо
   debounce.
4. **Состояние — внутри замыкания.** Если объявить `timeoutId` вне `debounce`, две обёртки
   начнут отменять таймеры друг друга.
5. **`immediate`-версия должна вызывать `fn` синхронно** при первом обращении, а таймер
   использовать только как «окно тишины». Частая ошибка — вызвать сразу **и** ещё раз в конце.
6. **`cancel` должен обнулить `timeoutId`**, иначе повторная отмена или проверка состояния
   соврут.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — каркас</summary>

```js
function debounce(fn, delay) {
  let timeoutId = null;
  return function (...args) {
    // отменить старый, поставить новый
  };
}
```

</details>

<details>
<summary>Подсказка 2 — контекст</summary>

Внутри `setTimeout` используй стрелочную функцию и `fn.apply(this, args)`.

</details>

<details>
<summary>Подсказка 3 — cancel</summary>

`debounced.cancel = () => { clearTimeout(timeoutId); timeoutId = null; };`
— свойство навешивается на возвращаемую функцию (функции в JS — тоже объекты).

</details>

---

## ✍️ Моё решение

```js
function debounce(fn, delay) {
  // пиши здесь
}
```

## 🧮 Самопроверка

- [ ] аргументы прокидываются
- [ ] `this` сохраняется
- [ ] две обёртки независимы
- [ ] `cancel()` работает
- [ ] `immediate` выполняет сразу

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>A + B: базовая версия с cancel</summary>

```js
function debounce(fn, delay) {
  let timeoutId = null;

  function debounced(...args) {
    clearTimeout(timeoutId);                 // на null тоже безопасно

    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn.apply(this, args);                  // стрелка → this из debounced
    }, delay);
  }

  debounced.cancel = function () {
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return debounced;
}
```

**Почему это работает:**

- `timeoutId` объявлен в `debounce`, а используется во вложенной функции → **замыкание**.
  У каждой созданной обёртки своя копия переменной, поэтому они независимы.
- `function debounced(...args)` — обычная функция, значит при вызове `obj.method()` внутри
  `this === obj`.
- Стрелка в `setTimeout` **не создаёт свой `this`**, поэтому `this` внутри неё — тот же, что в
  `debounced`. Без стрелки (обычный `function`) `this` стал бы `undefined` в strict mode или
  `globalThis`.
- `debounced.cancel = ...` — функции в JS являются объектами, свойства на них навешиваются
  свободно.

</details>

<details>
<summary>C: версия с immediate (leading edge)</summary>

```js
function debounce(fn, delay, immediate = false) {
  let timeoutId = null;

  function debounced(...args) {
    const callNow = immediate && timeoutId === null;   // "окно тишины" сейчас открыто

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) fn.apply(this, args);            // trailing: вызываем в конце
    }, delay);

    if (callNow) fn.apply(this, args);                 // leading: вызываем сразу
  }

  debounced.cancel = function () {
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return debounced;
}
```

**Логика `immediate`.** `timeoutId === null` означает «сейчас нет активного окна», то есть это
первый вызов после паузы — выполняем немедленно. Пока таймер жив, все вызовы только продлевают
окно и ничего не вызывают.

Проверь на последовательности `log('a')` в `t=0`, `log('b')` в `t=50`, `delay = 300`:
`'a'` выведется сразу, `'b'` — не выведется вообще, а окно продлится до `t = 350`.

</details>

<details>
<summary>Как проверить себя офлайн</summary>

```js
// 1. последний вызов побеждает
const d = debounce((x) => console.log('called with', x), 200);
d(1); d(2); d(3);
// через 200 мс: "called with 3"   — и только один раз

// 2. this сохраняется
const obj = { name: 'obj', hi: debounce(function () { console.log(this.name); }, 50) };
obj.hi();                     // "obj", НЕ undefined

// 3. независимость обёрток
const a = debounce(() => console.log('A'), 100);
const b = debounce(() => console.log('B'), 100);
a(); b();                     // выведет и A, и B

// 4. cancel
const c = debounce(() => console.log('НЕ ДОЛЖНО ВЫВЕСТИСЬ'), 100);
c(); c.cancel();              // тишина
```

Четвёртый тест особенно полезен: если `cancel` реализован неверно, вывод всё равно появится.

</details>

<details>
<summary>Где это встречается на практике</summary>

- поиск при вводе (не дёргать API на каждую букву);
- автосохранение черновика;
- валидация формы на `input`;
- пересчёт layout на `resize`;
- в React — `useDeferredValue` и самописные `useDebounce`-хуки решают ту же задачу.

Если тебя спросят «зачем», отвечай через **стоимость**: каждый лишний вызов — это сетевой
запрос или перерисовка, а пользователю нужен результат только после того, как он закончил
ввод.

</details>
