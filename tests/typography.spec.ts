import { expect, test, type Page } from '@playwright/test';
import { editorFonts, uiFonts } from '../src/lib/typography';

async function selectFont(page: Page, label: 'Шрифт текста' | 'Шрифт кода', id: string) {
  const fonts = label === 'Шрифт текста' ? uiFonts : editorFonts;
  const option = fonts.find(font => font.id === id);
  if (!option) throw new Error(`Unknown font: ${id}`);
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('listbox', { name: label, exact: true }).getByRole('option', { name: option.title, exact: true }).click();
}

test('UI and editor sizes are independent, persist and preserve heading hierarchy', async ({ page }) => {
  await page.goto('/#/settings');
  const uiSize = page.getByRole('group', { name: 'Размер текста', exact: true });
  const codeSize = page.getByRole('group', { name: 'Размер кода', exact: true });
  for (const [name, size] of [['Маленький', '13px'], ['Средний', '14px'], ['Большой', '16px']]) {
    await uiSize.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('html')).toHaveCSS('font-size', size);
    await expect(page.locator('.code-preview')).toHaveCSS('font-size', '14px');
    expect(await page.locator('h1').evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(Number.parseFloat(size));
  }
  for (const [name, size] of [['Маленький', '12px'], ['Средний', '14px'], ['Большой', '16px']]) {
    await codeSize.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('.code-preview')).toHaveCSS('font-size', size);
    await expect(page.locator('html')).toHaveCSS('font-size', '16px');
  }
  await page.reload();
  await expect(uiSize.getByRole('button', { name: 'Большой', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(codeSize.getByRole('button', { name: 'Большой', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/#/task/range-sum-query');
  await expect(page.locator('.monaco-editor')).toBeVisible();
  await expect(page.locator('.monaco-editor .view-lines')).toHaveCSS('font-size', '16px');
  await page.evaluate(() => document.documentElement.dataset.uiSize = 'small');
  await expect(page.locator('.monaco-editor .view-lines')).toHaveCSS('font-size', '16px');
});

test('font samples load locally on dropdown opening, including Cyrillic', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.resourceType() === 'font') requests.push(request.url()); });
  await page.goto('/#/settings');
  expect(requests).toEqual([]);
  for (const font of uiFonts.filter(font => font.webFamily)) {
    await selectFont(page, 'Шрифт текста', font.id);
    await expect.poll(() => page.evaluate(family => document.fonts.check(`400 16px "${family}"`, 'Text Пример'), font.webFamily)).toBe(true);
    await expect(page.locator('html')).toHaveCSS('font-family', font.family);
  }
  for (const font of editorFonts.filter(font => font.webFamily)) {
    await selectFont(page, 'Шрифт кода', font.id);
    await expect.poll(() => page.evaluate(family => document.fonts.check(`400 16px "${family}"`, 'Text Пример'), font.webFamily)).toBe(true);
    await expect(page.locator('.code-preview')).toHaveCSS('font-family', font.family);
  }
  expect(requests.length).toBeGreaterThanOrEqual(16);
  expect(requests.every(url => new URL(url).hostname === '127.0.0.1')).toBe(true);
  expect(requests.filter(url => url.includes('cyrillic')).length).toBeGreaterThanOrEqual(8);
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Шрифт текста', exact: true })).toHaveText('Comic Relief');
  await expect(page.getByRole('combobox', { name: 'Шрифт кода', exact: true })).toHaveText('Source Code Pro');
  await page.goto('/#/topic/two-pointers');
  await expect(page.locator('.article .markdown pre').first()).toHaveCSS('font-family', editorFonts[2].family);
  await expect(page.locator('.article')).toHaveCSS('font-family', '"Comic Relief", cursive');
});

test('large UI and all reading fonts fit narrow pages without clipping controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/settings');
  await page.getByRole('group', { name: 'Размер текста', exact: true }).getByRole('button', { name: 'Большой', exact: true }).click();
  for (const font of uiFonts) {
    await selectFont(page, 'Шрифт текста', font.id);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  for (const route of ['/topics', '/topic/two-pointers', '/task/output-order', '/task/range-sum-query']) {
    await page.goto(`/#${route}`);
    if (route === '/task/range-sum-query') await expect(page.locator('.monaco-editor')).toBeVisible();
    else if (route === '/task/output-order') await expect(page.locator('.quiz-question')).toHaveCount(6);
    else if (route.startsWith('/topic/')) await expect(page.locator('.article .markdown')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), route).toBe(true);
  }
});

test('slow code font loading keeps editor DOM, draft, caret and undo intact', async ({ page }) => {
  let release!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  await page.route(/jetbrains-mono.*\.woff2/, async route => {
    await waiting;
    await route.continue();
  });
  await page.addInitScript(() => localStorage.setItem('algo-settings', JSON.stringify({
    ui: 'light', editor: 'dark', palette: 'lavender', editorFont: 'jetbrains-mono',
  })));
  await page.goto('/#/task/range-sum-query', { waitUntil: 'domcontentloaded' });
  try {
    const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
    await editor.focus();
    await editor.press('ControlOrMeta+End');
    await editor.press('Enter');
    await page.keyboard.insertText('// font');
    const model = await page.locator('.monaco-editor').elementHandle();
    release();
    await expect.poll(() => page.evaluate(() => document.fonts.check('400 16px "JetBrains Mono Variable"', 'Text Пример'))).toBe(true);
    expect(await model?.evaluate(element => element.isConnected)).toBe(true);
    await page.keyboard.insertText(' loaded');
    await expect(page.locator('.monaco-editor')).toContainText('// font loaded');
    await editor.press('ControlOrMeta+Z');
    await expect(page.locator('.monaco-editor')).not.toContainText('loaded');
    await expect(page.locator('.monaco-editor')).toContainText('// font');
  } finally {
    release();
  }
});

test('font loading failures are visible and choosing the system font recovers', async ({ page }) => {
  await page.route(/inter.*\.woff2/, route => route.abort());
  await page.goto('/#/settings');
  await selectFont(page, 'Шрифт текста', 'inter');
  await expect(page.getByRole('alert')).toContainText('Шрифт не загрузился');
  await selectFont(page, 'Шрифт текста', 'system');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('appearance reset restores all typography without deleting stored layout', async ({ page }) => {
  await page.goto('/#/settings');
  await selectFont(page, 'Шрифт текста', 'inter');
  await selectFont(page, 'Шрифт кода', 'jetbrains-mono');
  await page.getByRole('group', { name: 'Размер текста', exact: true }).getByRole('button', { name: 'Большой', exact: true }).click();
  await page.evaluate(() => localStorage.setItem('algo-sidebar-width-v1', '320'));
  await page.getByRole('button', { name: 'Сбросить оформление', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Шрифт текста', exact: true })).toHaveText('Системный');
  await expect(page.getByRole('combobox', { name: 'Шрифт кода', exact: true })).toHaveText('По умолчанию');
  await expect(page.locator('html')).toHaveCSS('font-size', '14px');
  await expect(page.locator('.code-preview')).toHaveCSS('font-size', '14px');
  expect(await page.evaluate(() => localStorage.getItem('algo-sidebar-width-v1'))).toBe('320');
});

test('font licenses are distributed with the app', async ({ page }) => {
  await page.goto('/#/settings');
  await page.locator('.font-licenses > summary').click();
  const licenses = page.locator('.font-licenses a');
  await expect(licenses).toHaveCount(8);
  for (const license of await licenses.all()) {
    const download = page.waitForEvent('download');
    await license.click();
    const stream = await (await download).createReadStream();
    if (!stream) throw new Error('License download missing');
    let text = '';
    for await (const chunk of stream) text += chunk.toString();
    expect(text).toContain('SIL OPEN FONT LICENSE');
  }
});

test('styled font dropdown supports keyboard, cancellation, typeahead and outside clicks', async ({ page }) => {
  await page.goto('/#/settings');
  const trigger = page.getByRole('combobox', { name: 'Шрифт текста', exact: true });
  const list = page.getByRole('listbox', { name: 'Шрифт текста', exact: true });
  await trigger.focus();
  await trigger.press('ArrowDown');
  await expect(list).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(list.getByRole('option', { selected: true })).toHaveAccessibleName('Системный');
  await trigger.press('ArrowDown');
  await trigger.press('Enter');
  await expect(trigger).toHaveText('Inter');
  await expect(list).toHaveCount(0);
  await trigger.press('Space');
  await trigger.press('End');
  await trigger.press('Escape');
  await expect(trigger).toHaveText('Inter');
  await expect(list).toHaveCount(0);
  await trigger.press('ArrowUp');
  await trigger.press('Home');
  await trigger.press('Enter');
  await expect(trigger).toHaveText('Системный');
  await trigger.press('c');
  await trigger.press('o');
  await trigger.press('Enter');
  await expect(trigger).toHaveText('Comic Relief');
  await trigger.click();
  await page.getByRole('heading', { name: 'Настройки', exact: true }).click();
  await expect(list).toHaveCount(0);
  await trigger.click();
  await trigger.press('Tab');
  await expect(list).toHaveCount(0);
  await expect(trigger).not.toBeFocused();
});

test('font dropdown colors follow the palette in light and dark modes', async ({ page }) => {
  await page.goto('/#/settings');
  await page.locator('.palette-section > summary').click();
  await page.getByRole('button', { name: 'Лес', exact: true }).click();
  const trigger = page.getByRole('combobox', { name: 'Шрифт текста', exact: true });
  for (const mode of ['Светлая', 'Тёмная']) {
    await page.getByRole('group', { name: 'Интерфейс и теория', exact: true }).getByRole('button', { name: mode, exact: true }).click();
    await trigger.click();
    const list = page.getByRole('listbox', { name: 'Шрифт текста', exact: true });
    await expect(list).toHaveCSS('background-color', await trigger.evaluate(element => getComputedStyle(element).backgroundColor));
    const option = list.getByRole('option', { name: 'Manrope', exact: true });
    await option.hover();
    const preview = page.locator('.preview-selected');
    await expect(option).toHaveCSS('background-color', await preview.evaluate(element => getComputedStyle(element).backgroundColor));
    await expect(option).toHaveCSS('color', await preview.evaluate(element => getComputedStyle(element).color));
    await trigger.press('Escape');
  }
});

test('each dropdown option previews its own family without changing the chosen font', async ({ page }) => {
  await page.goto('/#/settings');
  for (const [label, fonts] of [['Шрифт текста', uiFonts], ['Шрифт кода', editorFonts]] as const) {
    const trigger = page.getByRole('combobox', { name: label, exact: true });
    const before = await trigger.innerText();
    await trigger.click();
    const list = page.getByRole('listbox', { name: label, exact: true });
    for (const font of fonts) {
      const sample = list.getByRole('option', { name: font.title, exact: true }).locator('.font-option-sample');
      await expect(sample).toHaveCSS('font-family', font.family);
      if (font.webFamily) await expect.poll(() => page.evaluate(family =>
        document.fonts.check(`400 16px "${family}"`, 'Аа'), font.webFamily)).toBe(true);
    }
    await trigger.press('Escape');
    await expect(trigger).toHaveText(before);
  }
});
