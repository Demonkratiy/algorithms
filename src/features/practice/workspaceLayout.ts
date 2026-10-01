export const panelIds = ['statement', 'editor', 'results'] as const;
export type PanelId = typeof panelIds[number];
export type Preset = 'columns' | 'bottom' | 'stacked';
export type WorkspaceLayout = {
  version: 2;
  preset: Preset;
  sizes: { columns: [number, number]; bottom: [number, number]; stacked: [number, number, number] };
  collapsed: PanelId[];
};
export const layoutKey = 'algo-workspace-v1';
export const stackedMinimum: Record<PanelId, number> = { statement: 140, editor: 220, results: 140 };
export function defaultLayout(): WorkspaceLayout {
  return { version: 2, preset: 'columns', sizes: { columns: [42, 65], bottom: [42, 65], stacked: [280, 450, 270] }, collapsed: [] };
}
export function parseLayout(source: string, legacyPanelSpace = 1000): WorkspaceLayout {
  const value: unknown = JSON.parse(source);
  if (!value || typeof value !== 'object') throw new Error('Неверный формат расположения панелей.');
  const data = value as Record<string, unknown>;
  const sizes = data.sizes as Record<string, unknown> | undefined;
  const validNumbers = (array: unknown, length: number): array is number[] =>
    Array.isArray(array) && array.length === length && array.every(n => typeof n === 'number' && Number.isFinite(n) && n > 0 && n < 100);
  const validStacked = (array: unknown): array is [number, number, number] =>
    Array.isArray(array) && array.length === 3 && (data.version === 1
      ? validNumbers(array, 3) && Math.abs(array.reduce((a, b) => a + b, 0) - 100) <= .01
      : array.every((height, index) => Number.isSafeInteger(height) && height >= stackedMinimum[panelIds[index]]));
  if ((data.version !== 1 && data.version !== 2)
    || !['columns', 'bottom', 'stacked'].includes(String(data.preset))
    || !sizes || !validNumbers(sizes.columns, 2) || !validNumbers(sizes.bottom, 2)
    || !validStacked(sizes.stacked)
    || !Array.isArray(data.collapsed) || !data.collapsed.every(id => panelIds.includes(id))
    || new Set(data.collapsed).size !== data.collapsed.length) {
    throw new Error('Сохранённое расположение повреждено. Выбери схему или сбрось расположение.');
  }
  return {
    version: 2, preset: data.preset as Preset,
    sizes: {
      columns: [sizes.columns[0], sizes.columns[1]],
      bottom: [sizes.bottom[0], sizes.bottom[1]],
      stacked: data.version === 1 ? [
        resizePanelHeight(sizes.stacked[0] * legacyPanelSpace / 100, 0, 'statement'),
        resizePanelHeight(sizes.stacked[1] * legacyPanelSpace / 100, 0, 'editor'),
        resizePanelHeight(sizes.stacked[2] * legacyPanelSpace / 100, 0, 'results'),
      ] : [...sizes.stacked],
    },
    collapsed: [...data.collapsed],
  };
}
export function resizePanelHeight(height: number, delta: number, panel: PanelId): number {
  return Math.max(stackedMinimum[panel], Math.min(Number.MAX_SAFE_INTEGER, Math.round(height + delta)));
}
export function resizePair(first: number, second: number, delta: number, minFirst: number, minSecond: number) {
  const total = first + second;
  const value = Math.max(minFirst, Math.min(total - minSecond, first + delta));
  return value / total;
}
