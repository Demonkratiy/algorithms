import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const meetingRoomsIITask: TaskDefinition = {
  id: 'meeting-rooms-ii', title: 'Meeting Rooms II', starter,
  verificationNote: 'Часть II: минимальное число комнат, а не boolean или число попарных пересечений. Сложность алгоритма не доказывается выходными тестами.',
  complexity: {
    variables: 'N — число встреч; выход — одно число, O(1).',
    options: [
      { id: 'constant', label: 'O(1)' }, { id: 'linear', label: 'O(N)' },
      { id: 'linearithmic', label: 'O(N log N)' }, { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Время', expected: 'linearithmic', explanation: 'Сортировка событий или сортировка встреч с heap: O(N log N).' },
      { id: 'space', title: 'Дополнительная память', expected: 'linear', explanation: 'Массивы начал/концов либо heap содержат до N элементов. Рабочая память JS sort также может быть O(N).' },
    ],
  },
  runner: { kind: 'function', entryPoint: 'minMeetingRooms', output: { kind: 'return' }, comparison: 'exact', cases },
}
