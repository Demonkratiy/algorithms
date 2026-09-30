# Heap Comparator — max-heap и очередь с приоритетом

**Тема:** heap / comparator · **Сложность:** medium · **Приоритет:** ⚪ дополнительная

Сначала реализуй [числовой Min-Heap](01-implement-min-heap.md). Здесь можно переиспользовать свой код, но новый результат сохраняется отдельно.

## Условие

Обобщи `MinHeap`: конструктор принимает `compare(a, b)` (по умолчанию `(a, b) => a - b`). Отрицательный результат означает, что `a` должен извлекаться раньше `b`; ноль — равный приоритет.

Сохрани `push`, `pop`, `peek`, getter `size`, обработку дубликатов и пустой кучи (`undefined`). Проверь **числа по убыванию** с `(a, b) => b - a` и **объекты** с `(a, b) => a.priority - b.priority`. Объекты возвращаются по ссылке; стабильный порядок равных приоритетов не требуется.

```js
const maxHeap = new MinHeap((a, b) => b - a);
[5, 1, 9].forEach((x) => maxHeap.push(x));
maxHeap.pop(); // 9

const pq = new MinHeap((a, b) => a.priority - b.priority);
pq.push({ task: 'low', priority: 5 });
pq.push({ task: 'urgent', priority: 1 });
pq.pop().task; // 'urgent'
```

## 🎯 Цель по сложности

`push` / `pop`: `O(log N)` сравнений; `peek` / `size`: `O(1)`; память `O(N)`. Предполагаем компаратор за `O(1)`.

## 🧠 Ментальная модель

Структура кучи не меняется. Меняется определение «раньше»: все сравнения в siftUp и siftDown должны использовать один и тот же компаратор.

## ⚠️ Подводные камни именно этой задачи

Нельзя оставить числовое `<` хотя бы в одной ветке: объекты и max-heap перестанут работать. Правый потомок сравнивается с уже выбранным лучшим. При равенстве не нужен обмен. Компаратор должен задавать согласованный порядок; не изменяй приоритет объекта, пока он в куче.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка — единый порядок</summary>

Найди все места сравнения чисел в базовой куче и замени смысл «меньше» на compare(a, b) < 0.

</details>

<details>
<summary>Подсказка — проверка</summary>

Последовательность pop должна совпадать с сортировкой тем же компаратором; проверь не только числа, но и объекты.

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

## 🧮 Моя оценка сложности

Время: O(?) · Память: O(?)

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

Первый тест — главный: последовательные `pop` **обязаны** дать порядок выбранного компаратора. Именно
он ловит ошибку «сравнил только с левым потомком».

</details>
