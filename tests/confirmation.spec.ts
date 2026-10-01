import { expect, test } from '@playwright/test';

test('reset and restore use themed dialogs, cancellation preserves code and history', async ({ page }) => {
  const nativeDialogs: string[] = [];
  page.on('dialog', async dialog => { nativeDialogs.push(dialog.type()); await dialog.dismiss(); });
  await page.goto('/#/task/range-sum-query');
  const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
  const reset = page.getByRole('button', { name: 'Сбросить', exact: true });
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await editor.press('Enter');
  await page.keyboard.insertText('// recorded draft');
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await expect(page.locator('.result-heading')).toContainText('Ответ не совпал');
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await editor.press('Enter');
  await page.keyboard.insertText('// current draft');
  await reset.click();
  const modal = page.getByRole('dialog', { name: 'Сбросить решение?', exact: true });
  await expect(modal).toBeVisible();
  const cancel = modal.getByRole('button', { name: 'Отмена', exact: true });
  await expect(cancel).toBeFocused();
  await cancel.press('Tab');
  await expect(modal.getByRole('button', { name: 'Сбросить код', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(cancel).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(reset).toBeFocused();
  await expect(page.locator('.monaco-editor')).toContainText('// current draft');
  await reset.click();
  await modal.getByRole('button', { name: 'Сбросить код', exact: true }).click();
  await expect(modal).toBeHidden();
  await expect(page.locator('.monaco-editor')).not.toContainText('// recorded draft');
  await page.getByText('Последние запуски (1/5)', { exact: true }).click();
  await page.getByRole('button', { name: 'Восстановить код', exact: true }).click();
  const restore = page.getByRole('dialog', { name: 'Восстановить код?', exact: true });
  await restore.getByRole('button', { name: 'Отмена', exact: true }).click();
  await expect(page.locator('.monaco-editor')).not.toContainText('// recorded draft');
  await page.getByRole('button', { name: 'Восстановить код', exact: true }).click();
  await restore.getByRole('button', { name: 'Восстановить код', exact: true }).click();
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await expect(page.locator('.monaco-editor')).toContainText('// recorded draft');
  await expect(page.locator('.monaco-editor')).not.toContainText('// current draft');
  await expect(page.locator('.attempt')).toHaveCount(1);
  expect(nativeDialogs).toEqual([]);
});

test('import can be cancelled and the same file can be selected again', async ({ page }) => {
  await page.goto('/#/settings');
  const file = { name: 'empty.json', mimeType: 'application/json', buffer: Buffer.from('{"version":3,"tasks":[]}') };
  await page.locator('input[type="file"]').setInputFiles(file);
  const modal = page.getByRole('dialog', { name: 'Импортировать прогресс?', exact: true });
  await expect(modal).toContainText('Импортировать 0 записей');
  await modal.getByRole('button', { name: 'Отмена', exact: true }).click();
  await expect(page.getByText('Импортировано записей: 0', { exact: false })).toHaveCount(0);
  await page.locator('input[type="file"]').setInputFiles(file);
  await modal.getByRole('button', { name: 'Импортировать', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Импортировано записей: 0');
});

test('leaving the route cancels a pending confirmation without replacing the draft', async ({ page }) => {
  await page.goto('/#/topic/prefix-sum');
  await page.locator('.task-link').filter({ hasText: 'Range Sum Query' }).click();
  const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await editor.press('Enter');
  await page.keyboard.insertText('// retain on navigation');
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Сбросить', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#\/topic\/prefix-sum$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goForward();
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await expect(page.locator('.monaco-editor')).toContainText('// retain on navigation');
});

test('confirmation follows palette and typography and fits mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('algo-settings', JSON.stringify({
    ui: 'dark', editor: 'dark', palette: 'forest', uiSize: 'large', uiFont: 'comic-relief',
  })));
  await page.goto('/#/settings');
  await page.evaluate(() => document.fonts.ready);
  const background = await page.locator('.settings-card').first().evaluate(element => getComputedStyle(element).backgroundColor);
  await page.locator('input[type="file"]').setInputFiles({
    name: 'empty.json', mimeType: 'application/json', buffer: Buffer.from('{"version":3,"tasks":[]}'),
  });
  const modal = page.getByRole('dialog');
  await expect(modal).toHaveCSS('background-color', background);
  await expect(modal).toHaveCSS('font-family', '"Comic Relief", cursive');
  const box = await modal.boundingBox();
  if (!box) throw new Error('Modal is not visible');
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  await expect(modal.getByRole('button', { name: 'Отмена', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});
