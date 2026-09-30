import { expect, test } from '@playwright/test';

test('course, theory and non-runnable practice are readable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Учимся решать, а не запоминать' })).toBeVisible();
  await page.locator('.topic-card').filter({ hasText: 'Matrix' }).click();
  await expect(page.locator('.article')).toContainText('Matrix');
  await page.locator('.task-link').filter({ hasText: 'Rotate Image' }).click();
  await expect(page.getByText('Проверка этой задачи ещё не подключена.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Проверить решение' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Разбор', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Показать разбор — я готов' })).toBeVisible();
});

test('one check button runs all cases, starter fails and draft survives reload', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.hostname !== '127.0.0.1') externalRequests.push(url.href);
  });
  await page.goto('/#/task/range-sum-query');
  await expect(page.locator('.monaco-editor')).toBeVisible();
  await expect.poll(() => page.locator('.monaco-editor .view-lines span[class*="mtk"]').evaluateAll(
    nodes => new Set(nodes.map(node => getComputedStyle(node).color)).size,
  )).toBeGreaterThan(1);
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Пример/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await expect(page.locator('.case-list > details')).toHaveCount(6);
  await expect(page.locator('.results')).toContainText('Ответ не совпал');
  await expect(page.locator('.results')).toContainText('undefined');
  await expect(page.getByText('Есть успешная проверка', { exact: true })).toHaveCount(0);
  const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await editor.press('Enter');
  await page.keyboard.insertText('// сохранённый черновик');
  await expect(page.locator('.monaco-editor')).toContainText('сохранённый черновик');
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
  await page.reload();
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await expect(page.locator('.monaco-editor')).toContainText('сохранённый черновик');
  await expect(page.getByText('Последние запуски (1/5)')).toBeVisible();
  expect(externalRequests).toEqual([]);
});

test('syntax errors, cancellation and changing layout are actionable', async ({ page }) => {
  await page.goto('/#/task/range-sum-query');
  const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
  await expect(editor).toBeAttached();
  await editor.focus();
  await editor.press('ControlOrMeta+A');
  await page.keyboard.insertText('const = 1;');
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await expect(page.locator('.results')).toContainText('SyntaxError');
  await expect(page.locator('.results')).toContainText('JavaScript не смог разобрать код');
  await editor.focus();
  await editor.press('ControlOrMeta+A');
  await page.keyboard.insertText('while (true) {}');
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await page.getByRole('button', { name: 'Остановить', exact: true }).click();
  await expect(page.locator('.results')).toContainText('Запуск остановлен');
  await page.getByRole('button', { name: 'Развернуть: Редактор', exact: true }).click();
  await expect(page.locator('.problem')).toBeHidden();
  await page.getByRole('button', { name: 'Вернуть расположение', exact: true }).click();
  await expect(page.locator('.problem')).toBeVisible();
});

test('independent themes persist and progress can be exported', async ({ page }) => {
  await page.goto('/#/settings');
  const ui = page.getByRole('group', { name: 'Интерфейс и теория' });
  const editor = page.getByRole('group', { name: 'Редактор кода' });
  await ui.getByRole('button', { name: 'Тёмная', exact: true }).click();
  await editor.getByRole('button', { name: 'Светлая', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.code-preview')).not.toHaveClass(/dark/);
  await page.reload();
  await expect(ui.getByRole('button', { name: 'Тёмная', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(editor.getByRole('button', { name: 'Светлая', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Экспорт прогресса' }).click();
  expect((await download).suggestedFilename()).toMatch(/^algo-progress-.*\.json$/);
});

test('bad backups report errors without overwriting local data', async ({ page }) => {
  await page.goto('/#/settings');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"version":42,"tasks":[]}'),
  });
  await expect(page.getByRole('alert')).toContainText('Импорт не выполнен');
});

test('valid backup restores a draft and full checks persist historical success', async ({ page }) => {
  // Deliberately naive: a passing test suite establishes outputs, not the Big O goal.
  const code = 'class NumArray { constructor(nums) { this.nums = nums; } sumRange(l, r) { return this.nums.slice(l, r + 1).reduce((a, b) => a + b, 0); } }';
  const backup = { version: 1, tasks: [{
    taskId: 'range-sum-query', code, updatedAt: new Date().toISOString(),
    solved: false, attempts: [{ at: new Date().toISOString(), code, mode: 'example', status: 'passed' }], timeComplexity: '', spaceComplexity: '',
  }] };
  await page.goto('/#/settings');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: 'progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByRole('status')).toContainText('Импортировано записей: 1');
  await page.goto('/#/task/range-sum-query');
  await expect(page.locator('.monaco-editor')).toContainText('reduce');
  await expect(page.getByText('Есть успешная проверка', { exact: true })).toHaveCount(0);
  await page.getByText('Последние запуски (1/5)', { exact: true }).click();
  await expect(page.locator('.attempt')).toContainText('Примеры (старый запуск)');
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await expect(page.locator('.results')).toContainText('Тесты пройдены');
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Есть успешная проверка', { exact: true })).toBeVisible();
});

test('in-page Markdown anchors do not replace the application route', async ({ page }) => {
  await page.goto('/#/read/00-how-to-solve.md');
  const link = page.locator('.markdown a[href^="#"]').first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/#\/read\/00-how-to-solve\.md$/);
  expect(await page.locator('.markdown [id^="user-content-"]').count()).toBeGreaterThan(0);
});

test('theory fits a phone-sized viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/topic/prefix-sum');
  await expect(page.locator('.article')).toContainText('префикс');
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

test('console output is grouped under the matching test with initialization separate', async ({ page }) => {
  await page.goto('/#/task/range-sum-query');
  const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
  await editor.focus();
  await editor.press('ControlOrMeta+A');
  await page.keyboard.insertText("console.log('initial'); class NumArray { constructor(nums) { console.log('size', nums.length); } sumRange(l, r) { console.log('call', l, r); } }");
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await expect(page.locator('.case-list > details')).toHaveCount(6);
  const first = page.locator('.case-list > details').nth(0).locator('.case-console');
  const second = page.locator('.case-list > details').nth(1).locator('.case-console');
  await first.locator('summary').click();
  await second.locator('summary').click();
  await expect(first.locator('pre')).toHaveText('size 6\ncall 0 2\ncall 2 5\ncall 0 5');
  await expect(second.locator('pre')).toHaveText('size 1\ncall 0 0');
  await page.locator('.initialization-logs summary').click();
  await expect(page.locator('.initialization-logs pre')).toHaveText('initial');
});
