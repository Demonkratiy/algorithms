import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Примитивы и функции по исходной ссылке',
    input: 'null,undefined,числа,NaN,Infinity,BigInt,Symbol,функция.',
    expected: 'Каждое значение возвращается без преобразования.',
    script: `
      const symbol = Symbol('x'), fn = () => 7;
      for (const value of [null, undefined, 0, -0, false, '', 12, NaN, Infinity, 123n, symbol, fn]) {
        assert(Object.is(subject(value), value), 'Примитивы и функции возвращаются как есть');
      }
    `,
  },
  {
    name: 'Вложенные объекты и массивы не делят изменяемые данные',
    input: '{a:[1,{b:[2]}],empty:{},list:[]}.',
    expected: 'Новые контейнеры всех уровней; изменение копии не меняет оригинал.',
    script: `
      const original = { a: [1, { b: [2] }], empty: {}, list: [] }, copy = subject(original);
      assert.equal(copy, original, 'Содержимое копируется');
      assert(copy !== original && copy.a !== original.a && copy.a[1] !== original.a[1], 'Все вложенные контейнеры новые');
      assert(copy.empty !== original.empty && copy.list !== original.list, 'Пустые контейнеры тоже копируются');
      assert(Array.isArray(copy.a) && Array.isArray(copy.list), 'Массивы остаются массивами');
      copy.a[1].b.push(3);
      assert.equal(original.a[1].b, [2], 'Оригинал не изменяется через копию');
    `,
  },
  {
    name: 'Циклы и общие ссылки обычных объектов',
    input: 'root.self=root; root.left и root.right указывают на один child; child.parent=root.',
    expected: 'Та же топология, но новые объекты.',
    script: `
      const root = {}, child = { parent: root };
      root.self = root; root.left = child; root.right = child;
      const copy = subject(root);
      assert(copy !== root, 'Корень новый');
      assert(copy.self === copy, 'Самоссылка ведёт в копию');
      assert(copy.left === copy.right && copy.left !== child, 'Общая ссылка сохраняется');
      assert(copy.left.parent === copy, 'Взаимный цикл замыкается на копию');
      assert(root.self === root && root.left === child, 'Оригинал не мутирует');
    `,
  },
  {
    name: 'Date и RegExp сохраняют тип и значение',
    input: 'Одинаковые ссылки на Date и RegExp в двух свойствах.',
    expected: 'Новые встроенные объекты с прежними значениями и общей идентичностью.',
    script: `
      const date = new Date('2024-02-29T12:34:56Z'), regexp = /a+b/giu;
      const copy = subject({ date, sameDate: date, regexp, sameRegexp: regexp });
      assert(copy.date instanceof Date && copy.date !== date, 'Date должен оставаться Date');
      assert.equal(copy.date.getTime(), date.getTime(), 'Timestamp Date');
      assert(copy.regexp instanceof RegExp && copy.regexp !== regexp, 'RegExp должен оставаться RegExp');
      assert.equal([copy.regexp.source, copy.regexp.flags], [regexp.source, regexp.flags], 'Source и flags');
      assert(copy.date === copy.sameDate && copy.regexp === copy.sameRegexp, 'seen нужен и для общих Date/RegExp');
      copy.date.setUTCFullYear(2000);
      assert.equal(date.getUTCFullYear(), 2024, 'Date оригинала независим');
    `,
  },
  {
    name: 'Map клонирует ключи, значения и связи между ними',
    input: 'Map с объектным ключом, общим значением и циклом на саму Map.',
    expected: 'Новый Map, клонированные ключи/значения; топология сохранена.',
    script: `
      const key = { id: 1 }, value = { key }, map = new Map();
      map.set(key, value); map.set('self', map);
      const copy = subject({ key, value, map });
      assert(copy.map instanceof Map && copy.map !== map, 'Новая Map');
      assert.equal(copy.map.size, 2, 'Все записи Map');
      assert(copy.key !== key && copy.value !== value, 'Ключ и значение новые');
      assert(copy.map.get(copy.key) === copy.value && copy.value.key === copy.key, 'Общие ссылки между Map и объектом');
      assert(!copy.map.has(key), 'Нельзя оставить исходный объектный ключ');
      assert(copy.map.get('self') === copy.map, 'Цикл Map');
      assert(map.get(key) === value && map.get('self') === map, 'Оригинальная Map не изменена');
    `,
  },
  {
    name: 'Set сохраняет циклы и ссылки на общие элементы',
    input: 'Set содержит объект и сам себя; объект ссылается на Set.',
    expected: 'Новый Set и объект, все связи ведут в копию.',
    script: `
      const set = new Set(), item = { set };
      set.add(item); set.add(set); set.add(0);
      const copy = subject({ set, item });
      assert(copy.set instanceof Set && copy.set !== set, 'Новый Set');
      assert.equal(copy.set.size, 3, 'Все элементы Set');
      assert(copy.set.has(copy.item) && !copy.set.has(item), 'Элемент клонируется');
      assert(copy.set.has(copy.set) && copy.item.set === copy.set, 'Циклы Set');
      assert(set.has(item) && item.set === set, 'Оригинал не меняется');
    `,
  },
  {
    name: 'Symbol-ключи и собственные неперечисляемые data-свойства',
    input: 'Символьный ключ, неперечисляемый hidden и функция.',
    expected: 'Собственные значения копируются; функция и Symbol сохраняются по ссылке.',
    script: `
      const key = Symbol('key'), value = Symbol('value'), fn = () => 1;
      const original = { [key]: { value }, fn };
      Object.defineProperty(original, 'hidden', { value: { x: 2 }, enumerable: false });
      const copy = subject(original);
      assert(Object.hasOwn(copy, key) && Object.hasOwn(copy, 'hidden'), 'Не теряй собственные ключи');
      assert(copy[key] !== original[key] && copy[key].value === value, 'Symbol-значение не пересоздаётся');
      assert(copy.hidden !== original.hidden && copy.hidden.x === 2, 'Неперечисляемое data-значение');
      assert(copy.fn === fn, 'Функция по ссылке');
    `,
  },
  {
    name: 'Прототип обычного объекта и null-prototype',
    input: 'Экземпляр класса с data-полями; объект Object.create(null).',
    expected: 'Прототипы сохранены по ссылке, data-поля глубоко скопированы.',
    script: `
      class Box { constructor() { this.value = { n: 3 }; } read() { return this.value.n; } }
      const original = new Box(), copy = subject(original);
      assert(copy instanceof Box && Object.getPrototypeOf(copy) === Box.prototype, 'Сохраняй прототип');
      assert(copy !== original && copy.value !== original.value, 'Data-поля независимы');
      assert.equal(copy.read(), 3, 'Метод прототипа работает');
      const dict = Object.create(null); dict.key = { value: 4 };
      const clonedDict = subject(dict);
      assert(Object.getPrototypeOf(clonedDict) === null, 'Null-prototype не заменяется на Object.prototype');
      assert(clonedDict.key !== dict.key && clonedDict.key.value === 4, 'Поля null-prototype копируются');
    `,
  },
  {
    name: 'Независимые вызовы и циклический массив',
    input: 'Массив содержит себя; объект клонируется повторно после изменения.',
    expected: 'Кеш посещённых не протекает между вызовами.',
    script: `
      const array = []; array.push(array);
      const clonedArray = subject(array);
      assert(Array.isArray(clonedArray) && clonedArray !== array && clonedArray[0] === clonedArray, 'Циклический массив');
      const original = { nested: { n: 1 } }, a = subject(original);
      original.nested.n = 2;
      const b = subject(original);
      assert(a !== b && a.nested !== b.nested, 'Каждое копирование независимо');
      assert.equal([a.nested.n, b.nested.n], [1, 2], 'Не возвращай устаревший seen из прошлого вызова');
    `,
  },
];
