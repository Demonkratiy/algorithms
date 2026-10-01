import { useLayoutEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { topics, type Topic } from '../../content/course';
import { Markdown, useMarkdown } from '../components/Markdown';
import { courseSections, findCourseLocation, getTaskNumber, type CourseSection } from '../lib/content/navigation';
import { TaskPriorityBadge } from '../components/TaskPriorityBadge';

function usePageStart() {
  const { key } = useLocation();
  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return () => { window.history.scrollRestoration = previousRestoration; };
  }, [key]);
}

export function WelcomePage() {
  usePageStart();
  return <div className="content welcome-page">
    <section className="welcome-hero" aria-labelledby="welcome-title">
      <div className="eyebrow">Algo · Тренажёр для технических интервью</div>
      <h1 id="welcome-title">Учимся решать, а не запоминать</h1>
      <p className="lede">Алгоритмы становятся понятнее, когда видишь за задачами общие приёмы.
        Здесь ты изучаешь один паттерн, пробуешь его на JavaScript и постепенно учишься
        выбирать подход самостоятельно.</p>
      <p>Не гонка за количеством задач и не олимпиадное программирование. Цель — уверенно
        объяснять ход мысли, писать корректный код и оценивать его время и память:
        на собеседовании и в повседневной разработке.</p>
      <div className="button-group">
        <Link className="button primary" to="/section/01-basics">Начать с основ</Link>
        <Link className="button" to="/topics">Все темы</Link>
      </div>
      <p className="small muted welcome-caption">Разделов: {courseSections.length} · Тем: {topics.length} · Заданий: {topics.reduce((count, topic) => count + topic.tasks.length, 0)} · Без аккаунта</p>
    </section>

    <section className="welcome-section" aria-labelledby="welcome-workflow">
      <h2 id="welcome-workflow">Как заниматься</h2>
      <ol className="welcome-steps">
        <li className="card"><h3>Разберись в идее</h3><p>Начни с обзора раздела, затем прочитай теорию темы.
          Важно понять, когда подход применим и почему работает, а не выучить шаблон кода.</p></li>
        <li className="card"><h3>Сделай свою попытку</h3><p>Уточни условие, придумай примеры и опиши план.
          Затем напиши решение в редакторе. Сначала допустим простой, даже медленный вариант.</p></li>
        <li className="card"><h3>Проверь и объясни</h3><p>Запусти тесты, изучи ошибки и пройди код вручную.
          Укажи сложность по времени и памяти. Прохождение тестов — полезная проверка,
          но не доказательство корректности для любого входа.</p></li>
        <li className="card"><h3>Закрепи понимание</h3><p>После попытки сравни подход с разбором.
          Закрой его и попробуй воспроизвести идею самостоятельно. Затем реши другую
          задачу того же паттерна и ответь на вопросы в конце темы.</p></li>
      </ol>
      <p>Нужен план разбора незнакомой задачи? <Link to="/read/00-how-to-solve.md">Изучи фреймворк UMPIRE →</Link></p>
    </section>

    <div className="welcome-grid">
      <section className="card welcome-section" aria-labelledby="welcome-habits">
        <h2 id="welcome-habits">Привычки, которые помогают</h2>
        <ul>
          <li>Иди по одному паттерну. Сначала основные задачи, дополнительные — для углубления. Доступ к темам свободный.</li>
          <li>Перед кодом проверь границы: пустой вход, один элемент, дубликаты. Не добавляй ограничения, которых нет в условии.</li>
          <li>Застрял — возьми одну подсказку и снова попробуй сам. Разбор полезнее после собственной попытки, чем вместо неё.</li>
          <li>Трассируй последнюю итерацию цикла и объясняй, что остаётся верным на каждом шаге.</li>
          <li>Возвращайся к задачам через несколько дней. Умение объяснить решение без подсматривания важнее отметки об успехе.</li>
        </ul>
      </section>
      <section className="card welcome-section" aria-labelledby="welcome-checking">
        <h2 id="welcome-checking">Что проверяет приложение</h2>
        <p><strong>Кодинг:</strong> твой JavaScript действительно выполняется локально.
          Тесты сравнивают результат с ожиданиями, показывают ошибки и вывод консоли.
          Код решения не отправляется на сервер; ИИ в проверке не участвует.</p>
        <p><strong>Оценка сложности:</strong> приложение сопоставляет выбранные ответы с целью
          задачи после успешных тестов, но не вычисляет сложность твоего кода автоматически.
          Обоснование остаётся за тобой.</p>
        <p><strong>Мини-тесты:</strong> отдельный формат для Event Loop.
          Проверяются выбранные ответы, а свободные пояснения нужны для самопроверки.</p>
      </section>
    </div>

    <section className="notice welcome-storage" aria-labelledby="welcome-storage">
      <h2 id="welcome-storage">Твой прогресс — в этом браузере</h2>
      <p>Черновики и последние попытки сохраняются локально, без аккаунта и синхронизации
        между устройствами. Очистка данных сайта может удалить прогресс; в другом браузере
        он не появится сам.</p>
      <p>Периодически <Link to="/settings">экспортируй резервную копию в настройках</Link>.
        Её можно импортировать для переноса или восстановления работы.</p>
    </section>
  </div>;
}

export function CoursePage() {
  usePageStart();
  return <div className="content">
    <div className="eyebrow">Твой маршрут</div>
    <h1>Все темы</h1>
    <p className="lede">Теория, осознанная практика и проверка на JavaScript. По одному паттерну за раз.</p>
    <div className="notice">Заданий с проверкой: {topics.flatMap(topic => topic.tasks).filter(task => task.runnable).length}. Практика кода и мини-тесты отмечены в разделах курса.</div>
    <p className="small muted">Номера показывают место в теме. Сначала проходи основные задачи, дополнительные можно отложить. Доступ к заданиям свободный.</p>
    <Link className="button" to="/read/00-how-to-solve.md">Начать с UMPIRE →</Link>
    <div className="course-sections">{courseSections.map(section => <section className="course-section" key={section.id} aria-labelledby={`course-section-${section.id}`}>
      <header className="course-section-heading">
        <span className="course-section-number" aria-hidden="true">{section.number}</span>
        <h2 id={`course-section-${section.id}`}><Link to={`/section/${section.id}`}>{section.title}</Link></h2>
      </header>
      <div className="course-grid">{section.topics.map(({ topic, number }) => <Link className="card topic-card" key={topic.id} to={`/topic/${topic.id}`}>
        <span className="eyebrow">Тема {number}</span>
        <h3>{topic.title}</h3><span className="muted">{topic.tasks.length ? `Заданий: ${topic.tasks.length}` : 'Базовые концепции'} →</span>
      </Link>)}</div>
    </section>)}</div>
  </div>;
}

function SectionView({ section }: { section: CourseSection }) {
  const { text, error, loading } = useMarkdown(section.overviewPath);
  return <div className="content section-page">
    <div className="eyebrow">Раздел {section.number} · Обзор</div><h1>{section.title}</h1>
    <div className="reading-layout">
      <article className="card article">
        {loading && <p role="status">Загружаем обзор…</p>}
        {error && <p role="alert" className="error">{error}</p>}
        {!loading && !error && <Markdown text={text} path={section.overviewPath} />}
      </article>
      <aside className="card reading-aside" aria-label="Темы раздела">
        <h2>Маршрут раздела</h2>
        <p className="muted small">Изучай темы по порядку: теория, своя попытка, разбор.</p>
        <Link className="button primary" to={`/topic/${section.topics[0].topic.id}`}>Начать первую тему →</Link>
        {section.topics.map(({ topic, number }) => <Link className="task-link" key={topic.id} to={`/topic/${topic.id}`}>
          <strong>{number} {topic.title}</strong>
          <span className="small muted">{topic.tasks.length ? `Заданий: ${topic.tasks.length}` : 'Базовые концепции'}</span>
        </Link>)}
        <Link to="/topics">← Все темы</Link>
      </aside>
    </div>
  </div>;
}

export function SectionPage() {
  const { sectionId } = useParams();
  const section = courseSections.find(entry => entry.id === sectionId);
  return section ? <SectionView key={section.id} section={section} /> : <NotFound />;
}

function TopicView({ topic }: { topic: Topic }) {
  const { text, error, loading } = useMarkdown(topic.theoryPath);
  const location = findCourseLocation(`/topic/${topic.id}`);
  return <div className="content">
    <div className="eyebrow">{location ? `${location.number} · ${location.section.title}` : topic.section}</div><h1>{topic.title}</h1>
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
          <strong><span className="task-index">{getTaskNumber(task.id)}</span> {task.title}</strong>
          <span className="badges"><TaskPriorityBadge priority={task.priority} />
            <span className={`badge ${task.runnable ? 'green' : ''}`}>{task.activity === 'quiz' ? 'Мини-тест' : task.runnable ? 'Кодинг' : 'Материал'}</span>
          </span>
        </Link>)}
        {!topic.tasks.length && <p className="muted">Мини-опрос находится в конце заметки.</p>}
        <Link to="/topics">← Все темы</Link>
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
    <Link to="/topics">← К курсу</Link>
    {loading ? <p>Загружаем материал…</p> : error ? <p role="alert" className="error">{error}</p> : <Markdown text={text} path={path} />}
  </article></div>;
}
export function NotFound() {
  return <div className="content"><h1>Страница не найдена</h1><Link to="/topics">Вернуться к курсу</Link></div>;
}
