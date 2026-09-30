import { Component, useState, type ErrorInfo, type ReactNode } from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { topics } from '../../content/course';
import { CoursePage, NotFound, ReadPage, TopicPage } from '../pages/Learning';
import { PracticePage } from '../pages/Practice';
import { SettingsPage } from '../pages/Settings';
import { PreferencesProvider, usePreferences } from './preferences';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Ошибка интерфейса Algo', error, info); }
  render() {
    if (this.state.error) return <div className="content" role="alert"><h1>Не удалось открыть приложение</h1>
      <p>{this.state.error}</p><p>Сохранённые данные не удалены. Попробуй перезагрузить страницу.</p>
      <button className="button" onClick={() => location.reload()}>Перезагрузить</button></div>;
    return this.props.children;
  }
}
function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const { error } = usePreferences();
  const location = useLocation();
  const current = topics.find(t => location.pathname === `/topic/${t.id}` || t.tasks.some(task => location.pathname === `/task/${task.id}`));
  return <div className={`app-shell ${collapsed ? 'sidebar-hidden' : ''}`}>
    <aside className="sidebar" aria-label="Навигация по курсу">
      <Link className="logo" to="/"><span className="logo-mark">&lt;/&gt;</span>algo<span className="logo-dot">.</span></Link>
      <div className="sidebar-course">
        <span className="eyebrow">Твоё обучение</span>
        <NavLink className="nav-link" to="/" end>▤ Все темы</NavLink>
        {topics.map((topic, index) => <div key={topic.id}>
          {(index === 0 || topics[index - 1].section !== topic.section) && <div className="nav-section">{topic.section}</div>}
          <NavLink className={`nav-link topic-nav ${current?.id === topic.id ? 'current' : ''}`} to={`/topic/${topic.id}`}>
            <span className="topic-index">{String(index + 1).padStart(2, '0')}</span>{topic.title}
          </NavLink>
        </div>)}
      </div>
      <div className="sidebar-bottom"><NavLink className="nav-link" to="/settings">⚙ Настройки</NavLink>
        <p className="small muted">Без аккаунта. В твоём темпе.<br />Прогресс — в этом браузере.</p></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <div className="breadcrumb"><button className="icon-button" aria-label={collapsed ? 'Показать меню' : 'Скрыть меню'} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>☰</button>
          <Link to="/">Обучение</Link><span>/</span><span>{location.pathname === '/settings' ? 'Настройки' : current?.title ?? 'Твой маршрут'}</span></div>
        <span className="badge">Первая версия · JavaScript</span>
      </header>
      {error && <div role="alert" className="error global-error">{error}</div>}
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<CoursePage />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
          <Route path="/task/:taskId" element={<PracticePage />} />
          <Route path="/read/*" element={<ReadPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </main>
  </div>;
}
export default function App() {
  return <ErrorBoundary><HashRouter><PreferencesProvider><Shell /></PreferencesProvider></HashRouter></ErrorBoundary>;
}
