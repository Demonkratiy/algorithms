import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const memoizeTask: TaskDefinition = {
  id: 'memoize',
  title: 'Memoize',
  starter,
  complexity: {
    variables: 'S — размер сериализации аргументов; K — число ключей; B — суммарный размер ключей и удерживаемых результатов. Map считаем O(1) в среднем.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'key', label: 'O(S)' },
      { id: 'cache', label: 'O(K + B)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Попадание с JSON-ключом', expected: 'key', explanation: 'Построить ключ стоит O(S); lookup — O(1) в среднем. Для своего resolver время равно его стоимости плюс lookup, при промахе добавляется fn.' },
      { id: 'space', title: 'Удерживаемый кеш', expected: 'cache', explanation: 'K записей удерживают ключи и результаты. Без лимита кеш растёт; WeakMap/LRU здесь не требуются.' },
    ],
  },
  verificationNote: 'По умолчанию несколько JSON-совместимых примитивов: null, boolean, string, конечные number (без различения ±0). Ключ учитывает порядок, типы и число аргументов. undefined/NaN/Infinity/Symbol/BigInt как вход без resolver вне области JSON-ключа. Все falsy-результаты кешируются. keyResolver(...args) задаёт ключ (включая объект по ссылке); this сохраняется у fn, но автоматически частью ключа не становится. Кеш каждой обёртки независим; синхронное исключение не кешируется. clear/TTL/LRU/особая обработка Promise не требуются. Тесты не доказывают Big O и не анализируют алгоритм статически.',
  runner: { kind: 'scenario', entryPoint: 'memoize', cases },
};
