import { expect, test, type Page } from '@playwright/test';
import type { RunResult } from '../src/lib/runner/types';
import { pointersWindowSolutions, pointersWindowWrongSolutions } from './fixtures/pointers-window';
import { counterPrefixSolutions, counterPrefixWrongSolutions } from './fixtures/counter-prefix';

const solutions = { ...pointersWindowSolutions, ...counterPrefixSolutions };
const wrong = { ...pointersWindowWrongSolutions, ...counterPrefixWrongSolutions };

async function run(page: Page, taskId: string, code: string): Promise<RunResult> {
  return page.evaluate(async ({ taskId, code }) => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href);
    return runTask(taskId, code);
  }, { taskId, code });
}
async function wrap(page: Page, id: string, transform: string) {
  const name: string = await page.evaluate(async id => {
    const { getTaskDefinition } = await import(/* @vite-ignore */ new URL('tasks/index.ts', document.baseURI).href);
    return getTaskDefinition(id).runner.entryPoint;
  }, id);
  return `const ${name} = (() => { ${solutions[id]}; const original = ${name}; return (...args) => { const value = original(...args); ${transform} }; })();`;
}

test.beforeEach(async ({ page }) => { await page.goto('/'); });
test.afterEach(async ({ page }) => { await expect(page.locator('iframe[data-runner]')).toHaveCount(0); });

for (const [id, code] of Object.entries(solutions)) {
  test(`${id}: real worker accepts a correct solution and rejects a typical bug`, async ({ page }) => {
    const result = await run(page, id, code);
    expect(result.status, JSON.stringify(result.error ?? result.cases.filter(item => !item.passed))).toBe('passed');
    expect(result.cases.length).toBeGreaterThanOrEqual(6);
    const variants = wrong[id];
    expect(variants).toBeTruthy();
    const mistakes = Array.isArray(variants) ? variants : [variants];
    for (const mistake of mistakes) expect((await run(page, id, mistake)).status).not.toBe('passed');
  });
  test(`${id}: workspace checks the selected task with its own complexity fields`, async ({ page }) => {
    await page.goto(`/#/task/${id}`);
    const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
    await editor.focus();
    await editor.press('ControlOrMeta+A');
    await editor.evaluate((element, text) => {
      const data = new DataTransfer();
      data.setData('text/plain', text);
      element.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    }, code);
    await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
    await expect(page.locator('.result-heading')).toContainText('Тесты пройдены');
    await expect(page.locator('.complexity-field')).toHaveCount(2);
  });
}

test('unordered comparisons accept permutations but preserve groups and multiplicity', async ({ page }) => {
  const reversedGroups = await wrap(page, 'group-anagrams', 'return value.reverse().map(group => group.reverse());');
  expect((await run(page, 'group-anagrams', reversedGroups)).status).toBe('passed');
  const deduplicated = await wrap(page, 'group-anagrams', 'return value.map(group => [...new Set(group)]);');
  expect((await run(page, 'group-anagrams', deduplicated)).status).toBe('failed');
  const flattened = await wrap(page, 'group-anagrams', 'return [value.flat()];');
  expect((await run(page, 'group-anagrams', flattened)).status).toBe('failed');
  const reversedTop = await wrap(page, 'top-k-frequent', 'return value.reverse();');
  expect((await run(page, 'top-k-frequent', reversedTop)).status).toBe('passed');
  const repeatedTop = await wrap(page, 'top-k-frequent', 'return value.map(() => value[0]);');
  expect((await run(page, 'top-k-frequent', repeatedTop)).status).toBe('failed');
});

test('in-place output uses the argument, not the returned copy, with fresh inputs each run', async ({ page }) => {
  const returningAnything = await wrap(page, 'move-zeroes', 'return "return value is ignored";');
  expect((await run(page, 'move-zeroes', returningAnything)).status).toBe('passed');
  expect((await run(page, 'move-zeroes', 'function moveZeroes(nums) { return nums.filter(n => n !== 0).concat(nums.filter(n => n === 0)); }')).status).toBe('failed');
  expect((await run(page, 'move-zeroes', returningAnything)).status).toBe('passed');
});

test('merge checks input preservation and a fresh output array', async ({ page }) => {
  const mutated = await wrap(page, 'merge-sorted-arrays', 'args[0].push(123456); return value;');
  const result = await run(page, 'merge-sorted-arrays', mutated);
  expect(result.status).toBe('failed');
  expect(result.cases.some(item => item.feedback?.includes('Изменён входной аргумент'))).toBe(true);
  const alias = await wrap(page, 'merge-sorted-arrays', 'return args[1].length === 0 ? args[0] : value;');
  expect((await run(page, 'merge-sorted-arrays', alias)).status).toBe('failed');
});

test('unknown task IDs are explicit errors rather than a fallback exercise', async ({ page }) => {
  const result = await run(page, 'missing-task', solutions['valid-palindrome']);
  expect(result.status).toBe('error');
  expect(result.error?.name).toBe('TaskNotFoundError');
  expect(result.cases).toEqual([]);
});

test('UI lists runnable tasks and keeps their drafts, histories and choices separate', async ({ page }) => {
  await expect(page.locator('.notice').first()).toContainText('46 задач');
  for (const id of ['valid-palindrome', 'move-zeroes', 'top-k-frequent', 'subarray-sum-k', 'range-sum-query']) {
    await page.goto(`/#/task/${id}`);
    await expect(page.getByRole('button', { name: 'Проверить решение', exact: true })).toBeVisible();
    await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
  }
  await page.goto('/#/task/valid-palindrome');
  const editor = page.getByRole('textbox', { name: 'JavaScript — решение задачи', exact: true });
  await editor.focus(); await editor.press('ControlOrMeta+End'); await editor.press('Enter');
  await page.keyboard.insertText('// palindrome draft');
  await page.locator('.complexity-assessment > summary').click();
  const time = page.locator('.complexity-field').filter({ has: page.locator('input[name$="-time"]') });
  await time.getByRole('radio', { name: 'O(N)', exact: true }).check();
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await expect(page.locator('.results')).toContainText('Ответ не совпал');
  await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
  await page.goto('/#/task/move-zeroes');
  await expect(page.locator('.monaco-editor')).not.toContainText('palindrome draft');
  await expect(page.getByText('Последние запуски (0/5)', { exact: true })).toBeVisible();
  await page.locator('.complexity-assessment > summary').click();
  await expect(page.locator('.complexity-assessment input:checked')).toHaveCount(0);
  await page.goto('/#/task/valid-palindrome');
  await editor.focus(); await editor.press('ControlOrMeta+End');
  await expect(page.locator('.monaco-editor')).toContainText('palindrome draft');
  await expect(page.getByText('Последние запуски (1/5)', { exact: true })).toBeVisible();
  await page.locator('.complexity-assessment > summary').click();
  await expect(time.getByRole('radio', { name: 'O(N)', exact: true })).toBeChecked();
  await expect(page.locator('.complexity-field')).toHaveCount(2);
});
