import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CourseTask, Topic } from '../../content/course';
import type { QuizDefinition } from '../../tasks/quiz-types';
import { useMarkdown } from '../components/Markdown';
import { useTaskRecord } from '../features/progress/useTaskRecord';
import { QuizQuestion } from '../features/quiz/QuizQuestion';
import { parseQuizMarkdown } from '../features/quiz/content';
import { assessQuiz, isQuizSnapshotCurrent, quizSnapshot, type QuizSnapshot } from '../features/quiz/assessment';
import type { Attempt } from '../lib/storage';
import '../features/quiz/quiz.css';

export function QuizPage(props: { task: CourseTask; topic: Topic; definition: QuizDefinition }) {
  return <QuizWorkspace key={props.task.id} {...props} />;
}

function QuizWorkspace({ task, topic, definition }: { task: CourseTask; topic: Topic; definition: QuizDefinition }) {
  const { text, loading, error: contentError } = useMarkdown(task.path);
  const { record, ready, update, error: storageError, saving } = useTaskRecord(task.id, '');
  const [snapshot, setSnapshot] = useState<QuizSnapshot | null>(null);
  const [restored, setRestored] = useState(false);
  const [storageLoaded, setStorageLoaded] = useState(false);
  useEffect(() => {
    if (ready && !storageError) setStorageLoaded(true);
  }, [ready, storageError]);
  const material = useMemo(() => {
    if (!text) return { questions: [], error: '' };
    try { return { questions: parseQuizMarkdown(text, definition), error: '' }; }
    catch (error) { return { questions: [], error: `Материал квиза не удалось разобрать: ${String(error)}` }; }
  }, [text, definition]);
  const answers = record.quizAnswers ?? {};
  const explanations = record.quizExplanations ?? {};
  const current = snapshot && isQuizSnapshotCurrent(definition, snapshot, answers, explanations);
  const assessment = snapshot && assessQuiz(definition, snapshot.answers);
  const available = storageLoaded && !loading && !contentError && !material.error && material.questions.length > 0;

  function check() {
    if (!available) return;
    const next = quizSnapshot(definition, answers, explanations);
    const { passed } = assessQuiz(definition, next.answers);
    const attempt: Attempt = {
      at: new Date().toISOString(), code: '', mode: 'check', status: passed ? 'passed' : 'failed',
      quizAnswers: next.answers, quizExplanations: next.explanations,
    };
    setSnapshot(next); setRestored(false);
    update(previous => ({ ...previous, solved: previous.solved || passed, attempts: [attempt, ...previous.attempts].slice(0, 5) }));
  }

  function restore(attempt: Attempt) {
    if (!attempt.quizAnswers || !confirm('Восстановить ответы и объяснения этой попытки вместо текущих? Прежние заметки и история сохранятся.')) return;
    update(previous => ({
      ...previous, quizAnswers: { ...attempt.quizAnswers }, quizExplanations: { ...attempt.quizExplanations },
    }));
    setSnapshot(null); setRestored(true);
  }

  return <div className="content quiz-page">
    <Link className="back-link" to={`/topic/${topic.id}`}>← {topic.title}</Link>
    <p className="eyebrow">Квиз · без запуска кода</p>
    <h1>{definition.title}</h1>
    <p className="lede">{task.id === 'output-order'
      ? 'Предскажи полный порядок вывода. Стрелки разделяют отдельные строки console.log.'
      : 'Выбери точное объяснение поведения и способ исправления. Не каждый сниппет содержит функциональный баг.'}</p>
    <p>Сначала рассуждай самостоятельно. Разбор появится только после «Проверить ответы» и только для заполненных вопросов.
      Свои объяснения необязательны и не оцениваются автоматически.</p>
    <p className="quiz-storage" role="status">{!ready ? 'Загружаем сохранённые ответы…'
      : storageError ? 'Ответы пока не сохранены.' : saving ? 'Сохраняем…' : 'Сохранено в браузере'}</p>
    {storageError && <div className="error" role="alert">
      <p>Не удалось сохранить или загрузить ответы. Не закрывай страницу до успешного сохранения. {storageError}</p>
      {storageLoaded
        ? <button className="button" onClick={() => update(previous => previous)} disabled={saving}>Повторить сохранение</button>
        : <><p>Редактирование отключено, чтобы не перезаписать прежние данные, которые не удалось прочитать.</p>
          <button className="button" onClick={() => location.reload()}>Повторить загрузку</button></>}
    </div>}
    {record.solved && <p className="notice">Ранее задача была отмечена решённой. Это история прогресса, а не оценка текущих ответов.</p>}
    {(record.code || record.timeComplexity || record.spaceComplexity) && <details className="card quiz-legacy">
      <summary>Прежние заметки (только чтение)</summary>
      {record.code && <pre>{record.code}</pre>}
      {record.timeComplexity && <p>Прежняя оценка времени: {record.timeComplexity}</p>}
      {record.spaceComplexity && <p>Прежняя оценка памяти: {record.spaceComplexity}</p>}
    </details>}
    {loading && <p role="status">Загружаем сниппеты…</p>}
    {(contentError || material.error) && <p className="error" role="alert">{contentError || material.error}</p>}
    {available && <>
      {material.questions.map(content => {
        const question = definition.questions.find(item => item.id === content.id)!;
        return <QuizQuestion key={content.id} question={question} content={content} path={task.path}
          answer={answers[question.id] ?? ''} explanation={explanations[question.id] ?? ''}
          checkedAnswer={current ? snapshot?.answers[question.id] : undefined}
          onAnswer={value => update(previous => {
            const next = { ...previous.quizAnswers };
            if (value) next[question.id] = value;
            else delete next[question.id];
            return { ...previous, quizAnswers: next };
          })}
          onExplanation={value => update(previous => ({
            ...previous, quizExplanations: { ...previous.quizExplanations, [question.id]: value },
          }))} />;
      })}
      <div className="card quiz-check">
        <button className="button primary" onClick={check}>Проверить ответы</button>
        {restored && <p role="status">Ответы восстановлены. Проверь их заново; прежняя попытка не оценивает текущий черновик.</p>}
        {snapshot && assessment && <div role="region" aria-label="Результат квиза" aria-live="polite">
          {!current ? <p className="notice">Проверка устарела: ответы или объяснения изменены. Нажми «Проверить ответы» снова.</p>
            : <>
              <p className={assessment.passed ? 'success-text' : ''}>
                {assessment.passed ? 'Все ответы верны.' : assessment.answered < definition.questions.length
                  ? 'Попытка не завершена: остались вопросы без ответа.' : 'Есть ошибки: сравни рассуждение с разбором.'}
              </p>
              <p>Заполнено: {assessment.answered} из {definition.questions.length}. Верно: {assessment.correct} из {definition.questions.length}.</p>
              <p className="muted">Проверены только выбранные варианты. Объяснения не оценивались.</p>
            </>}
        </div>}
      </div>
    </>}
    {ready && record.attempts.length > 0 && <section className="card quiz-history" aria-label="История попыток">
      <h2>Последние попытки</h2>
      <p className="muted">До пяти проверок. Восстановление заменяет только ответы и объяснения, без автоматической проверки.</p>
      <ol>{record.attempts.map((attempt, index) => <li key={`${attempt.at}-${index}`}>
        <span>{new Date(attempt.at).toLocaleString('ru-RU')} — {attempt.quizAnswers
          ? attempt.status === 'passed' ? 'Все варианты совпали' : 'Не все ответы верны или заполнены'
          : 'Прежняя попытка (не квиз)'}</span>
        {attempt.quizAnswers && <button className="button small" disabled={!available}
          onClick={() => restore(attempt)}>Восстановить попытку {index + 1}</button>}
      </li>)}</ol>
    </section>}
  </div>;
}
