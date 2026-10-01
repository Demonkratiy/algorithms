import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import { topics } from '../../content/course';
import { getMarkdown } from '../lib/content';
import { courseSections } from '../lib/content/navigation';

function contentLink(href: string, path: string): string {
  if (/^(https?:|mailto:|#)/i.test(href)) return href;
  const url = new URL(href, `https://content.local/${path}`);
  const file = decodeURIComponent(url.pathname.slice(1));
  const section = courseSections.find(entry => entry.overviewPath === file || `${entry.id}/` === file);
  if (section) return `/section/${section.id}${url.hash}`;
  const topic = topics.find(t => t.theoryPath === file);
  if (topic) return `/topic/${topic.id}${url.hash}`;
  for (const entry of topics) {
    const task = entry.tasks.find(t => t.path === file);
    if (task) return `/task/${task.id}${url.hash}`;
  }
  return `/read/${file.endsWith('/') ? `${file}README.md` : file}${url.hash}`;
}

export function Markdown({ text, path }: { text: string; path: string }) {
  const location = useLocation();
  function scrollToHeading(hash: string) {
    const id = decodeURIComponent(hash.slice(1));
    document.getElementById(`user-content-${id}`)?.scrollIntoView({ block: 'start' });
  }
  useEffect(() => {
    if (location.hash) scrollToHeading(location.hash);
  }, [text, location.hash]);
  return <div className="markdown"><ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw, rehypeSlug, rehypeSanitize]}
    components={{
      a: ({ href, children }) => {
        if (!href) return <span>{children}</span>;
        const target = contentLink(href, path);
        if (target.startsWith('#')) return <a href={target} onClick={event => {
          event.preventDefault(); scrollToHeading(target);
        }}>{children}</a>;
        return target.startsWith('/') ? <Link to={target}>{children}</Link> : <a href={target} rel="noreferrer">{children}</a>;
      },
    }}
  >{text}</ReactMarkdown></div>;
}
export function useMarkdown(path: string) {
  const [state, setState] = useState({ path: '', text: '', error: '' });
  useEffect(() => {
    let active = true;
    getMarkdown(path).then(text => { if (active) setState({ path, text, error: '' }); })
      .catch((e: unknown) => { if (active) setState({ path, text: '', error: `Материал не загрузился: ${String(e)}` }); });
    return () => { active = false; };
  }, [path]);
  return state.path === path ? { ...state, loading: false } : { text: '', error: '', loading: true };
}
