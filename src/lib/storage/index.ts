import { openDB, type DBSchema } from 'idb';
import type { ComplexityChoices } from '../../../tasks/types';

export type Theme = 'light' | 'dark' | 'system';
export type Settings = { ui: Theme; editor: Theme };
export type Attempt = {
  at: string;
  code: string;
  mode: 'example' | 'check';
  status: 'passed' | 'failed' | 'error' | 'timeout' | 'cancelled';
};
export type TaskRecord = {
  taskId: string;
  code: string;
  updatedAt: string;
  solved: boolean;
  attempts: Attempt[];
  timeComplexity: string;
  spaceComplexity: string;
  complexityChoices?: ComplexityChoices;
};
export const BACKUP_VERSION = 2;
export type Backup = { version: 2; tasks: TaskRecord[] };

interface AlgoDB extends DBSchema {
  tasks: { key: string; value: TaskRecord };
}

const database = () => openDB<AlgoDB>('algo-learning', 1, {
  upgrade(db) { db.createObjectStore('tasks', { keyPath: 'taskId' }); },
});
let pendingWrite: Promise<void> = Promise.resolve();

export const emptyRecord = (taskId: string, code: string): TaskRecord => ({
  taskId, code, updatedAt: new Date().toISOString(), solved: false,
  attempts: [], timeComplexity: '', spaceComplexity: '', complexityChoices: {},
});

export async function readRecord(id: string) {
  await pendingWrite;
  const db = await database();
  try { return await db.get('tasks', id); } finally { db.close(); }
}
export function writeRecord(record: TaskRecord) {
  const operation = pendingWrite.then(async () => {
    const db = await database();
    try { await db.put('tasks', record); } finally { db.close(); }
  });
  // Keep the queue usable after a failure; the caller receives the original rejection.
  pendingWrite = operation.then(() => undefined, () => undefined);
  return operation;
}
export async function readAllRecords() {
  await pendingWrite;
  const db = await database();
  try { return await db.getAll('tasks'); } finally { db.close(); }
}
export async function importBackup(backup: Backup) {
  await pendingWrite;
  const db = await database();
  try {
    const tx = db.transaction('tasks', 'readwrite');
    for (const record of backup.tasks) await tx.store.put(record);
    await tx.done;
  } finally { db.close(); }
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function text(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max;
}
function validDate(value: unknown): value is string {
  return text(value, 40) && Number.isFinite(Date.parse(value));
}
function attempt(value: unknown): value is Attempt {
  return object(value) && validDate(value.at) && text(value.code, 100_000)
    && (value.mode === 'example' || value.mode === 'check')
    && ['passed', 'failed', 'error', 'timeout', 'cancelled'].includes(String(value.status));
}
function complexityChoices(value: unknown): value is ComplexityChoices {
  return object(value) && Object.keys(value).length <= 20
    && Object.entries(value).every(([key, choice]) => /^[a-z0-9][a-z0-9-]{0,79}$/.test(key)
      && text(choice, 80) && /^[a-z0-9][a-z0-9-]*$/.test(choice));
}

export function parseBackup(source: string): Backup {
  if (source.length > 5_000_000) throw new Error('Файл больше 5 МБ.');
  const value: unknown = JSON.parse(source);
  if (!object(value) || (value.version !== 1 && value.version !== BACKUP_VERSION) || !Array.isArray(value.tasks) || value.tasks.length > 1000) {
    throw new Error('Неподдерживаемый формат резервной копии. Нужен экспорт Algo версии 1 или 2.');
  }
  const ids = new Set<string>();
  const tasks = value.tasks.map((item: unknown): TaskRecord => {
    if (!object(item) || !text(item.taskId, 100) || !/^[a-z0-9][a-z0-9-]*$/.test(item.taskId)
      || ids.has(item.taskId) || !text(item.code, 100_000) || !validDate(item.updatedAt)
      || typeof item.solved !== 'boolean' || !text(item.timeComplexity, 200)
      || !text(item.spaceComplexity, 200) || !Array.isArray(item.attempts)
      || (item.complexityChoices !== undefined && !complexityChoices(item.complexityChoices))
      || item.attempts.length > 5 || !item.attempts.every(attempt)) {
      throw new Error('Некорректная запись задачи в резервной копии.');
    }
    ids.add(item.taskId);
    return {
      taskId: item.taskId, code: item.code, updatedAt: item.updatedAt, solved: item.solved,
      timeComplexity: item.timeComplexity, spaceComplexity: item.spaceComplexity,
      complexityChoices: item.complexityChoices === undefined ? {} : { ...item.complexityChoices },
      attempts: item.attempts.map(entry => ({
        at: entry.at, code: entry.code, mode: entry.mode, status: entry.status,
      })),
    };
  });
  return { version: BACKUP_VERSION, tasks };
}

const isTheme = (value: unknown): value is Theme => ['light', 'dark', 'system'].includes(String(value));
export function readSettings(): Settings {
  const source = localStorage.getItem('algo-settings');
  if (source === null) return { ui: 'system', editor: 'dark' };
  const value: unknown = JSON.parse(source);
  if (!object(value) || !isTheme(value.ui) || !isTheme(value.editor)) {
    throw new Error('Сохранённые настройки повреждены. Выберите темы заново.');
  }
  return { ui: value.ui, editor: value.editor };
}
export function writeSettings(settings: Settings) {
  localStorage.setItem('algo-settings', JSON.stringify(settings));
}
