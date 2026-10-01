import { expect, test } from '@playwright/test';

test('theory practice-directory links open the task list, not a missing README', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/topic/two-pointers');
  const article = page.locator('.article');
  const practice = article.getByRole('link', { name: 'Two Pointers', exact: true });
  await expect(practice).toHaveAttribute('href', '#/topic/two-pointers#practice');
  await expect(article.getByRole('link', { name: 'Valid Palindrome', exact: true })).toHaveAttribute('href', '#/task/valid-palindrome');
  await expect(article.getByRole('link', { name: 'Move Zeroes', exact: true })).toHaveAttribute('href', '#/task/move-zeroes');
  await expect(article).not.toContainText('01-valid-palindrome');
  await practice.click();
  await expect(page).toHaveURL(/#\/topic\/two-pointers#practice$/);
  await expect(page.getByRole('heading', { name: 'Закрепи на практике', exact: true })).toBeInViewport();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Закрепи на практике', exact: true })).toBeInViewport();
  await page.locator('.task-link').filter({ hasText: 'Move Zeroes' }).click();
  await expect(page).toHaveURL(/#\/task\/move-zeroes$/);
  await expect(page.getByRole('button', { name: 'Проверить решение', exact: true })).toBeVisible();
});

test('practice index directories resolve to sections and topics and archival links go to GitHub', async ({ page }) => {
  await page.goto('/#/read/practice/README.md');
  const article = page.locator('.article');
  const archive = article.getByRole('link', { name: 'архиве', exact: true });
  await expect(archive).toHaveAttribute('href', 'https://github.com/Demonkratiy/algorithms/tree/main/personal/solutions/practice/');
  const section = article.locator('a[href="#/section/02-arrays-strings#topics"]');
  await expect(section).toBeVisible();
  await section.click();
  await expect(page.locator('.section-page > h1')).toHaveText('Массивы и строки');
  await expect(page.getByRole('heading', { name: 'Маршрут раздела', exact: true })).toBeInViewport();
  await page.goto('/#/read/practice/README.md');
  const topic = article.locator('a[href="#/topic/two-pointers#practice"]');
  await topic.click();
  await expect(page).toHaveURL(/#\/topic\/two-pointers#practice$/);
  await expect(page.locator('.task-link')).toHaveCount(3);
  await expect(page.getByRole('alert')).toHaveCount(0);
});
