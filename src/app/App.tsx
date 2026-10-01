import { Component, useState, type CSSProperties, type ErrorInfo, type ReactNode } from 'react';
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { CoursePage, NotFound, ReadPage, SectionPage, TopicPage, WelcomePage } from '../pages/Learning';
import { PracticePage } from '../pages/Practice';
import { SettingsPage } from '../pages/Settings';
import { PreferencesProvider, usePreferences } from './preferences';
import { ConfirmationProvider } from './confirmation';
import { CourseSidebar } from '../components/CourseSidebar';
import { SidebarResizer, useSidebarWidth } from '../components/SidebarResizer';
import { findCourseLocation, getTaskNumber } from '../lib/content/navigation';

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
  const { width: sidebarWidth, error: sidebarError, resize: resizeSidebar } = useSidebarWidth();
  const location = useLocation();
  const current = findCourseLocation(location.pathname);
  const currentLabel = current?.task ? `${getTaskNumber(current.task.id)} · ${current.task.title}`
    : current ? `${current.number} · ${current.topic?.title ?? current.section.title}`
    : location.pathname === '/' ? 'Добро пожаловать' : location.pathname === '/topics' ? 'Все темы'
    : location.pathname === '/settings' ? 'Настройки' : 'Материал';
  const sidebarStyle: CSSProperties & { '--sidebar-width': string } = { '--sidebar-width': `${sidebarWidth}px` };
  return <div className={`app-shell ${collapsed ? 'sidebar-hidden' : ''}`} style={sidebarStyle}>
    <CourseSidebar visible={!collapsed} />
    {!collapsed && <SidebarResizer width={sidebarWidth} onResize={resizeSidebar} />}
    <main className="main">
      <header className="topbar">
        <div className="breadcrumb"><button className="icon-button" aria-label={collapsed ? 'Показать меню' : 'Скрыть меню'} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>☰</button>
          {location.pathname !== '/' && <><Link to="/topics">Обучение</Link><span>/</span></>}
          {current?.topic && <><Link to={`/section/${current.section.id}`}>{current.section.number} · {current.section.title}</Link><span>/</span></>}
          {current?.task && <><Link to={`/topic/${current.topic.id}`}>{current.number} · {current.topic.title}</Link><span>/</span></>}
          <span aria-current="page">{currentLabel}</span></div>
        <span className="badge">Первая версия · JavaScript</span>
      </header>
      {error && <div role="alert" className="error global-error">{error}</div>}
      {sidebarError && <div role="alert" className="error global-error">{sidebarError}</div>}
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/topics" element={<CoursePage />} />
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
  return <ErrorBoundary><HashRouter><PreferencesProvider><ConfirmationProvider><Shell /></ConfirmationProvider></PreferencesProvider></HashRouter></ErrorBoundary>;
}
