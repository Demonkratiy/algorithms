import { expect, test } from '@playwright/test';

const sections = [
  ['01-basics', 'Основы', 'big-o', 2],
  ['02-arrays-strings', 'Массивы и строки', 'two-pointers', 5],
  ['03-linear-structures', 'Линейные структуры', 'linked-lists', 2],
  ['04-search-sort', 'Поиск и сортировка', 'binary-search', 3],
  ['05-recursion-trees', 'Рекурсия и деревья', 'recursion', 2],
  ['06-graphs', 'Графы', 'graph-traversal', 2],
  ['07-dynamic-programming', 'Dynamic Programming и Greedy', 'dp-basics', 2],
  ['08-js-interview', 'JS Interview', 'function-utils', 4],
] as const;

for (const [index, [id, title, firstTopic, count]] of sections.entries()) {
  test(`section ${index + 1} overview loads from catalog and direct URL with its learning route`, async ({ page }) => {
    await page.goto('/');
    await page.locator('.course-section-heading').getByRole('link', { name: title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#/section/${id}$`));
    await expect(page.locator('.section-page > h1')).toHaveText(title);
    for (const name of ['Общая идея', 'Где это встречается', 'Что нужно знать заранее', 'Маршрут изучения', 'Что получится после раздела']) {
      await expect(page.locator('.article').getByRole('heading', { name, exact: true })).toBeVisible();
    }
    const route = page.getByRole('complementary', { name: 'Темы раздела' });
    await expect(page.locator(`.article a[href="#/topic/${firstTopic}"]`)).not.toHaveCount(0);
    await expect(route.locator('.task-link')).toHaveCount(count);
    await expect(route.getByRole('link', { name: 'Начать первую тему →', exact: true })).toHaveAttribute('href', `#/topic/${firstTopic}`);
    const nav = page.getByRole('navigation', { name: 'Разделы курса' });
    const titleLink = nav.getByRole('link', { name: `${index + 1} ${title}`, exact: true });
    await expect(titleLink).toHaveAttribute('aria-current', 'page');
    await expect(nav.locator('.section-toggle[aria-expanded="true"]')).toHaveCount(1);
    await expect(nav.locator('.topic-toggle[aria-expanded="true"]')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('.article').getByRole('heading', { name: 'Общая идея', exact: true })).toBeVisible();
    await expect(titleLink).toHaveAttribute('aria-expanded', 'true');
    await route.getByRole('link', { name: 'Начать первую тему →', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#/topic/${firstTopic}$`));
    await page.locator('.breadcrumb').getByRole('link', { name: `${index + 1} · ${title}`, exact: true }).click();
    await expect(titleLink).toHaveAttribute('aria-current', 'page');
    await expect(nav.locator('.topic-toggle[aria-expanded="true"]')).toHaveCount(0);
  });
}

test('Markdown overview links use section routes instead of generic reading pages', async ({ page }) => {
  await page.goto('/#/read/README.md');
  for (const [id] of sections) {
    await expect(page.locator(`.article a[href="#/section/${id}"]`)).toHaveText('Обзор раздела');
  }
  await page.locator('.article a[href="#/section/06-graphs"]').click();
  await expect(page.locator('.section-page > h1')).toHaveText('Графы');
  await expect(page.getByRole('navigation', { name: 'Разделы курса' }).getByRole('link', { name: '6 Графы', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('section title opens overview and repeat clicks toggle without adding history', async ({ page }) => {
  await page.goto('/#/task/move-zeroes');
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  const title = nav.getByRole('link', { name: '2 Массивы и строки', exact: true });
  const toggle = nav.getByRole('button', { name: /раздел 2: Массивы и строки/ });
  await title.click();
  await expect(title).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.section-page')).toBeVisible();
  await expect(nav.locator('.topic-toggle[aria-expanded="true"]')).toHaveCount(0);
  await title.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await title.focus(); await title.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.focus(); await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#\/section\/02-arrays-strings$/);
  await page.goBack();
  await expect(page).toHaveURL(/#\/task\/move-zeroes$/);
  await expect(nav.getByRole('link', { name: /Move Zeroes/ })).toHaveAttribute('aria-current', 'page');
  await page.goForward();
  await expect(title).toHaveAttribute('aria-current', 'page');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.locator('.topic-toggle[aria-expanded="true"]')).toHaveCount(0);
});

test('section links preserve modified clicks and unknown sections show not found', async ({ page, context }) => {
  await page.goto('/#/section/02-arrays-strings');
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  const title = nav.getByRole('link', { name: '2 Массивы и строки', exact: true });
  const opened = context.waitForEvent('page');
  await title.click({ modifiers: ['ControlOrMeta'] });
  const tab = await opened;
  await expect(tab).toHaveURL(/#\/section\/02-arrays-strings$/);
  await expect(title).toHaveAttribute('aria-expanded', 'true');
  await tab.close();
  await page.goto('/#/section/missing');
  await expect(page.getByRole('heading', { name: 'Страница не найдена', exact: true })).toBeVisible();
});

test('section overview and breadcrumbs fit a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/section/07-dynamic-programming');
  await expect(page.locator('.article').getByRole('heading', { name: 'Общая идея', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole('link', { name: 'Начать первую тему →', exact: true }).click();
  await expect(page).toHaveURL(/#\/topic\/dp-basics$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('catalog groups cards and uses the same hierarchical numbers as the sidebar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.course-section')).toHaveCount(8);
  await expect(page.locator('.topic-card')).toHaveCount(22);
  const arrays = page.getByRole('region', { name: 'Массивы и строки', exact: true });
  await expect(arrays.locator('.topic-card')).toHaveCount(5);
  await expect(arrays.locator('.topic-card .eyebrow')).toHaveText(['Тема 2.1', 'Тема 2.2', 'Тема 2.3', 'Тема 2.4', 'Тема 2.5']);
  await arrays.getByRole('link', { name: /Тема 2\.4/ }).click();
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  await expect(nav.getByRole('link', { name: '2.4 Prefix Sum (префиксные суммы)', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.breadcrumb')).toContainText('2.4 · Prefix Sum');
});

test('section and topic disclosures toggle without navigation and expose task links', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  const section = nav.getByRole('button', { name: /раздел 2: Массивы и строки/ });
  await expect(section).toHaveAttribute('aria-expanded', 'false');
  await section.focus(); await section.press('Enter');
  await expect(section).toHaveAttribute('aria-expanded', 'true');
  const topic = nav.getByRole('button', { name: /тему 2\.1: Two Pointers$/ });
  await topic.focus(); await topic.press('Space');
  await expect(topic).toHaveAttribute('aria-expanded', 'true');
  await expect(page).toHaveURL(/\/(?:#\/)?$/);
  await nav.getByRole('link', { name: /Move Zeroes/ }).click();
  await expect(page).toHaveURL(/#\/task\/move-zeroes$/);
  await expect(nav.getByRole('link', { name: /Move Zeroes/ })).toHaveAttribute('aria-current', 'page');
  await section.click();
  await expect(section).toHaveAttribute('aria-expanded', 'false');
  await expect(nav.getByRole('link', { name: /Move Zeroes/ })).toBeHidden();
  await expect(page).toHaveURL(/#\/task\/move-zeroes$/);
});

test('deep links and history reveal only the current path while disclosure does not navigate', async ({ page }) => {
  await page.goto('/#/task/latest-search');
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  await expect(nav.getByRole('button', { name: /раздел 8:/ })).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.getByRole('button', { name: /тему 8\.4: JS: промисы на практике/ })).toHaveAttribute('aria-expanded', 'true');
  const current = nav.getByRole('link', { name: /Latest Search — поиск без гонки/, includeHidden: true });
  await expect(current).toHaveAttribute('aria-current', 'page');
  await expect(current).toBeInViewport();
  await nav.getByRole('button', { name: /раздел 1: Основы/ }).click();
  await expect(nav.getByRole('button', { name: /раздел 8:/ })).toHaveAttribute('aria-expanded', 'false');
  await expect(current).toHaveAttribute('aria-current', 'page');
  await expect(current).toBeHidden();
  await expect(page).toHaveURL(/#\/task\/latest-search$/);
  await expect(page.getByRole('heading', { name: 'Latest Search — поиск без гонки', exact: true })).toBeVisible();
  await nav.getByRole('link', { name: '1.1 Big O — оценка сложности', exact: true }).click();
  await expect(nav.getByRole('link', { name: '1.1 Big O — оценка сложности', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('button', { name: /раздел 8:/ })).toHaveAttribute('aria-expanded', 'false');
  await expect(nav.getByRole('button', { name: /тему 1\.1: Big O/ })).toHaveCount(0);
  await page.goBack();
  await expect(current).toHaveAttribute('aria-current', 'page');
  await expect(current).toBeInViewport();
  await expect(nav.getByRole('button', { name: /раздел 1: Основы/ })).toHaveAttribute('aria-expanded', 'false');
  await expect(nav.locator('.section-toggle[aria-expanded="true"]')).toHaveCount(1);
  await expect(nav.locator('.topic-toggle[aria-expanded="true"]')).toHaveCount(1);
  await page.goForward();
  await expect(page).toHaveURL(/#\/topic\/big-o$/);
  await expect(nav.getByRole('button', { name: /раздел 1: Основы/ })).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.getByRole('button', { name: /раздел 8:/ })).toHaveAttribute('aria-expanded', 'false');
  await expect(nav.locator('.topic-toggle[aria-expanded="true"]')).toHaveCount(0);
});

test('accordion allows one topic or none and clears nested expansion when switching sections', async ({ page }) => {
  await page.goto('/#/topic/two-pointers');
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  const pointers = nav.getByRole('button', { name: /тему 2\.1: Two Pointers$/ });
  const prefix = nav.getByRole('button', { name: /тему 2\.4: Prefix Sum/ });
  await prefix.click();
  await expect(pointers).toHaveAttribute('aria-expanded', 'false');
  await expect(prefix).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.locator('.topic-toggle[aria-expanded="true"]')).toHaveCount(1);
  await expect(page).toHaveURL(/#\/topic\/two-pointers$/);
  await expect(nav.getByRole('link', { name: '2.1 Two Pointers', exact: true })).toHaveAttribute('aria-current', 'page');
  await prefix.click();
  await expect(nav.locator('.topic-toggle[aria-expanded="true"]')).toHaveCount(0);
  await pointers.click();
  await nav.getByRole('link', { name: '2.4 Prefix Sum (префиксные суммы)', exact: true }).click();
  await expect(page).toHaveURL(/#\/topic\/prefix-sum$/);
  await expect(pointers).toHaveAttribute('aria-expanded', 'false');
  await expect(prefix).toHaveAttribute('aria-expanded', 'true');

  const arrays = nav.getByRole('button', { name: /раздел 2: Массивы и строки/ });
  const basics = nav.getByRole('button', { name: /раздел 1: Основы/ });
  await basics.click();
  await expect(arrays).toHaveAttribute('aria-expanded', 'false');
  await expect(nav.locator('.topic-toggle[aria-expanded="true"]')).toHaveCount(0);
  await basics.click();
  await expect(nav.locator('.section-toggle[aria-expanded="true"]')).toHaveCount(0);
  await arrays.click();
  await expect(prefix).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#\/topic\/prefix-sum$/);
  await expect(nav.getByRole('link', { name: '2.4 Prefix Sum (префиксные суммы)', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('a quiz and a split task are reachable through topic children', async ({ page }) => {
  await page.goto('/#/topic/event-loop');
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  await nav.getByRole('link', { name: /Что выведется/ }).click();
  await expect(page.locator('.quiz-question')).toHaveCount(6);
  await page.goto('/#/topic/function-utils');
  await nav.getByRole('link', { name: /Throttle — leading \+ trailing/ }).click();
  await expect(page).toHaveURL(/#\/task\/throttle-trailing$/);
  await expect(page.getByRole('button', { name: 'Проверить решение', exact: true })).toBeVisible();
});

test('hiding the menu preserves disclosures and grouped catalog fits a small screen', async ({ page }) => {
  await page.goto('/#/task/range-sum-query');
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  await page.getByRole('button', { name: 'Скрыть меню', exact: true }).click();
  await expect(nav).toBeHidden();
  await page.getByRole('button', { name: 'Показать меню', exact: true }).click();
  await expect(nav.getByRole('button', { name: /тему 2\.4: Prefix Sum/ })).toHaveAttribute('aria-expanded', 'true');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.course-section')).toHaveCount(8);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('topic title opens theory immediately and repeated clicks toggle without a navigation loop', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  await nav.getByRole('button', { name: /раздел 2: Массивы и строки/ }).click();
  const toggle = nav.getByRole('button', { name: /тему 2\.1: Two Pointers$/ });
  const title = nav.getByRole('link', { name: '2.1 Two Pointers', exact: true });
  await title.click();
  await expect(page).toHaveURL(/#\/topic\/two-pointers$/);
  await expect(page.locator('.article')).toContainText('Two Pointers');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.getByRole('link', { name: /Move Zeroes/ })).toBeVisible();
  await title.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav.getByRole('link', { name: /Move Zeroes/ })).toBeHidden();
  await expect(page).toHaveURL(/#\/topic\/two-pointers$/);
  await title.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.locator('.nav-chevron').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.focus(); await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await title.focus(); await title.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await title.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.goBack();
  await expect(page).toHaveURL(/\/(?:#\/)?$/);
});

test('topic selection from a task opens theory even when its children were already expanded', async ({ page }) => {
  await page.goto('/#/task/move-zeroes');
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  const title = nav.getByRole('link', { name: '2.1 Two Pointers', exact: true });
  await expect(title).toHaveAttribute('aria-expanded', 'true');
  await title.click();
  await expect(page).toHaveURL(/#\/topic\/two-pointers$/);
  await expect(title).toHaveAttribute('aria-expanded', 'true');
  await title.click();
  await expect(title).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#\/topic\/two-pointers$/);
});

test('task numbers and priorities agree in the sidebar, practice list and task heading', async ({ page }) => {
  await page.goto('/#/topic/prefix-sum');
  const nav = page.getByRole('navigation', { name: 'Разделы курса' });
  const required = page.locator('.task-link').filter({ hasText: 'Range Sum Query' });
  await expect(required.locator('.task-index')).toHaveText('2.4.1');
  await expect(required.locator('.priority-badge')).toHaveText('Основная');
  const optional = page.locator('.task-link').filter({ hasText: 'Product of Array Except Self' });
  await expect(optional.locator('.task-index')).toHaveText('2.4.4');
  await expect(optional.locator('.priority-badge')).toHaveText('Дополнительная');
  const sidebarTask = nav.getByRole('link', { name: /Product of Array Except Self/ });
  await expect(sidebarTask.locator('.task-index')).toHaveText('2.4.4');
  await expect(sidebarTask.locator('.priority-badge')).toHaveText('Дополнительная');
  await optional.click();
  await expect(page).toHaveURL(/#\/task\/product-except-self$/);
  await expect(page.locator('.page-heading .eyebrow')).toContainText('Задача 2.4.4');
  await expect(page.locator('.page-heading .priority-badge')).toHaveText('Дополнительная');
});

test('quiz pages also show their task number and priority', async ({ page }) => {
  await page.goto('/#/task/output-order');
  await expect(page.locator('.quiz-page > .eyebrow')).toContainText('Задание 8.3.1');
  await expect(page.locator('.quiz-page > .badges .priority-badge')).toHaveText('Основная');
  const task = page.getByRole('navigation', { name: 'Разделы курса' }).getByRole('link', { name: /Что выведется/ });
  await expect(task.locator('.task-index')).toHaveText('8.3.1');
  await expect(task.locator('.priority-badge')).toHaveText('Основная');
});
