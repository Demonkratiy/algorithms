import { describe, expect, it } from 'vitest';
import { topics } from '../../../content/course';
import { courseSections, findCourseLocation, getTaskNumber, groupCourseTopics } from './navigation';

describe('course navigation hierarchy', () => {
  it('groups every topic and task once into the eight original sections', () => {
    expect(courseSections.map(section => section.number)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
    const entries = courseSections.flatMap(section => section.topics);
    expect(entries.map(entry => entry.topic.id)).toEqual(topics.map(topic => topic.id));
    expect(entries.flatMap(entry => entry.topic.tasks)).toHaveLength(101);
    expect(new Set(entries.map(entry => entry.number)).size).toBe(22);
  });
  it('numbers topics inside their section in agreement with theory filenames', () => {
    for (const section of courseSections) {
      section.topics.forEach(({ topic, number }, index) => {
        const fileNumber = Number(topic.theoryPath.split('/')[1].match(/^(\d+)-/)?.[1]);
        expect(fileNumber, topic.id).toBe(index + 1);
        expect(number).toBe(`${section.number}.${fileNumber}`);
      });
    }
    expect(findCourseLocation('/topic/two-pointers')?.number).toBe('2.1');
    expect(findCourseLocation('/task/range-sum-query')?.number).toBe('2.4');
    expect(findCourseLocation('/topic/dp-basics')?.number).toBe('7.1');
    expect(findCourseLocation('/task/output-order')?.number).toBe('8.3');
    expect(findCourseLocation('/task/promise-any')?.number).toBe('8.4');
  });
  it('finds the same ancestors for theory and every task, without prefix collisions', () => {
    for (const topic of topics) {
      const location = findCourseLocation(`/topic/${topic.id}`);
      expect(location?.topic).toBe(topic);
      for (const task of topic.tasks) expect(findCourseLocation(`/task/${task.id}`)?.topic).toBe(topic);
    }
    expect(findCourseLocation('/topic/prefix-sum-extra')).toBeUndefined();
    expect(findCourseLocation('/settings')).toBeUndefined();
  });
  it('reports inconsistent section metadata rather than guessing a number', () => {
    expect(() => groupCourseTopics([{ ...topics[0], section: '09. Основы' }])).toThrow();
    expect(() => groupCourseTopics([topics[0], { ...topics[1], section: '01. Другое название' }])).toThrow();
    expect(() => groupCourseTopics([{ ...topics[0], theoryPath: 'basics/big-o.md' }])).toThrow();
  });
  it('numbers every task by its actual catalog position, including split parts', () => {
    const numbers: string[] = [];
    for (const section of courseSections) {
      for (const { topic, number } of section.topics) {
        topic.tasks.forEach((task, index) => {
          expect(getTaskNumber(task.id)).toBe(`${number}.${index + 1}`);
          numbers.push(getTaskNumber(task.id));
        });
      }
    }
    expect(new Set(numbers).size).toBe(101);
    expect(getTaskNumber('valid-palindrome')).toBe('2.1.1');
    expect(getTaskNumber('move-zeroes')).toBe('2.1.2');
    expect(getTaskNumber('linked-list-cycle-entry')).toBe('3.1.4');
    expect(getTaskNumber('merge-two-sorted-lists')).toBe('3.1.5');
    expect(getTaskNumber('output-order')).toBe('8.3.1');
    expect(() => getTaskNumber('missing')).toThrow();
  });
});
