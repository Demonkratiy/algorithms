import { expect, test, type Page } from '@playwright/test';

const storageKey = 'algo-sidebar-width-v1';
const separator = (page: Page) => page.getByRole('separator', { name: 'Ширина меню', exact: true });

async function expectWidth(page: Page, width: number) {
  await expect(page.locator('.sidebar')).toHaveCSS('width', `${width}px`);
  await expect(separator(page)).toHaveAttribute('aria-valuenow', String(width));
  const main = await page.locator('main').boundingBox();
  expect(main?.x).toBe(width);
}

test('dragging the sidebar moves the page edge, respects bounds and persists on reload', async ({ page }) => {
  await page.goto('/');
  await expectWidth(page, 228);
  const handle = separator(page);
  const box = await handle.boundingBox();
  if (!box) throw new Error('Sidebar separator missing');
  await page.mouse.move(box.x + box.width / 2, 350);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 100, 350, { steps: 6 });
  await expectWidth(page, 328);
  await page.mouse.move(1200, 350);
  await expectWidth(page, 400);
  await page.mouse.move(20, 350);
  await expectWidth(page, 200);
  await page.mouse.move(328, 350);
  await page.mouse.up();
  await expectWidth(page, 328);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe('328');
  await page.reload();
  await expectWidth(page, 328);
  await handle.dblclick();
  await expectWidth(page, 228);
});

test('keyboard resizing survives navigation, hide/show and mobile without changing desktop preference', async ({ page }) => {
  await page.goto('/#/topics');
  const handle = separator(page);
  await handle.focus();
  await handle.press('ArrowRight');
  await expectWidth(page, 238);
  await handle.press('Shift+ArrowRight');
  await expectWidth(page, 278);
  await handle.press('ArrowLeft');
  await expectWidth(page, 268);
  await handle.press('Home');
  await expectWidth(page, 200);
  await handle.press('End');
  await expectWidth(page, 400);
  await page.locator('.course-section-heading').getByRole('link', { name: 'Графы', exact: true }).click();
  await expect(page).toHaveURL(/#\/section\/06-graphs$/);
  await expectWidth(page, 400);
  await page.getByRole('button', { name: 'Скрыть меню', exact: true }).click();
  await expect(handle).toHaveCount(0);
  await expect(page.locator('.sidebar')).toBeHidden();
  expect((await page.locator('main').boundingBox())?.x).toBe(0);
  await page.getByRole('button', { name: 'Показать меню', exact: true }).click();
  await expectWidth(page, 400);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(handle).toBeHidden();
  await expect(page.locator('.sidebar')).toHaveCSS('width', '390px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe('400');
  await page.setViewportSize({ width: 1280, height: 720 });
  await expectWidth(page, 400);
});

test('resizing does not remount the editor or discard its code and undo', async ({ page }) => {
  await page.goto('/#/task/range-sum-query');
  const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await editor.press('Enter');
  await page.keyboard.insertText('// sidebar resize');
  const modelDOM = await page.locator('.monaco-editor').elementHandle();
  await separator(page).press('End');
  await expectWidth(page, 400);
  expect(await modelDOM?.evaluate(node => node.isConnected)).toBe(true);
  await expect(page.locator('.monaco-editor')).toContainText('// sidebar resize');
  await editor.focus();
  await editor.press('ControlOrMeta+Z');
  await expect(page.locator('.monaco-editor')).not.toContainText('// sidebar resize');
});

test('pointer cancellation ends resizing and the next drag still works', async ({ page }) => {
  await page.goto('/');
  const handle = separator(page);
  await page.mouse.move(228, 350);
  await page.mouse.down();
  await page.mouse.move(280, 350);
  await expectWidth(page, 280);
  await handle.dispatchEvent('pointercancel', { pointerId: 1 });
  await expect(handle).not.toHaveClass(/dragging/);
  await page.mouse.move(330, 350);
  await page.mouse.up();
  await expectWidth(page, 280);
  await page.mouse.move(280, 350);
  await page.mouse.down();
  await page.mouse.move(300, 350);
  await page.mouse.up();
  await expectWidth(page, 300);
});

for (const saved of ['{', '"wide"', '900', 'null']) {
  test(`invalid sidebar width ${saved} is reported and can be reset`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: saved });
    await page.reload();
    await expect(page.getByRole('alert')).toContainText('Не удалось восстановить ширину меню');
    await expectWidth(page, 228);
    await separator(page).dblclick();
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe('228');
  });
}

test('storage failures are reported without preventing sidebar resizing', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('Storage unavailable', 'QuotaExceededError');
      original.call(this, name, value);
    };
  }, storageKey);
  await separator(page).press('ArrowRight');
  await expectWidth(page, 238);
  await expect(page.getByRole('alert')).toContainText('Ширина меню изменена, но не сохранена');
});
