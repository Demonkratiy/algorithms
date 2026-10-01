import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { courseSections, findCourseLocation, getTaskNumber } from '../lib/content/navigation';
import { TaskPriorityBadge } from './TaskPriorityBadge';

function toggled(previous: Set<string>, id: string) {
  const next = new Set(previous);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function CourseSidebar({ visible }: { visible: boolean }) {
  const { pathname } = useLocation();
  const current = findCourseLocation(pathname);
  const sectionId = current?.section.id;
  const topicId = current?.topic.id;
  const [openSections, setOpenSections] = useState(() => new Set(sectionId ? [sectionId] : [courseSections[0].id]));
  const [openTopics, setOpenTopics] = useState(() => new Set(topicId ? [topicId] : []));
  const navigation = useRef<HTMLElement>(null);
  const revealCurrent = useRef(true);
  useEffect(() => {
    revealCurrent.current = true;
    if (sectionId) setOpenSections(previous => new Set(previous).add(sectionId));
    if (topicId) setOpenTopics(previous => new Set(previous).add(topicId));
  }, [pathname, sectionId, topicId]);
  useEffect(() => {
    if (!visible || !revealCurrent.current || (sectionId && !openSections.has(sectionId)) || (topicId && !openTopics.has(topicId))) return;
    const container = navigation.current;
    const active = container?.querySelector('[aria-current="page"]');
    if (container && active) {
      const bounds = container.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      if (item.top < bounds.top) container.scrollTop += item.top - bounds.top;
      else if (item.bottom > bounds.bottom) container.scrollTop += item.bottom - bounds.bottom;
    }
    revealCurrent.current = false;
  }, [pathname, sectionId, topicId, openSections, openTopics, visible]);

  return <aside className="sidebar" aria-label="Навигация по курсу">
    <Link className="logo" to="/"><span className="logo-mark">&lt;/&gt;</span>algo<span className="logo-dot">.</span></Link>
    <nav ref={navigation} className="sidebar-course" aria-label="Разделы курса">
      <span className="eyebrow">Твоё обучение</span>
      <NavLink className="nav-link" to="/" end>▤ Все темы</NavLink>
      <ul className="nav-groups">
        {courseSections.map(section => {
          const expanded = openSections.has(section.id);
          const childrenId = `nav-section-${section.id}`;
          return <li key={section.id} className={`nav-group ${sectionId === section.id ? 'is-current' : ''}`}>
            <button className="section-toggle" aria-expanded={expanded} aria-controls={childrenId}
              aria-label={`${expanded ? 'Свернуть' : 'Развернуть'} раздел ${section.number}: ${section.title}`}
              onClick={() => setOpenSections(previous => toggled(previous, section.id))}>
              <span className={`nav-chevron ${expanded ? 'expanded' : ''}`} aria-hidden="true">›</span>
              <span className="section-index">{section.number}</span>
              <span>{section.title}</span>
            </button>
            <ul id={childrenId} className="nav-topics" hidden={!expanded}>
              {section.topics.map(({ topic, number }) => {
                const topicExpanded = openTopics.has(topic.id);
                const tasksId = `nav-tasks-${topic.id}`;
                return <li key={topic.id}>
                  <div className={`topic-row ${topicId === topic.id ? 'current' : ''}`}>
                    {topic.tasks.length > 0 ? <button className="topic-toggle"
                      aria-expanded={topicExpanded} aria-controls={tasksId}
                      aria-label={`${topicExpanded ? 'Свернуть' : 'Развернуть'} тему ${number}: ${topic.title}`}
                      onClick={() => setOpenTopics(previous => toggled(previous, topic.id))}>
                      <span className={`nav-chevron ${topicExpanded ? 'expanded' : ''}`} aria-hidden="true">›</span>
                    </button> : <span className="topic-toggle-spacer" />}
                    <NavLink className="nav-link topic-nav" to={`/topic/${topic.id}`}
                      aria-expanded={topic.tasks.length ? topicExpanded : undefined}
                      aria-controls={topic.tasks.length ? tasksId : undefined}
                      onClick={event => {
                        if (!topic.tasks.length || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                        if (pathname === `/topic/${topic.id}`) {
                          event.preventDefault();
                          setOpenTopics(previous => toggled(previous, topic.id));
                        } else {
                          setOpenTopics(previous => new Set(previous).add(topic.id));
                        }
                      }}>
                      <span className="topic-index">{number}</span><span>{topic.title}</span>
                    </NavLink>
                  </div>
                  {topic.tasks.length > 0 && <ul id={tasksId} className="nav-tasks" hidden={!topicExpanded}>
                    {topic.tasks.map(task => <li key={task.id}>
                      <NavLink className="nav-link task-nav" to={`/task/${task.id}`}>
                        <span className="nav-task-main"><span className="task-index">{getTaskNumber(task.id)}</span><span>{task.title}</span></span>
                        <span className="nav-task-meta">
                          <TaskPriorityBadge priority={task.priority} />
                          {task.activity === 'quiz' && <span className="nav-quiz-label">квиз</span>}
                        </span>
                      </NavLink>
                    </li>)}
                  </ul>}
                </li>;
              })}
            </ul>
          </li>;
        })}
      </ul>
    </nav>
    <div className="sidebar-bottom"><NavLink className="nav-link" to="/settings">⚙ Настройки</NavLink>
      <p className="small muted">Без аккаунта. В твоём темпе.<br />Прогресс — в этом браузере.</p></div>
  </aside>;
}
