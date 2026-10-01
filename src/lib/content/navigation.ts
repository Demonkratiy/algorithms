import { topics, type Topic } from '../../../content/course';

export type NumberedTopic = { topic: Topic; number: string };
export type CourseSection = { id: string; number: string; title: string; overviewPath: string; topics: NumberedTopic[] };

export function groupCourseTopics(items: readonly Topic[]): CourseSection[] {
  const groups = new Map<string, CourseSection>();
  for (const topic of items) {
    const folder = topic.theoryPath.split('/')[0];
    const pathNumber = folder.match(/^(\d+)-[a-z0-9-]+$/)?.[1];
    const section = topic.section.match(/^(\d+)\.\s+(.+)$/);
    if (!pathNumber || !section || Number(pathNumber) !== Number(section[1])) {
      throw new Error(`Номер раздела не согласован с путём темы ${topic.id}.`);
    }
    let group = groups.get(folder);
    if (!group) {
      group = { id: folder, number: String(Number(pathNumber)), title: section[2], overviewPath: `${folder}/README.md`, topics: [] };
      groups.set(folder, group);
    } else if (group.title !== section[2]) {
      throw new Error(`Разные названия одного раздела: ${folder}.`);
    }
    group.topics.push({ topic, number: `${group.number}.${group.topics.length + 1}` });
  }
  return [...groups.values()];
}

export const courseSections = groupCourseTopics(topics);
const taskNumbers = new Map(courseSections.flatMap(section => section.topics.flatMap(({ topic, number }) =>
  topic.tasks.map((task, index) => [task.id, `${number}.${index + 1}`] as const))));

export function getTaskNumber(id: string): string {
  const number = taskNumbers.get(id);
  if (!number) throw new Error(`Задача отсутствует в нумерации каталога: ${id}`);
  return number;
}

export function findCourseLocation(pathname: string) {
  for (const section of courseSections) {
    if (pathname === `/section/${section.id}`) return { section, number: section.number, topic: undefined, task: undefined };
    for (const entry of section.topics) {
      const task = entry.topic.tasks.find(task => pathname === `/task/${task.id}`);
      if (pathname === `/topic/${entry.topic.id}` || task) {
        return { section, ...entry, task };
      }
    }
  }
  return undefined;
}
