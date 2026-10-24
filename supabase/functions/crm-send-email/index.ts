import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getEmailProvider } from "../_shared/crm/emailProvider.ts";
import { corsHeaders, isUuid, json, requireAccess, userClient } from "../_shared/crm/http.ts";
import { sendBlockers } from "../_shared/crm/sendGuards.ts";

// Agency Command Centre: sends one approved email draft through the connected
// provider. Off by default. Today it only reports why a draft can't be sent:
// sending is disabled and no provider is built, so every request stops at the
// guards. The database refuses provider sends on its own as well
// (crm_message_guard), whatever this function does.

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = userClient(req);
    const access = await requireAccess(supabase, ["owner", "manager"]);
    if (access instanceof Response) return access;

    const body = await req.json().catch(() => null);
    if (!isUuid(body?.draft_id)) return json({ error: "Bad request" }, 400);

    const { data: draft } = await supabase.from("crm_outreach_drafts").select("*").eq("id", body.draft_id).maybeSingle();
    if (!draft) return json({ error: "Draft not found" }, 404);
    const { data: canWrite } = await supabase.rpc("crm_can_write_lead", { _lead: draft.lead_id });
    if (canWrite !== true) return json({ error: "Not allowed" }, 403);

    const [{ data: lead }, { data: org }] = await Promise.all([
      supabase.from("crm_leads").select("*").eq("id", draft.lead_id).single(),
      supabase.from("crm_organisations").select("*").eq("id", access.org_id).single(),
    ]);
    if (!lead || !org) return json({ error: "Not allowed" }, 403);

    const to = typeof body.to === "string" ? body.to.trim().slice(0, 254) : lead.email;
    const { data: suppressed } = await supabase.rpc("crm_is_suppressed", {
      _org: org.id,
      _kind: "email",
      _key: (to ?? "").toLowerCase(),
    });
    const campaignPaused = draft.campaign_id
      ? (await supabase.from("crm_campaigns").select("status").eq("id", draft.campaign_id).maybeSingle()).data?.status ===
        "paused"
      : false;
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count: sentToday } = await supabase
      .from("crm_outreach_messages")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .in("status", ["queued", "sent", "delivered"])
      .gte("created_at", since);

    const blockers = sendBlockers({
      org,
      draft,
      lead,
      to,
      suppressed: suppressed === true,
      sentToday: sentToday ?? 0,
      campaignPaused,
      now: new Date(),
    });
    if (blockers.length) return json({ sent: false, blockers }, 409);

    const provider = getEmailProvider(org.email_provider);
    if (!provider) return json({ sent: false, blockers: ["The selected email provider isn't available yet"] }, 501);

    // Reached only once a provider is implemented: record the message with the
    // service role (status 'queued'), call provider.send(), then store the
    // provider message id. Left unbuilt on purpose until a provider is chosen.
    return json({ sent: false, blockers: ["Provider sending isn't built yet"] }, 501);
  } catch (e) {
    console.error("crm-send-email error:", e instanceof Error ? e.message : "unknown");
    return json({ error: "Unexpected error" }, 500);
  }
});
