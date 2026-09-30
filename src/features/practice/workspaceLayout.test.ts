import { describe, expect, it } from 'vitest';
import { defaultLayout, parseLayout, resizePair } from './workspaceLayout';

describe('workspace layout preferences', () => {
  it('round trips independent preset sizes and collapsed panes', () => {
    const layout = defaultLayout();
    layout.preset = 'bottom';
    layout.sizes.columns = [35, 70];
    layout.sizes.stacked = [20, 50, 30];
    layout.collapsed = ['statement', 'results'];
    expect(parseLayout(JSON.stringify(layout))).toEqual(layout);
    expect(defaultLayout().collapsed).toEqual([]);
  });
  it.each([
    { version: 2 }, { preset: 'unknown' }, { collapsed: ['editor', 'editor'] },
    { collapsed: ['unknown'] }, { sizes: null },
    { sizes: { columns: [42, 65], bottom: [42, 65], stacked: [10, 10, 10] } },
    { sizes: { columns: [-1, 65], bottom: [42, 65], stacked: [28, 45, 27] } },
  ])('rejects corrupt preferences: %j', change => {
    expect(() => parseLayout(JSON.stringify({ ...defaultLayout(), ...change }))).toThrow();
  });
  it('clamps resize to both panel minimums without changing total size', () => {
    expect(resizePair(400, 600, -5000, 280, 280)).toBe(.28);
    expect(resizePair(400, 600, 5000, 280, 280)).toBe(.72);
    expect(resizePair(400, 600, 100, 280, 280)).toBe(.5);
  });
});
