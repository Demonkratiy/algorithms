import { expect, test, type Page } from '@playwright/test';

const panel = (page: Page, id: string) => page.locator(`[data-panel="${id}"]`);
async function choose(page: Page, name: string) {
  await page.getByRole('group', { name: 'Расположение панелей', exact: true }).getByRole('button', { name, exact: true }).click();
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

test('layout icons are direct buttons with hover and keyboard tooltips', async ({ page }) => {
  const picker = page.getByRole('group', { name: 'Расположение панелей', exact: true });
  await expect(picker.getByRole('button')).toHaveCount(4);
  await expect(picker.locator('button svg')).toHaveCount(4);
  const columns = picker.getByRole('button', { name: 'Колонки', exact: true });
  await expect(columns).toHaveAttribute('aria-pressed', 'true');
  await expect(picker.getByRole('tooltip')).toHaveCount(0);
  await columns.hover();
  await expect(picker.getByRole('tooltip')).toHaveText('Колонки — Условие слева, редактор и результаты справа');
  await picker.getByRole('tooltip').hover();
  await expect(picker.getByRole('tooltip')).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(picker.getByRole('tooltip')).toHaveCount(0);
  await columns.focus();
  await expect(picker.getByRole('tooltip')).toBeVisible();
  await columns.press('Escape');
  await expect(picker.getByRole('tooltip')).toHaveCount(0);
  await columns.press('Tab');
  const bottom = picker.getByRole('button', { name: 'Результаты снизу', exact: true });
  await expect(bottom).toBeFocused();
  await expect(picker.getByRole('tooltip')).toContainText('Условие и редактор сверху');
  await bottom.press('Enter');
  await expect(bottom).toHaveAttribute('aria-pressed', 'true');
  await expect(columns).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-preset', 'bottom');
  await bottom.press('Tab');
  const stacked = picker.getByRole('button', { name: 'Вертикально', exact: true });
  await expect(stacked).toBeFocused();
  await stacked.press('Space');
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-preset', 'stacked');
  await stacked.press('Tab');
  const reset = picker.getByRole('button', { name: 'Сбросить расположение', exact: true });
  await expect(reset).toBeFocused();
  await expect(picker.getByRole('tooltip')).toContainText('не меняя код');
  await reset.press('Enter');
  await expect(columns).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-preset', 'columns');
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
  await expect(page.getByText('Потяни за границу, чтобы изменить размер', { exact: true })).toHaveCount(0);
  const toolbar = await page.locator('.layout-toolbar').boundingBox();
  const picker = await page.locator('.layout-picker').boundingBox();
  if (!toolbar || !picker) throw new Error('Layout toolbar missing');
  expect(picker.x + picker.width).toBeCloseTo(toolbar.x + toolbar.width, 0);
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
  await page.getByRole('separator', { name: 'Высота условия', exact: true }).press('Shift+ArrowDown');
  expect((await size(page, 'statement')).height).toBeCloseTo(initialStatement.height + 40, 0);
  expect((await size(page, 'results')).height).toBeCloseTo(initialResult.height, 0);
  await choose(page, 'Результаты снизу');
  expect((await size(page, 'editor')).height).toBeCloseTo(resizedBottom.height, 0);
});

test('stacked heights push all lower panels and notes without shrinking any neighbour', async ({ page }) => {
  await choose(page, 'Вертикально');
  const ids = ['statement', 'editor', 'results'];
  const labels = ['Высота условия', 'Высота редактора', 'Высота результатов'];
  const positions = () => page.locator('.workspace-panel, .practice-notes').evaluateAll(elements =>
    elements.map(element => ({ top: element.getBoundingClientRect().top + scrollY, height: element.getBoundingClientRect().height })));
  for (let index = 0; index < ids.length; index++) {
    const before = await positions();
    const gridHeight = await page.locator('.panel-grid').evaluate(element => element.getBoundingClientRect().height);
    const handle = page.getByRole('separator', { name: labels[index], exact: true });
    await handle.press('Shift+ArrowDown');
    const after = await positions();
    for (let other = 0; other < after.length; other++) {
      expect(after[other].height).toBeCloseTo(before[other].height + (other === index ? 40 : 0), 0);
      expect(after[other].top).toBeCloseTo(before[other].top + (other > index ? 40 : 0), 0);
    }
    expect(await page.locator('.panel-grid').evaluate(element => element.getBoundingClientRect().height)).toBeCloseTo(gridHeight + 40, 0);
    await expect(handle).toHaveAttribute('aria-valuetext', `${Math.round(after[index].height)} пикселей`);
  }
  const heights = await Promise.all(ids.map(id => size(page, id).then(box => box.height)));
  await page.reload();
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-loaded', 'true');
  expect(await Promise.all(ids.map(id => size(page, id).then(box => box.height)))).toEqual(heights);
  await page.getByRole('separator', { name: 'Высота редактора', exact: true }).press('Home');
  expect((await size(page, 'editor')).height).toBe(220);
  expect((await size(page, 'statement')).height).toBe(heights[0]);
  expect((await size(page, 'results')).height).toBe(heights[2]);
});

test('stacked dragging accounts for page scroll and grows beyond the window height', async ({ page }) => {
  await choose(page, 'Вертикально');
  const handle = page.getByRole('separator', { name: 'Высота условия', exact: true });
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) throw new Error('Stacked separator missing');
  const before = await size(page, 'statement');
  const editorHeight = (await size(page, 'editor')).height;
  const resultsHeight = (await size(page, 'results')).height;
  const startScroll = await page.evaluate(() => scrollY);
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 40, { steps: 4 });
  await page.evaluate(() => window.scrollBy(0, 500));
  const scrolled = await page.evaluate(() => scrollY);
  expect(scrolled).toBeGreaterThan(startScroll);
  await page.mouse.move(x, y + 80, { steps: 4 });
  await page.mouse.up();
  const after = await size(page, 'statement');
  expect(after.height).toBeCloseTo(before.height + 80 + scrolled - startScroll, 0);
  expect(after.height).toBeGreaterThan(await page.evaluate(() => innerHeight));
  expect((await size(page, 'editor')).height).toBe(editorHeight);
  expect((await size(page, 'results')).height).toBe(resultsHeight);
});

test('stacked resizing remains independent beside a collapsed panel and after maximizing', async ({ page }) => {
  await choose(page, 'Вертикально');
  const original = await size(page, 'statement');
  await page.getByRole('button', { name: 'Свернуть: Редактор', exact: true }).click();
  const handle = page.getByRole('separator', { name: 'Высота условия', exact: true });
  await expect(handle).toHaveAttribute('aria-disabled', 'false');
  await handle.press('Shift+ArrowDown');
  expect((await size(page, 'statement')).height).toBe(original.height + 40);
  expect((await size(page, 'editor')).height).toBe(44);
  await page.getByRole('button', { name: 'Развернуть: Условие', exact: true }).click();
  await expect(handle).toBeHidden();
  await page.getByRole('button', { name: 'Вернуть расположение', exact: true }).click();
  expect((await size(page, 'statement')).height).toBe(original.height + 40);
  expect((await size(page, 'editor')).height).toBe(44);
  await page.getByRole('button', { name: 'Восстановить: Редактор', exact: true }).click();
  expect((await size(page, 'editor')).height).toBe(450);
});

test('legacy percentage layout is migrated without discarding its preset or collapsed panels', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('algo-workspace-v1', JSON.stringify({
    version: 1, preset: 'stacked',
    sizes: { columns: [35, 60], bottom: [45, 70], stacked: [20, 50, 30] },
    collapsed: ['results'],
  })));
  await page.reload();
  await expect(page.locator('.panel-grid')).toHaveAttribute('data-preset', 'stacked');
  await expect(page.locator('.workspace-panels > [role="alert"]')).toHaveCount(0);
  expect((await size(page, 'results')).height).toBe(44);
  const before = (await size(page, 'editor')).height;
  await page.getByRole('separator', { name: 'Высота редактора', exact: true }).press('ArrowDown');
  expect((await size(page, 'editor')).height).toBe(before + 10);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('algo-workspace-v1')!));
  expect(saved.version).toBe(2);
  expect(saved.sizes.columns).toEqual([35, 60]);
  expect(saved.sizes.bottom).toEqual([45, 70]);
  expect(saved.collapsed).toEqual(['results']);
  expect(saved.sizes.stacked[1]).toBe(before + 10);
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
  const saved = page.getByRole('button', { name: 'Результаты снизу', exact: true });
  await expect(saved).toHaveAttribute('aria-pressed', 'true');
  await saved.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
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
