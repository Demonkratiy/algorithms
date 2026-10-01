import { courseSections } from './navigation';

const repository = 'https://github.com/Demonkratiy/algorithms';

export function resolveContentLink(href: string, path: string): string {
  if (/^[a-z][a-z0-9+.-]*:|^\/\/|^#/i.test(href)) return href;
  const url = new URL(href, `https://content.local/content/${path}`);
  const repositoryPath = decodeURIComponent(url.pathname.slice(1));
  if (!repositoryPath) return repository;
  if (!repositoryPath.startsWith('content/')) {
    const kind = repositoryPath.endsWith('/') ? 'tree' : 'blob';
    return `${repository}/${kind}/main/${repositoryPath}${url.hash}`;
  }
  const file = repositoryPath.slice('content/'.length);
  const directory = file.replace(/\/$/, '');
  for (const section of courseSections) {
    if (file === section.overviewPath || directory === section.id) return `/section/${section.id}${url.hash}`;
    if (directory === `practice/${section.id}`) return `/section/${section.id}${url.hash || '#topics'}`;
    for (const { topic } of section.topics) {
      if (file === topic.theoryPath) return `/topic/${topic.id}${url.hash}`;
      if (topic.tasks.some(task => task.path.slice(0, task.path.lastIndexOf('/')) === directory)) {
        return `/topic/${topic.id}${url.hash || '#practice'}`;
      }
      const task = topic.tasks.find(task => task.path === file);
      if (task) return `/task/${task.id}${url.hash}`;
    }
  }
  const document = directory === 'practice' ? 'practice/README.md' : !file || file.endsWith('/') ? `${file}README.md` : file;
  return `/read/${document}${url.hash}`;
}
