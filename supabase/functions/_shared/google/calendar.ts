// Google Calendar plumbing shared by the google-calendar and
// google-oauth-callback functions. No network calls and no Deno-only APIs, so
// the rules here run under Vitest as well (calendar.test.ts).

export const GOOGLE_SCOPES = ["openid", "email", "https://www.googleapis.com/auth/calendar.events"];

const STATE_TTL_MS = 10 * 60 * 1000;

// ---------------------------------------------------------------- OAuth state

const enc = new TextEncoder();

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/**
 * The OAuth `state`: who started the connection and until when it's valid,
 * signed so the callback (which has no session) can trust the user id in it.
 */
export async function signState(userId: string, secret: string, now = Date.now()) {
  const payload = b64url(enc.encode(JSON.stringify({ u: userId, e: now + STATE_TTL_MS, n: crypto.randomUUID() })));
  return `${payload}.${b64url(await hmac(secret, payload))}`;
}

/** The user id from a state made by signState, or null if it's forged, mangled or expired. */
export async function verifyState(state: string, secret: string, now = Date.now()): Promise<string | null> {
  const [payload, sig, extra] = state.split(".");
  if (!payload || !sig || extra !== undefined) return null;
  let given: Uint8Array;
  try {
    given = fromB64url(sig);
  } catch {
    return null;
  }
  const expected = await hmac(secret, payload);
  if (given.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given[i] ^ expected[i];
  if (diff !== 0) return null;
  try {
    const { u, e } = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (typeof u !== "string" || typeof e !== "number" || e < now) return null;
    return u;
  } catch {
    return null;
  }
}

export function authUrl(clientId: string, redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    // offline + consent: Google only hands out a refresh token on consent.
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** The email claim from Google's id_token. It came straight from Google over TLS, so it isn't re-verified. */
export function emailFromIdToken(idToken: string | undefined): string | null {
  const part = idToken?.split(".")[1];
  if (!part) return null;
  try {
    const claims = JSON.parse(new TextDecoder().decode(fromB64url(part)));
    return typeof claims.email === "string" ? claims.email : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- events

/** What the hub sees of a Google event. All-day events use dates; `end` is exclusive, as in Google. */
export type HubEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  allDay: boolean;
  start: string;
  end: string;
  htmlLink: string | null;
  meetLink: string | null;
  // Recurring instances and invitations from others can be edited in Google only.
  editable: boolean;
};

export type EventInput = {
  title: string;
  description?: string | null;
  location?: string | null;
  allDay: boolean;
  start: string;
  end: string;
  timeZone?: string;
};

type GoogleTime = { date?: string; dateTime?: string; timeZone?: string };
export type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: GoogleTime;
  end?: GoogleTime;
  htmlLink?: string;
  hangoutLink?: string;
  recurringEventId?: string;
  organizer?: { self?: boolean };
  guestsCanModify?: boolean;
};

export function toHubEvent(e: GoogleEvent): HubEvent | null {
  if (e.status === "cancelled" || !e.start || !e.end) return null;
  const allDay = Boolean(e.start.date);
  const start = allDay ? e.start.date : e.start.dateTime;
  const end = allDay ? e.end.date : e.end.dateTime;
  if (!start || !end) return null;
  return {
    id: e.id,
    title: e.summary?.trim() || "(No title)",
    description: e.description ?? null,
    location: e.location ?? null,
    allDay,
    start,
    end,
    htmlLink: e.htmlLink ?? null,
    meetLink: e.hangoutLink ?? null,
    editable: !e.recurringEventId && e.organizer?.self !== false,
  };
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TZ = /^[A-Za-z_]+(\/[A-Za-z0-9_+-]+)*$/;

const trimmed = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

/** Checks an event from the hub and shapes it for Google, or returns why it can't be saved. */
export function toGoogleBody(input: unknown): { body: Record<string, unknown> } | { error: string } {
  const e = (input ?? {}) as Record<string, unknown>;
  const title = trimmed(e.title, 300);
  if (!title) return { error: "Give the event a title" };
  const allDay = e.allDay === true;
  const start = typeof e.start === "string" ? e.start : "";
  const end = typeof e.end === "string" ? e.end : "";
  const timeZone = typeof e.timeZone === "string" && TZ.test(e.timeZone) ? e.timeZone : undefined;

  if (allDay) {
    if (!DATE.test(start) || !DATE.test(end)) return { error: "Pick the dates" };
    if (end <= start) return { error: "The event must end after it starts" };
  } else {
    const s = Date.parse(start);
    const f = Date.parse(end);
    if (Number.isNaN(s) || Number.isNaN(f)) return { error: "Pick the start and end times" };
    if (f <= s) return { error: "The event must end after it starts" };
  }

  // The other field is sent as null so a patch can switch between all-day and timed.
  const time = (v: string) =>
    allDay
      ? { date: v, dateTime: null, timeZone: null }
      : { date: null, dateTime: new Date(v).toISOString(), timeZone: timeZone ?? null };

  return {
    body: {
      summary: title,
      // null clears a field on update; Google ignores it on insert.
      description: trimmed(e.description, 8000),
      location: trimmed(e.location, 500),
      start: time(start),
      end: time(end),
    },
  };
}

/** Event ids come from Google; this only keeps anything odd out of the request path. */
export const isEventId = (v: unknown): v is string => typeof v === "string" && /^[a-zA-Z0-9_-]{1,1024}$/.test(v);
