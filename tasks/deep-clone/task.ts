import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const deepCloneTask: TaskDefinition = {
  id: 'deep-clone',
  title: 'Deep Clone',
  starter,
  complexity: {
    variables: 'V — число различных объектов/контейнеров; E — число свойств и элементов; H — глубина обхода. Map считаем O(1) в среднем.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'depth', label: 'O(H)' },
      { id: 'graph', label: 'O(V + E)' },
      { id: 'aux', label: 'O(V + H)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время копирования', expected: 'graph', explanation: 'Каждый объект копируется один раз, каждое ребро/свойство обходится один раз. Общие ссылки не должны вызывать повторный обход.' },
      { id: 'space', title: 'Память вместе с результатом', expected: 'graph', explanation: 'Копия занимает O(V + E), seen — O(V), рекурсивный стек — O(H). Без результата вспомогательная память O(V + H).' },
    ],
  },
  verificationNote: 'Расширенный вариант A–C: объекты/массивы, циклы и общие ссылки, Date (timestamp), RegExp (source/flags), Map (ключи и значения), Set. Примитивы и функции возвращаются как есть. У обычных объектов копируются собственные data-свойства, включая Symbol и неперечисляемые; прототип сохраняется по ссылке. Дескрипторы, accessors, private fields, host-объекты, разреженные массивы и дополнительные свойства встроенных типов вне контракта; RegExp.lastIndex не требуется. Глубина конечна и умеренна, бесконечный стек не обещается. Тесты не доказывают Big O и не анализируют алгоритм статически.',
  runner: { kind: 'scenario', entryPoint: 'deepClone', cases },
};
