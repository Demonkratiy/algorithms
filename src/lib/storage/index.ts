import { openDB, type DBSchema } from 'idb';
import type { ComplexityChoices } from '../../../tasks/types';
import type { QuizAnswers } from '../../../tasks/quiz-types';
import { isPalette, type Palette } from '../palettes';
import { isEditorFont, isTextSize, isUiFont, type EditorFont, type TextSize, type UiFont } from '../typography';

export type Theme = 'light' | 'dark' | 'system';
export type Settings = {
  ui: Theme; editor: Theme; palette: Palette;
  uiSize: TextSize; editorSize: TextSize; uiFont: UiFont; editorFont: EditorFont;
};
export const defaultSettings: Settings = {
  ui: 'system', editor: 'dark', palette: 'lavender',
  uiSize: 'medium', editorSize: 'medium', uiFont: 'system', editorFont: 'default',
};
export type Attempt = {
  at: string;
  code: string;
  mode: 'example' | 'check';
  status: 'passed' | 'failed' | 'error' | 'timeout' | 'cancelled';
  quizAnswers?: QuizAnswers;
  quizExplanations?: Record<string, string>;
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
  quizAnswers?: QuizAnswers;
  quizExplanations?: Record<string, string>;
};
export const BACKUP_VERSION = 3;
export type Backup = { version: 3; tasks: TaskRecord[] };

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
    && ['passed', 'failed', 'error', 'timeout', 'cancelled'].includes(String(value.status))
    && (value.quizAnswers === undefined || quizMap(value.quizAnswers, false))
    && (value.quizExplanations === undefined || quizMap(value.quizExplanations, true));
}
function quizMap(value: unknown, explanations: boolean): value is Record<string, string> {
  return object(value) && Object.keys(value).length <= 30
    && Object.entries(value).every(([key, answer]) => /^[a-z0-9][a-z0-9-]{0,79}$/.test(key)
      && text(answer, explanations ? 2000 : 80)
      && (explanations || /^[a-z0-9][a-z0-9-]*$/.test(answer)));
}
function complexityChoices(value: unknown): value is ComplexityChoices {
  return object(value) && Object.keys(value).length <= 20
    && Object.entries(value).every(([key, choice]) => /^[a-z0-9][a-z0-9-]{0,79}$/.test(key)
      && text(choice, 80) && /^[a-z0-9][a-z0-9-]*$/.test(choice));
}

export function parseBackup(source: string): Backup {
  if (source.length > 5_000_000) throw new Error('Файл больше 5 МБ.');
  const value: unknown = JSON.parse(source);
  if (!object(value) || ![1, 2, BACKUP_VERSION].includes(Number(value.version)) || !Array.isArray(value.tasks) || value.tasks.length > 1000
    || typeof value.version !== 'number') {
    throw new Error('Неподдерживаемый формат резервной копии. Нужен экспорт Algo версии 1, 2 или 3.');
  }
  const ids = new Set<string>();
  const tasks = value.tasks.map((item: unknown): TaskRecord => {
    if (!object(item) || !text(item.taskId, 100) || !/^[a-z0-9][a-z0-9-]*$/.test(item.taskId)
      || ids.has(item.taskId) || !text(item.code, 100_000) || !validDate(item.updatedAt)
      || typeof item.solved !== 'boolean' || !text(item.timeComplexity, 200)
      || !text(item.spaceComplexity, 200) || !Array.isArray(item.attempts)
      || (item.complexityChoices !== undefined && !complexityChoices(item.complexityChoices))
      || (item.quizAnswers !== undefined && !quizMap(item.quizAnswers, false))
      || (item.quizExplanations !== undefined && !quizMap(item.quizExplanations, true))
      || item.attempts.length > 5 || !item.attempts.every(attempt)) {
      throw new Error('Некорректная запись задачи в резервной копии.');
    }
    ids.add(item.taskId);
    return {
      taskId: item.taskId, code: item.code, updatedAt: item.updatedAt, solved: item.solved,
      timeComplexity: item.timeComplexity, spaceComplexity: item.spaceComplexity,
      complexityChoices: item.complexityChoices === undefined ? {} : { ...item.complexityChoices },
      ...(item.quizAnswers === undefined ? {} : { quizAnswers: { ...item.quizAnswers } }),
      ...(item.quizExplanations === undefined ? {} : { quizExplanations: { ...item.quizExplanations } }),
      attempts: item.attempts.map(entry => ({
        at: entry.at, code: entry.code, mode: entry.mode, status: entry.status,
        ...(entry.quizAnswers === undefined ? {} : { quizAnswers: { ...entry.quizAnswers } }),
        ...(entry.quizExplanations === undefined ? {} : { quizExplanations: { ...entry.quizExplanations } }),
      })),
    };
  });
  return { version: BACKUP_VERSION, tasks };
}

const isTheme = (value: unknown): value is Theme => ['light', 'dark', 'system'].includes(String(value));
export function readSettings(): Settings {
  const source = localStorage.getItem('algo-settings');
  if (source === null) return { ...defaultSettings };
  const value: unknown = JSON.parse(source);
  if (!object(value) || !isTheme(value.ui) || !isTheme(value.editor)) {
    throw new Error('Сохранённые настройки повреждены. Выберите оформление заново или сбросьте его.');
  }
  const palette = 'palette' in value ? value.palette : defaultSettings.palette;
  if (!isPalette(palette)) throw new Error('Сохранённая палитра неизвестна. Выберите палитру заново или сбросьте оформление.');
  const uiSize = 'uiSize' in value ? value.uiSize : defaultSettings.uiSize;
  const editorSize = 'editorSize' in value ? value.editorSize : defaultSettings.editorSize;
  const uiFont = 'uiFont' in value ? value.uiFont : defaultSettings.uiFont;
  const editorFont = 'editorFont' in value ? value.editorFont : defaultSettings.editorFont;
  if (!isTextSize(uiSize) || !isTextSize(editorSize) || !isUiFont(uiFont) || !isEditorFont(editorFont)) {
    throw new Error('Сохранённые настройки шрифтов повреждены. Сбросьте оформление.');
  }
  return { ui: value.ui, editor: value.editor, palette, uiSize, editorSize, uiFont, editorFont };
}
export function writeSettings(settings: Settings) {
  localStorage.setItem('algo-settings', JSON.stringify(settings));
}
