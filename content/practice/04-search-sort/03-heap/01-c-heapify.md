# Heapify — построение кучи за O(N)

**Тема:** heap / bottom-up · **Сложность:** medium · **Приоритет:** ⚪ дополнительная

Дополнение к [Min-Heap](01-implement-min-heap.md) и [компаратору](01-b-heap-comparator.md). Переиспользуй свои методы кучи.

## Условие

Добавь статический метод `MinHeap.heapify(array, compare = (a, b) => a - b)`: он возвращает новую кучу из всех элементов массива, **не изменяя вход**. Нельзя строить её последовательными `push`: нужна линейная работа.

`MinHeap.heapify([5, 1, 3])` извлекает `1, 3, 5`; пустой массив даёт пустую кучу. Дубликаты, max-heap и объекты с компаратором поддерживаются как в предыдущей задаче.

## 🎯 Цель по сложности

Время `O(N)` сравнений, память `O(N)` для копии массива, `O(1)` рабочей памяти при итеративном siftDown. Компаратор — `O(1)`.

## 🧠 Ментальная модель

Листья уже являются кучами. При обработке внутренних узлов снизу вверх оба поддерева уже удовлетворяют инварианту.

## ⚠️ Подводные камни именно этой задачи

Просеивание должно начинаться с заданного индекса, а не всегда с корня. Последний нелистовой индекс — Math.floor(N / 2) - 1. Для пустой кучи он отрицательный. Не изменяй исходный массив.

## 💡 Подсказки (открывай по очереди)

<details>
<summary>Подсказка — порядок</summary>

Обходи нелистовые индексы справа налево, просеивая каждый вниз.

</details>

<details>
<summary>Подсказка — оценка</summary>

Не умножай максимальную высоту на число узлов: большинство узлов находятся внизу и проходят мало уровней.

</details>

---

## ✍️ Моё решение

```js
class MinHeap {
  // Перенеси сюда свой рабочий класс и добавь метод.
  static heapify(array, compare = (a, b) => a - b) {
    // пиши здесь
  }
}
```

## 🧮 Моя оценка сложности

Время: O(?) · Память: O(?)

---

## 🔍 Разбор — открывай ТОЛЬКО после своей попытки

<details>
<summary>Полный класс и bottom-up построение</summary>

```js
class MinHeap {
  constructor(compare = (a, b) => a - b) {
    this.items = [];
    this.compare = compare;                    // < 0 ⇒ a приоритетнее b
  }

  static heapify(array, compare = (a, b) => a - b) {
    const heap = new MinHeap(compare);
    heap.items = [...array];
    for (let i = Math.floor(heap.items.length / 2) - 1; i >= 0; i--) {
      heap.#siftDownFrom(i);
    }
    return heap;
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
      this.#siftDownFrom(0);
    }

    return top;
  }

  #siftDownFrom(index) {
    const n = this.items.length;

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

Построение кучи из готового массива стоит **`O(N)`**, а не `O(N log N)`: узлов на большой
глубине много, но их путь просеивания короткий, и сумма сходится к линейной.

Это контринтуитивный факт, который любят спрашивать: _«сколько стоит построить кучу из массива?»_
— правильный ответ **`O(N)`**.

</details>
