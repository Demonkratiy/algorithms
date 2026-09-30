import type { FunctionCase } from '../types';

export const cases: FunctionCase[] = [
  { name: 'Пустое дерево', args: [[]], expected: 0 },
  { name: 'Без replies', args: [[{ id: 1 }]], expected: 1 },
  { name: 'Пустые replies', args: [[{ id: 1, replies: [] }]], expected: 1 },
  { name: 'Null replies', args: [[{ id: 1, replies: null }]], expected: 1 },
  { name: 'Несколько корней', args: [[{ id: 1 }, { id: 2, replies: [] }, { id: 3, replies: null }]], expected: 3 },
  { name: 'Ветвление из примера', args: [[{ id: 1, replies: [{ id: 2, replies: [] }, { id: 3, replies: [{ id: 4, replies: [] }] }] }, { id: 5 }]], expected: 5 },
  { name: 'Глубокая цепочка', args: [[{ replies: [{ replies: [{ replies: [{ replies: [{ replies: null }] }] }] }] }]], expected: 5 },
  { name: 'Повторяющиеся id не сливают узлы', args: [[{ id: 0, replies: [{ id: 0 }, { id: 0 }] }, { id: 0 }]], expected: 4 },
  { name: 'Другие вложенные поля не являются replies', args: [[{ id: 1, data: { comments: [{ id: 99 }] }, replies: [{ id: 2, replies: null }] }]], expected: 2 },
];
