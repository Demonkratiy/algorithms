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
  if (runner.kind === 'function') {
    if (!['exact', 'unordered', 'nested-unordered', 'unordered-tuples', 'closest-points'].includes(runner.comparison)) fail('неизвестное сравнение');
    if (runner.freshArray && runner.output.kind !== 'return') fail('freshArray требует возвращаемого массива');
    const indices = [...(runner.preserveArgs ?? []), ...(runner.output.kind === 'argument' ? [runner.output.index] : [])];
    for (const test of runner.cases) {
      if (!test.args.every(json) || !json(test.expected)) fail(`тест ${test.name} содержит не-JSON значения`);
      if (indices.some(index => !Number.isInteger(index) || index < 0 || index >= test.args.length)) fail('неверный индекс аргумента');
      if (runner.comparison !== 'exact' && !Array.isArray(test.expected)) fail('unordered требует массива');
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
  } else {
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
  }
}
