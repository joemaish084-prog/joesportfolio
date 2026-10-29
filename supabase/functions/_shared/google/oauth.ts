import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

// Server-side Google OAuth: config from Edge Function secrets, the code
// exchange, and access tokens refreshed from the stored refresh token. Only the
// service role reads google_calendar_connections.

export type GoogleConfig = { clientId: string; clientSecret: string; stateSecret: string; redirectUri: string; hubUrl: string };

/** The Google secrets, or null until they've been set with `supabase secrets set`. */
export function googleConfig(): GoogleConfig | null {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    stateSecret: Deno.env.get("GOOGLE_OAUTH_STATE_SECRET") || clientSecret,
    redirectUri: `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-oauth-callback`,
    hubUrl: (Deno.env.get("HUB_URL") ?? "https://www.josephmaina.co.ke/hub").replace(/\/+$/, ""),
  };
}

export const serviceClient = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
};

/** Thrown when Google no longer accepts the stored refresh token (revoked, or expired in testing mode). */
export class GoogleDisconnected extends Error {}

async function tokenRequest(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const body = await res.json().catch(() => ({}));
  if (body?.error === "invalid_grant") throw new GoogleDisconnected("invalid_grant");
  if (!res.ok || !body?.access_token) throw new Error(`Google token request failed (${res.status})`);
  return body as TokenResponse;
}

export const exchangeCode = (cfg: GoogleConfig, code: string) =>
  tokenRequest({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: cfg.redirectUri,
    grant_type: "authorization_code",
  });

export type Connection = {
  user_id: string;
  google_email: string | null;
  refresh_token: string;
  calendar_id: string;
  access_token: string | null;
  access_token_expires_at: string | null;
};

/** A working access token for this connection, refreshed (and cached) when it's within a minute of expiring. */
export async function accessToken(admin: SupabaseClient, cfg: GoogleConfig, conn: Connection) {
  const expires = conn.access_token_expires_at ? Date.parse(conn.access_token_expires_at) : 0;
  if (conn.access_token && expires - Date.now() > 60_000) return conn.access_token;

  try {
    const t = await tokenRequest({
      refresh_token: conn.refresh_token,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      grant_type: "refresh_token",
    });
    await admin
      .from("google_calendar_connections")
      .update({
        access_token: t.access_token,
        access_token_expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(),
        ...(t.refresh_token ? { refresh_token: t.refresh_token } : {}),
      })
      .eq("user_id", conn.user_id);
    return t.access_token;
  } catch (error) {
    // A dead refresh token can't come back: forget it so the hub offers "Connect" again.
    if (error instanceof GoogleDisconnected) {
      await admin.from("google_calendar_connections").delete().eq("user_id", conn.user_id);
    }
    throw error;
  }
}

export async function revoke(token: string) {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: "POST" }).catch(() => null);
}
