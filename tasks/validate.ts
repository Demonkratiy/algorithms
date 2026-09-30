import type { JsonValue, TaskDefinition } from './types';

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
    if (!['exact', 'unordered', 'nested-unordered'].includes(runner.comparison)) fail('неизвестное сравнение');
    if (runner.freshArray && runner.output.kind !== 'return') fail('freshArray требует возвращаемого массива');
    const indices = [...(runner.preserveArgs ?? []), ...(runner.output.kind === 'argument' ? [runner.output.index] : [])];
    for (const test of runner.cases) {
      if (!test.args.every(json) || !json(test.expected)) fail(`тест ${test.name} содержит не-JSON значения`);
      if (indices.some(index => !Number.isInteger(index) || index < 0 || index >= test.args.length)) fail('неверный индекс аргумента');
      if (runner.comparison !== 'exact' && !Array.isArray(test.expected)) fail('unordered требует массива');
      if (runner.comparison === 'nested-unordered' && (!Array.isArray(test.expected) || !test.expected.every(Array.isArray))) fail('nested-unordered требует групп');
      if (runner.comparison === 'unordered' && Array.isArray(test.expected) && !test.expected.every(primitive)) fail('unordered поддерживает массив примитивов');
      if (runner.comparison === 'nested-unordered' && Array.isArray(test.expected)
        && !test.expected.every(group => Array.isArray(group) && group.every(primitive))) fail('nested-unordered поддерживает группы примитивов');
    }
  } else {
    for (const test of runner.cases) {
      if (!test.instances.length || !test.instances.every(args => args.every(json)) || !test.calls.length) fail('неполный тест класса');
      for (const call of test.calls) {
        if (!Number.isInteger(call.instance) || call.instance < 0 || call.instance >= test.instances.length
          || !identifier.test(call.method) || !call.args.every(json) || !json(call.expected)) fail('неверный вызов метода');
      }
    }
  }
}
