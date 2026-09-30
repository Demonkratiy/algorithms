import type { QuizDefinition } from '../quiz-types';

export const outputOrderQuiz: QuizDefinition = {
  id: 'output-order',
  title: '«Что выведется?» — порядок выполнения',
  questions: [
    {
      id: 'snippet-1',
      options: [
        { id: 'a', label: 'start → promise → end → timeout' },
        { id: 'b', label: 'start → end → promise → timeout' },
        { id: 'c', label: 'start → end → timeout → promise' },
      ],
      answerId: 'b',
    },
    {
      id: 'snippet-2',
      options: [
        { id: 'a', label: 'A → B → C → D' },
        { id: 'b', label: 'C → D → A → B' },
        { id: 'c', label: 'A → C → B → D' },
      ],
      answerId: 'c',
    },
    {
      id: 'snippet-3',
      options: [
        { id: 'a', label: 'script start → foo start → bar → executor → script end → foo end → then → timeout' },
        { id: 'b', label: 'script start → foo start → bar → foo end → executor → script end → then → timeout' },
        { id: 'c', label: 'script start → foo start → bar → executor → script end → then → foo end → timeout' },
        { id: 'd', label: 'script start → executor → script end → foo start → bar → foo end → then → timeout' },
      ],
      answerId: 'a',
    },
    {
      id: 'snippet-4',
      options: [
        { id: 'a', label: 'p0 → t1 → t2 → p1 → p2' },
        { id: 'b', label: 't1 → p1 → t2 → p2 → p0' },
        { id: 'c', label: 'p0 → t1 → p1 → t2 → p2' },
      ],
      answerId: 'c',
    },
    {
      id: 'snippet-5',
      options: [
        { id: 'a', label: 'sync → micro 1 → micro 2 → loop 1 → loop 2 → loop 3' },
        { id: 'b', label: 'sync → loop 1 → micro 1 → micro 2 → loop 2 → loop 3' },
        { id: 'c', label: 'sync → loop 1 → loop 2 → loop 3 → micro 1 → micro 2' },
        { id: 'd', label: 'loop 1 → sync → micro 1 → micro 2 → loop 2 → loop 3' },
      ],
      answerId: 'b',
    },
    {
      id: 'snippet-6',
      options: [
        { id: 'a', label: '1 → 6 → 3 → 4 → 5' },
        { id: 'b', label: '1 → 6 → 2 → 4 → 5' },
        { id: 'c', label: '1 → 3 → 4 → 5 → 6' },
        { id: 'd', label: '1 → 6 → 3 → 5 → 4' },
      ],
      answerId: 'a',
    },
  ],
};
