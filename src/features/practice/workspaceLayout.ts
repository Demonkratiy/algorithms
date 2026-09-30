export const panelIds = ['statement', 'editor', 'results'] as const;
export type PanelId = typeof panelIds[number];
export type Preset = 'columns' | 'bottom' | 'stacked';
export type WorkspaceLayout = {
  version: 1;
  preset: Preset;
  sizes: { columns: [number, number]; bottom: [number, number]; stacked: [number, number, number] };
  collapsed: PanelId[];
};
export const layoutKey = 'algo-workspace-v1';
export function defaultLayout(): WorkspaceLayout {
  return { version: 1, preset: 'columns', sizes: { columns: [42, 65], bottom: [42, 65], stacked: [28, 45, 27] }, collapsed: [] };
}
export function parseLayout(source: string): WorkspaceLayout {
  const value: unknown = JSON.parse(source);
  if (!value || typeof value !== 'object') throw new Error('Неверный формат расположения панелей.');
  const data = value as Record<string, unknown>;
  const sizes = data.sizes as Record<string, unknown> | undefined;
  const validNumbers = (array: unknown, length: number): array is number[] =>
    Array.isArray(array) && array.length === length && array.every(n => typeof n === 'number' && Number.isFinite(n) && n > 0 && n < 100);
  if (data.version !== 1 || !['columns', 'bottom', 'stacked'].includes(String(data.preset))
    || !sizes || !validNumbers(sizes.columns, 2) || !validNumbers(sizes.bottom, 2)
    || !validNumbers(sizes.stacked, 3) || Math.abs(sizes.stacked.reduce((a, b) => a + b, 0) - 100) > .01
    || !Array.isArray(data.collapsed) || !data.collapsed.every(id => panelIds.includes(id))
    || new Set(data.collapsed).size !== data.collapsed.length) {
    throw new Error('Сохранённое расположение повреждено. Выбери схему или сбрось расположение.');
  }
  return {
    version: 1, preset: data.preset as Preset,
    sizes: {
      columns: [sizes.columns[0], sizes.columns[1]],
      bottom: [sizes.bottom[0], sizes.bottom[1]],
      stacked: [sizes.stacked[0], sizes.stacked[1], sizes.stacked[2]],
    },
    collapsed: [...data.collapsed],
  };
}
export function resizePair(first: number, second: number, delta: number, minFirst: number, minSecond: number) {
  const total = first + second;
  const value = Math.max(minFirst, Math.min(total - minSecond, first + delta));
  return value / total;
}
