# Свой Promise.allSettled

**Тема:** js-interview / async · **Сложность:** medium · **Приоритет:** ⚪ дополнительная

Самостоятельное продолжение [Promise.all](03-promise-all.md). Вход — плотный конечный массив промисов, thenable или обычных значений; исходные операции не отменяются. Соответствующий встроенный комбинатор вызывать нельзя.

## Условие

Реализуй `myAllSettled(promises)`: дождись всех входов и верни массив результатов **в исходном порядке**. Успех → `{ status: "fulfilled", value }`, ошибка → `{ status: "rejected", reason }`. Ошибка отдельного входа не отклоняет общий промис. Пустой вход → `[]`.

`myAllSettled([1, Promise.reject("x")])` выполняется с `[{status:"fulfilled",value:1},{status:"rejected",reason:"x"}]`.

## 🎯 Цель по сложности

Служебная работа `O(N)`, память `O(N)` на подписки/результаты. Wall-clock ожидание — до завершения всех входов.

## 🧠 Ментальная модель

Вместо fail-fast каждая ветка завершения превращается в запись результата.

## ⚠️ Подводные камни именно этой задачи

Сохраняй исходный индекс, а не порядок завершения. Не оставляй reject без обработчика. Пустой вход не должен зависнуть.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка — два исхода</summary>

И fulfillment, и rejection увеличивают общий счётчик завершённых. Различается только форма записи.

</details>

---

## ✍️ Моё решение

```js
function myAllSettled(promises) {
  // пиши здесь
}
```

## 🧮 Моя оценка сложности

Время: O(?) · Память: O(?)

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Самостоятельная реализация</summary>

```js
function myAllSettled(promises) {
  return new Promise((resolve) => {
    const results = new Array(promises.length);
    let completed = 0;
    if (promises.length === 0) {
      resolve(results);
      return;
    }
    const save = (index, result) => {
      results[index] = result;
      if (++completed === promises.length) resolve(results);
    };
    promises.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => save(index, { status: 'fulfilled', value }),
        (reason) => save(index, { status: 'rejected', reason }),
      );
    });
  });
}
```

</details>

<details>
<summary>Композиция с собственной myPromiseAll</summary>

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
```

myAllSettled элегантно выражается через all: каждую ошибку превращаем в успешный объект, поэтому общий промис не отклоняется. Это полезный приём и вне комбинаторов.

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
