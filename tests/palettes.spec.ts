import { expect, test, type Page } from '@playwright/test';
import { palettes } from '../src/lib/palettes';

async function openSettings(page: Page) {
  await page.goto('/#/settings');
  await page.locator('.palette-section > summary').click();
}

function luminance(hex: string) {
  if (/^#[0-9a-f]{3}$/i.test(hex)) hex = `#${[...hex.slice(1)].map(char => char + char).join('')}`;
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Unexpected palette color: ${hex}`);
  const channels = [1, 3, 5].map(offset => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a: string, b: string) {
  const first = luminance(a), second = luminance(b);
  return (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
}

for (const palette of palettes) {
  for (const mode of ['light', 'dark'] as const) {
    test(`${palette.id} ${mode} has readable text, actions and focus`, async ({ page }) => {
      await openSettings(page);
      await page.getByRole('group', { name: 'Интерфейс и теория', exact: true })
        .getByRole('button', { name: mode === 'light' ? 'Светлая' : 'Тёмная', exact: true }).click();
      await page.getByRole('button', { name: palette.title, exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('data-palette', palette.id);
      await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
      const colors = await page.locator('html').evaluate(element => {
        const style = getComputedStyle(element);
        return Object.fromEntries(['bg', 'surface', 'subtle', 'tint', 'text', 'muted', 'accent', 'focus',
          'primary', 'primary-hover', 'on-primary', 'green', 'green-bg', 'red', 'red-bg']
          .map(name => [name, style.getPropertyValue(`--${name}`).trim()]));
      });
      for (const background of ['bg', 'surface', 'subtle', 'tint']) {
        for (const text of ['text', 'muted', 'accent']) {
          expect(contrast(colors[text], colors[background]), `${text} on ${background}`).toBeGreaterThanOrEqual(4.5);
        }
        expect(contrast(colors.focus, colors[background]), `focus on ${background}`).toBeGreaterThanOrEqual(3);
      }
      for (const background of ['primary', 'primary-hover']) {
        expect(contrast(colors['on-primary'], colors[background]), `label on ${background}`).toBeGreaterThanOrEqual(4.5);
      }
      for (const status of ['green', 'red']) {
        for (const text of ['text', 'muted']) {
          expect(contrast(colors[text], colors[`${status}-bg`]), `${text} on ${status}-bg`).toBeGreaterThanOrEqual(4.5);
        }
        for (const background of ['bg', 'surface', `${status}-bg`]) {
          expect(contrast(colors[status], colors[background]), `${status} on ${background}`).toBeGreaterThanOrEqual(4.5);
        }
      }
      const button = page.locator('.preview-card .button.primary');
      await page.getByRole('button', { name: 'Открыть теорию →', exact: true }).focus();
      await page.keyboard.press('Tab');
      await expect(button).toBeFocused();
      expect(await button.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
      await button.hover();
      const hoverBackground = await button.evaluate(element => getComputedStyle(element).backgroundColor);
      await page.mouse.move(0, 0);
      const normalBackground = await button.evaluate(element => getComputedStyle(element).backgroundColor);
      expect(hoverBackground).not.toBe(normalBackground);
      await page.reload();
      await page.locator('.palette-section > summary').click();
      await expect(page.getByRole('button', { name: palette.title, exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
      await page.goto('/#/topic/prefix-sum');
      await expect(page.locator('.article .markdown')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-palette', palette.id);
    });
  }
}

test('one palette follows system mode without changing independent editor colors', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await openSettings(page);
  const editor = page.getByRole('group', { name: 'Редактор кода', exact: true });
  await editor.getByRole('button', { name: 'Тёмная', exact: true }).click();
  const previewColor = await page.locator('.code-preview').evaluate(element => getComputedStyle(element).backgroundColor);
  await page.getByRole('button', { name: 'Океан', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'ocean');
  await expect(editor.getByRole('button', { name: 'Тёмная', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('.code-preview').evaluate(element => getComputedStyle(element).backgroundColor)).toBe(previewColor);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'ocean');
  await page.goto('/#/task/range-sum-query');
  await expect(page.locator('.monaco-editor')).toHaveClass(/vs-dark/);
});

test('legacy modes survive migration and reset changes only appearance', async ({ page }) => {
  await openSettings(page);
  await page.evaluate(() => {
    localStorage.setItem('algo-settings', JSON.stringify({ ui: 'dark', editor: 'light' }));
    localStorage.setItem('algo-sidebar-width-v1', '320');
  });
  await page.reload();
  await page.locator('.palette-section > summary').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Лаванда', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Редактор кода', exact: true }).getByRole('button', { name: 'Светлая', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Лес', exact: true }).click();
  await page.goto('/#/task/range-sum-query');
  const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await editor.press('Enter');
  await page.keyboard.insertText('// palette draft');
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: '⚙ Настройки', exact: true }).click();
  await page.getByRole('button', { name: 'Сбросить оформление', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('algo-settings')!))).toEqual({
    ui: 'system', editor: 'dark', palette: 'lavender',
    uiSize: 'medium', editorSize: 'medium', uiFont: 'system', editorFont: 'default',
  });
  expect(await page.evaluate(() => localStorage.getItem('algo-sidebar-width-v1'))).toBe('320');
  await page.goto('/#/task/range-sum-query');
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await expect(page.locator('.monaco-editor')).toContainText('// palette draft');
});

test('unknown saved palette and write failures are visible and recoverable', async ({ page }) => {
  await openSettings(page);
  await page.evaluate(() => localStorage.setItem('algo-settings', JSON.stringify({ ui: 'light', editor: 'dark', palette: 'missing' })));
  await page.reload();
  await page.locator('.palette-section > summary').click();
  await expect(page.getByRole('alert')).toContainText('Сохранённая палитра неизвестна');
  await page.getByRole('button', { name: 'Сбросить оформление', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'algo-settings') throw new DOMException('Storage unavailable', 'QuotaExceededError');
      original.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Графит', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'graphite');
  await expect(page.getByRole('alert')).toContainText('не сохранены');
});

test('palette picker fits a phone and supports keyboard selection', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSettings(page);
  const palette = page.getByRole('button', { name: 'Лес', exact: true });
  await palette.focus();
  await palette.press('Space');
  await expect(palette).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.palette-samples')).toHaveCount(palettes.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('palette disclosure starts collapsed, shows selected palette and supports keyboard', async ({ page }) => {
  await page.goto('/#/settings');
  const summary = page.locator('.palette-section > summary');
  await expect(summary).toHaveText('Палитра · Лаванда');
  await expect(page.getByRole('button', { name: 'Роза', exact: true })).toBeHidden();
  await summary.focus();
  await summary.press('Enter');
  await page.getByRole('button', { name: 'Роза', exact: true }).click();
  await expect(summary).toHaveText('Палитра · Роза');
  await summary.focus();
  await summary.press('Space');
  await expect(page.getByRole('button', { name: 'Роза', exact: true })).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'ruby');
  await page.reload();
  await expect(summary).toHaveText('Палитра · Роза');
  await expect(page.locator('.palette-choices')).toBeHidden();
});

test('code sample has fixed syntax colors independent of all interface palettes', async ({ page }) => {
  await openSettings(page);
  const editor = page.getByRole('group', { name: 'Редактор кода', exact: true });
  const sampleColors = () => page.locator('.code-preview').evaluate(element => ({
    background: getComputedStyle(element).backgroundColor,
    text: getComputedStyle(element).color,
    tokens: Array.from(element.querySelectorAll('[class^="code-"]'), token => getComputedStyle(token).color),
  }));
  const modes = [];
  for (const name of ['Светлая', 'Тёмная']) {
    await editor.getByRole('button', { name, exact: true }).click();
    const initial = await sampleColors();
    expect(new Set(initial.tokens).size).toBe(4);
    for (const palette of palettes) {
      await page.getByRole('button', { name: palette.title, exact: true }).click();
      expect(await sampleColors()).toEqual(initial);
    }
    modes.push(initial);
  }
  expect(modes[0]).not.toEqual(modes[1]);
});

test('preview buttons retain focus and hover without navigation or side effects', async ({ page, context }) => {
  await page.goto('/#/settings');
  const preview = page.locator('.preview-card');
  const before = await page.evaluate(() => ({ settings: localStorage.getItem('algo-settings'), history: history.length }));
  const pages = context.pages().length;
  await expect(preview.getByRole('link')).toHaveCount(0);
  await expect(preview).toContainText('Выбирай то, что удобно в твоей любимой палитре.');
  for (const name of ['Открыть теорию →', 'К практике']) {
    const button = preview.getByRole('button', { name, exact: true });
    await button.hover();
    await button.click();
    await button.press('Enter');
    await button.press('Space');
    await expect(button).toBeFocused();
    await expect(page).toHaveURL(/#\/settings$/);
  }
  expect(context.pages()).toHaveLength(pages);
  expect(await page.evaluate(() => ({ settings: localStorage.getItem('algo-settings'), history: history.length }))).toEqual(before);
});
