import { expect, test } from '@playwright/test';

test('welcome is the default homepage with guidance and two learning entry points', async ({ page }) => {
  const loadedScripts: string[] = [];
  page.on('request', request => {
    if (request.resourceType() === 'script') loadedScripts.push(request.url());
  });
  await page.goto('/');
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Учимся решать, а не запоминать');
  for (const name of ['Как заниматься', 'Привычки, которые помогают', 'Что проверяет приложение', 'Твой прогресс — в этом браузере']) {
    await expect(main.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await expect(main.locator('.welcome-steps > li')).toHaveCount(4);
  await expect(main.locator('.welcome-caption')).toHaveText('Разделов: 8 · Тем: 22 · Заданий: 101 · Без аккаунта');
  await expect(page.locator('.topic-card')).toHaveCount(0);
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
  expect(loadedScripts.some(url => /CodeEditor|editor\.api|ts\.worker/.test(url))).toBe(false);
  const catalog = page.getByRole('navigation', { name: 'Разделы курса' }).getByRole('link', { name: 'Все темы', exact: true });
  await expect(catalog).not.toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: 'Algo — главная', exact: true })).toHaveAttribute('aria-current', 'page');
  await main.getByRole('link', { name: 'Начать с основ', exact: true }).click();
  await expect(page).toHaveURL(/#\/section\/01-basics$/);
  await expect(page.locator('.section-page > h1')).toHaveText('Основы');
  await page.getByRole('link', { name: 'Algo — главная', exact: true }).click();
  await expect(main.locator('.welcome-page')).toBeVisible();
  await main.getByRole('link', { name: 'Все темы', exact: true }).click();
  await expect(page).toHaveURL(/#\/topics$/);
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Все темы');
  await expect(page.locator('.topic-card')).toHaveCount(22);
  await expect(catalog).toHaveAttribute('aria-current', 'page');
});

test('welcome guidance links lead to UMPIRE and backup settings', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Изучи фреймворк UMPIRE →', exact: true }).click();
  await expect(page).toHaveURL(/#\/read\/00-how-to-solve\.md$/);
  await expect(page.locator('.article')).toContainText('UMPIRE');
  await page.getByRole('link', { name: '← К курсу', exact: true }).click();
  await expect(page).toHaveURL(/#\/topics$/);
  await page.getByRole('link', { name: 'Algo — главная', exact: true }).click();
  await page.getByRole('link', { name: 'экспортируй резервную копию в настройках', exact: true }).click();
  await expect(page).toHaveURL(/#\/settings$/);
  await expect(page.getByRole('button', { name: /Экспорт/ })).toBeVisible();
});

test('logo returns to welcome at the top without replacing task or catalogue deep links', async ({ page }) => {
  await page.goto('/#/task/range-sum-query');
  await expect(page.locator('.monaco-editor')).toBeVisible();
  await page.getByRole('button', { name: 'Вертикально', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  const logo = page.getByRole('link', { name: 'Algo — главная', exact: true });
  await logo.click();
  await expect(logo).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.welcome-page')).toBeVisible();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 500));
  await logo.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole('main').getByRole('link', { name: 'Все темы', exact: true }).click();
  await page.reload();
  await expect(page).toHaveURL(/#\/topics$/);
  await expect(page.getByRole('heading', { name: 'Все темы', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator('.welcome-page')).toBeVisible();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test('welcome fits mobile and supports both UI themes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
    await expect(page.locator('.welcome-page')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect(page.getByRole('main').getByRole('link', { name: 'Начать с основ', exact: true })).toBeVisible();
  }
});
