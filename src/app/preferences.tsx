import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { readSettings, writeSettings, type Settings } from '../lib/storage';

const Preferences = createContext<{
  settings: Settings; editorDark: boolean; error: string;
  update: (settings: Settings) => void;
} | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({ ui: 'system', editor: 'dark' });
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const [error, setError] = useState('');
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
  const update = (next: Settings) => {
    setSettings(next);
    try { writeSettings(next); setError(''); }
    catch (e) { setError(`Тема изменена, но не сохранена: ${String(e)}`); }
  };
  return <Preferences.Provider value={{ settings, update, error, editorDark: dark(settings.editor) }}>{children}</Preferences.Provider>;
}
export function usePreferences() {
  const value = useContext(Preferences);
  if (!value) throw new Error('PreferencesProvider is missing');
  return value;
}
