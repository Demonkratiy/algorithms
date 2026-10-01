import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

type Option = { id: string; title: string; family: string; webFamily: string };

export function AppearanceSelect({ label, options, value, onChange }: {
  label: string; options: readonly Option[]; value: string; onChange: (value: string) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const search = useRef({ text: '', time: 0 });
  const [open, setOpen] = useState(false);
  const selected = options.findIndex(option => option.id === value);
  const [active, setActive] = useState(0);
  const [above, setAbove] = useState(false);
  const [fontError, setFontError] = useState('');
  if (selected < 0) throw new Error(`Неизвестный вариант ${label}: ${value}`);

  function show(index = selected) {
    const bounds = trigger.current?.getBoundingClientRect();
    setAbove(Boolean(bounds && window.innerHeight - bounds.bottom < 260 && bounds.top > window.innerHeight - bounds.bottom));
    search.current = { text: '', time: 0 };
    setActive(index);
    setOpen(true);
  }
  function choose(index: number) {
    onChange(options[index].id);
    setOpen(false);
    trigger.current?.focus();
  }
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    setFontError('');
    void Promise.all(options.filter(option => option.webFamily).map(async option => {
      const loaded = await document.fonts.load(`400 16px "${option.webFamily}"`, `${option.title} Аа`);
      if (!loaded.length) throw new Error(`Шрифт ${option.title} отсутствует в сборке.`);
    })).catch((error: unknown) => {
      if (active) setFontError(`Не удалось загрузить пример шрифта: ${String(error)} Показан запасной шрифт.`);
    });
    return () => { active = false; };
  }, [open, options]);
  useLayoutEffect(() => {
    if (!open || !list.current) return;
    const option = list.current.children[active];
    if (!(option instanceof HTMLElement)) return;
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (top < list.current.scrollTop) list.current.scrollTop = top;
    else if (bottom > list.current.scrollTop + list.current.clientHeight) list.current.scrollTop = bottom - list.current.clientHeight;
  }, [open, active]);

  return <div className="appearance-select" ref={root}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label id={`${id}-label`} htmlFor={`${id}-trigger`}>{label}</label>
    <button id={`${id}-trigger`} ref={trigger} type="button" role="combobox"
      className="appearance-select-trigger" aria-labelledby={`${id}-label`}
      aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined}
      aria-activedescendant={open ? `${id}-option-${active}` : undefined}
      onClick={() => { if (open) setOpen(false); else show(); }}
      onKeyDown={event => {
        if (event.key === 'Tab') { setOpen(false); return; }
        if (event.key === 'Escape') { if (open) event.preventDefault(); setOpen(false); return; }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (open) choose(active); else show();
          return;
        }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
            : Math.max(0, Math.min(options.length - 1, active + (event.key === 'ArrowDown' ? 1 : -1)));
          if (open) setActive(next);
          else show(event.key === 'Home' || event.key === 'End' ? next : selected);
          return;
        }
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        event.preventDefault();
        const now = Date.now();
        const text = (now - search.current.time < 700 ? search.current.text : '') + event.key.toLocaleLowerCase();
        search.current = { text, time: now };
        const match = options.findIndex(option => option.title.toLocaleLowerCase().startsWith(text));
        if (match >= 0) { if (open) setActive(match); else { show(match); search.current = { text, time: now }; } }
      }}>
      <span style={{ fontFamily: options[selected].family }}>{options[selected].title}</span>
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m4 6 4 4 4-4" /></svg>
    </button>
    {open && <ul id={`${id}-list`} ref={list} className={`appearance-select-list ${above ? 'opens-above' : ''}`}
      role="listbox" aria-labelledby={`${id}-label`}>
      {options.map((option, index) => <li key={option.id} id={`${id}-option-${index}`}
        role="option" aria-selected={option.id === value} className={index === active ? 'is-highlighted' : ''}
        onPointerMove={() => setActive(index)} onPointerDown={event => event.preventDefault()}
        onClick={() => choose(index)}>
        <span className="font-option-sample" style={{ fontFamily: option.family }}>
          {option.title}<span className="muted" aria-hidden="true">Аа</span>
        </span><span aria-hidden="true">{option.id === value ? '✓' : ''}</span>
      </li>)}
    </ul>}
    {open && fontError && <p className="error small" role="alert">{fontError}</p>}
  </div>;
}
