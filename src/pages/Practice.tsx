import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { topics, type CourseTask, type Topic } from '../../content/course';
import { getTaskDefinition, getQuizDefinition } from '../../tasks';
import type { TaskDefinition } from '../../tasks/types';
import { splitTaskMarkdown } from '../lib/content';
import type { RunResult } from '../lib/runner';
import { useTaskRecord } from '../features/progress/useTaskRecord';
import { readRecord, type Attempt } from '../lib/storage';
import { WorkspacePanels } from '../features/practice/WorkspacePanels';
import { ComplexityAssessment, ComplexityFeedback } from '../features/practice/ComplexityAssessment';
import type { ComplexitySnapshot } from '../features/practice/complexity';
import { Markdown, useMarkdown } from '../components/Markdown';
import { NotFound } from './Learning';
import { QuizPage } from './Quiz';
import { getTaskNumber } from '../lib/content/navigation';
import { TaskPriorityBadge } from '../components/TaskPriorityBadge';

const CodeEditor = lazy(() => import('../features/practice/CodeEditor'));
const statusNames: Record<RunResult['status'], string> = {
  passed: 'Тесты пройдены', failed: 'Ответ не совпал', error: 'Ошибка выполнения',
  timeout: 'Превышено время выполнения', cancelled: 'Запуск остановлен',
};
function explain(result: RunResult): string {
  if (result.status === 'timeout') return 'Проверь условие выхода из циклов. Лимит защищает вкладку от зависания, но не определяет Big O.';
  if (result.status === 'cancelled') return 'Проверка не завершена. Этот запуск не засчитывается.';
  switch (result.error?.name) {
    case 'SyntaxError': return 'JavaScript не смог разобрать код. Проверь скобки, кавычки и синтаксис рядом с указанным местом.';
    case 'ReferenceError': return 'Код обратился к имени, которое недоступно. Проверь объявление переменной, опечатки и область видимости.';
    case 'TypeError': return 'Операция не подходит для полученного значения. Проверь типы и случаи undefined / null.';
    default: return result.status === 'failed' ? 'Сравни вход, ожидание и результат. Прогони этот случай вручную, включая последнюю итерацию.' : '';
  }
}

function TaskReading({ task, topic }: { task: CourseTask; topic: Topic }) {
  const { text, error, loading } = useMarkdown(task.path);
  const [tab, setTab] = useState<'statement' | 'hints' | 'solution'>('statement');
  const [hintCount, setHintCount] = useState(0);
  const [reveal, setReveal] = useState(false);
  const sections = splitTaskMarkdown(text);
  return <article className="card problem">
    <div className="tabs" aria-label="Материалы задачи">
      <button className={tab === 'statement' ? 'selected' : ''} onClick={() => setTab('statement')}>Условие</button>
      <button className={tab === 'hints' ? 'selected' : ''} onClick={() => setTab('hints')}>Подсказки</button>
      <button className={tab === 'solution' ? 'selected' : ''} onClick={() => setTab('solution')}>Разбор</button>
    </div>
    <div className="problem-body">
      {loading && <p role="status">Загружаем условие…</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {!loading && !error && <>
        {tab === 'statement' && <Markdown text={sections.statement} path={task.path} />}
        {tab === 'hints' && <>
          <h2>По одному шагу</h2><p>Попробуй сначала сформулировать план своими словами.</p>
          {sections.hints.slice(0, hintCount).map((hint, i) => <Markdown key={i} text={hint} path={task.path} />)}
          {hintCount < sections.hints.length ? <button className="button" onClick={() => setHintCount(n => n + 1)}>Открыть подсказку {hintCount + 1}</button> : <p className="muted">Больше подсказок нет.</p>}
        </>}
        {tab === 'solution' && (reveal
          ? <Markdown text={sections.solution || 'Для этой задачи разбор ещё не добавлен.'} path={task.path} />
          : <div className="notice"><h2>Сначала своя попытка</h2><p>Разбор содержит готовое решение. Даже неудачная попытка полезнее преждевременного ответа.</p>
            <button className="button" onClick={() => setReveal(true)}>Показать разбор — я готов</button></div>)}
      </>}
      <Link className="back-link" to={`/topic/${topic.id}`}>← Вернуться к теории</Link>
    </div>
  </article>;
}

function Workspace({ task, topic, definition }: { task: CourseTask; topic: Topic; definition: TaskDefinition }) {
  const { record, ready, update, error: storageError, saving } = useTaskRecord(task.id, definition.starter);
  const [result, setResult] = useState<RunResult | null>(null);
  const [resultCode, setResultCode] = useState('');
  const [complexitySnapshot, setComplexitySnapshot] = useState<ComplexitySnapshot | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [copying, setCopying] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  const previousTaskId = task.previousTaskId;
  const abort = useRef<AbortController | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; abort.current?.abort(); }; }, []);
  async function copyPreviousCode(id: string) {
    setCopying(true); setError(''); setCopyNotice('');
    try {
      const previous = await readRecord(id);
      if (!alive.current) return;
      if (!previous) {
        setError('В прежней общей задаче пока нет сохранённого кода.');
        return;
      }
      if (!confirm('Заменить код этой задачи кодом из прежней общей задачи? История источника останется без изменений.')) return;
      update(current => ({ ...current, code: previous.code }));
      setResult(null); setComplexitySnapshot(null);
      setCopyNotice('Код скопирован. Эта часть проверяется отдельно; история прежних запусков осталась в исходной задаче.');
    } catch (e) {
      if (alive.current) setError(`Не удалось скопировать прежний код: ${String(e)}`);
    } finally {
      if (alive.current) setCopying(false);
    }
  }
  async function execute() {
    if (running) return;
    setError(''); setRunning(true); setResult(null); setComplexitySnapshot(null);
    const source = record.code;
    const selectedComplexity = { ...record.complexityChoices };
    const controller = new AbortController();
    abort.current = controller;
    try {
      const { runTask } = await import('../lib/runner');
      const report = await runTask(task.id, source, controller.signal);
      if (!alive.current) return;
      setResult(report); setResultCode(source);
      setComplexitySnapshot({ code: source, choices: selectedComplexity, status: report.status });
      const attempt: Attempt = { at: new Date().toISOString(), code: source, mode: 'check', status: report.status };
      update(previous => ({
        ...previous,
        solved: previous.solved || report.status === 'passed',
        attempts: [attempt, ...previous.attempts].slice(0, 5),
      }));
    } catch (e) {
      if (alive.current) setError(`Проверку не удалось выполнить: ${String(e)}`);
    } finally {
      if (alive.current) setRunning(false);
      abort.current = null;
    }
  }
  return <div className="workspace">
    <div className="page-heading">
      <div><div className="eyebrow">Задача {getTaskNumber(task.id)} · {topic.title}</div><h1>{task.title}</h1>
        <div className="badges"><TaskPriorityBadge priority={task.priority} /><span className="badge green">Кодинг</span>{record.solved && <span className="badge green">Есть успешная проверка</span>}</div></div>
      <span className="small muted">Код не отправляется на сервер</span>
    </div>
    {previousTaskId && <div className="notice small">
      Раньше эта часть входила в <Link to={`/task/${previousTaskId}`}>общую задачу</Link>. Старый код и история сохранены там.
      {' '}<button className="button small" disabled={!ready || running || copying}
        onClick={() => void copyPreviousCode(previousTaskId)}>{copying ? 'Загружаем код…' : 'Взять прежний код'}</button>
      {copyNotice && <p role="status">{copyNotice}</p>}
    </div>}
    {definition.verificationNote && <p className="notice small">{definition.verificationNote}</p>}
    {definition.runner.kind === 'scenario' && <p className="notice small">
      Сценарии используют виртуальные таймеры и имитацию сети. Ожидания не занимают реальное время; код и Promise выполняются в изолированном браузерном окружении.
    </p>}
    {storageError && <div className="error" role="alert">{storageError}<button className="button small" onClick={() => update(p => p)}>Повторить сохранение</button></div>}
    {error && <div role="alert" className="error">{error}</div>}
    <WorkspacePanels
      statement={<TaskReading task={task} topic={topic} />}
      editor={<section className="editor-panel" aria-label="Редактор решения">
          <div className="editor-toolbar"><span>solution.js <span className="muted">· JavaScript</span></span><span role="status">{!ready ? 'Загрузка…' : storageError ? 'Не сохранено' : saving ? 'Сохраняем…' : 'Сохранено в браузере'}</span></div>
          <div className="editor-workflow">
            <div className="editor-canvas">{ready ? <Suspense fallback={<div className="notice">Загружаем редактор…</div>}><CodeEditor taskId={task.id} code={record.code} onChange={code => {
              if (code.length > 100_000) { setError('Лимит кода — 100 000 символов. Сократи решение.'); return; }
              update(p => ({ ...p, code }));
            }} /></Suspense> : <div className="notice">Загружаем сохранённое решение…</div>}</div>
            <ComplexityAssessment definition={definition.complexity} choices={record.complexityChoices ?? {}}
              disabled={!ready} onChange={choices => update(p => ({ ...p, complexityChoices: choices }))}
              legacyTime={record.timeComplexity} legacySpace={record.spaceComplexity} />
          </div>
          <div className="editor-actions">
            <button className="button" disabled={!ready || running} onClick={() => {
              if (confirm('Заменить текущий код стартовым шаблоном? Последние запуски останутся в истории.')) {
                update(p => ({ ...p, code: definition.starter })); setResult(null);
              }
            }}>Сбросить</button>
            <div className="button-group">
              {running ? <button className="button danger" onClick={() => abort.current?.abort()}>Остановить</button>
                : <button className="button primary" disabled={!ready} onClick={() => void execute()}>Проверить решение</button>}
            </div>
          </div>
        </section>}
      results={<section className="results" aria-label="Результаты проверки" aria-live="polite">
          {running ? <p role="status">Проверяем решение на полном наборе тестов…</p> : !result ? <p className="muted">Нажми «Проверить решение», чтобы запустить все тесты. Результаты и вывод консоли появятся у каждого теста.</p> : <>
            <div className="result-heading"><strong className={result.status === 'passed' ? 'success-text' : 'error-text'}>{statusNames[result.status]}</strong><span className="muted small">{Math.round(result.durationMs)} мс · не оценка Big O</span></div>
            {record.code !== resultCode && <p className="notice small">Код изменён после запуска. Результаты относятся к предыдущей версии.</p>}
            {explain(result) && <p>{explain(result)}</p>}
            {result.error && <pre className="error">{result.error.name}: {result.error.message}{result.error.line ? `\nСтрока ${result.error.line}${result.error.column ? `:${result.error.column}` : ''}` : ''}</pre>}
            {result.status === 'error' && result.cases.length > 0 && <p className="small muted">После ошибки проверка остановлена. Ниже показаны запущенные тесты.</p>}
            {(result.status === 'timeout' || result.status === 'cancelled') && <p className="small muted">Запуск прерван до получения отчёта. Вывод консоли этого запуска недоступен.</p>}
            {result.logsTruncated && <p className="notice small">Вывод консоли ограничен для всего запуска: до 100 сообщений, 1 000 символов в сообщении и 20 000 суммарно. Часть вывода сокращена или пропущена.</p>}
            {result.logs.length > 0 && <details className="initialization-logs"><summary>Консоль до запуска тестов ({result.logs.length})</summary><pre>{result.logs.join('\n')}</pre></details>}
            <div className="case-list">{result.cases.map((test, index) => <details key={index} open={!test.passed}>
              <summary><span className={test.passed ? 'success-text' : 'error-text'}>{test.passed ? '✓' : '×'}</span> {test.name}</summary>
              <p className="small">Вход</p><pre>{test.input}</pre>
              <div className="comparison"><div><span>Ожидается</span><pre>{test.expected}</pre></div><div><span>Получено</span><pre>{test.actual}</pre></div></div>
              {test.error && <pre className="error">{test.error.name}: {test.error.message}</pre>}
              {test.feedback && <p className="notice small">{test.feedback}</p>}
              <details className="case-console"><summary>Консоль теста ({test.logs.length})</summary><pre>{test.logs.join('\n') || 'Нет сохранённых сообщений.'}</pre></details>
            </details>)}</div>
            {complexitySnapshot && <ComplexityFeedback definition={definition.complexity}
              code={record.code} choices={record.complexityChoices ?? {}} snapshot={complexitySnapshot} />}
          </>}
        </section>}
    />
    <div className="practice-notes">
        <details className="card assessment"><summary>Последние запуски ({record.attempts.length}/5)</summary>
          <p className="small muted">Сохраняются снимки кода последних пяти запусков.</p>
          {record.attempts.map((attempt, i) => <div className="attempt" key={`${attempt.at}-${i}`}>
            <span>{new Date(attempt.at).toLocaleString('ru')} · {attempt.mode === 'check' ? 'Проверка' : 'Примеры (старый запуск)'} · {statusNames[attempt.status]}</span>
            <button className="button small" disabled={running} onClick={() => {
              if (confirm('Заменить текущий код этой версией?')) { update(p => ({ ...p, code: attempt.code })); setResult(null); }
            }}>Восстановить код</button>
          </div>)}
        </details>
    </div>
  </div>;
}
export function PracticePage() {
  const { taskId } = useParams();
  const topic = topics.find(t => t.tasks.some(task => task.id === taskId));
  const task = topic?.tasks.find(t => t.id === taskId);
  if (!topic || !task) return <NotFound />;
  const quiz = getQuizDefinition(task.id);
  if (quiz) return <QuizPage key={task.id} task={task} topic={topic} definition={quiz} />;
  const definition = getTaskDefinition(task.id);
  return definition ? <Workspace key={task.id} task={task} topic={topic} definition={definition} /> : <div className="content">
    <div className="notice">Проверка этой задачи ещё не подключена. Условие, подсказки и доступный разбор можно читать уже сейчас.</div>
    <TaskReading key={task.id} task={task} topic={topic} />
  </div>;
}
