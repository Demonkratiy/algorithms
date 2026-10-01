import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultSettings, readSettings, writeSettings, type Settings } from '../lib/storage';
import { editorFontDefinition, editorFontSizes, uiFontDefinition } from '../lib/typography';

const Preferences = createContext<{
  settings: Settings; editorDark: boolean; error: string;
  update: (settings: Settings) => void;
} | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const [error, setError] = useState('');
  const [fontError, setFontError] = useState('');
  useEffect(() => {
    try { setSettings(readSettings()); }
    catch (e) { setError(`Не удалось прочитать настройки: ${String(e)}`); }
    const media = matchMedia('(prefers-color-scheme: dark)');
    const listener = () => setSystemDark(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);
  const dark = (theme: Settings['ui']) => theme === 'dark' || (theme === 'system' && systemDark);
  useEffect(() => { document.documentElement.dataset.theme = dark(settings.ui) ? 'dark' : 'light'; }, [settings.ui, systemDark]);
  useEffect(() => { document.documentElement.dataset.palette = settings.palette; }, [settings.palette]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.uiSize = settings.uiSize;
    root.style.setProperty('--ui-font-family', uiFontDefinition(settings.uiFont).family);
    root.style.setProperty('--code-font-family', editorFontDefinition(settings.editorFont).family);
    root.style.setProperty('--editor-font-size', `${editorFontSizes[settings.editorSize]}px`);
  }, [settings.uiSize, settings.uiFont, settings.editorSize, settings.editorFont]);
  useEffect(() => {
    let active = true;
    setFontError('');
    const families = [uiFontDefinition(settings.uiFont), editorFontDefinition(settings.editorFont)]
      .map(font => font.webFamily).filter(Boolean);
    void Promise.all(families.map(async family => {
      const faces = await document.fonts.load(`400 16px "${family}"`, 'Text Пример');
      if (!faces.length) throw new Error(`Шрифт ${family} отсутствует в сборке.`);
    })).catch((e: unknown) => {
      if (active) setFontError(`Шрифт не загрузился: ${String(e)} Используется запасной шрифт. Попробуйте выбрать его снова или перезагрузить страницу.`);
    });
    return () => { active = false; };
  }, [settings.uiFont, settings.editorFont]);
  const update = (next: Settings) => {
    setSettings(next);
    try { writeSettings(next); setError(''); }
    catch (e) { setError(`Настройки изменены, но не сохранены: ${String(e)}`); }
  };
  return <Preferences.Provider value={{ settings, update, error: [error, fontError].filter(Boolean).join(' '), editorDark: dark(settings.editor) }}>{children}</Preferences.Provider>;
}
export function usePreferences() {
  const value = useContext(Preferences);
  if (!value) throw new Error('PreferencesProvider is missing');
  return value;
}
