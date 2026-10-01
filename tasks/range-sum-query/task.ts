import starter from './starter.js?raw'
import type { ComplexityDefinition, TaskDefinition } from '../types'
import { getRangeSumCases } from './cases'

const complexity = {
  variables: 'N — число элементов исходного массива. Память — дополнительная, без учёта входного массива.',
  options: [
    { id: 'constant', label: 'O(1)' },
    { id: 'logarithmic', label: 'O(log N)' },
    { id: 'linear', label: 'O(N)' },
    { id: 'linearithmic', label: 'O(N log N)' },
    { id: 'quadratic', label: 'O(N²)' },
    { id: 'unknown', label: 'Пока не знаю' },
  ],
  criteria: [
    {
      id: 'build-time', title: 'Подготовка — время',
      expected: 'linear',
      explanation: 'Цель — подготовить данные за один проход по N элементам, без вложенного полного обхода.',
    },
    {
      id: 'build-space', title: 'Подготовка — память',
      expected: 'linear',
      explanation: 'В целевом подходе храним накопленные данные, количество которых растёт пропорционально N.',
    },
    {
      id: 'query-time', title: 'Один запрос — время',
      expected: 'constant',
      explanation: 'Цель — фиксированное число операций на запрос, независимо от длины диапазона и N.',
    },
    {
      id: 'query-space', title: 'Один запрос — память',
      expected: 'constant',
      explanation: 'Учитывается дополнительная память самого запроса. Подготовленная структура уже учтена отдельно.',
    },
  ],
} satisfies ComplexityDefinition

export const rangeSumTask: TaskDefinition = {
  id: 'range-sum-query',
  title: 'Range Sum Query — Immutable',
  starter,
  complexity,
  runner: {
    kind: 'class',
    entryPoint: 'NumArray',
    cases: getRangeSumCases().map(test => ({
      name: test.name,
      instances: test.instances.map(nums => [nums]),
      calls: test.calls.map(call => ({
        instance: call.instance, method: 'sumRange',
        args: [call.left, call.right], expected: call.expected,
      })),
    })),
  },
}
