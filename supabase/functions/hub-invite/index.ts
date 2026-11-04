import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, "Content-Type": "application/json" },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: allowed, error: denied } = await caller.rpc("is_hub_admin");
    if (denied || allowed !== true) return json({ error: "Only admins can add team members" }, 403);

    // Check the migration before sending an email that could not grant access.
    const { error: setupError } = await caller.rpc("hub_team_list");
    if (setupError) return json({ error: "Team management is not set up yet" }, 503);
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body?.full_name === "string" ? body.full_name.trim() : "";
    const title = typeof body?.job_title === "string" ? body.job_title.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const role = body?.role;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200 ||
      !name || name.length > 120 || title.length > 120 || phone.length > 40 ||
      !["admin", "editor"].includes(role) || body?.active !== true) return json({ error: "Invalid member details" }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let found = false;
    let complete = false;
    for (let page = 1; page <= 100; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      found = data.users.some((u) => u.email?.toLowerCase() === email);
      if (found || data.users.length < 200) { complete = true; break; }
    }
    if (!complete) return json({ error: "Could not look up this account" }, 503);
    if (!found) {
      const redirectTo = Deno.env.get("HUB_INVITE_URL") ?? "https://www.josephmaina.co.ke/hub/reset-password";
      const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (error) return json({ error: "Could not send the invitation" }, 502);
    }
    // The caller's JWT grants membership; service-role credentials never decide
    // who may administer the hub. An invite by itself grants no database access.
    const { error } = await caller.rpc("hub_save_member", {
      _email: email, _full_name: name, _job_title: title, _phone: phone, _role: role, _active: true,
    });
    if (error) return json({ error: "Account exists, but access was not saved. Check the details and try again." }, 400);
    return json({ status: found ? "linked" : "invited" });
  } catch {
    return json({ error: "Could not add this team member" }, 500);
  }
});
