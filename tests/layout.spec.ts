import { expect, test, type Page } from '@playwright/test';

const panel = (page: Page, id: string) => page.locator(`[data-panel="${id}"]`);
async function choose(page: Page, name: string) {
  await page.getByLabel('Расположение панелей', { exact: true }).click();
  await page.getByRole('button', { name, exact: true }).click();
}
async function size(page: Page, id: string) {
  const box = await panel(page, id).boundingBox();
  if (!box) throw new Error(`Panel ${id} is not visible`);
  return box;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/#/task/range-sum-query');
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-loaded', 'true');
  await expect(page.locator('.monaco-editor')).toBeVisible();
});

test('three presets position panels, persist globally and reset', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const statement = await size(page, 'statement');
  const editor = await size(page, 'editor');
  const results = await size(page, 'results');
  expect(editor.x).toBeGreaterThan(statement.x + statement.width);
  expect(results.y).toBeGreaterThan(editor.y + editor.height);
  await choose(page, 'Результаты снизу');
  expect((await size(page, 'results')).width).toBeGreaterThan((await size(page, 'editor')).width * 1.4);
  await choose(page, 'Вертикально');
  expect((await size(page, 'editor')).x).toBeCloseTo((await size(page, 'statement')).x, 0);
  expect((await size(page, 'results')).y).toBeGreaterThan((await size(page, 'editor')).y);
  await page.goto('/#/topic/prefix-sum');
  await page.goto('/#/task/range-sum-query');
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-preset', 'stacked');
  await page.reload();
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-preset', 'stacked');
  await choose(page, 'Сбросить расположение');
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-preset', 'columns');
  expect(errors).toEqual([]);
});

test('drag and keyboard resizing respect minimums and survive reload', async ({ page }) => {
  const before = await size(page, 'statement');
  const separator = page.getByRole('separator', { name: 'Ширина колонок' });
  const box = await separator.boundingBox();
  if (!box) throw new Error('Separator missing');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  const resized = await size(page, 'statement');
  expect(resized.width).toBeGreaterThan(before.width + 60);
  await page.reload();
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-loaded', 'true');
  expect((await size(page, 'statement')).width).toBeCloseTo(resized.width, 0);
  await separator.focus();
  await separator.press('Home');
  expect((await size(page, 'statement')).width).toBeCloseTo(280, 0);
  await separator.press('End');
  expect((await size(page, 'editor')).width).toBeCloseTo(280, 0);
  const horizontal = page.getByRole('separator', { name: 'Высота редактора и результатов' });
  await horizontal.press('Home');
  expect((await size(page, 'editor')).height).toBeCloseTo(220, 0);
  await horizontal.press('End');
  expect((await size(page, 'results')).height).toBeCloseTo(120, 0);
  await page.getByRole('button', { name: 'Свернуть: Редактор', exact: true }).click();
  await page.getByRole('button', { name: 'Свернуть: Результаты', exact: true }).click();
  await page.getByRole('button', { name: 'Восстановить: Результаты', exact: true }).click();
  await expect(panel(page, 'results').locator('.panel-body')).toBeVisible();
});

test('collapse, maximize and presets keep the same editor DOM, caret, undo, hints and results', async ({ page }) => {
  const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await editor.press('Enter');
  await page.keyboard.insertText('// alpha');
  const modelDOM = await page.locator('.monaco-editor').elementHandle();
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await expect(page.locator('.results')).toContainText('Ответ не совпал');
  await page.getByRole('button', { name: 'Подсказки', exact: true }).click();
  await page.getByRole('button', { name: 'Открыть подсказку 1', exact: true }).click();
  const hint = await page.locator('.problem-body .markdown').innerText();
  await page.getByRole('button', { name: 'Свернуть: Редактор', exact: true }).click();
  await expect(page.locator('.monaco-editor')).toBeHidden();
  await page.getByRole('button', { name: 'Восстановить: Редактор', exact: true }).click();
  const originalSize = await size(page, 'editor');
  await page.getByRole('button', { name: 'Развернуть: Редактор', exact: true }).click();
  await expect(panel(page, 'statement')).toBeHidden();
  await page.getByRole('button', { name: 'Вернуть расположение', exact: true }).click();
  expect((await size(page, 'editor')).width).toBeCloseTo(originalSize.width, 0);
  expect((await size(page, 'editor')).height).toBeCloseTo(originalSize.height, 0);
  await choose(page, 'Результаты снизу');
  await choose(page, 'Вертикально');
  await choose(page, 'Колонки');
  expect(await modelDOM?.evaluate(node => node.isConnected)).toBe(true);
  await expect(page.locator('.results')).toContainText('Ответ не совпал');
  expect(await page.locator('.problem-body .markdown').innerText()).toBe(hint);
  await editor.focus();
  await page.keyboard.insertText(' beta');
  await expect(page.locator('.monaco-editor')).toContainText('// alpha beta');
  await editor.press('ControlOrMeta+Z');
  await expect(page.locator('.monaco-editor')).not.toContainText('beta');
  await expect(page.locator('.monaco-editor')).toContainText('alpha');
});

test('row resizing is independent for bottom and stacked presets', async ({ page }) => {
  await choose(page, 'Результаты снизу');
  const initialBottom = await size(page, 'editor');
  await page.getByRole('separator', { name: 'Высота верхних панелей и результатов' }).press('Shift+ArrowDown');
  const resizedBottom = await size(page, 'editor');
  expect(resizedBottom.height).toBeCloseTo(initialBottom.height + 40, 0);
  await choose(page, 'Вертикально');
  const initialStatement = await size(page, 'statement');
  const initialResult = await size(page, 'results');
  await page.getByRole('separator', { name: 'Высота условия и редактора' }).press('Shift+ArrowDown');
  expect((await size(page, 'statement')).height).toBeCloseTo(initialStatement.height + 40, 0);
  expect((await size(page, 'results')).height).toBeCloseTo(initialResult.height, 0);
  await choose(page, 'Результаты снизу');
  expect((await size(page, 'editor')).height).toBeCloseTo(resizedBottom.height, 0);
});

for (const preset of ['Колонки', 'Результаты снизу', 'Вертикально']) {
  test(`all panes can collapse and restore in ${preset}`, async ({ page }) => {
    await choose(page, preset);
    for (const name of ['Условие', 'Редактор', 'Результаты']) {
      await page.getByRole('button', { name: `Свернуть: ${name}`, exact: true }).click();
    }
    for (const name of ['Условие', 'Редактор', 'Результаты']) {
      await page.getByRole('button', { name: `Восстановить: ${name}`, exact: true }).click();
    }
    for (const id of ['statement', 'editor', 'results']) {
      await expect(panel(page, id).locator('.panel-body').first()).toBeVisible();
    }
  });
}

test('narrow screen uses vertical panels without overwriting desktop preference', async ({ page }) => {
  await choose(page, 'Результаты снизу');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-preset', 'stacked');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-preset', 'bottom');
});

test('invalid stored layout is reported and can be reset', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('algo-workspace-v1', '{"version":7}'));
  await page.reload();
  await expect(page.locator('.workspace-panels > [role="alert"]')).toContainText('Не удалось восстановить расположение');
  await choose(page, 'Сбросить расположение');
  await expect(page.locator('.workspace-panels > [role="alert"]')).toHaveCount(0);
});

test('storage failures are visible without blocking layout changes', async ({ page }) => {
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'algo-workspace-v1') throw new DOMException('Storage unavailable', 'QuotaExceededError');
      original.call(this, key, value);
    };
  });
  await choose(page, 'Вертикально');
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-preset', 'stacked');
  await expect(page.locator('.workspace-panels > [role="alert"]')).toContainText('Расположение изменено, но не сохранено');
});
