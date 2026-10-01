import { useRef, useState } from 'react';
import { usePreferences } from '../app/preferences';
import { useConfirmation } from '../app/confirmation';
import { BACKUP_VERSION, defaultSettings, importBackup, parseBackup, readAllRecords, type Theme } from '../lib/storage';
import { palettes, type Palette } from '../lib/palettes';
import { editorFonts, isEditorFont, isUiFont, textSizes, uiFonts } from '../lib/typography';
import interLicense from '@fontsource-variable/inter/LICENSE?raw';
import sourceSansLicense from '@fontsource-variable/source-sans-3/LICENSE?raw';
import jetbrainsLicense from '@fontsource-variable/jetbrains-mono/LICENSE?raw';
import sourceCodeLicense from '@fontsource-variable/source-code-pro/LICENSE?raw';
import robotoLicense from '@fontsource-variable/roboto/LICENSE?raw';
import manropeLicense from '@fontsource-variable/manrope/LICENSE?raw';
import notoSerifLicense from '@fontsource-variable/noto-serif/LICENSE?raw';
import comicReliefLicense from '@fontsource/comic-relief/LICENSE?raw';
import { AppearanceSelect } from '../components/AppearanceSelect';

const fontLicenses = [
  { title: 'Inter', text: interLicense }, { title: 'Source Sans 3', text: sourceSansLicense },
  { title: 'JetBrains Mono', text: jetbrainsLicense }, { title: 'Source Code Pro', text: sourceCodeLicense },
  { title: 'Roboto', text: robotoLicense }, { title: 'Manrope', text: manropeLicense },
  { title: 'Noto Serif', text: notoSerifLicense }, { title: 'Comic Relief', text: comicReliefLicense },
];

const themes: { value: Theme; title: string }[] = [
  { value: 'light', title: 'Светлая' }, { value: 'dark', title: 'Тёмная' }, { value: 'system', title: 'Как в системе' },
];
function PaletteSample({ palette, mode }: { palette: Palette; mode: 'light' | 'dark' }) {
  return <span className="palette-sample" data-palette={palette} data-theme={mode} aria-hidden="true">
    <i /><i /><b />
  </span>;
}
function TypographyControls({ group }: { group: 'ui' | 'editor' }) {
  const { settings, update } = usePreferences();
  const sizeKey = group === 'ui' ? 'uiSize' : 'editorSize';
  const fontKey = group === 'ui' ? 'uiFont' : 'editorFont';
  const fonts = group === 'ui' ? uiFonts : editorFonts;
  return <div className="typography-controls">
    <fieldset className="text-size-choices">
      <legend>{group === 'ui' ? 'Размер текста' : 'Размер кода'}</legend>
      <div className="button-group">{textSizes.map(size => <button type="button" key={size.id}
        className="button" aria-pressed={settings[sizeKey] === size.id}
        onClick={() => update({ ...settings, [sizeKey]: size.id })}>{size.title}</button>)}</div>
    </fieldset>
    <AppearanceSelect label={group === 'ui' ? 'Шрифт текста' : 'Шрифт кода'}
      options={fonts} value={settings[fontKey]} onChange={value => {
        if (group === 'ui' && isUiFont(value)) update({ ...settings, uiFont: value });
        else if (group === 'editor' && isEditorFont(value)) update({ ...settings, editorFont: value });
        else throw new Error(`Неизвестный шрифт: ${value}`);
      }} />
  </div>;
}
export function SettingsPage() {
  const confirm = useConfirmation();
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
      if (!await confirm({ title: 'Импортировать прогресс?', message: `Импортировать ${backup.tasks.length} записей? Для совпадающих задач локальный код и история будут заменены. Остальные задачи не изменятся.`, confirmLabel: 'Импортировать' })) return;
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
              {group === 'ui' ? <span className="theme-samples" aria-hidden="true">
                {theme.value !== 'dark' && <PaletteSample palette={settings.palette} mode="light" />}
                {theme.value !== 'light' && <PaletteSample palette={settings.palette} mode="dark" />}
              </span> : <span className={`mini-window ${theme.value}`} aria-hidden="true"><i /><i /><i /></span>}
              <span>{theme.title}</span>
            </button>)}</div>
            {group === 'ui' && <details className="palette-section">
              <summary>Палитра <span className="muted">· {palettes.find(palette => palette.id === settings.palette)?.title}</span></summary>
              <p className="muted small">Один выбор для обоих режимов. Слева — светлая версия, справа — тёмная.</p>
              <div className="palette-choices">{palettes.map(palette => <button type="button" key={palette.id}
                className="palette-choice" aria-label={palette.title} aria-pressed={settings.palette === palette.id}
                onClick={() => update({ ...settings, palette: palette.id })}>
                <span className="palette-samples">
                  <PaletteSample palette={palette.id} mode="light" /><PaletteSample palette={palette.id} mode="dark" />
                </span>
                <strong>{palette.title}</strong><span className="small muted">{palette.description}</span>
              </button>)}</div>
            </details>}
            <TypographyControls group={group} />
          </fieldset>)}
          <p className="small muted">Применяются сразу. Настройки сохраняются только в этом браузере.</p>
          <button type="button" className="button" onClick={() => update({ ...defaultSettings })}>Сбросить оформление</button>
          <p className="small muted appearance-reset-note">Вернёт «Лаванду», системный режим интерфейса, тёмный редактор, средний размер и исходные шрифты. Прогресс и размеры панелей не изменятся.</p>
          <details className="font-licenses">
            <summary>Лицензии шрифтов</summary>
            <ul>{fontLicenses.map(font => <li key={font.title}>
              <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(font.text)}`} download={`${font.title}-LICENSE.txt`}>{font.title} · OFL-1.1</a>
            </li>)}</ul>
          </details>
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
        <p><button type="button" className="preview-link">Открыть теорию →</button></p>
        <div className="preview-selected">Выбранная тема · Prefix Sum</div>
        <button type="button" className="button primary">К практике</button>
        <div className={`code-preview ${editorDark ? 'dark' : ''}`}><code>
          <span className="code-keyword">const</span>{' nums = ['}<span className="code-number">2</span>{', '}
          <span className="code-number">4</span>{', '}<span className="code-number">1</span>{'];'}<br />
          <span className="code-comment">// Твоё решение</span><br />
          {'console.log('}<span className="code-string">'Массив:'</span>{', nums);'}
        </code></div>
        <p className="result-status result-status--passed">Пример: тест пройден</p>
        <p className="result-status result-status--failed">Пример ошибки: ответ не совпал</p>
        <p className="small muted">Светлая статья и тёмный редактор? Или наоборот? Выбирай то, что удобно в твоей любимой палитре.</p>
      </aside>
    </div>
  </div>;
}
