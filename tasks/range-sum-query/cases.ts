export interface RangeSumCase {
  name: string
  instances: number[][]
  calls: { instance: number; left: number; right: number; expected: number }[]
}

const examples: RangeSumCase[] = [
  {
    name: 'Пример из условия',
    instances: [[-2, 0, 3, -5, 2, -1]],
    calls: [
      { instance: 0, left: 0, right: 2, expected: 1 },
      { instance: 0, left: 2, right: 5, expected: -1 },
      { instance: 0, left: 0, right: 5, expected: -3 },
    ],
  },
  {
    name: 'Один элемент',
    instances: [[7]],
    calls: [{ instance: 0, left: 0, right: 0, expected: 7 }],
  },
]

const checks: RangeSumCase[] = [
  {
    name: 'Отрицательные числа и границы',
    instances: [[-8, -3, -6, -2]],
    calls: [
      { instance: 0, left: 0, right: 0, expected: -8 },
      { instance: 0, left: 3, right: 3, expected: -2 },
      { instance: 0, left: 0, right: 3, expected: -19 },
      { instance: 0, left: 1, right: 2, expected: -9 },
    ],
  },
  {
    name: 'Все нули',
    instances: [[0, 0, 0, 0]],
    calls: [
      { instance: 0, left: 0, right: 3, expected: 0 },
      { instance: 0, left: 1, right: 1, expected: 0 },
      { instance: 0, left: 2, right: 3, expected: 0 },
    ],
  },
  {
    name: 'Независимые экземпляры и повторные вызовы',
    instances: [[4, -1, 6, 2, -3], [-10, 20], [0]],
    calls: [
      { instance: 0, left: 1, right: 3, expected: 7 },
      { instance: 1, left: 0, right: 1, expected: 10 },
      { instance: 0, left: 0, right: 4, expected: 8 },
      { instance: 2, left: 0, right: 0, expected: 0 },
      { instance: 1, left: 1, right: 1, expected: 20 },
      { instance: 0, left: 1, right: 3, expected: 7 },
      { instance: 0, left: 4, right: 4, expected: -3 },
    ],
  },
  {
    name: 'Максимальные допустимые длина и значения',
    instances: [Array<number>(10_000).fill(100_000)],
    calls: [
      { instance: 0, left: 0, right: 9999, expected: 1_000_000_000 },
      { instance: 0, left: 0, right: 0, expected: 100_000 },
      { instance: 0, left: 9999, right: 9999, expected: 100_000 },
      { instance: 0, left: 1, right: 9998, expected: 999_800_000 },
    ],
  },
]

export function getRangeSumCases(): RangeSumCase[] {
  return structuredClone([...examples, ...checks])
}
