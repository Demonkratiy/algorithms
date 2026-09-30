import starter from './starter.js?raw'
import { cases } from './cases'
import type { TaskDefinition } from '../types'

export const minStackTask: TaskDefinition = {
  id: 'min-stack',
  title: 'Min Stack',
  starter,
  complexity: {
    variables: 'N — число хранимых элементов. Считаем операции абстрактного стека O(1); для динамического массива JS push — амортизированно O(1).',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'push-time', title: 'push — время', expected: 'constant', explanation: 'Фиксированное число операций стека, без обхода: O(1). При реализации на массиве учитываем амортизированную стоимость его push.' },
      { id: 'pop-time', title: 'pop — время', expected: 'constant', explanation: 'Удаление и восстановление минимума не требуют обхода: O(1) в модели стека.' },
      { id: 'top-time', title: 'top — время', expected: 'constant', explanation: 'Чтение вершины без удаления: O(1).' },
      { id: 'min-time', title: 'getMin — время', expected: 'constant', explanation: 'Минимум уже сохранён: O(1), не O(N) на повторный поиск.' },
      { id: 'space', title: 'Память структуры', expected: 'linear', explanation: 'Значения и информация для восстановления минимумов занимают O(N).' },
    ],
  },
  runner: { kind: 'class', entryPoint: 'MinStack', cases },
}
