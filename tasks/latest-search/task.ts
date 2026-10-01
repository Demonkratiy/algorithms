import starter from './starter.js?raw';
import { cases } from './cases';
import type { TaskDefinition } from '../types';

export const latestSearchTask: TaskDefinition = {
  id: 'latest-search',
  title: 'Latest Search — поиск без гонки запросов',
  starter,
  complexity: {
    variables: 'Q — длина query. Оцениваем один запрос и его URL; сеть и данные отдельно. Незавершённые операции могут накапливаться, если loadData игнорирует отмену.',
    options: [
      { id: 'constant', label: 'O(1)' },
      { id: 'query', label: 'O(Q)' },
      { id: 'quadratic', label: 'O(Q²)' },
      { id: 'unknown', label: 'Пока не знаю' },
    ],
    criteria: [
      { id: 'time', title: 'Служебное время на запрос', expected: 'query', explanation: 'Кодирование query длины Q требует O(Q), управление актуальностью — O(1), без времени loadData.' },
      { id: 'space', title: 'Память на запрос с URL', expected: 'query', explanation: 'URL занимает O(Q), состояние актуальности O(1). Это не верхняя граница памяти всех незавершённых операций.' },
    ],
  },
  verificationNote: 'Напиши search(query) в замыкании. Зависимости loadData(url, signal), render(results), showError(error) уже доступны. URL: "/api/search?q=" + encodeURIComponent(query). Новый вызов отменяет предыдущий запрос; только последний может обновлять UI, даже если loadData игнорирует signal. AbortError не отображается. Для каждого запроса нужен свежий контроллер. Сценарий получает новое замыкание.',
  runner: { kind: 'scenario', entryPoint: 'search', cases },
};
