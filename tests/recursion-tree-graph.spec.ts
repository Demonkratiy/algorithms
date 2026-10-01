import { expect, test, type Page } from '@playwright/test';
import type { RunResult } from '../src/lib/runner/types';
import { recursionSolutions, recursionWrongSolutions } from './fixtures/recursion';
import { binaryTreeSolutions, binaryTreeWrongSolutions } from './fixtures/binary-trees';
import { graphSolutions, graphWrongSolutions } from './fixtures/graphs';

const solutions = { ...recursionSolutions, ...binaryTreeSolutions, ...graphSolutions };
const mistakes = { ...recursionWrongSolutions, ...binaryTreeWrongSolutions, ...graphWrongSolutions };
async function run(page: Page, taskId: string, code: string): Promise<RunResult> {
  return page.evaluate(async ({ taskId, code }) => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href);
    return runTask(taskId, code);
  }, { taskId, code });
}
async function wrap(page: Page, id: string, body: string) {
  const name: string = await page.evaluate(async id => {
    const { getTaskDefinition } = await import(/* @vite-ignore */ new URL('tasks/index.ts', document.baseURI).href);
    return getTaskDefinition(id).runner.entryPoint;
  }, id);
  return `const ${name} = (() => { ${solutions[id]}; const original = ${name}; return (...args) => { ${body} }; })();`;
}
test.beforeEach(async ({ page }) => { await page.goto('/'); });
test.afterEach(async ({ page }) => { await expect(page.locator('iframe[data-runner]')).toHaveCount(0); });

for (const [id, code] of Object.entries(solutions)) {
  test(`${id}: worker accepts the contract and rejects common mistakes`, async ({ page }) => {
    const result = await run(page, id, code);
    expect(result.status, JSON.stringify(result.error ?? result.cases.filter(item => !item.passed))).toBe('passed');
    expect(mistakes[id].length).toBeGreaterThan(0);
    for (const wrong of mistakes[id]) expect((await run(page, id, wrong)).status).not.toBe('passed');
  });
  test(`${id}: workspace runs and retains the correct task`, async ({ page }) => {
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

test('graph clone rejects original nodes and shallow neighbors, accepts reordered clone neighbors', async ({ page }) => {
  expect((await run(page, 'clone-graph', 'const cloneGraph = node => node;')).status).toBe('failed');
  expect((await run(page, 'clone-graph', 'const cloneGraph = node => node === null ? null : new Node(node.val, node.neighbors);')).status).toBe('failed');
  const reordered = await wrap(page, 'clone-graph', `
    const root = original(...args); if (root === null) return null;
    const seen = new Set(), queue = [root];
    for (let i=0; i<queue.length; i++) {
      const node=queue[i]; if(seen.has(node)) continue;
      seen.add(node); node.neighbors.reverse(); queue.push(...node.neighbors);
    }
    return root;
  `);
  expect((await run(page, 'clone-graph', reordered)).status).toBe('passed');
});

test('LCA must return an original tree node and tree output cannot contain cycles', async ({ page }) => {
  for (const id of ['lowest-common-ancestor', 'lowest-common-ancestor-binary-tree']) {
    const copied = await wrap(page, id, 'const node = original(...args); return node === null ? null : new TreeNode(node.val, node.left, node.right);');
    expect((await run(page, id, copied)).status).toBe('failed');
  }
  const badTree = await wrap(page, 'invert-tree', 'const root = original(...args); if (root) root.left = root; return root;');
  const result = await run(page, 'invert-tree', badTree);
  expect(result.status).toBe('failed');
  expect(result.cases.some(item => item.feedback?.includes('цикл'))).toBe(true);
});

test('topological validation does not depend on one exact ordering', async ({ page }) => {
  const reordered = await wrap(page, 'course-schedule-ii', 'return original(args[0], [...args[1]].reverse());');
  expect((await run(page, 'course-schedule-ii', reordered)).status).toBe('passed');
  const duplicate = await wrap(page, 'course-schedule-ii', 'const result = original(...args); return result.map(() => result[0]);');
  expect((await run(page, 'course-schedule-ii', duplicate)).status).toBe('failed');
});

test('backtracking comparison distinguishes permutations, subsets and repeated answers', async ({ page }) => {
  const reorderedSubsets = await wrap(page, 'subsets', 'return original(...args).reverse().map(group => group.reverse());');
  expect((await run(page, 'subsets', reorderedSubsets)).status).toBe('passed');
  const duplicatedPermutations = await wrap(page, 'permutations', 'const result = original(...args); return result.map(() => result[0]);');
  expect((await run(page, 'permutations', duplicatedPermutations)).status).toBe('failed');
});

test('Deep Get keeps undefined distinct from null and Word Search restores the board', async ({ page }) => {
  const nullInstead = await wrap(page, 'deep-get', 'const value = original(...args); return value === undefined ? null : value;');
  expect((await run(page, 'deep-get', nullInstead)).status).toBe('failed');
  const mutated = await wrap(page, 'word-search', 'const value = original(...args); args[0][0][0] = "#"; return value;');
  const result = await run(page, 'word-search', mutated);
  expect(result.status).toBe('failed');
  expect(result.cases.some(item => item.feedback?.includes('Изменён входной аргумент'))).toBe(true);
});
