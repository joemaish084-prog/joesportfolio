import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

// Shared plumbing for the CRM edge functions. Every function works with the
// caller's own JWT, so the database's RLS decides what they can touch; none of
// them needs the service-role key.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/** A Supabase client acting as the caller. */
export function userClient(req: Request) {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type CrmAccess = { org_id: string; role: "owner" | "manager" | "viewer"; mfa_ok: boolean };

/** The caller's CRM membership, or a ready-made error response. */
export async function requireAccess(
  supabase: ReturnType<typeof userClient>,
  roles: CrmAccess["role"][],
): Promise<CrmAccess | Response> {
  const { data, error } = await supabase.rpc("crm_my_access");
  if (error || !data) return json({ error: "Not allowed" }, 403);
  const access = data as CrmAccess;
  if (!access.mfa_ok) return json({ error: "Verify your second factor first" }, 403);
  if (!roles.includes(access.role)) return json({ error: "Not allowed" }, 403);
  return access;
}

export async function rateLimited(supabase: ReturnType<typeof userClient>, bucket: string, max: number, windowSeconds: number) {
  const { data, error } = await supabase.rpc("crm_take_rate_token", {
    _bucket: bucket,
    _max: max,
    _window_seconds: windowSeconds,
  });
  return error || data !== true;
}

export const isUuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
