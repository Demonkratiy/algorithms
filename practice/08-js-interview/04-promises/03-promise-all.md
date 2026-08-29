# Свой Promise.all (и allSettled / race / any)

**Тема:** js-interview / async · **Сложность:** medium · **Приоритет:** ⚪ дополнительная

> Задача на понимание того, **как устроены комбинаторы промисов**. Заодно закрепляет знание их
> различий — а это спрашивают в теоретической части почти всегда.

## Условие

Реализуй `myPromiseAll(promises)` — аналог `Promise.all`:

- принимает массив промисов (или обычных значений);
- возвращает промис с массивом результатов **в исходном порядке**;
- отклоняется с **первой** возникшей ошибкой (fail-fast);
- на пустом массиве — немедленно резолвится с `[]`.

**Бонус:** реализуй `myAllSettled`, `myRace`, `myAny`.

## Примеры

```js
myPromiseAll([Promise.resolve(1), 2, Promise.resolve(3)])
  .then(console.log);                     // [1, 2, 3]

myPromiseAll([Promise.resolve(1), Promise.reject(new Error('boom'))])
  .catch((e) => console.log(e.message));  // "boom"

myPromiseAll([]).then(console.log);       // []
```

## 🎯 Требования

- Порядок результатов = порядок входа (не порядок завершения).
- Не-промисы обрабатываются как уже выполненные значения.
- Первая ошибка отклоняет общий промис немедленно.

## 🧠 Ментальная модель

```
создать промис
счётчик завершённых = 0
для каждого элемента с индексом i:
    Promise.resolve(item)                 ← нормализует не-промисы
      .then(value => {
          results[i] = value;             ← по ИНДЕКСУ, не push
          если все завершились → resolve(results)
      })
      .catch(reject)                      ← первая ошибка отклоняет всё
```

Ключевых деталей три: нормализация через `Promise.resolve`, запись по индексу и **счётчик**
завершённых (а не проверка длины массива — см. подводные камни).

## ⚠️ Подводные камни именно этой задачи

1. **`results.push(value)` вместо `results[i] = value`** — порядок будет по времени
   завершения, а не по входу. Главная ошибка задачи.
2. **Считать завершённые счётчиком, а не `results.length`.** Присваивание по индексу оставляет
   «дыры»: `results[2] = x` в пустом массиве сразу даст `length === 3`, хотя выполнена одна
   задача. Нужен отдельный `completed`.
3. **Пустой массив** должен резолвиться немедленно. Без явной проверки промис зависнет навсегда,
   потому что ни один `then` не сработает.
4. **Не-промисы в массиве** (`[1, Promise.resolve(2)]`) валидны. `Promise.resolve(value)`
   нормализует любое значение.
5. **`reject` можно вызывать многократно** — сработает только первый, промис уже перешёл в
   финальное состояние. На этом и строится fail-fast: отдельный флаг не нужен.
6. **`Promise.all` не отменяет** остальные задачи при ошибке — они продолжают выполняться, их
   результаты просто игнорируются. Это частый уточняющий вопрос.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — каркас</summary>

```js
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    // ...
  });
}
```

</details>

<details>
<summary>Подсказка 2 — счётчик</summary>

`let completed = 0;` и внутри `then`: `completed++; if (completed === promises.length) resolve(results);`

</details>

---

## ✍️ Моё решение

```js
function myPromiseAll(promises) {
  // пиши здесь
}
```

## 🧮 Самопроверка

- [ ] порядок результатов сохраняется
- [ ] не-промисы обрабатываются
- [ ] первая ошибка отклоняет общий промис
- [ ] пустой массив → `[]` немедленно

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>myPromiseAll + объяснение</summary>

```js
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = new Array(promises.length);
    let completed = 0;

    if (promises.length === 0) {
      resolve(results);                          // пустой вход — сразу
      return;
    }

    promises.forEach((item, index) => {
      Promise.resolve(item)                      // нормализуем не-промисы
        .then((value) => {
          results[index] = value;                // по ИНДЕКСУ — порядок сохранён
          completed++;

          if (completed === promises.length) resolve(results);
        })
        .catch(reject);                          // первая ошибка отклоняет всё
    });
  });
}
```

**Почему здесь `forEach` уместен**, хотя в теории мы говорили, что он не умеет `await`.
Мы и не ждём внутри — мы просто **подписываемся** на каждый промис. Ожидание организовано
счётчиком, а не последовательным `await`. Это принципиально разные вещи.

**Почему `.catch(reject)` безопасен.** Он может сработать у нескольких промисов, но состояние
промиса меняется **только один раз** — второй и последующие `reject` игнорируются движком.
Отдельный флаг «уже упали» не нужен.

**Почему нужен `completed`, а не `results.length`.** Присваивание `results[5] = x` в массиве
длины 0 мгновенно делает `length === 6`, хотя выполнена одна задача. Счётчик считает честно.

**Сложность:** `O(N)` подписок, память `O(N)` под результаты.

</details>

<details>
<summary>myAllSettled, myRace, myAny</summary>

```js
function myAllSettled(promises) {
  return myPromiseAll(
    promises.map((item) =>
      Promise.resolve(item)
        .then((value) => ({ status: 'fulfilled', value }))
        .catch((reason) => ({ status: 'rejected', reason })),   // ошибку "гасим"
    ),
  );
}

function myRace(promises) {
  return new Promise((resolve, reject) => {
    for (const item of promises) {
      Promise.resolve(item).then(resolve, reject);    // кто первый — тот и победил
    }
  });
}

function myAny(promises) {
  return new Promise((resolve, reject) => {
    let rejected = 0;
    const errors = new Array(promises.length);

    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    promises.forEach((item, index) => {
      Promise.resolve(item).then(resolve, (error) => {
        errors[index] = error;
        rejected++;
        if (rejected === promises.length) {
          reject(new AggregateError(errors, 'All promises were rejected'));
        }
      });
    });
  });
}
```

`myAllSettled` элегантно выражается через `all`: каждую ошибку превращаем в успешный объект,
поэтому общий промис никогда не отклоняется. Приём «погасить ошибку, вернув объект» полезен и
сам по себе.

`myRace` — самый короткий: `.then(resolve, reject)` для всех, а дальше сработает первый
завершившийся, остальные будут проигнорированы.

</details>

<details>
<summary>Таблица различий (часто спрашивают устно)</summary>

| Комбинатор | Когда резолвится | Когда реджектится | Результат |
|---|---|---|---|
| `all` | все успешны | **первая** ошибка | массив значений |
| `allSettled` | все завершились | никогда | массив `{status, value/reason}` |
| `race` | первый **завершившийся** | если первый завершился ошибкой | значение/ошибка первого |
| `any` | первый **успешный** | все отклонены | значение первого успешного / `AggregateError` |

Мнемоника: `all` — «все или ничего», `allSettled` — «расскажи про всех», `race` — «кто первый»,
`any` — «первый, у кого получилось».

Практика: `all` — параллельная загрузка обязательных данных; `allSettled` — когда часть
запросов может падать (дашборд с виджетами); `race` — таймаут запроса
(`race([fetch(...), timeout(5000)])`); `any` — запрос к нескольким зеркалам.

</details>
