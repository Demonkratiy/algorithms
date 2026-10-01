import { describe, expect, it } from 'vitest';
import { defaultLayout, parseLayout, resizePair, resizePanelHeight } from './workspaceLayout';

describe('workspace layout preferences', () => {
  it('round trips independent preset sizes and collapsed panes', () => {
    const layout = defaultLayout();
    layout.preset = 'bottom';
    layout.sizes.columns = [35, 70];
    layout.sizes.stacked = [240, 550, 300];
    layout.collapsed = ['statement', 'results'];
    expect(parseLayout(JSON.stringify(layout))).toEqual(layout);
    expect(defaultLayout().collapsed).toEqual([]);
  });
  it.each([
    { version: 3 }, { version: '2' }, { preset: 'unknown' }, { collapsed: ['editor', 'editor'] },
    { collapsed: ['unknown'] }, { sizes: null },
    { sizes: { columns: [42, 65], bottom: [42, 65], stacked: [10, 10, 10] } },
    { sizes: { columns: [-1, 65], bottom: [42, 65], stacked: [28, 45, 27] } },
    { sizes: { columns: [42, 65], bottom: [42, 65], stacked: [280, 219, 270] } },
    { sizes: { columns: [42, 65], bottom: [42, 65], stacked: [280, 450.5, 270] } },
    { sizes: { columns: [42, 65], bottom: [42, 65], stacked: [280, Number.MAX_SAFE_INTEGER + 1, 270] } },
  ])('rejects corrupt preferences: %j', change => {
    expect(() => parseLayout(JSON.stringify({ ...defaultLayout(), ...change }))).toThrow();
  });
  it('migrates v1 proportions to independent pixels while keeping other preferences', () => {
    const legacy = { ...defaultLayout(), version: 1, preset: 'stacked', sizes: {
      columns: [35, 60], bottom: [45, 70], stacked: [20, 50, 30],
    }, collapsed: ['editor'] };
    const migrated = parseLayout(JSON.stringify(legacy), 800);
    expect(migrated).toEqual({ ...legacy, version: 2, sizes: { ...legacy.sizes, stacked: [160, 400, 240] } });
    expect(parseLayout(JSON.stringify(migrated))).toEqual(migrated);
    expect(parseLayout(JSON.stringify(legacy), 400).sizes.stacked).toEqual([140, 220, 140]);
    expect(() => parseLayout(JSON.stringify({ ...legacy, sizes: { ...legacy.sizes, stacked: [20, 20, 20] } }))).toThrow();
  });
  it('resizes one panel without a viewport ceiling and clamps only at its minimum', () => {
    expect(resizePanelHeight(280, 120, 'statement')).toBe(400);
    expect(resizePanelHeight(280, -1000, 'statement')).toBe(140);
    expect(resizePanelHeight(450, -1000, 'editor')).toBe(220);
    expect(resizePanelHeight(270, -1000, 'results')).toBe(140);
    expect(resizePanelHeight(450, 5000, 'editor')).toBe(5450);
    const layout = defaultLayout();
    layout.sizes.stacked = [140, 5450, 3000];
    expect(parseLayout(JSON.stringify(layout))).toEqual(layout);
  });
  it('clamps resize to both panel minimums without changing total size', () => {
    expect(resizePair(400, 600, -5000, 280, 280)).toBe(.28);
    expect(resizePair(400, 600, 5000, 280, 280)).toBe(.72);
    expect(resizePair(400, 600, 100, 280, 280)).toBe(.5);
  });
});
