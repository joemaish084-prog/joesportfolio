// Outreach draft rules, shared by the crm-draft edge function and the hub.
// Plain TypeScript with no imports so Deno and Vitest can both load it.

export type DraftKind =
  | "initial_email"
  | "whatsapp_intro"
  | "instagram_dm"
  | "follow_up_1"
  | "follow_up_2"
  | "discovery_prep";

export const PROMPT_VERSION = "crm-draft-v1";

export type DraftLead = {
  name: string;
  area?: string | null;
  business_type?: string | null;
  industry?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  socials_verified?: boolean;
  google_rating?: number | null;
  google_reviews?: number | null;
  research_notes?: string | null;
  notes?: string | null;
  /** Factor notes from the fit score, with whether each was verified. */
  findings?: { label: string; note: string; verified: boolean }[];
  contact?: { name: string | null; role_title: string | null; verified: boolean } | null;
};

export type Sender = {
  name: string;
  business?: string | null;
  email?: string | null;
  phone?: string | null;
  signature?: string | null;
};

/**
 * Splits what we know into facts the copy may state and notes it may only
 * lean on as labelled assumptions. Scraped presence data is never a fact:
 * a blank website or Instagram field means "not found", not "doesn't have one".
 */
export function splitFacts(lead: DraftLead) {
  const verified: string[] = [`Business name: ${lead.name}`];
  const unverified: string[] = [];
  if (lead.industry) verified.push(`Industry: ${lead.industry}`);
  if (lead.area) verified.push(`Area (from their public listing): ${lead.area}`);
  if (lead.business_type) verified.push(`Listed as: ${lead.business_type}`);
  if (lead.contact?.name) {
    (lead.contact.verified ? verified : unverified).push(
      `Contact: ${lead.contact.name}${lead.contact.role_title ? `, ${lead.contact.role_title}` : ""}`,
    );
  }
  for (const f of lead.findings ?? []) {
    if (f.note.trim()) (f.verified ? verified : unverified).push(`${f.label}: ${f.note.trim()}`);
  }
  if (lead.google_rating != null && lead.google_reviews != null) {
    unverified.push(
      `Google listing showed ${lead.google_rating} stars from ${lead.google_reviews} reviews when researched (may have changed)`,
    );
  }
  const found = [
    lead.website && "a website",
    lead.instagram && "an Instagram account",
    lead.facebook && "a Facebook page",
    lead.tiktok && "a TikTok account",
  ].filter(Boolean);
  if (found.length) {
    (lead.socials_verified ? verified : unverified).push(`Online presence found: ${found.join(", ")}`);
  }
  unverified.push(
    "Any channel not listed above is simply not found yet. Never say or imply the business lacks a website or social account.",
  );
  if (lead.research_notes?.trim()) unverified.push(`Research notes: ${lead.research_notes.trim().slice(0, 1500)}`);
  if (lead.notes?.trim()) unverified.push(`Notes: ${lead.notes.trim().slice(0, 1500)}`);
  return { verified, unverified };
}

const KIND_BRIEF: Record<DraftKind, string> = {
  initial_email:
    "A first cold email. 90 to 150 words. A plain subject line under 8 words. One relevant opportunity, one low-pressure question as the call to action (e.g. whether a 15-minute call next week is worth it).",
  whatsapp_intro:
    "A short WhatsApp introduction to the business line. Under 70 words, no subject, no links, no emojis beyond at most one. Say who you are first. End with a simple yes/no question.",
  instagram_dm:
    "An Instagram DM to the business account. Under 80 words, conversational, no links, no subject. Say who you are first.",
  follow_up_1:
    "A first follow-up email, 4 to 5 business days after the first one with no reply. 50 to 90 words. Refer back briefly, add one new useful point, same low-pressure question. Subject starts with 'Re: ' is not needed; give a short fresh subject.",
  follow_up_2:
    "A last, polite follow-up email. 40 to 70 words. Say this is the last note, leave the door open, make it easy to say no.",
  discovery_prep:
    "Discovery call preparation notes for Joseph, not a message to the prospect. Bullet points: what we know (verified), what we're assuming, 6 to 8 open questions about their enquiry volume, lead handling, sales follow-up and current marketing, and what a good outcome of the call looks like. No subject.",
};

const RULES = `Rules you must follow:
- Use only the verified facts as facts. You may lean on an unverified note only if you phrase it tentatively, and you must list every such note in "assumptions".
- Mention the business by its name.
- Explain one relevant opportunity around vehicle enquiries and the quality of the sales pipeline (or the equivalent for their industry): getting more serious buyers asking, and making sure enquiries are followed up.
- Never promise or guarantee results, never quote statistics or percentages, never invent stock, prices, numbers, audits, reviews of their ads, or anything you "noticed" that isn't in the facts.
- Never say or imply the business has no website, no Instagram or weak marketing.
- Concise, natural, polite English that reads well to a Kenyan business owner. No hype, no exclamation marks, no buzzwords, no "I hope this finds you well".
- A clear, low-pressure call to action.
- Identify the sender by name and business. Emails end with the sender's sign-off block exactly as given.
- Emails include one short line saying they can reply "no thanks" and won't be contacted again.`;

export function buildDraftPrompt(kind: DraftKind, lead: DraftLead, sender: Sender, extra?: string) {
  const { verified, unverified } = splitFacts(lead);
  const signoff = [
    sender.signature?.trim() ||
      [sender.name, sender.business, sender.phone, sender.email].filter(Boolean).join("\n"),
  ].join("");
  const system = `You write outreach for ${sender.name}${sender.business ? ` of ${sender.business}` : ""}, a digital marketing consultant in Nairobi, Kenya, who runs ads and lead generation for local businesses.
${RULES}
Return your answer only through the write_draft tool.`;
  const user = [
    `Task: ${KIND_BRIEF[kind]}`,
    "",
    "Verified facts:",
    ...verified.map((f) => `- ${f}`),
    "",
    "Unverified notes (assumptions only, never state as fact):",
    ...unverified.map((f) => `- ${f}`),
    "",
    `Sender sign-off block:\n${signoff}`,
    extra?.trim() ? `\nExtra instructions from ${sender.name} (follow them unless they break a rule above):\n${extra.trim().slice(0, 800)}` : "",
  ].join("\n");
  return { system, user };
}

export const DRAFT_TOOL = {
  type: "function",
  function: {
    name: "write_draft",
    description: "Return one outreach draft.",
    parameters: {
      type: "object",
      properties: {
        subject: { type: ["string", "null"], description: "Email subject, or null for WhatsApp, Instagram and notes." },
        body: { type: "string" },
        assumptions: {
          type: "array",
          items: { type: "string" },
          description: "Every unverified note or guess the draft relies on.",
        },
        facts_used: { type: "array", items: { type: "string" }, description: "The verified facts the draft uses." },
      },
      required: ["subject", "body", "assumptions", "facts_used"],
    },
  },
};

const LIMITS: Partial<Record<DraftKind, number>> = {
  initial_email: 1600,
  follow_up_1: 1100,
  follow_up_2: 900,
  whatsapp_intro: 600,
  instagram_dm: 700,
};

const CHECKS: [RegExp, string][] = [
  [/\bguarantee(d|s)?\b/i, "Promises a guaranteed result"],
  [/\brisk[- ]free\b/i, "Says risk-free"],
  [/\b(double|triple|10x|skyrocket|explode)\b/i, "Promises dramatic growth"],
  [/\d+(\.\d+)?\s?(%|percent\b)/i, "Quotes a percentage; check it isn't an invented statistic"],
  [/\b(i|we)( have| 've)? (audited|analy[sz]ed|reviewed|looked at) your (ads|account|campaigns|analytics|website traffic)\b/i, "Claims an audit that didn't happen"],
  [/\b(no|don't have an?|without an?|lack(s|ing)? an?) (website|instagram|online presence|social media)\b/i, "Says they lack a channel; that isn't verified"],
  [/\b(act now|limited time|last chance|only \d+ (spots|slots))\b/i, "High-pressure language"],
  [/!/, "Uses an exclamation mark"],
];

const OPT_OUT = /(no thanks|not interested|rather not|won'?t (contact|email|message) you again|unsubscribe|opt out)/i;

/** Problems to show beside a draft. The draft is still saved; you decide. */
export function checkDraft(
  kind: DraftKind,
  draft: { subject?: string | null; body: string },
  ctx: { leadName: string; senderName?: string | null },
): string[] {
  const warnings: string[] = [];
  const body = draft.body ?? "";
  const text = `${draft.subject ?? ""}\n${body}`;
  if (kind === "discovery_prep") {
    if (!body.trim()) warnings.push("Empty");
    return warnings;
  }
  const name = ctx.leadName.trim().toLowerCase();
  const firstWord = name.split(/\s+/)[0];
  if (name && !text.toLowerCase().includes(name) && !(firstWord.length > 3 && text.toLowerCase().includes(firstWord))) {
    warnings.push(`Doesn't mention ${ctx.leadName}`);
  }
  for (const [re, message] of CHECKS) if (re.test(text)) warnings.push(message);
  if (ctx.senderName && !body.toLowerCase().includes(ctx.senderName.split(/\s+/)[0].toLowerCase())) {
    warnings.push("Doesn't say who it's from");
  }
  const isEmail = kind === "initial_email" || kind === "follow_up_1" || kind === "follow_up_2";
  if (isEmail && !draft.subject?.trim()) warnings.push("No subject line");
  if (isEmail && !OPT_OUT.test(body)) warnings.push("No easy way to opt out");
  const limit = LIMITS[kind];
  if (limit && body.length > limit) warnings.push(`Long for this kind of message (${body.length} characters)`);
  return warnings;
}
