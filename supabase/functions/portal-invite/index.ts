import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Client portal: gives a client contact access. Admin only: the caller's own
// session must hold the hub admin role. It finds or creates the person's login
// (Supabase emails an invite to new people), then lists them under the client so
// portal_snapshot() recognises them. Sign-up stays closed for everyone else.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    // Only the hub admin may use this.
    const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: isAdmin, error: roleError } = await caller.rpc("is_hub_admin");
    if (roleError || isAdmin !== true) return json({ error: "Not allowed" }, 403);

    const body = await req.json().catch(() => null);
    const clientId = String(body?.client_id ?? "");
    const email = String(body?.email ?? "").trim().toLowerCase();
    const fullName = typeof body?.full_name === "string" && body.full_name.trim() ? body.full_name.trim().slice(0, 120) : null;
    if (!UUID.test(clientId) || !EMAIL.test(email) || email.length > 200) return json({ error: "Invalid request" }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: client } = await admin.from("clients").select("id").eq("id", clientId).maybeSingle();
    if (!client) return json({ error: "Client not found" }, 404);

    // An existing login is linked as is; a new person is invited by email.
    let userId: string | null = null;
    for (let page = 1; page <= 5 && !userId; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
      if (data.users.length < 200) break;
    }

    let status: "invited" | "linked" = "linked";
    if (!userId) {
      const redirectTo = `${Deno.env.get("PORTAL_URL") ?? "https://www.josephmaina.co.ke/portal"}`;
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (error || !data.user) return json({ error: "Couldn't send the invite" }, 502);
      userId = data.user.id;
      status = "invited";
    }

    const { data: existing } = await admin
      .from("client_users")
      .select("id")
      .eq("client_id", clientId)
      .ilike("email", email)
      .maybeSingle();
    const row = { client_id: clientId, user_id: userId, email, full_name: fullName, invited_at: new Date().toISOString() };
    const { error: saveError } = existing
      ? await admin.from("client_users").update({ user_id: userId, ...(fullName ? { full_name: fullName } : {}), invited_at: row.invited_at }).eq("id", existing.id)
      : await admin.from("client_users").insert(row);
    if (saveError) throw saveError;

    return json({ status });
  } catch (error) {
    console.error("portal-invite failed", error);
    return json({ error: "Something went wrong" }, 500);
  }
});
