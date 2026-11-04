import { useCallback, useEffect, useState } from "react";
import { agencyDate, parseTimer, timerMinutes, type RunningTimer } from "./time";
import type { TimeDraft } from "./timeQueries";

/** One browser timer per login. Persist before changing UI or attempting a save. */
export function usePersonalTimer(userId: string) {
  const key = `hub:time:timer:${userId}`;
  const [timer, setTimer] = useState<RunningTimer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const read = useCallback(() => parseTimer(localStorage.getItem(key)), [key]);
  const sync = useCallback(() => {
    try {
      setTimer(read());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Browser storage is unavailable. Allow it to use the timer.");
    }
    setReady(true);
  }, [read]);
  useEffect(() => {
    sync();
    const changed = (event: StorageEvent) => { if (event.key === key || event.key === null) sync(); };
    window.addEventListener("storage", changed);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.removeEventListener("storage", changed); window.clearInterval(tick); };
  }, [key, sync]);

  const locked = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      if (navigator.locks) await navigator.locks.request(key, action);
      else await action();
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save. Your timer is kept; try again.");
    } finally { setBusy(false); }
  };
  const start = (clientId: string, note: string) => locked(async () => {
    const existing = read();
    if (existing) { setTimer(existing); return; }
    const next = { id: crypto.randomUUID(), clientId, note: note.trim(), startedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(next));
    setTimer(next);
    setNow(Date.now());
  });
  const stopAndSave = (save: (draft: TimeDraft) => Promise<unknown>) => locked(async () => {
    const existing = read();
    if (!existing) { setTimer(null); return; }
    const stopped = { ...existing, stoppedAt: existing.stoppedAt ?? Date.now() };
    localStorage.setItem(key, JSON.stringify(stopped));
    setTimer(stopped);
    await save({ id: stopped.id, client_id: stopped.clientId, note: stopped.note,
      entry_date: agencyDate(new Date(stopped.startedAt)), minutes: timerMinutes(stopped) });
    localStorage.removeItem(key);
    setTimer(null);
  });
  const discard = () => locked(async () => {
    localStorage.removeItem(key);
    setTimer(null);
  });
  const seconds = timer ? Math.max(0, Math.floor(((timer.stoppedAt ?? now) - timer.startedAt) / 1000)) : 0;
  const clock = [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
  return { timer, error, ready, busy, clock, now, start, stopAndSave, discard };
}
