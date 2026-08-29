# Реализовать Min-Heap

**Тема:** heap / дизайн структуры · **Сложность:** medium · **Приоритет:** 🔴 основная

> ⚠️ Разобрана в теории ([heap.md](../../../04-search-sort/03-heap.md)).
> Пиши **по памяти**. Поскольку в JS кучи нет, это единственный способ решать задачи «k
> наибольших», «медиана потока», «слить k списков» — и на интервью её просят написать целиком.

## Условие

Реализуй класс `MinHeap` с методами:

- `push(value)` — добавить элемент, `O(log N)`;
- `pop()` — извлечь и вернуть **минимум**, `O(log N)`;
- `peek()` — посмотреть минимум без извлечения, `O(1)`;
- `size` — количество элементов.

**Бонус:** поддержка компаратора, чтобы получить max-heap и очередь с приоритетом.

## Примеры

```js
const heap = new MinHeap();
heap.push(5);
heap.push(3);
heap.push(8);
heap.push(1);

heap.peek();     // 1
heap.pop();      // 1
heap.pop();      // 3
heap.size;       // 2

// max-heap через компаратор
const maxHeap = new MinHeap((a, b) => b - a);
maxHeap.push(5); maxHeap.push(1); maxHeap.push(9);
maxHeap.pop();   // 9
```

## 🎯 Требования

- `pop` / `peek` на пустой куче возвращают `undefined`, не бросают ошибку.
- Дубликаты допустимы.
- Внутреннее хранение — обычный массив, без ссылок и объектов-узлов.

## 🧠 Ментальная модель

Дерево, «уложенное» в массив. Индексная арифметика заменяет ссылки:

```
parent(i) = (i - 1) >> 1        // или Math.floor((i - 1) / 2)
left(i)   = 2i + 1
right(i)  = 2i + 2
```

**`push`** — положить в конец и **всплывать** вверх, пока меньше родителя.
**`pop`** — забрать корень, поставить туда последний элемент и **просеивать** вниз, меняя с
меньшим из потомков.

```
push(1) в [3, 5, 8]:
   [3, 5, 8, 1] → 1 < 5 → swap → [3, 1, 8, 5] → 1 < 3 → swap → [1, 3, 8, 5] ✅
```

## ⚠️ Подводные камни именно этой задачи

1. **В `siftDown` выбирать МЕНЬШЕГО из двух потомков.** Сравнение только с левым разрушит
   инвариант кучи, и ошибка проявится не сразу, а на третьем-четвёртом `pop`.
2. **Проверять `left < n` ДО обращения** к `items[left]`. Иначе получишь `undefined`, сравнение
   даст `NaN`, а `NaN < x` — всегда `false` → тихий баг.
3. **`pop` при одном элементе.** После `items.pop()` массив пуст, и записывать `items[0] = last`
   нельзя — куча «воскреснет» с удалённым элементом. Нужна проверка `if (items.length > 0)`.
4. **Условие остановки во всплытии — нестрогое.** Меняем, только если строго меньше родителя
   (`compare(...) < 0`); при равенстве — стоп. Со строгим `>` в условии выхода получишь
   бесконечный цикл на дубликатах.
5. **Обмен через деструктуризацию.** `a[i] = a[j]; a[j] = a[i];` теряет значение.
6. **Куча не отсортирована** — не пытайся проверять себя сравнением `heap.items` с
   `sorted(array)`. Проверяй последовательностью `pop`.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка 1 — push</summary>

`items.push(value)`, затем цикл: пока `index > 0` и элемент меньше родителя — меняем местами и
переходим на индекс родителя.

</details>

<details>
<summary>Подсказка 2 — pop</summary>

Сохранить `items[0]`, забрать последний через `items.pop()`, положить его в корень (если куча
не опустела) и запустить просеивание вниз.

</details>

<details>
<summary>Подсказка 3 — siftDown</summary>

В цикле находи `smallest` среди `index`, `left`, `right`. Если `smallest === index` — выходим,
иначе меняем и продолжаем с `smallest`.

</details>

---

## ✍️ Моё решение

```js
class MinHeap {
  constructor(compare = (a, b) => a - b) {
    // пиши здесь
  }

  get size() {}

  peek() {}

  push(value) {}

  pop() {}
}
```

## 🧮 Самопроверка

- [ ] `pop` выдаёт элементы по возрастанию
- [ ] работает с дубликатами
- [ ] `pop` пустой кучи → `undefined`
- [ ] компаратор даёт max-heap

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Решение + объяснение</summary>

```js
class MinHeap {
  constructor(compare = (a, b) => a - b) {
    this.items = [];
    this.compare = compare;                    // < 0 ⇒ a приоритетнее b
  }

  get size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];                      // undefined на пустой — то, что нужно
  }

  push(value) {
    this.items.push(value);

    let index = this.items.length - 1;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.compare(this.items[index], this.items[parent]) >= 0) break;

      [this.items[index], this.items[parent]] = [this.items[parent], this.items[index]];
      index = parent;
    }
  }

  pop() {
    if (this.items.length === 0) return undefined;

    const top = this.items[0];
    const last = this.items.pop();

    if (this.items.length > 0) {               // если это был не единственный элемент
      this.items[0] = last;
      this.#siftDown();
    }

    return top;
  }

  #siftDown() {
    const n = this.items.length;
    let index = 0;

    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < n && this.compare(this.items[left], this.items[smallest]) < 0) {
        smallest = left;
      }
      if (right < n && this.compare(this.items[right], this.items[smallest]) < 0) {
        smallest = right;                      // сравниваем с УЖЕ найденным меньшим
      }

      if (smallest === index) break;

      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}
```

**Тонкость в `siftDown`:** правый потомок сравнивается не с `index`, а с текущим `smallest` —
так за два сравнения выбирается минимум из трёх элементов.

**`(index - 1) >> 1`** — быстрый аналог `Math.floor((index - 1) / 2)` для неотрицательных чисел.
Читаемость чуть хуже; на интервью можно писать `Math.floor`.

**Трассировка `push`** в куче `[1, 3, 8, 5]`, добавляем `2`:
```
[1, 3, 8, 5, 2]   index=4, parent=1 → 2 < 3 → swap
[1, 2, 8, 5, 3]   index=1, parent=0 → 2 > 1 → стоп ✅
```

**Трассировка `pop`** из `[1, 2, 8, 5, 3]`:
```
забрали 1, last = 3 → [3, 2, 8, 5]
siftDown: потомки 2 (индекс 1) и 8 (индекс 2) → smallest = 1 → swap
          [2, 3, 8, 5]
          у индекса 1 потомок 5 (индекс 3) → 5 > 3 → стоп ✅
```

**Сложность:** `push` / `pop` — `O(log N)` (высота дерева), `peek` / `size` — `O(1)`.
Память `O(N)`.

</details>

<details>
<summary>Как проверить себя офлайн</summary>

```js
// 1. извлечение по возрастанию
const h = new MinHeap();
const input = [5, 3, 8, 1, 9, 2, 7, 3];
for (const x of input) h.push(x);

const out = [];
while (h.size > 0) out.push(h.pop());
console.log(out);                            // [1,2,3,3,5,7,8,9]
console.log(String(out) === String([...input].sort((a, b) => a - b)));   // true

// 2. пустая куча
const e = new MinHeap();
console.log(e.pop(), e.peek(), e.size);      // undefined undefined 0

// 3. max-heap
const mx = new MinHeap((a, b) => b - a);
[4, 9, 1].forEach((x) => mx.push(x));
console.log(mx.pop(), mx.pop(), mx.pop());   // 9 4 1

// 4. очередь с приоритетом
const pq = new MinHeap((a, b) => a.priority - b.priority);
pq.push({ task: 'low', priority: 5 });
pq.push({ task: 'urgent', priority: 1 });
console.log(pq.pop().task);                  // "urgent"
```

Первый тест — главный: последовательные `pop` **обязаны** дать отсортированный порядок. Именно
он ловит ошибку «сравнил только с левым потомком».

</details>

<details>
<summary>Бонус: heapify за O(N)</summary>

```js
static heapify(array, compare = (a, b) => a - b) {
  const heap = new MinHeap(compare);
  heap.items = [...array];

  // просеиваем вниз все НЕлистовые узлы, начиная с последнего
  for (let i = (heap.items.length >> 1) - 1; i >= 0; i--) {
    heap.#siftDownFrom(i);
  }

  return heap;
}
```

Построение кучи из готового массива стоит **`O(N)`**, а не `O(N log N)`: узлов на большой
глубине много, но их путь просеивания короткий, и сумма сходится к линейной.

Это контринтуитивный факт, который любят спрашивать: _«сколько стоит построить кучу из массива?»_
— правильный ответ **`O(N)`**.

</details>
