import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, json, userClient } from "../_shared/crm/http.ts";
import { authUrl, isEventId, signState, toGoogleBody, toHubEvent, type GoogleEvent } from "../_shared/google/calendar.ts";
import { GoogleDisconnected, accessToken, googleConfig, revoke, serviceClient, type Connection } from "../_shared/google/oauth.ts";

// Client Hub calendar: the hub's only way to reach Google Calendar. Hub admin
// only. One POST endpoint with an `action`:
//   status | connect | disconnect | list {timeMin, timeMax} |
//   create {event} | update {id, event} | delete {id}
// Tokens never leave this function; the browser only sees events.

const API = "https://www.googleapis.com/calendar/v3";
const MAX_RANGE_MS = 120 * 24 * 60 * 60 * 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const caller = userClient(req);
    const { data: isAdmin, error: roleError } = await caller.rpc("is_hub_admin");
    if (roleError || isAdmin !== true) return json({ error: "Not allowed" }, 403);
    const { data: who } = await caller.auth.getUser();
    const userId = who.user?.id;
    if (!userId) return json({ error: "Not allowed" }, 403);

    const body = await req.json().catch(() => null);
    const action = String(body?.action ?? "");

    const cfg = googleConfig();
    if (!cfg) {
      return action === "status" ? json({ configured: false, connected: false }) : json({ error: "Google isn't set up yet" }, 503);
    }

    const admin = serviceClient();
    const { data: conn } = await admin
      .from("google_calendar_connections")
      .select("user_id, google_email, refresh_token, calendar_id, access_token, access_token_expires_at")
      .eq("user_id", userId)
      .maybeSingle<Connection>();

    if (action === "status") {
      return json({ configured: true, connected: Boolean(conn), email: conn?.google_email ?? null });
    }

    if (action === "connect") {
      return json({ url: authUrl(cfg.clientId, cfg.redirectUri, await signState(userId, cfg.stateSecret)) });
    }

    if (!conn) return json({ error: "Connect Google Calendar first", reconnect: true }, 409);

    if (action === "disconnect") {
      await revoke(conn.refresh_token);
      await admin.from("google_calendar_connections").delete().eq("user_id", userId);
      return json({ connected: false });
    }

    const token = await accessToken(admin, cfg, conn);
    const calendar = `${API}/calendars/${encodeURIComponent(conn.calendar_id)}/events`;
    const google = (path: string, init: RequestInit = {}) =>
      fetch(`${calendar}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
      });
    const failed = async (res: Response) => {
      console.error("google-calendar: Google said", res.status, await res.text().catch(() => ""));
      if (res.status === 404 || res.status === 410) return json({ error: "That event no longer exists" }, 404);
      if (res.status === 403) return json({ error: "Google refused that change" }, 403);
      return json({ error: "Google Calendar didn't respond as expected" }, 502);
    };

    if (action === "list") {
      const min = Date.parse(String(body?.timeMin ?? ""));
      const max = Date.parse(String(body?.timeMax ?? ""));
      if (Number.isNaN(min) || Number.isNaN(max) || max <= min || max - min > MAX_RANGE_MS) {
        return json({ error: "Bad date range" }, 400);
      }
      const events: GoogleEvent[] = [];
      let pageToken: string | undefined;
      for (let page = 0; page < 5; page++) {
        const q = new URLSearchParams({
          timeMin: new Date(min).toISOString(),
          timeMax: new Date(max).toISOString(),
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: "250",
          ...(pageToken ? { pageToken } : {}),
        });
        const res = await google(`?${q}`);
        if (!res.ok) return failed(res);
        const data = await res.json();
        events.push(...(data.items ?? []));
        pageToken = data.nextPageToken;
        if (!pageToken) break;
      }
      return json({ email: conn.google_email, events: events.map(toHubEvent).filter(Boolean) });
    }

    if (action === "create" || action === "update") {
      const shaped = toGoogleBody(body?.event);
      if ("error" in shaped) return json({ error: shaped.error }, 400);
      if (action === "update" && !isEventId(body?.id)) return json({ error: "Bad request" }, 400);
      const res =
        action === "create"
          ? await google("", { method: "POST", body: JSON.stringify(shaped.body) })
          : await google(`/${encodeURIComponent(body.id)}`, { method: "PATCH", body: JSON.stringify(shaped.body) });
      if (!res.ok) return failed(res);
      return json({ event: toHubEvent(await res.json()) });
    }

    if (action === "delete") {
      if (!isEventId(body?.id)) return json({ error: "Bad request" }, 400);
      const res = await google(`/${encodeURIComponent(body.id)}`, { method: "DELETE" });
      // Already gone counts as deleted.
      if (!res.ok && res.status !== 404 && res.status !== 410) return failed(res);
      return json({ deleted: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    if (error instanceof GoogleDisconnected) {
      return json({ error: "Google disconnected the hub. Connect again.", reconnect: true }, 409);
    }
    console.error("google-calendar failed", error);
    return json({ error: "Something went wrong" }, 500);
  }
});
