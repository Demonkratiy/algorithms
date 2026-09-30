import { useEffect, useRef, useState } from 'react';
import { emptyRecord, readRecord, writeRecord, type TaskRecord } from '../../lib/storage';

export function useTaskRecord(taskId: string, starter: string) {
  const [record, setRecord] = useState(() => emptyRecord(taskId, starter));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const latest = useRef(record);
  const sequence = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    readRecord(taskId).then(async saved => {
      if (mounted.current) {
        latest.current = saved ?? emptyRecord(taskId, starter);
        setRecord(latest.current);
        if (!saved) await writeRecord(latest.current);
        if (!mounted.current) return;
        setReady(true);
      }
    }).catch((e: unknown) => {
      if (mounted.current) {
        setError(`Локальное хранилище недоступно. Код пока не сохранён: ${String(e)}`);
        setReady(true);
      }
    });
    return () => { mounted.current = false; };
  }, [taskId, starter]);
  useEffect(() => {
    if (!saving && !error) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [saving, error]);
  function update(change: (previous: TaskRecord) => TaskRecord) {
    const next = { ...change(latest.current), updatedAt: new Date().toISOString() };
    latest.current = next;
    setRecord(next);
    setSaving(true);
    const id = ++sequence.current;
    void writeRecord(next).then(() => {
      if (mounted.current && id === sequence.current) { setSaving(false); setError(''); }
    }).catch((e: unknown) => {
      if (mounted.current) { setSaving(false); setError(`Не удалось сохранить решение: ${String(e)}`); }
      else console.error('Не удалось сохранить решение после закрытия страницы задачи', e);
    });
  }
  return { record, ready, update, error, saving };
}
