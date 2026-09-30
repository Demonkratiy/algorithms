import { expect, test, type Page } from '@playwright/test';
import { linkedListSolutions } from './fixtures/linked-lists';

const combined = `const hasCycle = (() => { ${linkedListSolutions['linked-list-cycle']}; return hasCycle; })();
const detectCycle = (() => { ${linkedListSolutions['linked-list-cycle-entry']}; return detectCycle; })();`;
async function stored(page: Page, id: string) {
  return page.evaluate(id => new Promise((resolve, reject) => {
    const opening = indexedDB.open('algo-learning');
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => {
      const db = opening.result;
      const request = db.transaction('tasks').objectStore('tasks').get(id);
      request.onsuccess = () => { resolve(request.result); db.close(); };
      request.onerror = () => { reject(request.error); db.close(); };
    };
  }), id);
}

test('splitting a task preserves old code/history and copies code only with confirmation', async ({ page }) => {
  const source = {
    taskId: 'linked-list-cycle', code: combined, updatedAt: '2026-09-30T10:00:00.000Z',
    solved: true, attempts: [{ at: '2026-09-30T09:00:00.000Z', code: combined, mode: 'check', status: 'passed' }],
    timeComplexity: 'O(N)', spaceComplexity: 'O(1)', complexityChoices: { time: 'linear', space: 'constant' },
  };
  await page.goto('/#/settings');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: 'legacy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ version: 2, tasks: [source] })),
  });
  await expect(page.getByRole('status')).toContainText('Импортировано записей: 1');
  await page.goto('/#/task/linked-list-cycle-entry');
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'общую задачу', exact: true })).toHaveAttribute('href', '#/task/linked-list-cycle');
  const before = await stored(page, 'linked-list-cycle-entry');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Взять прежний код', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Взять прежний код', exact: true })).toBeEnabled();
  expect(await stored(page, 'linked-list-cycle-entry')).toEqual(before);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Взять прежний код', exact: true }).click();
  await expect(page.getByText('Код скопирован.', { exact: false })).toBeVisible();
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
  expect(await stored(page, 'linked-list-cycle')).toEqual(source);
  expect(await stored(page, 'linked-list-cycle-entry')).toMatchObject({ code: combined, solved: false, attempts: [], complexityChoices: {} });
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await expect(page.locator('.result-heading')).toContainText('Тесты пройдены');
  expect(await stored(page, 'linked-list-cycle')).toEqual(source);
});

test('a new split part reports the absence of a legacy draft explicitly', async ({ page }) => {
  await page.goto('/#/task/linked-list-cycle-entry');
  await page.getByRole('button', { name: 'Взять прежний код', exact: true }).click();
  await expect(page.locator('.workspace > [role="alert"]')).toContainText('нет сохранённого кода');
});
