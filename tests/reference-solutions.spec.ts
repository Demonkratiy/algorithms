import { expect, test } from '@playwright/test';

const ids = [
  'valid-palindrome', 'move-zeroes', 'merge-sorted-arrays',
  'min-subarray-sum', 'max-vowels', 'longest-substring',
  'first-unique-char', 'valid-anagram', 'group-anagrams', 'top-k-frequent',
];

for (const id of ids) {
  test(`${id}: the actual Markdown reference passes the task cases`, async ({ page }) => {
    await page.goto('/');
    const report = await page.evaluate(async id => {
      const base = document.baseURI;
      const { topics } = await import(/* @vite-ignore */ new URL('content/course.ts', base).href);
      const { getTaskDefinition } = await import(/* @vite-ignore */ new URL('tasks/index.ts', base).href);
      const { getMarkdown, splitTaskMarkdown } = await import(/* @vite-ignore */ new URL('src/lib/content/index.ts', base).href);
      const { runTask } = await import(/* @vite-ignore */ new URL('src/lib/runner/index.ts', base).href);
      const task = topics.flatMap((topic: { tasks: { id: string; path: string }[] }) => topic.tasks).find((task: { id: string }) => task.id === id);
      if (!task) throw new Error(`Missing task ${id}`);
      const parsed = splitTaskMarkdown(await getMarkdown(task.path));
      const name = getTaskDefinition(id).runner.entryPoint;
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const declaration = new RegExp(`\\b(?:function\\s+${escaped}\\b|(?:const|let|var)\\s+${escaped}\\s*=)`);
      const blocks = [...parsed.solution.matchAll(/```(?:js|javascript)\s*\n([\s\S]*?)\n```/g)].map(match => match[1]);
      const source = blocks.find(code => declaration.test(code));
      if (!source) throw new Error(`Missing Markdown reference for ${id}`);
      return runTask(id, source);
    }, id);
    expect(report.status, JSON.stringify(report.error ?? report.cases.filter((item: { passed: boolean }) => !item.passed))).toBe('passed');
    await expect(page.locator('iframe[data-runner]')).toHaveCount(0);
  });
}
