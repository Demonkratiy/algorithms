import type { FunctionCase } from '../types'

export const cases: FunctionCase[] = [
  { name: 'Пустая строка', args: [''], expected: true },
  { name: 'Все типы подряд', args: ['()[]{}'], expected: true },
  { name: 'Вложенные типы', args: ['{[()]}'], expected: true },
  { name: 'Неправильный тип', args: ['(]'], expected: false },
  { name: 'Пересечение', args: ['([)]'], expected: false },
  { name: 'Одна закрывающая', args: [']'], expected: false },
  { name: 'Незакрытые скобки', args: ['((('], expected: false },
  { name: 'Лишняя закрывающая', args: ['()]'], expected: false },
  { name: 'Закрытие до открытия', args: [')('], expected: false },
  { name: 'Глубокая вложенность', args: ['('.repeat(5000) + ')'.repeat(5000)], expected: true },
  { name: 'Ошибка в конце длинной строки', args: ['[]'.repeat(4999) + '[}'], expected: false },
]
