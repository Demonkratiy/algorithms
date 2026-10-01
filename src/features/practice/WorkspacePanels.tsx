import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { defaultLayout, layoutKey, panelIds, parseLayout, resizePair, resizePanelHeight, stackedMinimum, type PanelId, type Preset, type WorkspaceLayout } from './workspaceLayout';

const names: Record<PanelId, string> = { statement: 'Условие', editor: 'Редактор', results: 'Результаты' };
const presets: { id: Preset; title: string; description: string }[] = [
  { id: 'columns', title: 'Колонки', description: 'Условие слева, редактор и результаты справа' },
  { id: 'bottom', title: 'Результаты снизу', description: 'Условие и редактор сверху, результаты на всю ширину снизу' },
  { id: 'stacked', title: 'Вертикально', description: 'Условие, редактор и результаты друг под другом' },
];
type Split = { axis: 'x' | 'y'; first: PanelId; area: string; disabled: boolean; label: string } & (
  { second: PanelId; index: 0 | 1 } | { second?: undefined; index: 0 | 1 | 2 }
);

function LayoutButton({ label, description, pressed, onClick, children }: {
  label: string; description: string; pressed?: boolean; onClick: () => void; children: ReactNode;
}) {
  const tooltipId = useId();
  const [dismissed, setDismissed] = useState(false);
  return <span className="layout-control" data-tooltip-dismissed={dismissed}
    onMouseEnter={() => setDismissed(false)} onFocus={() => setDismissed(false)}
    onKeyDown={event => { if (event.key === 'Escape') setDismissed(true); }}>
    <button className="layout-icon-button" aria-label={label} aria-describedby={tooltipId}
      aria-pressed={pressed} onClick={onClick}>{children}</button>
    <span className="layout-tooltip" id={tooltipId} role="tooltip">{label} — {description}</span>
  </span>;
}

function LayoutIcon({ preset }: { preset: Preset }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d={preset === 'columns' ? 'M11 4v16M11 12h10' : preset === 'bottom' ? 'M3 14h18M12 4v10' : 'M3 9h18M3 15h18'} />
  </svg>;
}

export function WorkspacePanels({ statement, editor, results }: Record<PanelId, ReactNode>) {
  const [layout, setLayout] = useState(defaultLayout);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [maximized, setMaximized] = useState<PanelId | null>(null);
  const [narrow, setNarrow] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const instanceId = useId();
  useEffect(() => {
    try {
      const saved = localStorage.getItem(layoutKey);
      if (saved) setLayout(parseLayout(saved, root.current ? root.current.clientHeight - 16 : undefined));
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
    style = { gridTemplateColumns: 'minmax(0, 1fr)', gridTemplateRows: panelIds.map((id, i) => `${collapsed(id) ? 44 : layout.sizes.stacked[i]}px 8px`).join(' ') };
    areas = { statement: '1 / 1 / 2 / 2', editor: '3 / 1 / 4 / 2', results: '5 / 1 / 6 / 2' };
    splits = [
      { axis: 'y', first: 'statement', index: 0, area: '2 / 1 / 3 / 2', disabled: collapsed('statement'), label: 'Высота условия' },
      { axis: 'y', first: 'editor', index: 1, area: '4 / 1 / 5 / 2', disabled: collapsed('editor'), label: 'Высота редактора' },
      { axis: 'y', first: 'results', index: 2, area: '6 / 1 / 7 / 2', disabled: collapsed('results'), label: 'Высота результатов' },
    ];
  }
  function resize(split: Split, first: number, second: number, delta: number, initial: WorkspaceLayout) {
    const sizes = { ...initial.sizes };
    if (!split.second) {
      const next: [number, number, number] = [...sizes.stacked];
      next[split.index] = resizePanelHeight(first, delta, split.first);
      sizes.stacked = next;
    } else if (preset !== 'stacked') {
      const minFirst = split.axis === 'x' ? 280 : split.first === 'editor' || preset === 'bottom' ? 220 : 140;
      const minSecond = split.axis === 'x' ? 280 : split.second === 'editor' ? 220 : 120;
      const fraction = resizePair(first, second, delta, minFirst, minSecond);
      const next: [number, number] = [...sizes[preset]];
      next[split.index] = fraction * 100;
      sizes[preset] = next;
    }
    change({ ...initial, sizes });
  }
  const children = { statement, editor, results };
  return <div className="workspace-panels">
    <div className="layout-toolbar">
      {narrow && <span className="small muted">На узком экране панели расположены вертикально</span>}
      <div className="layout-picker" role="group" aria-label="Расположение панелей">
        {presets.map(item => <LayoutButton key={item.id} label={item.title} description={item.description}
          pressed={layout.preset === item.id} onClick={() => {
            change({ ...layout, preset: item.id }); setMaximized(null);
          }}><LayoutIcon preset={item.id} /></LayoutButton>)}
        <span className="layout-control-divider" aria-hidden="true" />
        <LayoutButton label="Сбросить расположение" description="Вернуть исходную схему, размеры и раскрыть панели, не меняя код"
          onClick={() => { change(defaultLayout()); setMaximized(null); }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 10a9 9 0 1 1 2.6 8.4M3 4v6h6" />
          </svg>
        </LayoutButton>
      </div>
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
      {splits.map(split => <Splitter key={`${preset}-${split.index}`} split={split} hidden={maximized !== null} root={root.current}
        controls={split.second ? `${instanceId}-${split.first} ${instanceId}-${split.second}` : `${instanceId}-${split.first}`} layout={layout}
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
  const [value, setValue] = useState(split.second ? 50 : layout.sizes.stacked[split.index]);
  const measure = () => {
    const first = root?.querySelector(`[data-panel="${split.first}"]`)?.getBoundingClientRect();
    const second = split.second ? root?.querySelector(`[data-panel="${split.second}"]`)?.getBoundingClientRect() : undefined;
    if (!first || (split.second && !second)) return null;
    return { first: split.axis === 'x' ? first.width : first.height, second: second ? (split.axis === 'x' ? second.width : second.height) : 0 };
  };
  useEffect(() => {
    if (!root) return;
    const observer = new ResizeObserver(() => {
      const sizes = measure();
      if (sizes && sizes.first + sizes.second) setValue(Math.round(split.second ? sizes.first / (sizes.first + sizes.second) * 100 : sizes.first));
    });
    for (const id of [split.first, split.second]) {
      if (!id) continue;
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
    drag.current = { ...sizes, start: split.axis === 'x' ? event.clientX : split.second ? event.clientY : event.pageY, layout };
    setDragging(true);
  }
  return <div role="separator" aria-label={split.label} aria-orientation={split.axis === 'x' ? 'vertical' : 'horizontal'}
    aria-controls={controls} aria-valuemin={split.second ? 0 : stackedMinimum[split.first]}
    aria-valuemax={split.second ? 100 : Number.MAX_SAFE_INTEGER} aria-valuenow={value}
    aria-valuetext={split.second ? `${value}%` : `${value} пикселей`}
    aria-disabled={split.disabled} tabIndex={split.disabled || hidden ? -1 : 0} hidden={hidden}
    title={`${split.label}: перетащи или используй стрелки`}
    className={`panel-divider axis-${split.axis} ${dragging ? 'dragging' : ''} ${split.disabled ? 'disabled' : ''}`}
    style={{ gridArea: split.area }} onPointerDown={begin}
    onPointerMove={event => {
      if (!drag.current) return;
      onResize(drag.current.first, drag.current.second, (split.axis === 'x' ? event.clientX : split.second ? event.clientY : event.pageY) - drag.current.start, drag.current.layout);
    }}
    onPointerUp={event => { drag.current = null; setDragging(false); event.currentTarget.releasePointerCapture(event.pointerId); }}
    onLostPointerCapture={() => { drag.current = null; setDragging(false); }}
    onPointerCancel={() => { drag.current = null; setDragging(false); }}
    onKeyDown={event => {
      if (split.disabled) return;
      const keys = split.axis === 'x' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
      if (![...keys, 'Home', ...(split.second ? ['End'] : [])].includes(event.key)) return;
      const sizes = measure();
      if (!sizes) return;
      event.preventDefault();
      const delta = event.key === 'Home' ? -sizes.first : event.key === 'End' ? sizes.second
        : (event.key === keys[0] ? -1 : 1) * (event.shiftKey ? 40 : 10);
      onResize(sizes.first, sizes.second, delta, layout);
    }}
  ><span /></div>;
}
