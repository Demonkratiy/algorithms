import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const promisePoolTask: TaskDefinition = {
  id: 'promise-pool',
  title: 'Promise Pool',
  starter,
  complexity: {
    variables: 'N — число задач, K = min(limit, N) — число воркеров. Считаем служебную работу успешного запуска всех задач, без сети, ожидания и вычислений самих tasks.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'workers', label: 'O(K)' },
      { id: 'linear', label: 'O(N)' },
      { id: 'quadratic', label: 'O(N²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Служебное время', expected: 'linear', explanation: 'Каждая задача запускается и её результат сохраняется один раз: O(N) для схемы воркеров.' },
      { id: 'space', title: 'Дополнительная память с результатом', expected: 'linear', explanation: 'Массив результатов O(N), воркеры и удерживаемые callbacks O(K). Итого O(N + K) = O(N), а не только O(limit). Состояние исходных операций не учитывается.' },
    ],
  },
  verificationNote: 'Вход — плотный конечный массив фабрик () => Promise; limit — положительное целое, в том числе больше N. Для limit ≤ 0 материал предлагает договориться: такие входы здесь не проверяются. Задачи стартуют лениво и заполняют свободные слоты; максимум K активных, результаты в порядке входа, пустой вход → []. Первая ошибка отклоняет пул без ожидания остальных. Отменять уже запущенное или запрещать все дальнейшие запуски после ошибки не требуется. Мутация массива отдельно не проверяется.',
  runner: { kind: 'scenario', entryPoint: 'promisePool', cases },
};
