import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AiError, generateStructured } from "../_shared/crm/ai.ts";
import { DRAFT_TOOL, PROMPT_VERSION, buildDraftPrompt, checkDraft, type DraftKind, type DraftLead } from "../_shared/crm/draftRules.ts";
import { corsHeaders, isUuid, json, rateLimited, requireAccess, userClient } from "../_shared/crm/http.ts";

// Agency Command Centre: writes one outreach draft for a lead with AI.
// The caller must be able to edit the lead (RLS decides). The draft is saved
// as status 'draft' and is never sent from here; approving and sending are
// separate, explicit steps in the hub.

const KINDS: Record<DraftKind, "email" | "whatsapp" | "instagram" | "notes"> = {
  initial_email: "email",
  whatsapp_intro: "whatsapp",
  instagram_dm: "instagram",
  follow_up_1: "email",
  follow_up_2: "email",
  discovery_prep: "notes",
};

const FINDING_LABELS: Record<string, string> = {
  business_fit: "Business fit",
  ad_opportunity: "Advertising opportunity",
  activity_signals: "Activity signals",
  affordability: "Affordability",
  contact_quality: "Contact information",
  decision_maker: "Decision-maker",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = userClient(req);
    const access = await requireAccess(supabase, ["owner", "manager"]);
    if (access instanceof Response) return access;

    const body = await req.json().catch(() => null);
    const kind = body?.kind as DraftKind;
    if (!isUuid(body?.lead_id) || !(kind in KINDS)) return json({ error: "Bad request" }, 400);
    if (body.contact_id != null && !isUuid(body.contact_id)) return json({ error: "Bad request" }, 400);
    if (body.campaign_id != null && !isUuid(body.campaign_id)) return json({ error: "Bad request" }, 400);
    const instructions = typeof body.instructions === "string" ? body.instructions.slice(0, 800) : "";

    const { data: canWrite } = await supabase.rpc("crm_can_write_lead", { _lead: body.lead_id });
    if (canWrite !== true) return json({ error: "Not allowed" }, 403);

    if (await rateLimited(supabase, "draft", 40, 3600)) {
      return json({ error: "That's a lot of drafts this hour. Try again shortly." }, 429);
    }

    const { data: lead, error: leadError } = await supabase.from("crm_leads").select("*").eq("id", body.lead_id).single();
    if (leadError || !lead) return json({ error: "Lead not found" }, 404);
    if (lead.do_not_contact && kind !== "discovery_prep") return json({ error: "This lead is marked do not contact" }, 409);

    const [{ data: org }, { data: industry }, { data: contact }] = await Promise.all([
      supabase.from("crm_organisations").select("*").eq("id", lead.org_id).single(),
      lead.industry_id
        ? supabase.from("crm_industries").select("name").eq("id", lead.industry_id).maybeSingle()
        : Promise.resolve({ data: null }),
      body.contact_id
        ? supabase.from("crm_lead_contacts").select("*").eq("id", body.contact_id).eq("lead_id", lead.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    if (!org) return json({ error: "Not allowed" }, 403);
    if (!org.sender_name?.trim()) return json({ error: "Add your sender name in CRM settings first" }, 409);
    if (contact?.opted_out) return json({ error: "That contact has opted out" }, 409);

    const findings = Object.entries((lead.fit_inputs ?? {}) as Record<string, { note?: string; verified?: boolean }>)
      .filter(([k, v]) => FINDING_LABELS[k] && typeof v?.note === "string" && v.note.trim())
      .map(([k, v]) => ({ label: FINDING_LABELS[k], note: String(v.note).slice(0, 500), verified: !!v.verified }));

    const draftLead: DraftLead = {
      name: lead.name,
      area: lead.area,
      business_type: lead.business_type,
      industry: industry?.name ?? null,
      website: lead.website,
      instagram: lead.instagram,
      facebook: lead.facebook,
      tiktok: lead.tiktok,
      socials_verified: lead.socials_verified,
      google_rating: lead.google_rating,
      google_reviews: lead.google_reviews,
      research_notes: lead.research_notes,
      notes: lead.notes,
      findings,
      contact: contact
        ? { name: contact.name, role_title: contact.role_title, verified: contact.verification === "verified" }
        : null,
    };
    const sender = {
      name: org.sender_name,
      business: org.sender_business,
      email: org.sender_email,
      phone: org.sender_phone,
      signature: org.sender_signature,
    };
    const prompt = buildDraftPrompt(kind, draftLead, sender, instructions);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error("LOVABLE_API_KEY is not configured");
      return json({ error: "Drafting service not configured" }, 503);
    }
    const model = Deno.env.get("CRM_AI_MODEL") || "google/gemini-3-flash-preview";

    let out: Record<string, unknown>;
    try {
      out = await generateStructured({ provider: "lovable", apiKey, model }, { ...prompt, tool: DRAFT_TOOL });
    } catch (e) {
      if (e instanceof AiError) return json({ error: e.message }, e.status);
      throw e;
    }

    const text = typeof out.body === "string" ? out.body.trim().slice(0, 20000) : "";
    if (!text) return json({ error: "The draft came back empty. Try again." }, 422);
    const channel = KINDS[kind];
    const subject = channel === "email" && typeof out.subject === "string" ? out.subject.trim().slice(0, 200) : null;
    const strings = (v: unknown) =>
      Array.isArray(v) ? v.filter((s) => typeof s === "string").slice(0, 20).map((s: string) => s.slice(0, 300)) : [];

    const warnings = checkDraft(kind, { subject, body: text }, { leadName: lead.name, senderName: org.sender_name });

    // A regenerated draft replaces the open one of the same kind.
    await supabase
      .from("crm_outreach_drafts")
      .update({ status: "superseded" })
      .eq("lead_id", lead.id)
      .eq("kind", kind)
      .eq("status", "draft");

    const { data: draft, error: insertError } = await supabase
      .from("crm_outreach_drafts")
      .insert({
        lead_id: lead.id,
        contact_id: contact?.id ?? null,
        campaign_id: body.campaign_id ?? null,
        kind,
        channel,
        subject,
        body: text,
        assumptions: strings(out.assumptions),
        facts_used: strings(out.facts_used),
        warnings,
        model,
        prompt_version: PROMPT_VERSION,
      })
      .select()
      .single();
    if (insertError) {
      console.error("crm-draft insert failed:", insertError.code);
      return json({ error: "Couldn't save the draft" }, 500);
    }

    await supabase.from("crm_activities").insert({
      lead_id: lead.id,
      type: "note",
      summary: `AI draft written: ${kind.replace(/_/g, " ")}`,
      data: { draft_id: draft.id },
      actor_id: (await supabase.auth.getUser()).data.user?.id,
    });

    return json({ draft });
  } catch (e) {
    console.error("crm-draft error:", e instanceof Error ? e.message : "unknown");
    return json({ error: "Unexpected error" }, 500);
  }
});
