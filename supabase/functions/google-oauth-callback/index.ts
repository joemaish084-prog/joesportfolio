import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GOOGLE_SCOPES, emailFromIdToken, verifyState } from "../_shared/google/calendar.ts";
import { exchangeCode, googleConfig, serviceClient } from "../_shared/google/oauth.ts";

// Where Google sends the browser back after "Connect Google Calendar". Google
// can't attach a Supabase session, so verify_jwt is off (config.toml) and the
// signed `state` from google-calendar's "connect" identifies the hub user
// instead. Stores the refresh token, then returns to /hub/calendar.

const CALENDAR_SCOPE = GOOGLE_SCOPES[2];

serve(async (req) => {
  const cfg = googleConfig();
  const back = (result: string) =>
    new Response(null, {
      status: 303,
      headers: { Location: `${cfg?.hubUrl ?? "/hub"}/calendar?google=${result}`, "Cache-Control": "no-store" },
    });

  if (req.method !== "GET" || !cfg) return back("error");

  try {
    const url = new URL(req.url);
    // The person pressed Cancel on Google's screen.
    if (url.searchParams.get("error")) return back("cancelled");

    const code = url.searchParams.get("code");
    const userId = await verifyState(url.searchParams.get("state") ?? "", cfg.stateSecret);
    if (!code || !userId) return back("error");

    const admin = serviceClient();
    // The state was signed for a hub admin; check they still are.
    const { data: role } = await admin.from("user_roles").select("user_id").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!role) return back("error");

    const t = await exchangeCode(cfg, code);
    // Unticking the calendar box on Google's consent screen leaves us with nothing to sync.
    if (!t.scope?.split(" ").includes(CALENDAR_SCOPE)) return back("scope");
    if (!t.refresh_token) return back("error");

    const { error } = await admin.from("google_calendar_connections").upsert({
      user_id: userId,
      google_email: emailFromIdToken(t.id_token),
      refresh_token: t.refresh_token,
      scope: t.scope,
      calendar_id: "primary",
      access_token: t.access_token,
      access_token_expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(),
      connected_at: new Date().toISOString(),
    });
    if (error) throw error;
    return back("connected");
  } catch (error) {
    console.error("google-oauth-callback failed", error);
    return back("error");
  }
});
