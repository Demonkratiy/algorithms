import { useRef, useState } from 'react';
import { usePreferences } from '../app/preferences';
import { BACKUP_VERSION, importBackup, parseBackup, readAllRecords, type Theme } from '../lib/storage';

const themes: { value: Theme; title: string }[] = [
  { value: 'light', title: 'Светлая' }, { value: 'dark', title: 'Тёмная' }, { value: 'system', title: 'Как в системе' },
];
export function SettingsPage() {
  const { settings, update, editorDark } = usePreferences();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function exportData() {
    setError(''); setNotice(''); setBusy(true);
    try {
      const tasks = await readAllRecords();
      const blob = new Blob([JSON.stringify({ version: BACKUP_VERSION, tasks }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `algo-progress-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setNotice('Резервная копия подготовлена. Проверь папку загрузок.');
    } catch (e) { setError(`Экспорт не выполнен: ${String(e)}`); }
    finally { setBusy(false); }
  }
  async function loadFile(file: File) {
    setError(''); setNotice(''); setBusy(true);
    try {
      if (file.size > 5_000_000) throw new Error('Файл больше 5 МБ.');
      const backup = parseBackup(await file.text());
      if (!confirm(`Импортировать ${backup.tasks.length} записей? Для совпадающих задач локальный код и история будут заменены. Остальные задачи не изменятся.`)) return;
      await importBackup(backup);
      setNotice(`Импортировано записей: ${backup.tasks.length}. Темы интерфейса не изменены.`);
    } catch (e) { setError(`Импорт не выполнен: ${String(e)}`); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  return <div className="content">
    <div className="eyebrow">Твоё рабочее место</div><h1>Настройки</h1>
    <p className="lede">Удобно читать. Комфортно писать код. Не обязательно в одной теме.</p>
    <div className="settings-layout">
      <div>
        <section className="card settings-card">
          <h2>Внешний вид</h2><p className="muted">Теория и интерфейс используют общую тему. Редактор — свою.</p>
          {(['ui', 'editor'] as const).map(group => <fieldset className="theme-section" key={group}>
            <legend>{group === 'ui' ? 'Интерфейс и теория' : 'Редактор кода'}</legend>
            <div className="theme-choices">{themes.map(theme => <button key={theme.value} type="button"
              className={`theme-choice ${settings[group] === theme.value ? 'selected' : ''}`}
              aria-pressed={settings[group] === theme.value}
              onClick={() => update({ ...settings, [group]: theme.value })}>
              <span className={`mini-window ${theme.value}`}><i /><i /><i /></span>
              <span>{theme.title}</span>
            </button>)}</div>
          </fieldset>)}
          <p className="small muted">Применяются сразу. Настройки сохраняются только в этом браузере.</p>
        </section>
        <section className="card settings-card">
          <h2>Данные обучения</h2>
          <p>Код, прогресс и последние пять запусков каждой задачи хранятся на этом устройстве. Очистка данных сайта или приватный режим могут привести к их потере.</p>
          <p className="muted small">Резервная копия содержит твой код. Не добавляй в решения пароли и API-ключи.</p>
          <div className="button-group">
            <button className="button" disabled={busy} onClick={() => void exportData()}>Экспорт прогресса</button>
            <button className="button" disabled={busy} onClick={() => input.current?.click()}>Импорт прогресса</button>
          </div>
          <input ref={input} type="file" accept=".json,application/json" hidden onChange={e => {
            const file = e.target.files?.[0]; if (file) void loadFile(file);
          }} />
          {notice && <p className="success-text" role="status">{notice}</p>}
          {error && <p className="error" role="alert">{error}</p>}
        </section>
      </div>
      <aside className="card preview-card"><div className="eyebrow">Предпросмотр</div>
        <h3>Prefix Sum</h3><p className="muted">Сумма отрезка — разница накопленных сумм.</p>
        <div className={`code-preview ${editorDark ? 'dark' : ''}`}><code>const nums = [2, 4, 1];<br />// Твоё решение<br />console.log(nums);</code></div>
        <p className="small muted">Светлая статья и тёмный редактор? Или наоборот? Выбирай то, что удобно тебе.</p>
      </aside>
    </div>
  </div>;
}
