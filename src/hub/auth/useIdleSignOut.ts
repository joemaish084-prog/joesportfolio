import { useEffect } from "react";

const STORAGE_KEY = "hub:last-activity";
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"] as const;
const WRITE_THROTTLE_MS = 15_000;
const CHECK_EVERY_MS = 30_000;

function readStored() {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

/** Resets the idle clock, e.g. on sign-in, so an old timestamp can't end a fresh session. */
export function markActive() {
  writeStored(Date.now());
}

function writeStored(value: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Private mode: the in-memory timestamp still works for this tab.
  }
}

/**
 * Calls onIdle after `timeoutMs` without input. Activity is shared across tabs
 * through localStorage, and a stale timestamp on load (laptop closed overnight)
 * signs out immediately.
 */
export function useIdleSignOut(onIdle: () => void, timeoutMs: number, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const stored = readStored();
    if (stored && Date.now() - stored > timeoutMs) {
      onIdle();
      return;
    }

    let last = Date.now();
    let lastWrite = 0;
    writeStored(last);

    const onActivity = () => {
      last = Date.now();
      if (last - lastWrite > WRITE_THROTTLE_MS) {
        lastWrite = last;
        writeStored(last);
      }
    };

    const check = () => {
      const latest = Math.max(last, readStored() ?? 0);
      if (Date.now() - latest > timeoutMs) onIdle();
    };

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true, capture: true }));
    document.addEventListener("visibilitychange", check);
    const timer = window.setInterval(check, CHECK_EVERY_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity, { capture: true }));
      document.removeEventListener("visibilitychange", check);
      window.clearInterval(timer);
    };
  }, [onIdle, timeoutMs, enabled]);
}
