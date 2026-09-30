import { expect, test, type Page } from '@playwright/test';
import type { RunResult } from '../src/lib/runner/types';
import { linkedListSolutions, linkedListWrongSolutions } from './fixtures/linked-lists';
import { stackQueueSolutions, stackQueueWrongSolutions } from './fixtures/stack-queue';

const solutions = { ...linkedListSolutions, ...stackQueueSolutions };
const mistakes = { ...linkedListWrongSolutions, ...stackQueueWrongSolutions };
async function run(page: Page, taskId: string, code: string): Promise<RunResult> {
  return page.evaluate(async ({ taskId, code }) => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href);
    return runTask(taskId, code);
  }, { taskId, code });
}

test.beforeEach(async ({ page }) => { await page.goto('/'); });
test.afterEach(async ({ page }) => { await expect(page.locator('iframe[data-runner]')).toHaveCount(0); });

for (const [id, code] of Object.entries(solutions)) {
  test(`${id}: worker checks the contract and rejects typical mistakes`, async ({ page }) => {
    const result = await run(page, id, code);
    expect(result.status, JSON.stringify(result.error ?? result.cases.filter(item => !item.passed))).toBe('passed');
    expect(result.cases.length).toBeGreaterThanOrEqual(6);
    expect(mistakes[id].length).toBeGreaterThan(0);
    for (const wrong of mistakes[id]) expect((await run(page, id, wrong)).status).not.toBe('passed');
  });
  test(`${id}: workspace supports the new exercise end to end`, async ({ page }) => {
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
    await expect(page.getByText('Есть успешная проверка', { exact: true })).toBeVisible();
    await expect(page.getByText('Сохранено в браузере', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Есть успешная проверка', { exact: true })).toBeVisible();
  });
}

test('cycle requires both A and B, not just successful boolean detection', async ({ page }) => {
  const onlyA = `const hasCycle = (() => { ${linkedListSolutions['linked-list-cycle']}; return hasCycle; })();`;
  const result = await run(page, 'linked-list-cycle', onlyA);
  expect(result.status).toBe('error');
  expect(result.error?.message).toContain('detectCycle');
  expect(result.cases.length).toBeGreaterThan(1);
  expect(result.cases.slice(0, -1).every(item => item.passed)).toBe(true);
  expect(result.cases.at(-1)?.error?.name).toBe('TypeError');
});

test('returning copied middle or cycle-entry nodes fails even with identical values', async ({ page }) => {
  const middle = `const middleNode = (() => {
    ${linkedListSolutions['middle-of-list']};
    const original = middleNode;
    return head => { const node = original(head); return node === null ? null : new ListNode(node.val, node.next); };
  })();`;
  expect((await run(page, 'middle-of-list', middle)).status).toBe('failed');
  const cycle = `const { hasCycle, detectCycle } = (() => {
    ${linkedListSolutions['linked-list-cycle']};
    const original = detectCycle;
    return { hasCycle, detectCycle: head => {
      const node = original(head); return node === null ? null : new ListNode(node.val, node.next);
    } };
  })();`;
  expect((await run(page, 'linked-list-cycle', cycle)).status).toBe('failed');
});

test('cyclic list output is rejected promptly, and the next run starts with fresh nodes', async ({ page }) => {
  const malformed = await run(page, 'reverse-linked-list', 'function reverseList(head) { if (head) head.next = head; return head; }');
  expect(malformed.status).toBe('failed');
  expect(malformed.cases.some(item => item.feedback?.includes('цикл'))).toBe(true);
  expect((await run(page, 'reverse-linked-list', linkedListSolutions['reverse-linked-list'])).status).toBe('passed');
});

test('unspecified push/pop returns are ignored, not their state effects', async ({ page }) => {
  const stack = `${stackQueueSolutions['min-stack']}
    const push = MinStack.prototype.push, pop = MinStack.prototype.pop;
    MinStack.prototype.push = function(...args) { push.apply(this, args); return 123; };
    MinStack.prototype.pop = function(...args) { pop.apply(this, args); return "ignored"; };`;
  const result = await run(page, 'min-stack', stack);
  expect(result.status).toBe('passed');
  expect(result.cases.every(item => item.expected.includes('без проверки возврата'))).toBe(true);
  const queue = `${stackQueueSolutions['queue-via-stacks']}
    const push = MyQueue.prototype.push;
    MyQueue.prototype.push = function(...args) { push.apply(this, args); return false; };`;
  expect((await run(page, 'queue-via-stacks', queue)).status).toBe('passed');
});
