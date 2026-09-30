import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { emptyRecord, importBackup, parseBackup, readRecord, writeRecord } from './index';

describe('local progress', () => {
  it('round trips drafts and attempt snapshots through IndexedDB', async () => {
    const record = emptyRecord('range-sum-query', 'class NumArray {}');
    await writeRecord(record);
    expect(await readRecord(record.taskId)).toEqual(record);
    await importBackup(parseBackup(JSON.stringify({ version: 1, tasks: [{ ...record, solved: true }] })));
    expect((await readRecord(record.taskId))?.solved).toBe(true);
  });
  it('rejects unsupported versions, corrupt and duplicate records', () => {
    const record = emptyRecord('range-sum-query', '');
    expect(() => parseBackup('{"version":4,"tasks":[]}')).toThrow();
    expect(() => parseBackup(JSON.stringify({ version: 1, tasks: [record, record] }))).toThrow();
    expect(() => parseBackup(JSON.stringify({ version: 1, tasks: [{ ...record, code: null }] }))).toThrow();
    expect(() => parseBackup(JSON.stringify({ version: 1, tasks: [{ ...record, attempts: [{}] }] }))).toThrow();
  });
  it('does not import unknown fields', () => {
    const record = emptyRecord('range-sum-query', '');
    expect(parseBackup(JSON.stringify({ version: 1, tasks: [{ ...record, apiKey: 'not-a-secret' }] })).tasks[0])
      .not.toHaveProperty('apiKey');
  });
  it('preserves legacy text and imports v1 without guessing card choices', () => {
    const { complexityChoices: _choices, ...legacy } = emptyRecord('range-sum-query', 'old code');
    legacy.timeComplexity = 'Подготовка: O(N), запрос: O(1)';
    legacy.spaceComplexity = 'O(N)';
    const backup = parseBackup(JSON.stringify({ version: 1, tasks: [legacy] }));
    expect(backup.version).toBe(3);
    expect(backup.tasks[0].complexityChoices).toEqual({});
    expect(backup.tasks[0].timeComplexity).toBe(legacy.timeComplexity);
    expect(backup.tasks[0].spaceComplexity).toBe(legacy.spaceComplexity);
  });
  it('round trips choices through export/import and IndexedDB', async () => {
    const record = {
      ...emptyRecord('assessment-round-trip', 'new code'),
      complexityChoices: { 'build-time': 'linear', 'query-space': 'unknown' },
    };
    const backup = parseBackup(JSON.stringify({ version: 2, tasks: [record] }));
    await importBackup(backup);
    expect(await readRecord(record.taskId)).toEqual(record);
  });
  it.each([null, [], { 'query-time': 1 }, { 'query-time': 'O(N)' }, { 'invalid key': 'linear' }])('rejects malformed choices: %j', complexityChoices => {
    const record = { ...emptyRecord('range-sum-query', ''), complexityChoices };
    expect(() => parseBackup(JSON.stringify({ version: 2, tasks: [record] }))).toThrow();
  });
});
