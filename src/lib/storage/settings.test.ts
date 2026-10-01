import { afterEach, describe, expect, it, vi } from 'vitest';
import { palettes } from '../palettes';
import { editorFonts, textSizes, uiFonts } from '../typography';
import { defaultSettings, readSettings, writeSettings } from './index';

afterEach(() => vi.unstubAllGlobals());

function mockStorage(source: string | null) {
  const storage = { getItem: vi.fn(() => source), setItem: vi.fn() };
  vi.stubGlobal('localStorage', storage);
  return storage;
}

describe('appearance settings', () => {
  it('defaults to lavender and preserves legacy independent theme modes', () => {
    mockStorage(null);
    expect(readSettings()).toEqual(defaultSettings);
    mockStorage(JSON.stringify({ ui: 'dark', editor: 'light' }));
    expect(readSettings()).toEqual({ ...defaultSettings, ui: 'dark', editor: 'light' });
  });
  it.each(palettes)('round trips $id using the existing settings key', ({ id }) => {
    const settings = { ...defaultSettings, ui: 'system', editor: 'light', palette: id } as const;
    const storage = mockStorage(JSON.stringify(settings));
    expect(readSettings()).toEqual(settings);
    writeSettings(settings);
    expect(storage.setItem).toHaveBeenCalledWith('algo-settings', JSON.stringify(settings));
  });
  it.each(['unknown', null, 2, {}, []])('rejects an invalid saved palette: %j', palette => {
    mockStorage(JSON.stringify({ ...defaultSettings, palette }));
    expect(() => readSettings()).toThrow(/палитра/);
  });
  it('surfaces storage failures', () => {
    const storage = mockStorage(null);
    storage.getItem.mockImplementation(() => { throw new Error('blocked'); });
    storage.setItem.mockImplementation(() => { throw new Error('quota'); });
    expect(() => readSettings()).toThrow('blocked');
    expect(() => writeSettings(defaultSettings)).toThrow('quota');
  });
  it('preserves palette-only records and migrates missing typography to medium defaults', () => {
    mockStorage(JSON.stringify({ ui: 'light', editor: 'system', palette: 'amber' }));
    expect(readSettings()).toEqual({ ...defaultSettings, ui: 'light', editor: 'system', palette: 'amber' });
  });
  it('round trips each supported font and size', () => {
    for (const uiFont of uiFonts) for (const editorFont of editorFonts) for (const size of textSizes) {
      const settings = { ...defaultSettings, uiFont: uiFont.id, editorFont: editorFont.id, uiSize: size.id, editorSize: size.id };
      mockStorage(JSON.stringify(settings));
      expect(readSettings()).toEqual(settings);
    }
  });
  it.each([
    { uiFont: 'missing' }, { uiFont: null }, { editorFont: 'inter' },
    { uiSize: 16 }, { editorSize: 'huge' }, { editorSize: null },
  ])('rejects corrupt typography instead of silently guessing: %j', change => {
    mockStorage(JSON.stringify({ ...defaultSettings, ...change }));
    expect(() => readSettings()).toThrow(/шрифтов/);
  });
});
