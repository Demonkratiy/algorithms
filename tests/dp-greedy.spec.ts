import { expect, test, type Page } from '@playwright/test';
import type { RunResult } from '../src/lib/runner/types';
import { dpSolutions, dpWrongSolutions } from './fixtures/dp';
import { greedySolutions, greedyWrongSolutions } from './fixtures/greedy';

const solutions = { ...dpSolutions, ...greedySolutions };
const mistakes = { ...dpWrongSolutions, ...greedyWrongSolutions };
async function run(page: Page, taskId: string, code: string): Promise<RunResult> {
  return page.evaluate(async ({ taskId, code }) => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href);
    return runTask(taskId, code);
  }, { taskId, code });
}
async function renameFor(page: Page, from: string, to: string) {
  const names: string[] = await page.evaluate(async ids => {
    const { getTaskDefinition } = await import(/* @vite-ignore */ new URL('tasks/index.ts', document.baseURI).href);
    return ids.map(id => getTaskDefinition(id).runner.entryPoint);
  }, [from, to]);
  return `const ${names[1]} = (() => { ${solutions[from]}; return ${names[0]}; })();`;
}
test.beforeEach(async ({ page }) => { await page.goto('/'); });
test.afterEach(async ({ page }) => { await expect(page.locator('iframe[data-runner]')).toHaveCount(0); });

for (const [id, code] of Object.entries(solutions)) {
  test(`${id}: worker validates results and rejects typical mistakes`, async ({ page }) => {
    const result = await run(page, id, code);
    expect(result.status, JSON.stringify(result.error ?? result.cases.filter(item => !item.passed))).toBe('passed');
    expect(mistakes[id].length).toBeGreaterThan(0);
    for (const wrong of mistakes[id]) expect((await run(page, id, wrong)).status).not.toBe('passed');
  });
  test(`${id}: workspace runs the selected task and preserves its result`, async ({ page }) => {
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
  });
}

test('linear and circular robber conditions cannot substitute for each other', async ({ page }) => {
  const linearAsCircular = await renameFor(page, 'house-robber', 'house-robber-ii');
  expect((await run(page, 'house-robber-ii', linearAsCircular)).status).toBe('failed');
  const circularAsLinear = await renameFor(page, 'house-robber-ii', 'house-robber');
  expect((await run(page, 'house-robber', circularAsLinear)).status).toBe('failed');
});

test('single and multiple stock transactions remain different independent tasks', async ({ page }) => {
  expect((await run(page, 'stock-ii', await renameFor(page, 'best-time-to-buy-sell-stock', 'stock-ii'))).status).toBe('failed');
  expect((await run(page, 'best-time-to-buy-sell-stock', await renameFor(page, 'stock-ii', 'best-time-to-buy-sell-stock'))).status).toBe('failed');
});

test('jump reachability is not accepted as a minimum jump count', async ({ page }) => {
  const reachableAsCount = await renameFor(page, 'jump-game', 'jump-game-ii');
  expect((await run(page, 'jump-game-ii', reachableAsCount)).status).toBe('failed');
});

test('minimum coin count is not accepted as the number of combinations', async ({ page }) => {
  const contract: { from: string; to: string; coinsFirst: boolean } = await page.evaluate(async () => {
    const { getTaskDefinition } = await import(/* @vite-ignore */ new URL('tasks/index.ts', document.baseURI).href);
    const from = getTaskDefinition('coin-change').runner;
    const to = getTaskDefinition('coin-change-ii').runner;
    return { from: from.entryPoint, to: to.entryPoint, coinsFirst: Array.isArray(from.cases[0].args[0]) };
  });
  const source = `const ${contract.to} = (() => {
    ${solutions['coin-change']}; const original = ${contract.from};
    return (...args) => {
      const coins = args.find(Array.isArray), amount = args.find(value => typeof value === 'number');
      return original(...${contract.coinsFirst ? '[coins, amount]' : '[amount, coins]'});
    };
  })();`;
  expect((await run(page, 'coin-change-ii', source)).status).toBe('failed');
});
