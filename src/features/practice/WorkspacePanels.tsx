import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { defaultLayout, layoutKey, panelIds, parseLayout, resizePair, type PanelId, type Preset, type WorkspaceLayout } from './workspaceLayout';

const names: Record<PanelId, string> = { statement: 'Условие', editor: 'Редактор', results: 'Результаты' };
const presets: { id: Preset; title: string }[] = [
  { id: 'columns', title: 'Колонки' }, { id: 'bottom', title: 'Результаты снизу' }, { id: 'stacked', title: 'Вертикально' },
];
type Split = { axis: 'x' | 'y'; first: PanelId; second: PanelId; index: 0 | 1; area: string; disabled: boolean; label: string };

export function WorkspacePanels({ statement, editor, results }: Record<PanelId, ReactNode>) {
  const [layout, setLayout] = useState(defaultLayout);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [maximized, setMaximized] = useState<PanelId | null>(null);
  const [narrow, setNarrow] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const instanceId = useId();
  useEffect(() => {
    try {
      const saved = localStorage.getItem(layoutKey);
      if (saved) setLayout(parseLayout(saved));
    } catch (e) { setError(`Не удалось восстановить расположение: ${String(e)}`); }
    setLoaded(true);
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => setNarrow(entries[0].contentRect.width < 640));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  function change(next: WorkspaceLayout) {
    setLayout(next);
    try { localStorage.setItem(layoutKey, JSON.stringify(next)); setError(''); }
    catch (e) { setError(`Расположение изменено, но не сохранено: ${String(e)}`); }
  }
  const preset = narrow ? 'stacked' : layout.preset;
  const collapsed = (id: PanelId) => layout.collapsed.includes(id);
  const bothRight = collapsed('editor') && collapsed('results');
  const bothTop = collapsed('statement') && collapsed('editor');
  const track = (size: number, min: number, closed: boolean) => closed ? '44px' : `minmax(${min}px, ${size}fr)`;
  const [main, cross] = layout.sizes[preset];
  let style: CSSProperties;
  let areas: Record<PanelId, string>;
  let rails: PanelId[] = [];
  let splits: Split[];
  if (preset === 'columns') {
    style = {
      gridTemplateColumns: `${track(main, 280, collapsed('statement'))} 8px ${track(100 - main, 280, bothRight)}`,
      gridTemplateRows: bothRight ? `${cross}fr 8px ${100 - cross}fr`
        : `${track(cross, 220, collapsed('editor'))} 8px ${track(100 - cross, 120, collapsed('results'))}`,
    };
    areas = { statement: '1 / 1 / 4 / 2', editor: '1 / 3 / 2 / 4', results: '3 / 3 / 4 / 4' };
    rails = [...(collapsed('statement') ? ['statement' as const] : []), ...(bothRight ? ['editor' as const, 'results' as const] : [])];
    splits = [
      { axis: 'x', first: 'statement', second: 'editor', index: 0, area: '1 / 2 / 4 / 3', disabled: collapsed('statement') || bothRight, label: 'Ширина колонок' },
      { axis: 'y', first: 'editor', second: 'results', index: 1, area: '2 / 3 / 3 / 4', disabled: collapsed('editor') || collapsed('results'), label: 'Высота редактора и результатов' },
    ];
  } else if (preset === 'bottom') {
    style = {
      gridTemplateColumns: bothTop ? `${main}fr 8px ${100 - main}fr`
        : `${track(main, 280, collapsed('statement'))} 8px ${track(100 - main, 280, collapsed('editor'))}`,
      gridTemplateRows: `${track(cross, 220, bothTop)} 8px ${track(100 - cross, 120, collapsed('results'))}`,
    };
    areas = { statement: '1 / 1 / 2 / 2', editor: '1 / 3 / 2 / 4', results: '3 / 1 / 4 / 4' };
    rails = bothTop ? [] : panelIds.filter(id => id !== 'results' && collapsed(id));
    splits = [
      { axis: 'x', first: 'statement', second: 'editor', index: 0, area: '1 / 2 / 2 / 3', disabled: collapsed('statement') || collapsed('editor'), label: 'Ширина колонок' },
      { axis: 'y', first: 'editor', second: 'results', index: 1, area: '2 / 1 / 3 / 4', disabled: bothTop || collapsed('results'), label: 'Высота верхних панелей и результатов' },
    ];
  } else {
    style = { gridTemplateColumns: 'minmax(0, 1fr)', gridTemplateRows: panelIds.map((id, i) => track(layout.sizes.stacked[i], id === 'editor' ? 220 : 140, collapsed(id))).join(' 8px ') };
    areas = { statement: '1 / 1 / 2 / 2', editor: '3 / 1 / 4 / 2', results: '5 / 1 / 6 / 2' };
    splits = [
      { axis: 'y', first: 'statement', second: 'editor', index: 0, area: '2 / 1 / 3 / 2', disabled: collapsed('statement') || collapsed('editor'), label: 'Высота условия и редактора' },
      { axis: 'y', first: 'editor', second: 'results', index: 1, area: '4 / 1 / 5 / 2', disabled: collapsed('editor') || collapsed('results'), label: 'Высота редактора и результатов' },
    ];
  }
  function resize(split: Split, first: number, second: number, delta: number, initial: WorkspaceLayout) {
    const minFirst = split.axis === 'x' ? 280 : split.first === 'editor' || preset === 'bottom' ? 220 : 140;
    const minSecond = split.axis === 'x' ? 280 : split.second === 'editor' ? 220 : preset === 'stacked' ? 140 : 120;
    const fraction = resizePair(first, second, delta, minFirst, minSecond);
    const sizes = { ...initial.sizes };
    if (preset === 'stacked') {
      const pair = sizes.stacked[split.index] + sizes.stacked[split.index + 1];
      const next: [number, number, number] = [...sizes.stacked];
      next[split.index] = pair * fraction;
      next[split.index + 1] = pair * (1 - fraction);
      sizes.stacked = next;
    } else {
      const next: [number, number] = [...sizes[preset]];
      next[split.index] = fraction * 100;
      sizes[preset] = next;
    }
    change({ ...initial, sizes });
  }
  const children = { statement, editor, results };
  return <div className="workspace-panels">
    <div className="layout-toolbar">
      <span className="small muted">{narrow ? 'На узком экране панели расположены вертикально' : 'Потяни за границу, чтобы изменить размер'}</span>
      <details className="layout-picker" ref={menu} onKeyDown={event => {
        if (event.key === 'Escape' && menu.current) { menu.current.open = false; menu.current.querySelector('summary')?.focus(); }
      }}>
        <summary title="Расположение панелей" aria-label="Расположение панелей">▦ <span>Расположение</span></summary>
        <div className="layout-options" aria-label="Схемы расположения">
          {presets.map(item => <button key={item.id} className="layout-option" aria-pressed={layout.preset === item.id} onClick={() => {
            change({ ...layout, preset: item.id }); setMaximized(null); if (menu.current) menu.current.open = false;
          }}><span className={`layout-mini ${item.id}`} aria-hidden="true"><i /><i /><i /></span>{item.title}</button>)}
          <button className="button" onClick={() => {
            change(defaultLayout()); setMaximized(null); if (menu.current) menu.current.open = false;
          }}>Сбросить расположение</button>
        </div>
      </details>
    </div>
    {error && <div role="alert" className="error">{error}</div>}
    <div ref={root} className={`panel-grid ${maximized ? 'has-maximized' : ''}`} data-preset={preset} data-loaded={loaded} style={maximized ? { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' } : style}>
      {panelIds.map(id => {
        const closed = collapsed(id) && maximized !== id;
        const invisible = maximized !== null && maximized !== id;
        return <section key={id} id={`${instanceId}-${id}`} data-panel={id}
          className={`workspace-panel card ${closed ? 'is-collapsed' : ''} ${!maximized && rails.includes(id) ? 'is-rail' : ''}`}
          aria-label={`Панель: ${names[id]}`} hidden={invisible} style={{ gridArea: maximized ? '1 / 1' : areas[id] }}>
          <header className="panel-heading">
            <strong>{names[id]}</strong>
            <div className="panel-buttons">
              <button className="icon-button" title={`${closed ? 'Восстановить' : 'Свернуть'}: ${names[id]}`}
                aria-label={`${closed ? 'Восстановить' : 'Свернуть'}: ${names[id]}`} aria-expanded={!closed} aria-controls={`${instanceId}-${id}-body`}
                onClick={() => {
                  if (maximized) setMaximized(null);
                  change({ ...layout, collapsed: closed ? layout.collapsed.filter(panel => panel !== id) : [...new Set([...layout.collapsed, id])] });
                }}>{closed ? '＋' : '−'}</button>
              <button className="icon-button" title={maximized === id ? 'Вернуть расположение' : `Развернуть: ${names[id]}`}
                aria-label={maximized === id ? 'Вернуть расположение' : `Развернуть: ${names[id]}`}
                onClick={() => setMaximized(maximized === id ? null : id)}>{maximized === id ? '⤡' : '⤢'}</button>
            </div>
          </header>
          <div id={`${instanceId}-${id}-body`} className="panel-body" hidden={closed}>{children[id]}</div>
        </section>;
      })}
      {splits.map(split => <Splitter key={split.index} split={split} hidden={maximized !== null} root={root.current}
        controls={`${instanceId}-${split.first} ${instanceId}-${split.second}`} layout={layout}
        onResize={(first, second, delta, initial) => resize(split, first, second, delta, initial)} />)}
    </div>
  </div>;
}

function Splitter({ split, root, layout, hidden, controls, onResize }: {
  split: Split; root: HTMLDivElement | null; layout: WorkspaceLayout; hidden: boolean; controls: string;
  onResize: (first: number, second: number, delta: number, initial: WorkspaceLayout) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ start: number; first: number; second: number; layout: WorkspaceLayout } | null>(null);
  const [value, setValue] = useState(50);
  const measure = () => {
    const first = root?.querySelector(`[data-panel="${split.first}"]`)?.getBoundingClientRect();
    const second = root?.querySelector(`[data-panel="${split.second}"]`)?.getBoundingClientRect();
    if (!first || !second) return null;
    return { first: split.axis === 'x' ? first.width : first.height, second: split.axis === 'x' ? second.width : second.height };
  };
  useEffect(() => {
    if (!root) return;
    const observer = new ResizeObserver(() => {
      const sizes = measure();
      if (sizes && sizes.first + sizes.second) setValue(Math.round(sizes.first / (sizes.first + sizes.second) * 100));
    });
    for (const id of [split.first, split.second]) {
      const element = root.querySelector(`[data-panel="${id}"]`);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [root, split.first, split.second, split.axis]);
  function begin(event: PointerEvent<HTMLDivElement>) {
    if (split.disabled || event.button !== 0) return;
    const sizes = measure();
    if (!sizes) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { ...sizes, start: split.axis === 'x' ? event.clientX : event.clientY, layout };
    setDragging(true);
  }
  return <div role="separator" aria-label={split.label} aria-orientation={split.axis === 'x' ? 'vertical' : 'horizontal'}
    aria-controls={controls} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}
    aria-disabled={split.disabled} tabIndex={split.disabled || hidden ? -1 : 0} hidden={hidden}
    title={`${split.label}: перетащи или используй стрелки`}
    className={`panel-divider axis-${split.axis} ${dragging ? 'dragging' : ''} ${split.disabled ? 'disabled' : ''}`}
    style={{ gridArea: split.area }} onPointerDown={begin}
    onPointerMove={event => {
      if (!drag.current) return;
      onResize(drag.current.first, drag.current.second, (split.axis === 'x' ? event.clientX : event.clientY) - drag.current.start, drag.current.layout);
    }}
    onPointerUp={event => { drag.current = null; setDragging(false); event.currentTarget.releasePointerCapture(event.pointerId); }}
    onLostPointerCapture={() => { drag.current = null; setDragging(false); }}
    onKeyDown={event => {
      if (split.disabled) return;
      const keys = split.axis === 'x' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
      if (![...keys, 'Home', 'End'].includes(event.key)) return;
      const sizes = measure();
      if (!sizes) return;
      event.preventDefault();
      const delta = event.key === 'Home' ? -sizes.first : event.key === 'End' ? sizes.second
        : (event.key === keys[0] ? -1 : 1) * (event.shiftKey ? 40 : 10);
      onResize(sizes.first, sizes.second, delta, layout);
    }}
  ><span /></div>;
}
