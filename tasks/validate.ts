import type { JsonValue, NodeReference, TaskDefinition } from './types';

const identifier = /^[A-Za-z_$][\w$]*$/;
const stableId = /^[a-z0-9][a-z0-9-]{0,79}$/;
const primitive = (value: JsonValue) => value === null || ['number', 'string', 'boolean'].includes(typeof value);
function json(value: JsonValue): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(json);
  return typeof value === 'object' && Object.values(value).every(json);
}
function validTree(values: (number | null)[]): boolean {
  if (!values.every(value => value === null || (typeof value === 'number' && Number.isFinite(value)))) return false;
  if (!values.length || values[0] === null) return values.every(value => value === null);
  let pending = 1, index = 1;
  while (pending > 0 && index < values.length) {
    pending--;
    for (let child = 0; child < 2 && index < values.length; child++, index++) {
      if (values[index] !== null) pending++;
    }
  }
  return values.slice(index).every(value => value === null);
}
export function validateTask(task: TaskDefinition) {
  const fail = (message: string): never => { throw new Error(`Задача ${task.id}: ${message}`); };
  if (!stableId.test(task.id) || !task.title || !task.starter.trim()) fail('неполные метаданные');
  const { runner, complexity } = task;
  if (!identifier.test(runner.entryPoint) || !runner.cases.length || runner.cases.length > 100) fail('неверный контракт запуска');
  const optionIds = new Set(complexity.options.map(option => option.id));
  if (optionIds.size !== complexity.options.length || !optionIds.has('unknown')
    || complexity.options.some(option => !stableId.test(option.id) || !option.label)) fail('неверные варианты сложности');
  const criteria = new Set(complexity.criteria.map(item => item.id));
  if (!criteria.size || criteria.size > 20 || criteria.size !== complexity.criteria.length
    || complexity.criteria.some(item => !stableId.test(item.id)
      || [item.expected, ...(item.accepted ?? [])].some(id => !optionIds.has(id) || id === 'unknown'))) fail('неверные цели сложности');
  const caseNames = new Set(runner.cases.map(item => item.name));
  if (caseNames.size !== runner.cases.length || runner.cases.some(item => !item.name || item.name.length > 200)) fail('имена тестов должны быть уникальными');
  if (runner.kind === 'scenario') {
    for (const test of runner.cases) {
      if (!test.input || test.input.length > 4000 || !test.expected || test.expected.length > 4000
        || !test.script.trim() || test.script.length > 50_000) fail('неверное описание сценария');
    }
  } else if (runner.kind === 'function') {
    if (!['exact', 'unordered', 'nested-unordered', 'unordered-tuples', 'closest-points', 'approximate', 'topological-order'].includes(runner.comparison)) fail('неизвестное сравнение');
    if (runner.tolerance && (!Number.isFinite(runner.tolerance.absolute) || runner.tolerance.absolute < 0
      || !Number.isFinite(runner.tolerance.relative) || runner.tolerance.relative < 0)) fail('неверная погрешность');
    if (runner.freshArray && runner.output.kind !== 'return') fail('freshArray требует возвращаемого массива');
    const indices = [...(runner.preserveArgs ?? []), ...(runner.output.kind === 'argument' ? [runner.output.index] : [])];
    for (const test of runner.cases) {
      if (!test.args.every(json) || (test.expectedUndefined ? test.expected !== undefined : !json(test.expected))) fail(`тест ${test.name} содержит не-JSON значения`);
      if (test.expectedUndefined && (runner.comparison !== 'exact' || runner.output.kind !== 'return')) fail('undefined поддерживается только для точного возвращаемого значения');
      if (indices.some(index => !Number.isInteger(index) || index < 0 || index >= test.args.length)) fail('неверный индекс аргумента');
      if (runner.comparison !== 'exact' && runner.comparison !== 'approximate' && !Array.isArray(test.expected)) fail('сравнение требует массива');
      if (runner.comparison === 'approximate' && typeof test.expected !== 'number') fail('approximate требует числа');
      if (['nested-unordered', 'unordered-tuples'].includes(runner.comparison) && (!Array.isArray(test.expected) || !test.expected.every(Array.isArray))) fail('сравнение групп/кортежей требует вложенных массивов');
      if (runner.comparison === 'unordered' && Array.isArray(test.expected) && !test.expected.every(primitive)) fail('unordered поддерживает массив примитивов');
      if (['nested-unordered', 'unordered-tuples'].includes(runner.comparison) && Array.isArray(test.expected)
        && !test.expected.every(group => Array.isArray(group) && group.every(primitive))) fail('nested-unordered поддерживает группы примитивов');
      if (runner.comparison === 'closest-points') {
        const [points, k] = test.args;
        const point = (value: JsonValue) => Array.isArray(value) && value.length === 2 && value.every(n => typeof n === 'number' && Number.isFinite(n));
        if (!Array.isArray(points) || !points.every(point) || typeof k !== 'number' || !Number.isInteger(k)
          || k < 1 || k > points.length || !Array.isArray(test.expected) || test.expected.length !== k || !test.expected.every(point)) fail('неверный тест ближайших точек');
      }
      if (runner.comparison === 'topological-order') {
        const [count, edges] = test.args;
        if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || !Array.isArray(edges)
          || !edges.every(edge => Array.isArray(edge) && edge.length === 2
            && edge.every(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < count))
          || !Array.isArray(test.expected) || !test.expected.every(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < count)) fail('неверный топологический тест');
      }
    }
  } else if (runner.kind === 'class') {
    if (runner.factoryMethod !== undefined && !identifier.test(runner.factoryMethod)) fail('неверная статическая фабрика');
    for (const test of runner.cases) {
      if (!test.instances.length || !test.instances.every(args => args.every(json)) || !test.calls.length
        || !test.calls.some(call => !call.ignoreReturn)) fail('тест класса должен проверять хотя бы одно значение');
      if (test.instances.some(args => runner.preserveArgs?.some(index =>
        !Number.isInteger(index) || index < 0 || index >= args.length))) fail('неверный сохраняемый аргумент конструктора');
      for (const call of test.calls) {
        if (!Number.isInteger(call.instance) || call.instance < 0 || call.instance >= test.instances.length) fail('неверный экземпляр');
        if (call.property !== undefined) {
          if (!identifier.test(call.property) || call.method !== undefined || call.args !== undefined) fail('неверное чтение свойства');
        } else if (!identifier.test(call.method) || !call.args.every(json)) fail('неверный вызов метода');
        if (call.ignoreReturn === true ? call.expected !== undefined || call.expectedUndefined !== undefined
          : call.expectedUndefined === true ? call.expected !== undefined : !json(call.expected)) fail('неверное ожидание метода');
      }
      const slots = new Set<string>();
      for (const factory of test.factories ?? []) {
        if (!Number.isInteger(factory.instance) || factory.instance < 0 || factory.instance >= test.instances.length
          || !Number.isInteger(factory.argument) || factory.argument < 0 || factory.argument > test.instances[factory.instance].length
          || !['asc', 'desc'].includes(factory.direction)
          || (factory.kind !== 'number' && (factory.kind !== 'property' || !identifier.test(factory.property)))) fail('неверная фабрика компаратора');
        const slot = `${factory.instance}:${factory.argument}`;
        if (slots.has(slot)) fail('повторная фабрика для аргумента');
        slots.add(slot);
      }
    }
  } else if (runner.kind === 'linked-list') {
    for (const test of runner.cases) {
      if (!test.lists.length || (test.entryPoint !== undefined && !identifier.test(test.entryPoint))
        || (test.args !== undefined && !test.args.every(json))) fail('неверные аргументы списка');
      for (const list of test.lists) {
        if (!list.values.every(value => typeof value === 'number' && Number.isFinite(value))
          || (list.cycleAt !== undefined && (!Number.isInteger(list.cycleAt) || list.cycleAt < -1 || list.cycleAt >= list.values.length))) {
          fail('неверные данные или позиция цикла');
        }
      }
      const validReference = (node: NodeReference) => Number.isInteger(node.list) && node.list >= 0
        && node.list < test.lists.length && Number.isInteger(node.index)
        && node.index >= 0 && node.index < test.lists[node.list].values.length;
      const expected = test.expected;
      if (expected.kind === 'value') {
        if (!json(expected.value)) fail('неверное значение результата');
      } else if (expected.kind === 'node') {
        if (expected.node !== null && !validReference(expected.node)) fail('неверная ссылка на ожидаемый узел');
      } else {
        if (!expected.values.every(value => typeof value === 'number' && Number.isFinite(value))
          || (expected.nodeOrder !== undefined && (expected.nodeOrder.length !== expected.values.length
            || !expected.nodeOrder.every(validReference)
            || new Set(expected.nodeOrder.map(node => `${node.list}:${node.index}`)).size !== expected.nodeOrder.length))) fail('неверное ожидание выходного списка');
      }
    }
  } else if (runner.kind === 'binary-tree') {
    for (const test of runner.cases) {
      if (!validTree(test.tree) || !(test.args ?? []).every(json)) fail('неверная сериализация дерева');
      const validNode = (index: number) => Number.isInteger(index) && index >= 0 && index < test.tree.length && test.tree[index] !== null;
      if (!(test.nodeArgs ?? []).every(validNode)) fail('неверная ссылка на узел-аргумент');
      if (test.expected.kind === 'node') {
        if (test.expected.index !== null && !validNode(test.expected.index)) fail('неверный ожидаемый узел дерева');
      } else if (test.expected.kind === 'tree') {
        if (!validTree(test.expected.values)) fail('неверное ожидаемое дерево');
      } else if (!json(test.expected.value)) fail('неверный результат дерева');
    }
  } else {
    for (const test of runner.cases) {
      const count = test.adjacency.length;
      if (count > 100 || (test.start !== undefined && (!Number.isInteger(test.start) || test.start < 0 || test.start >= count))) fail('неверная вершина графа');
      const values = test.values ?? Array.from({ length: count }, (_, index) => index + 1);
      if (values.length !== count || new Set(values).size !== count || !values.every(value => Number.isInteger(value) && value >= 1 && value <= 100)) fail('неверные значения вершин');
      for (let index = 0; index < count; index++) {
        const neighbors = test.adjacency[index];
        if (new Set(neighbors).size !== neighbors.length || !neighbors.every(v => Number.isInteger(v) && v >= 1 && v <= count && v !== index + 1)) fail('петля, повтор или неверное ребро');
        if (!neighbors.every(v => test.adjacency[v - 1].includes(index + 1))) fail('граф должен быть неориентированным');
      }
      if (count) {
        const visited = new Set([0]), queue = [0];
        for (let head = 0; head < queue.length; head++) {
          for (const value of test.adjacency[queue[head]]) if (!visited.has(value - 1)) { visited.add(value - 1); queue.push(value - 1); }
        }
        if (visited.size !== count) fail('граф должен быть связным');
      }
    }
  }
}
