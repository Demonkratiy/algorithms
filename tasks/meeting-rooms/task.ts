import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const meetingRoomsTask: TaskDefinition = {
  id: 'meeting-rooms', title: 'Meeting Rooms I', starter,
  verificationNote: 'Только часть I: вернуть boolean. Касание встреч не является конфликтом; мутация входа допустима. Тесты не измеряют асимптотику.',
  complexity: {
    variables: 'N — число встреч. Считаем дополнительную память, не вход.',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'logarithmic', label: 'O(log N)' },
      { id: 'linear', label: 'O(N)' }, { id: 'linearithmic', label: 'O(N log N)' },
      { id: 'quadratic', label: 'O(N²)' }, { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linearithmic', explanation: 'Сортировка встреч по началу и проверка соседей: O(N log N).' },
      { id: 'space', title: 'Дополнительная память', expected: 'linear', accepted: ['logarithmic', 'constant'], explanation: 'Проход требует O(1), но JS sort может выделять O(N). Меньшие оценки требуют явно выбранной сортировки с соответствующей памятью; ECMAScript её не гарантирует.' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'canAttendMeetings', output: { kind: 'return' }, comparison: 'exact', cases },
}
