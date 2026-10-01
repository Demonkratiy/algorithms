import { Component, useState, type ErrorInfo, type ReactNode } from 'react';
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { CoursePage, NotFound, ReadPage, SectionPage, TopicPage } from '../pages/Learning';
import { PracticePage } from '../pages/Practice';
import { SettingsPage } from '../pages/Settings';
import { PreferencesProvider, usePreferences } from './preferences';
import { CourseSidebar } from '../components/CourseSidebar';
import { findCourseLocation } from '../lib/content/navigation';

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
  const current = findCourseLocation(location.pathname);
  return <div className={`app-shell ${collapsed ? 'sidebar-hidden' : ''}`}>
    <CourseSidebar visible={!collapsed} />
    <main className="main">
      <header className="topbar">
        <div className="breadcrumb"><button className="icon-button" aria-label={collapsed ? 'Показать меню' : 'Скрыть меню'} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>☰</button>
          <Link to="/">Обучение</Link><span>/</span>
          {current?.topic && <><Link to={`/section/${current.section.id}`}>{current.section.number} · {current.section.title}</Link><span>/</span></>}
          <span>{location.pathname === '/settings' ? 'Настройки' : current ? `${current.number} · ${current.topic?.title ?? current.section.title}` : 'Твой маршрут'}</span></div>
        <span className="badge">Первая версия · JavaScript</span>
      </header>
      {error && <div role="alert" className="error global-error">{error}</div>}
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<CoursePage />} />
          <Route path="/section/:sectionId" element={<SectionPage />} />
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
