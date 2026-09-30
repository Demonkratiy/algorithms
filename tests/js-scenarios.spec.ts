import { expect, test, type Page } from '@playwright/test';
import type { RunResult } from '../src/lib/runner/types';
import { jsUtilsObjectSolutions, jsUtilsObjectWrongSolutions } from './fixtures/js-utils-objects';
import { promiseCoreSolutions, promiseCoreWrongSolutions } from './fixtures/promise-core';
import { promiseCancelSolutions, promiseCancelWrongSolutions } from './fixtures/promise-cancel';

const solutions = { ...jsUtilsObjectSolutions, ...promiseCoreSolutions, ...promiseCancelSolutions };
const mistakes = { ...jsUtilsObjectWrongSolutions, ...promiseCoreWrongSolutions, ...promiseCancelWrongSolutions };
async function run(page: Page, taskId: string, code: string): Promise<RunResult> {
  return page.evaluate(async ({ taskId, code }) => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href);
    return runTask(taskId, code);
  }, { taskId, code });
}
test.beforeEach(async ({ page }) => { await page.goto('/'); });
test.afterEach(async ({ page }) => { await expect(page.locator('iframe[data-runner]')).toHaveCount(0); });

for (const [id, code] of Object.entries(solutions)) {
  test(`${id}: scenario runner accepts the reference and rejects mistakes`, async ({ page }) => {
    const result = await run(page, id, code);
    expect(result.status, JSON.stringify(result.error ?? result.cases.filter(item => !item.passed))).toBe('passed');
    expect(mistakes[id].length).toBeGreaterThan(0);
    for (const wrong of mistakes[id]) expect((await run(page, id, wrong)).status).not.toBe('passed');
  });
  test(`${id}: workspace verifies the JS contract without external network`, async ({ page }) => {
    const external: string[] = [];
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.protocol.startsWith('http') && url.hostname !== '127.0.0.1') external.push(url.href);
    });
    await page.goto(`/#/task/${id}`);
    const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
    await editor.focus(); await editor.press('ControlOrMeta+A');
    await editor.evaluate((element, text) => {
      const data = new DataTransfer();
      data.setData('text/plain', text);
      element.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    }, code);
    await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
    await expect(page.locator('.result-heading')).toContainText('Тесты пройдены');
    await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Есть успешная проверка', { exact: true })).toBeVisible();
    expect(external).toEqual([]);
  });
}

test('leading-only throttle is not silently required to pass the trailing contract', async ({ page }) => {
  expect((await run(page, 'throttle', solutions.throttle)).status).toBe('passed');
  const leadingAsTrailing = `const throttleTrailing = (() => { ${solutions.throttle}; return throttle; })();`;
  expect((await run(page, 'throttle-trailing', leadingAsTrailing)).status).toBe('failed');
});

test('virtual-clock scenario can be cancelled without blocking the page', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href);
    const controller = new AbortController();
    const pending = runTask('sleep-retry-timeout', 'function sleep() { while (true) {} }', controller.signal);
    setTimeout(() => controller.abort(), 100);
    return pending;
  });
  expect(result.status).toBe('cancelled');
  expect(await page.evaluate(() => 2 + 2)).toBe(4);
  expect((await run(page, 'sleep-retry-timeout', solutions['sleep-retry-timeout'])).status).toBe('passed');
});
