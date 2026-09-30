import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Вложенное значение', args: [{ a: { b: { c: 42 } } }, 'a.b.c'], expected: 42 },
  { name: 'Нет конечного ключа', args: [{ a: { b: {} } }, 'a.b.c'], expectedUndefined: true },
  { name: 'Нет первого ключа', args: [{}, 'a.b.c'], expectedUndefined: true },
  { name: 'Null посреди пути', args: [{ a: null }, 'a.b'], expectedUndefined: true },
  { name: 'Null в конце пути', args: [{ a: { b: null } }, 'a.b'], expected: null },
  { name: 'Ноль в конце пути', args: [{ a: { b: 0 } }, 'a.b'], expected: 0 },
  { name: 'False в конце пути', args: [{ a: false }, 'a'], expected: false },
  { name: 'Пустая строка в конце пути', args: [{ a: '' }, 'a'], expected: '' },
  { name: 'Индекс массива в пути', args: [{ a: [{ value: 0 }, { value: 7 }] }, 'a.1.value'], expected: 7 },
  { name: 'Массив как результат', args: [{ a: { values: [0, false, null] } }, 'a.values'], expected: [0, false, null] },
  { name: 'Объект как результат', args: [{ a: { b: { c: [1] } } }, 'a.b'], expected: { c: [1] } },
  { name: 'Обычный доступ к свойству строки', args: [{ a: '' }, 'a.length'], expected: 0 },
  { name: 'Путь за пределами массива', args: [{ a: [] }, 'a.0.value'], expectedUndefined: true },
  { name: 'Null исходный объект', args: [null, 'a'], expectedUndefined: true },
  { name: 'Отсутствующее свойство у числа', args: [{ a: 0 }, 'a.value'], expectedUndefined: true },
];
