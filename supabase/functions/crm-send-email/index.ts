import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";
import { ProviderError, getEmailProvider, withOptOut } from "../_shared/crm/emailProvider.ts";
import { corsHeaders, isUuid, json, rateLimited, requireAccess, userClient } from "../_shared/crm/http.ts";
import { sendBlockers } from "../_shared/crm/sendGuards.ts";

// Agency Command Centre: sends one approved email draft through Brevo.
//
// Off by default: the owner must pick Brevo, set a From address and switch
// sending on in CRM Settings. Every check runs here (sendBlockers) and again in
// the database (crm_message_guard) when the sent message is recorded.
//
// Only the approved subject and body are sent, never text from the request.
// The caller chooses only the recipient address. Each draft is sent at most once.

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

    if (await rateLimited(supabase, "send-email", 40, 3600)) {
      return json({ sent: false, blockers: ["That's a lot of emails this hour. Try again shortly."] }, 429);
    }

    const [{ data: lead }, { data: org }, { data: user }] = await Promise.all([
      supabase.from("crm_leads").select("*").eq("id", draft.lead_id).single(),
      supabase.from("crm_organisations").select("*").eq("id", access.org_id).single(),
      supabase.auth.getUser(),
    ]);
    if (!lead || !org || !user.user) return json({ error: "Not allowed" }, 403);

    const to = (typeof body.to === "string" ? body.to : (lead.email ?? "")).trim().toLowerCase().slice(0, 254);

    // Counts and history across the whole organisation, whatever the caller can see.
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: already } = await admin.from("crm_outreach_messages").select("id").eq("idempotency_key", `draft:${draft.id}`).maybeSingle();
    if (already) return json({ sent: false, blockers: ["This draft has already been sent"] }, 409);

    const domain = to.split("@")[1] ?? "";
    const [{ data: emailSuppressed }, { data: domainSuppressed }] = await Promise.all([
      admin.rpc("crm_is_suppressed", { _org: org.id, _kind: "email", _key: to }),
      admin.rpc("crm_is_suppressed", { _org: org.id, _kind: "domain", _key: domain }),
    ]);
    const campaignPaused = draft.campaign_id
      ? (await admin.from("crm_campaigns").select("status").eq("id", draft.campaign_id).maybeSingle()).data?.status === "paused"
      : false;
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count: sentToday } = await admin
      .from("crm_outreach_messages")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .in("status", ["queued", "sent", "delivered", "bounced"])
      .gte("created_at", since);

    const provider = getEmailProvider(org.email_provider, { BREVO_API_KEY: Deno.env.get("BREVO_API_KEY") });
    const blockers = sendBlockers({
      org,
      draft,
      lead,
      to,
      suppressed: emailSuppressed === true || domainSuppressed === true,
      sentToday: sentToday ?? 0,
      campaignPaused,
      now: new Date(),
    });
    if (!org.from_email) blockers.push("Set the From address in CRM settings");
    if (org.email_provider !== "none" && !provider) blockers.push("The Brevo API key isn't set on the server");
    if (provider && (sentToday ?? 0) >= provider.maxPerDay) blockers.push(`Brevo's daily limit of ${provider.maxPerDay} is reached`);
    if (!draft.subject?.trim()) blockers.push("The draft has no subject");
    if (blockers.length || !provider) return json({ sent: false, blockers }, 409);

    const text = withOptOut(draft.body, org.sender_email);
    let providerMessageId: string;
    try {
      ({ providerMessageId } = await provider.send({
        to,
        from: { email: org.from_email, name: org.sender_name ?? undefined },
        replyTo: org.sender_email ?? undefined,
        subject: draft.subject.trim(),
        text,
        idempotencyKey: `draft:${draft.id}`,
        headers: {
          "List-Unsubscribe": `<mailto:${org.sender_email ?? org.from_email}?subject=unsubscribe>`,
        },
        tags: ["crm-outreach"],
      }));
    } catch (e) {
      if (e instanceof ProviderError) return json({ sent: false, blockers: [e.message] }, e.status);
      throw e;
    }

    // Record it. The database runs its own guard again and schedules follow-ups.
    const { error: insertError } = await admin.from("crm_outreach_messages").insert({
      lead_id: lead.id,
      draft_id: draft.id,
      campaign_id: draft.campaign_id,
      contact_id: draft.contact_id,
      channel: "email",
      direction: "outbound",
      status: "sent",
      to_address: to,
      from_address: org.from_email,
      subject: draft.subject.trim(),
      body: text,
      provider: provider.name,
      provider_message_id: providerMessageId,
      idempotency_key: `draft:${draft.id}`,
      created_by: user.user.id,
    });
    if (insertError) {
      // The email has gone; say so rather than inviting a second send.
      console.error("crm-send-email: sent but not recorded:", insertError.code);
      return json({ sent: true, warning: "Sent, but it couldn't be recorded in the CRM. Log it by hand." });
    }
    return json({ sent: true, provider_message_id: providerMessageId });
  } catch (e) {
    console.error("crm-send-email error:", e instanceof Error ? e.message : "unknown");
    return json({ error: "Unexpected error" }, 500);
  }
});
