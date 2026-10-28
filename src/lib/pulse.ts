const PULSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pulse`;

const DEVICE_ID_KEY = "pulse_device_id";
const SESSION_ID_KEY = "pulse_session_id";

// crypto.randomUUID is missing on iOS Safari < 15.4, older Android WebViews and
// insecure contexts; calling it unguarded throws and unmounts the whole app.
function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = newId();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = newId();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return newId();
  }
}

export type PulseEventType = "page_view" | "click" | "heartbeat" | "page_exit";

export interface PulsePayload {
  event_type: PulseEventType;
  page_path: string;
  page_title?: string;
  element_selector?: string;
  element_text?: string;
  duration_ms?: number;
  referrer?: string;
}

export function sendPulse(payload: PulsePayload, useBeacon = false) {
  try {
    const body = JSON.stringify({
      device_id: getDeviceId(),
      session_id: getSessionId(),
      ...payload,
    });

    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(PULSE_URL, blob);
      return;
    }
    fetch(PULSE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking must never break the page.
  }
}

export function buildElementSelector(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const classes =
    typeof el.className === "string" && el.className.trim()
      ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
      : "";
  return `${tag}${id}${classes}`;
}
