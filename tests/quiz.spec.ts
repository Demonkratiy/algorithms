import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { outputOrderQuiz } from '../tasks/output-order/quiz';
import { asyncTrapsQuiz } from '../tasks/async-traps/quiz';
import type { QuizDefinition } from '../tasks/quiz-types';
import type { Backup, TaskRecord } from '../src/lib/storage';

const result = (page: Page) => page.getByRole('region', { name: 'Результат квиза' });
const question = (page: Page, id: string) => page.locator(`[data-question-id="${id}"]`);
const explanations = (page: Page) => page.getByRole('region', { name: /^Разбор сниппета/ });

test('output-order answers match actual execution of the readonly snippets', async ({ page }) => {
  const markdown = readFileSync(new URL('../content/practice/08-js-interview/03-event-loop/01-output-order.md', import.meta.url), 'utf8');
  const statement = markdown.slice(0, markdown.indexOf('## ✍️ Мои ответы'));
  const snippets = [...statement.matchAll(/```js\r?\n([\s\S]*?)\r?\n```/g)].map(match => match[1]);
  expect(snippets).toHaveLength(outputOrderQuiz.questions.length);
  await page.goto('/');
  for (const [index, source] of snippets.entries()) {
    const lines = await page.evaluate(source => new Promise<string[]>((resolve, reject) => {
      const script = `const captured = []; console.log = (...args) => captured.push(args.map(String).join(' '));\n${source}\nsetTimeout(() => setTimeout(() => postMessage(captured), 0), 0);`;
      const url = URL.createObjectURL(new Blob([script], { type: 'text/javascript' }));
      const worker = new Worker(url);
      const cleanup = () => { clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); };
      const timer = setTimeout(() => { cleanup(); reject(new Error('Readonly snippet did not finish')); }, 3000);
      worker.onmessage = event => { cleanup(); resolve(event.data); };
      worker.onerror = event => { cleanup(); reject(new Error(event.message)); };
    }), source);
    const q = outputOrderQuiz.questions[index];
    expect(lines).toEqual(q.options.find(option => option.id === q.answerId)!.label.split(' → '));
  }
});
async function saved(page: Page) {
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
}
async function open(page: Page, definition = outputOrderQuiz) {
  await page.goto(`/#/task/${definition.id}`);
  await expect(page.locator('.quiz-question')).toHaveCount(6);
  await saved(page);
}
async function choose(page: Page, definition: QuizDefinition, index: number, correct: boolean) {
  const q = definition.questions[index];
  const option = q.options.find(option => (option.id === q.answerId) === correct)!;
  await question(page, q.id).getByRole('radio', { name: option.label, exact: true }).check();
}
async function chooseAll(page: Page, definition: QuizDefinition) {
  for (let i = 0; i < definition.questions.length; i++) await choose(page, definition, i, true);
}
async function check(page: Page) {
  await page.getByRole('button', { name: 'Проверить ответы', exact: true }).click();
  await saved(page);
}
async function download(page: Page): Promise<{ backup: Backup; source: string }> {
  await page.goto('/#/settings');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Экспорт прогресса' }).click();
  const stream = await (await downloading).createReadStream();
  if (!stream) throw new Error('Missing backup stream');
  let source = '';
  for await (const chunk of stream) source += chunk.toString();
  return { source, backup: JSON.parse(source) as Backup };
}
async function importData(page: Page, source: string) {
  await page.goto('/#/settings');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: 'quiz.json', mimeType: 'application/json', buffer: Buffer.from(source),
  });
  await expect(page.getByRole('status')).toContainText('Импортировано записей: 1');
}

for (const definition of [outputOrderQuiz, asyncTrapsQuiz]) {
  test(`${definition.id}: no preselection, spoilers, Monaco or execution; incomplete and incorrect attempts`, async ({ page }) => {
    const forbiddenRequests: string[] = [];
    page.on('request', request => {
      if (/monaco|sandbox-worker|sandbox-frame/i.test(request.url())) forbiddenRequests.push(request.url());
    });
    await open(page, definition);
    await expect(page.locator('.quiz-options input:checked')).toHaveCount(0);
    await expect(explanations(page)).toHaveCount(0);
    await expect(page.getByText('Правильный вариант:', { exact: true })).toHaveCount(0);
    await expect(page.locator('.monaco-editor')).toHaveCount(0);
    await check(page);
    await expect(result(page)).toContainText('Попытка не завершена');
    await expect(result(page)).toContainText('Заполнено: 0 из 6');
    await expect(explanations(page)).toHaveCount(0);
    await choose(page, definition, 0, false);
    await expect(result(page)).toContainText('Проверка устарела');
    await check(page);
    await expect(result(page)).toContainText('Верно: 0 из 6');
    await expect(explanations(page)).toHaveCount(1);
    await expect(explanations(page)).toContainText('Ответ не совпал');
    await expect(question(page, 'snippet-2').locator('.quiz-explanation')).toHaveCount(0);
    await expect(page.getByText(/Ранее задача была отмечена решённой/)).toHaveCount(0);
    expect(forbiddenRequests).toEqual([]);
  });
}

test('correct choices pass, notes are ungraded; editing choices or notes invalidates feedback', async ({ page }) => {
  await open(page);
  await chooseAll(page, outputOrderQuiz);
  const notes = question(page, 'snippet-1').getByRole('textbox');
  await notes.fill('Объяснение намеренно неверное: таймеры синхронны.');
  await expect(explanations(page)).toHaveCount(0);
  await check(page);
  await expect(result(page)).toContainText('Все ответы верны');
  await expect(result(page)).toContainText('Объяснения не оценивались');
  await expect(explanations(page)).toHaveCount(6);
  await expect(page.getByText(/Ранее задача была отмечена решённой/)).toBeVisible();
  await notes.fill('Теперь проверю вручную.');
  await expect(result(page)).toContainText('Проверка устарела');
  await expect(explanations(page)).toHaveCount(0);
  await check(page);
  await choose(page, outputOrderQuiz, 0, false);
  await expect(result(page)).toContainText('Проверка устарела');
  await check(page);
  await expect(result(page)).toContainText('Есть ошибки');
  await expect(result(page)).toContainText('Верно: 5 из 6');
  await question(page, 'snippet-1').getByRole('button', { name: 'Снять выбор' }).click();
  await check(page);
  await expect(result(page)).toContainText('Попытка не завершена');
  await expect(explanations(page)).toHaveCount(5);
  await expect(question(page, 'snippet-1').locator('.quiz-explanation')).toHaveCount(0);
});

test('drafts and attempt snapshots survive reload and version 3 export/import without spoiling answers', async ({ page }) => {
  await open(page, asyncTrapsQuiz);
  await chooseAll(page, asyncTrapsQuiz);
  await question(page, 'snippet-3').getByRole('textbox').fill('Моё рассуждение, не оценка.');
  await check(page);
  await choose(page, asyncTrapsQuiz, 0, false);
  await saved(page);
  await page.reload();
  await expect(page.locator('.quiz-options input:checked')).toHaveCount(6);
  await expect(explanations(page)).toHaveCount(0);
  await expect(result(page)).toHaveCount(0);
  await expect(question(page, 'snippet-3').getByRole('textbox')).toHaveValue('Моё рассуждение, не оценка.');
  const { backup, source } = await download(page);
  expect(backup.version).toBe(3);
  const record = backup.tasks.find(task => task.taskId === 'async-traps')!;
  expect(record.solved).toBe(true);
  expect(record.quizAnswers).toHaveProperty('snippet-1');
  expect(record.quizExplanations).toEqual({ 'snippet-3': 'Моё рассуждение, не оценка.' });
  expect(record.attempts).toHaveLength(1);
  expect(record.attempts[0]).toMatchObject({ code: '', mode: 'check', status: 'passed' });
  expect(record.attempts[0].quizAnswers?.['snippet-1']).toBe(asyncTrapsQuiz.questions[0].answerId);
  expect(record.attempts[0].quizAnswers?.['snippet-1']).not.toBe(record.quizAnswers?.['snippet-1']);
  expect(record.attempts[0].quizExplanations).toEqual(record.quizExplanations);
  await importData(page, JSON.stringify({ version: 3, tasks: [{ ...record, quizAnswers: {}, quizExplanations: {} }] }));
  await importData(page, source);
  await open(page, asyncTrapsQuiz);
  await expect(page.locator('.quiz-options input:checked')).toHaveCount(6);
  await expect(explanations(page)).toHaveCount(0);
});

test('restore needs confirmation, retains legacy text and keeps only five non-destructive snapshots', async ({ page }) => {
  const legacy: TaskRecord = {
    taskId: 'output-order', code: 'Прежние текстовые заметки', updatedAt: new Date().toISOString(),
    solved: false, attempts: [], timeComplexity: 'старое время', spaceComplexity: 'старая память',
  };
  await importData(page, JSON.stringify({ version: 2, tasks: [legacy] }));
  await open(page);
  await page.getByText('Прежние заметки (только чтение)', { exact: true }).click();
  await expect(page.locator('.quiz-legacy')).toContainText(legacy.code);
  await expect(page.locator('.quiz-options input:checked')).toHaveCount(0);
  await chooseAll(page, outputOrderQuiz);
  await question(page, 'snippet-1').getByRole('textbox').fill('Первое объяснение');
  await check(page);
  await choose(page, outputOrderQuiz, 0, false);
  await question(page, 'snippet-1').getByRole('textbox').fill('Второе объяснение');
  await check(page);
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Восстановить попытку 2', exact: true }).click();
  await expect(question(page, 'snippet-1').getByRole('textbox')).toHaveValue('Второе объяснение');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Восстановить попытку 2', exact: true }).click();
  await expect(question(page, 'snippet-1').getByRole('textbox')).toHaveValue('Первое объяснение');
  await expect(explanations(page)).toHaveCount(0);
  await expect(result(page)).toHaveCount(0);
  await expect(page.getByText(/Ответы восстановлены/)).toBeVisible();
  for (let i = 0; i < 5; i++) await check(page);
  await expect(page.getByRole('region', { name: 'История попыток' }).locator('li')).toHaveCount(5);
  const { backup } = await download(page);
  const record = backup.tasks[0];
  expect(record.code).toBe(legacy.code);
  expect(record.timeComplexity).toBe(legacy.timeComplexity);
  expect(record.spaceComplexity).toBe(legacy.spaceComplexity);
  expect(record.attempts).toHaveLength(5);
  expect(record.attempts.every(attempt => attempt.code === '' && attempt.mode === 'check')).toBe(true);
});

test('storage failure is explicit rather than claiming that answers were saved', async ({ page }) => {
  await page.addInitScript(() => {
    IDBFactory.prototype.open = () => { throw new Error('Storage intentionally unavailable'); };
  });
  await page.goto('/#/task/output-order');
  await expect(page.locator('.quiz-page').getByRole('alert')).toContainText('Не удалось сохранить или загрузить ответы');
  await expect(page.getByRole('button', { name: 'Повторить загрузку' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Проверить ответы' })).toHaveCount(0);
  await expect(page.getByText('Ответы пока не сохранены.', { exact: true })).toBeVisible();
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toHaveCount(0);
});
