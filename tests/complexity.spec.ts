import { expect, test, type Page } from '@playwright/test';
import type { TaskRecord } from '../src/lib/storage';

// Output-correct but not optimal: matching a chosen target must never certify this code's Big O.
const code = 'class NumArray { constructor(nums) { this.nums = nums; } sumRange(l, r) { return this.nums.slice(l, r + 1).reduce((a, b) => a + b, 0); } }';
const targets = [
  ['Подготовка — время', 'O(N)'], ['Подготовка — память', 'O(N)'],
  ['Один запрос — время', 'O(1)'], ['Один запрос — память', 'O(1)'],
] as const;
const feedback = (page: Page) => page.getByRole('region', { name: 'Сверка оценки сложности' });
async function seed(page: Page, overrides: Partial<TaskRecord> = {}, version = 2) {
  const record: TaskRecord = {
    taskId: 'range-sum-query', code, updatedAt: new Date().toISOString(),
    solved: false, attempts: [], timeComplexity: '', spaceComplexity: '', ...overrides,
  };
  await page.goto('/#/settings');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'assessment.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version, tasks: [record] })),
  });
  await page.getByRole('dialog').getByRole('button', { name: 'Импортировать', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Импортировано записей: 1');
  await page.goto('/#/task/range-sum-query');
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
}
async function openAssessment(page: Page) {
  await page.locator('.complexity-assessment > summary').click();
}
async function select(page: Page, group: string, option: string) {
  await page.getByRole('group', { name: group, exact: true }).getByRole('radio', { name: option, exact: true }).check();
}
async function check(page: Page) {
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await expect(page.locator('.results')).toContainText('Тесты пройдены');
}

test('four optional radio groups have no default and failed tests do not grade choices', async ({ page }, testInfo) => {
  await page.goto('/#/task/range-sum-query');
  await openAssessment(page);
  await expect(page.locator('.complexity-assessment input:checked')).toHaveCount(0);
  await expect(page.locator('.complexity-assessment input[type="text"]')).toHaveCount(0);
  for (const [group] of targets) {
    await expect(page.getByRole('group', { name: group, exact: true }).getByRole('radio')).toHaveCount(6);
  }
  await select(page, targets[0][0], 'O(N)');
  await expect(feedback(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await expect(page.locator('.results')).toContainText('Ответ не совпал');
  await expect(feedback(page)).toContainText('оценка пока не сверяется');
  await expect(feedback(page)).not.toContainText('Цель задачи:');
  await page.locator('.editor-panel').screenshot({ path: testInfo.outputPath('editor-workflow.png') });
});

test('passed tests with no choices remain incomplete until the next explicit check', async ({ page }) => {
  await seed(page);
  await check(page);
  await expect(feedback(page)).toContainText('не заполнена полностью');
  await expect(feedback(page)).not.toContainText('Цель задачи:');
  await openAssessment(page);
  for (const [group, option] of targets) await select(page, group, option);
  await expect(feedback(page)).toContainText('Сверка устарела');
  await check(page);
  await expect(feedback(page)).toContainText('Выбранные оценки совпадают с целевыми');
  await expect(feedback(page)).toContainText('Сложность самого кода автоматически не подтверждена');
  await expect(feedback(page).locator('li')).toHaveCount(4);
});

test('mismatch, uncertainty and code edits are distinct from correctness', async ({ page }) => {
  await seed(page);
  await openAssessment(page);
  for (const [group, option] of targets) await select(page, group, option);
  await select(page, 'Один запрос — время', 'O(N)');
  await check(page);
  await expect(feedback(page)).toContainText('отличаются от целевых');
  await expect(feedback(page)).toContainText('Если твой код действительно имеет выбранную сложность');
  await select(page, 'Один запрос — время', 'Пока не знаю');
  await expect(feedback(page)).toContainText('Сверка устарела');
  await check(page);
  await expect(feedback(page)).toContainText('не заполнена полностью');
  const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await editor.press('Enter');
  await page.keyboard.insertText('// changed');
  await expect(feedback(page)).toContainText('Сверка устарела');
});

test('choices made during execution do not alter the run snapshot', async ({ page }) => {
  await seed(page, { code: 'const started = performance.now(); while (performance.now() - started < 1000) {} ' + code });
  await openAssessment(page);
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await select(page, 'Подготовка — время', 'O(N)');
  await expect(page.locator('.results')).toContainText('Тесты пройдены');
  await expect(feedback(page)).toContainText('Сверка устарела');
});

test('choices survive reload and an export/import round trip', async ({ page }) => {
  await seed(page);
  await openAssessment(page);
  await select(page, 'Подготовка — время', 'O(N)');
  await select(page, 'Один запрос — память', 'Пока не знаю');
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
  await page.reload();
  await openAssessment(page);
  await expect(page.getByRole('group', { name: 'Подготовка — время', exact: true }).getByRole('radio', { name: 'O(N)', exact: true })).toBeChecked();
  await expect(feedback(page)).toHaveCount(0);
  await page.goto('/#/settings');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Экспорт прогресса' }).click();
  const stream = await (await downloading).createReadStream();
  if (!stream) throw new Error('Backup download is missing');
  let source = '';
  for await (const chunk of stream) source += chunk.toString();
  const backup = JSON.parse(source);
  expect(backup.version).toBe(3);
  expect(backup.tasks[0].complexityChoices).toEqual({ 'build-time': 'linear', 'query-space': 'unknown' });
  await seed(page);
  await page.goto('/#/settings');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'restored.json', mimeType: 'application/json', buffer: Buffer.from(source),
  });
  await page.getByRole('dialog').getByRole('button', { name: 'Импортировать', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Импортировано записей: 1');
  await page.goto('/#/task/range-sum-query');
  await openAssessment(page);
  await expect(page.getByRole('group', { name: 'Один запрос — память', exact: true }).getByRole('radio', { name: 'Пока не знаю', exact: true })).toBeChecked();
});

test('legacy text is retained read-only without selecting cards automatically', async ({ page }) => {
  await seed(page, { timeComplexity: 'Подготовка O(N), запрос O(1)', spaceComplexity: 'O(N)' }, 1);
  await openAssessment(page);
  await expect(page.locator('.complexity-assessment input:checked')).toHaveCount(0);
  await page.getByText('Прежние текстовые оценки', { exact: true }).click();
  await expect(page.locator('.legacy-complexity')).toContainText('Подготовка O(N), запрос O(1)');
  await expect(page.locator('.legacy-complexity')).toContainText('Память: O(N)');
});

test('assessment follows the editor before checking in every layout, including a small panel', async ({ page }) => {
  await seed(page);
  await openAssessment(page);
  await select(page, 'Подготовка — время', 'O(N)');
  for (const preset of ['Колонки', 'Результаты снизу', 'Вертикально']) {
    await page.getByRole('button', { name: preset, exact: true }).click();
    await expect(page.locator('[data-panel="editor"] .complexity-assessment')).toHaveCount(1);
    await expect(page.locator('.practice-notes .complexity-assessment')).toHaveCount(0);
    expect(await page.locator('.editor-panel').evaluate(panel => {
      const editor = panel.querySelector('.editor-canvas')!;
      const assessment = panel.querySelector('.complexity-assessment')!;
      const actions = panel.querySelector('.editor-actions')!;
      return Boolean((editor.compareDocumentPosition(assessment) & Node.DOCUMENT_POSITION_FOLLOWING)
        && (assessment.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING));
    })).toBe(true);
    await page.getByRole('button', { name: 'Развернуть: Редактор', exact: true }).click();
    await expect(page.locator('.complexity-assessment')).toBeVisible();
    await expect(page.getByRole('group', { name: 'Подготовка — время', exact: true }).getByRole('radio', { name: 'O(N)', exact: true })).toBeChecked();
    await page.getByRole('button', { name: 'Вернуть расположение', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Колонки', exact: true }).click();
  await page.getByRole('separator', { name: 'Высота редактора и результатов' }).press('Home');
  expect((await page.locator('.editor-canvas').boundingBox())?.height).toBeGreaterThanOrEqual(180);
  await select(page, 'Один запрос — память', 'Пока не знаю');
  await check(page);
});
