import { Link, useParams } from 'react-router-dom';
import { topics, type Topic } from '../../content/course';
import { Markdown, useMarkdown } from '../components/Markdown';

export function CoursePage() {
  return <div className="content">
    <div className="eyebrow">Твой маршрут</div>
    <h1>Учимся решать, а не запоминать</h1>
    <p className="lede">Теория, осознанная практика и проверка на JavaScript. По одному паттерну за раз.</p>
    <div className="notice">Задач с автоматической проверкой: {topics.flatMap(topic => topic.tasks).filter(task => task.runnable).length}. Они отмечены в разделах курса; остальные доступны для чтения.</div>
    <Link className="button" to="/read/00-how-to-solve.md">Начать с UMPIRE →</Link>
    <div className="course-grid">{topics.map((topic, index) => <Link className="card topic-card" key={topic.id} to={`/topic/${topic.id}`}>
      <span className="eyebrow">{String(index + 1).padStart(2, '0')} / {topic.section}</span>
      <h2>{topic.title}</h2><span className="muted">{topic.tasks.length ? `${topic.tasks.length} задач` : 'Базовые концепции'} →</span>
    </Link>)}</div>
  </div>;
}

function TopicView({ topic }: { topic: Topic }) {
  const { text, error, loading } = useMarkdown(topic.theoryPath);
  return <div className="content">
    <div className="eyebrow">{topic.section}</div><h1>{topic.title}</h1>
    <div className="reading-layout">
      <article className="card article">
        {loading && <p role="status">Загружаем теорию…</p>}
        {error && <p role="alert" className="error">{error}</p>}
        {!loading && !error && <Markdown text={text} path={topic.theoryPath} />}
      </article>
      <aside className="card reading-aside">
        <h2>Закрепи на практике</h2>
        <p className="muted small">Сначала своя попытка, затем подсказки и разбор.</p>
        {topic.tasks.map(task => <Link className="task-link" key={task.id} to={`/task/${task.id}`}>
          <strong>{task.title}</strong>
          <span className={`badge ${task.runnable ? 'green' : ''}`}>{task.runnable ? 'Проверка в браузере' : 'Материал'}</span>
        </Link>)}
        {!topic.tasks.length && <p className="muted">Мини-опрос находится в конце заметки.</p>}
        <Link to="/">← Все темы</Link>
      </aside>
    </div>
  </div>;
}
export function TopicPage() {
  const { topicId } = useParams();
  const topic = topics.find(t => t.id === topicId);
  return topic ? <TopicView key={topic.id} topic={topic} /> : <NotFound />;
}
export function ReadPage() {
  const params = useParams();
  const path = params['*'] || 'README.md';
  const { text, error, loading } = useMarkdown(path);
  return <div className="content"><article className="card article">
    <Link to="/">← К курсу</Link>
    {loading ? <p>Загружаем материал…</p> : error ? <p role="alert" className="error">{error}</p> : <Markdown text={text} path={path} />}
  </article></div>;
}
export function NotFound() {
  return <div className="content"><h1>Страница не найдена</h1><Link to="/">Вернуться к курсу</Link></div>;
}
