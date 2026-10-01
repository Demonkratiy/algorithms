import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { describe, expect, it } from 'vitest';
import { resolveContentLink } from './links';
import { courseSections, findCourseLocation } from './navigation';
import { getMarkdown } from './index';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const files = execFileSync('git', ['ls-files', '-z', '--', '*.md'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const parsed = new Map<string, { links: string[]; anchors: Set<string> }>();
function parse(file: string) {
  const full = resolve(root, file);
  const cached = parsed.get(full);
  if (cached) return cached;
  const links: string[] = [];
  const html = renderToStaticMarkup(createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm], rehypePlugins: [rehypeRaw, rehypeSlug, rehypeSanitize],
    components: {
      a: ({ href, children }) => { if (href) links.push(href); return createElement('a', { href }, children); },
      img: ({ src, alt }) => { if (typeof src === 'string') links.push(src); return createElement('img', { src, alt }); },
    },
  }, readFileSync(full, 'utf8')));
  const result = { links, anchors: new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])) };
  parsed.set(full, result);
  return result;
}

describe('repository links', () => {
  it('checks every tracked Markdown file, including code-styled labels and HTML links', () => {
    const errors: string[] = [];
    for (const file of files) for (const href of parse(file).links) {
      if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(href)) continue;
      const url = new URL(href, `https://repository.local/${file}`);
      const path = decodeURIComponent(url.pathname.slice(1));
      const target = resolve(root, path);
      if (!existsSync(target)) { errors.push(`${file}: ${href} — missing ${path}`); continue; }
      if (url.hash && statSync(target).isFile() && path.endsWith('.md')) {
        const anchor = decodeURIComponent(url.hash.slice(1));
        if (!parse(path).anchors.has(`user-content-${anchor}`)) errors.push(`${file}: ${href} — missing heading`);
      }
    }
    expect(errors).toEqual([]);
  });
  it('resolves all public course links to existing app routes, documents and headings', async () => {
    const errors: string[] = [];
    for (const file of files.filter(file => file.startsWith('content/'))) for (const href of parse(file).links) {
      const path = file.slice('content/'.length);
      const target = resolveContentLink(href, path);
      if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(target)) continue;
      if (target.startsWith('#')) continue;
      const url = new URL(target, 'https://app.local');
      const location = findCourseLocation(url.pathname);
      let document: string | undefined;
      if (location?.task) document = location.task.path;
      else if (location?.topic) document = location.topic.theoryPath;
      else if (location) document = location.section.overviewPath;
      else if (url.pathname.startsWith('/read/')) document = decodeURIComponent(url.pathname.slice('/read/'.length));
      else if (url.pathname === '/topics' || url.pathname === '/') continue;
      if (!document) { errors.push(`${file}: ${href} → ${target} — missing route`); continue; }
      try { await getMarkdown(document); }
      catch { errors.push(`${file}: ${href} → ${target} — missing document`); continue; }
      const anchor = decodeURIComponent(url.hash.slice(1));
      const generatedAnchor = (location?.topic && anchor === 'practice') || (location && !location.topic && anchor === 'topics');
      if (anchor && !generatedAnchor && !parse(`content/${document}`).anchors.has(`user-content-${anchor}`)) {
        errors.push(`${file}: ${href} → ${target} — missing heading`);
      }
    }
    expect(errors).toEqual([]);
  });
  it('maps every practice directory to its section or topic rather than a missing README', () => {
    for (const section of courseSections) {
      expect(resolveContentLink(`practice/${section.id}/`, 'README.md')).toBe(`/section/${section.id}#topics`);
      for (const { topic } of section.topics) {
        if (!topic.tasks.length) continue;
        const directory = relative(resolve(root, 'content'), dirname(resolve(root, 'content', topic.tasks[0].path))).replaceAll('\\', '/');
        expect(resolveContentLink(`${directory}/`, 'README.md')).toBe(`/topic/${topic.id}#practice`);
      }
    }
  });
  it('keeps anchors and external URLs and links repository-only documents to GitHub', () => {
    expect(resolveContentLink('#-идея', '02-arrays-strings/01-two-pointers.md')).toBe('#-идея');
    expect(resolveContentLink('https://example.com/path?q=1#intro', 'README.md')).toBe('https://example.com/path?q=1#intro');
    expect(resolveContentLink('//example.com/path', 'README.md')).toBe('//example.com/path');
    expect(resolveContentLink('../../personal/solutions/practice/', 'practice/README.md'))
      .toBe('https://github.com/Demonkratiy/algorithms/tree/main/personal/solutions/practice/');
    expect(resolveContentLink('../README.md', 'README.md')).toBe('https://github.com/Demonkratiy/algorithms/blob/main/README.md');
  });
});
