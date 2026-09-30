import { expect, test, type Page } from '@playwright/test';
import type { RunResult } from '../src/lib/runner/types';
import { searchMatrixSolutions, searchMatrixWrongSolutions } from './fixtures/search-matrix';
import { sortingHeapSolutions, sortingHeapWrongSolutions } from './fixtures/sorting-heap';

const solutions = { ...searchMatrixSolutions, ...sortingHeapSolutions };
const wrong = { ...searchMatrixWrongSolutions, ...sortingHeapWrongSolutions };
async function run(page: Page, taskId: string, code: string): Promise<RunResult> {
  return page.evaluate(async ({ taskId, code }) => {
    const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', document.baseURI).href);
    return runTask(taskId, code);
  }, { taskId, code });
}
async function wrap(page: Page, id: string, expression: string) {
  const name: string = await page.evaluate(async id => {
    const { getTaskDefinition } = await import(/* @vite-ignore */ new URL('tasks/index.ts', document.baseURI).href);
    return getTaskDefinition(id).runner.entryPoint;
  }, id);
  return `const ${name} = (() => { ${solutions[id]}; const original = ${name}; return (...args) => { ${expression} }; })();`;
}
test.beforeEach(async ({ page }) => { await page.goto('/'); });
test.afterEach(async ({ page }) => { await expect(page.locator('iframe[data-runner]')).toHaveCount(0); });

for (const [id, code] of Object.entries(solutions)) {
  test(`${id}: worker accepts valid solutions and rejects known errors`, async ({ page }) => {
    const result = await run(page, id, code);
    expect(result.status, JSON.stringify(result.error ?? result.cases.filter(item => !item.passed))).toBe('passed');
    expect(wrong[id].length).toBeGreaterThan(0);
    for (const mistake of wrong[id]) expect((await run(page, id, mistake)).status).not.toBe('passed');
  });
  test(`${id}: workspace checks the independent task`, async ({ page }) => {
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
    await expect(page.getByText('Есть успешная проверка', { exact: true })).toBeVisible();
  });
}

test('core heap does not require a comparator, the bonus task does', async ({ page }) => {
  const numericOnly = `const MinHeap = (() => { ${sortingHeapSolutions['heap-comparator']}; const Heap = MinHeap; return class extends Heap { constructor() { super(); } }; })();`;
  expect((await run(page, 'implement-min-heap', numericOnly)).status).toBe('passed');
  expect((await run(page, 'heap-comparator', numericOnly)).status).toBe('failed');
});

test('heap requires undefined, not null, for empty peek and pop', async ({ page }) => {
  const modified = `${sortingHeapSolutions['implement-min-heap']}
    const peek = MinHeap.prototype.peek, pop = MinHeap.prototype.pop;
    MinHeap.prototype.peek = function() { const value = peek.call(this); return value === undefined ? null : value; };
    MinHeap.prototype.pop = function() { const value = pop.call(this); return value === undefined ? null : value; };`;
  expect((await run(page, 'implement-min-heap', modified)).status).toBe('failed');
});

test('Meeting Rooms I is independently complete without part II', async ({ page }) => {
  expect((await run(page, 'meeting-rooms', sortingHeapSolutions['meeting-rooms'])).status).toBe('passed');
  expect((await run(page, 'meeting-rooms-ii', sortingHeapSolutions['meeting-rooms'])).status).toBe('error');
  expect((await run(page, 'meeting-rooms-ii', sortingHeapSolutions['meeting-rooms-ii'])).status).toBe('passed');
});

test('merge intervals permits output order changes but not swapped endpoints', async ({ page }) => {
  const reversed = await wrap(page, 'merge-intervals', 'return original(...args).reverse();');
  expect((await run(page, 'merge-intervals', reversed)).status).toBe('passed');
  const swapped = await wrap(page, 'merge-intervals', 'return original(...args).map(([a,b]) => [b,a]);');
  expect((await run(page, 'merge-intervals', swapped)).status).toBe('failed');
});

test('nearest points accept different boundary tie choices and reject fabricated multiplicity', async ({ page }) => {
  for (const direction of [1, -1]) {
    const source = `function kClosest(points, k) {
      return [...points].sort((a,b) => (a[0]**2+a[1]**2)-(b[0]**2+b[1]**2)
        || ${direction}*(a[0]-b[0]) || ${direction}*(a[1]-b[1])).slice(0,k);
    }`;
    expect((await run(page, 'k-closest-points', source)).status).toBe('passed');
  }
  const repeated = await wrap(page, 'k-closest-points', 'const result = original(...args); return result.map(() => result[0]);');
  expect((await run(page, 'k-closest-points', repeated)).status).toBe('failed');
});

test('in-place matrix tasks reject solutions that only return a modified copy', async ({ page }) => {
  for (const id of ['rotate-image', 'set-matrix-zeroes']) {
    const copy = await wrap(page, id, 'const matrix = args[0].map(row => [...row]); original(matrix); return matrix;');
    expect((await run(page, id, copy)).status).toBe('failed');
  }
});
