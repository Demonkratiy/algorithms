import { useEffect, useRef, useState } from 'react';

const storageKey = 'algo-sidebar-width-v1';
const defaultWidth = 228;
const minWidth = 200;
const maxWidth = 400;

export function useSidebarWidth() {
  const [width, setWidth] = useState(defaultWidth);
  const [error, setError] = useState('');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const value: unknown = JSON.parse(saved);
        if (typeof value !== 'number' || !Number.isInteger(value) || value < minWidth || value > maxWidth) {
          throw new Error('Недопустимая ширина меню. Измени ширину или дважды нажми на границу для сброса.');
        }
        setWidth(value);
      }
    } catch (e) { setError(`Не удалось восстановить ширину меню: ${String(e)}`); }
  }, []);
  function resize(value: number) {
    const next = Math.max(minWidth, Math.min(maxWidth, Math.round(value)));
    setWidth(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setError(''); }
    catch (e) { setError(`Ширина меню изменена, но не сохранена: ${String(e)}`); }
  }
  return { width, error, resize };
}

export function SidebarResizer({ width, onResize }: { width: number; onResize: (width: number) => void }) {
  const drag = useRef<{ pointerId: number; start: number; width: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  function stop() {
    drag.current = null;
    setDragging(false);
  }
  return <div className={`sidebar-resizer ${dragging ? 'dragging' : ''}`}
    role="separator" aria-label="Ширина меню" aria-orientation="vertical" aria-controls="course-sidebar"
    aria-valuemin={minWidth} aria-valuemax={maxWidth} aria-valuenow={width} aria-valuetext={`${width} пикселей`}
    tabIndex={0} title="Ширина меню: перетащи или используй стрелки. Двойной клик — сброс."
    onPointerDown={event => {
      if (event.button !== 0 || drag.current) return;
      event.preventDefault();
      event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { pointerId: event.pointerId, start: event.clientX, width };
      setDragging(true);
    }}
    onPointerMove={event => {
      if (!drag.current || drag.current.pointerId !== event.pointerId) return;
      if (!event.currentTarget.getClientRects().length) { stop(); return; }
      onResize(drag.current.width + event.clientX - drag.current.start);
    }}
    onPointerUp={event => {
      if (drag.current?.pointerId !== event.pointerId) return;
      stop();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onPointerCancel={stop} onLostPointerCapture={stop}
    onDoubleClick={() => onResize(defaultWidth)}
    onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      onResize(event.key === 'Home' ? minWidth : event.key === 'End' ? maxWidth
        : width + (event.key === 'ArrowLeft' ? -1 : 1) * (event.shiftKey ? 40 : 10));
    }} />;
}
