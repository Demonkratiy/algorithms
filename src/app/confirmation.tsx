import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type Confirmation = { title: string; message: string; confirmLabel: string };
type Request = Confirmation & { resolve: (confirmed: boolean) => void };
const ConfirmationContext = createContext<((options: Confirmation) => Promise<boolean>) | null>(null);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null);
  const queue = useRef<Request[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const id = useId();
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const confirm = useCallback((options: Confirmation) => new Promise<boolean>(resolve => {
    const next = { ...options, resolve };
    queue.current.push(next);
    if (queue.current.length === 1) setRequest(next);
  }), []);
  const finish = useCallback((confirmed: boolean) => {
    const current = queue.current.shift();
    dialog.current?.close();
    current?.resolve(confirmed);
    setRequest(queue.current[0] ?? null);
  }, []);
  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    for (const pending of queue.current.splice(0)) pending.resolve(false);
    dialog.current?.close();
    setRequest(null);
  }, [pathname]);
  useEffect(() => () => {
    for (const pending of queue.current.splice(0)) pending.resolve(false);
  }, []);
  useLayoutEffect(() => {
    if (request && dialog.current && !dialog.current.open) {
      dialog.current.showModal();
      cancel.current?.focus();
    }
  }, [request]);

  return <ConfirmationContext.Provider value={confirm}>
    {children}
    <dialog ref={dialog} className="confirmation-dialog" aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-message`} aria-modal="true"
      onCancel={event => { event.preventDefault(); finish(false); }}>
      {request && <>
        <h2 id={`${id}-title`}>{request.title}</h2>
        <p id={`${id}-message`}>{request.message}</p>
        <div className="button-group confirmation-actions">
          <button ref={cancel} type="button" className="button" onClick={() => finish(false)}>Отмена</button>
          <button type="button" className="button primary" onClick={() => finish(true)}>{request.confirmLabel}</button>
        </div>
      </>}
    </dialog>
  </ConfirmationContext.Provider>;
}

export function useConfirmation() {
  const confirm = useContext(ConfirmationContext);
  if (!confirm) throw new Error('ConfirmationProvider is missing');
  return confirm;
}
