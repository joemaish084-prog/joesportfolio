import emailjs from "@emailjs/browser";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export const INDUSTRY_OPTIONS = [
  "Beauty & skincare",
  "Health & wellness",
  "Real estate",
  "Retail & e-commerce",
  "Food & hospitality",
  "Other",
] as const;

export const NEED_OPTIONS = [
  "SEO",
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "Content & social media",
  "Not sure",
] as const;

export const BUDGET_OPTIONS = ["Under 30k", "30k–50k", "50k–100k", "100k+"] as const;

export const START_OPTIONS = ["This month", "In 1–2 months", "Just exploring"] as const;

export type ChatLeadStatus = "hot" | "warm" | "cold";

export interface ChatLeadFields {
  name?: string;
  business_name?: string;
  what_they_sell?: string;
  industry?: string;
  need?: string;
  budget_range?: string;
  start_timeframe?: string;
  email?: string;
  whatsapp?: string;
  website_or_social?: string;
}

// HOT = budget 30k+ AND starting within 2 months (service choice, including "Not sure", never disqualifies)
// WARM = budget 30k+ AND "Just exploring"
// COLD = budget under 30k (or not yet given)
export function computeStatus(fields: ChatLeadFields): ChatLeadStatus {
  const budget = fields.budget_range;
  if (!budget || budget === "Under 30k") return "cold";

  const start = fields.start_timeframe;
  if (start === "This month" || start === "In 1–2 months") return "hot";
  if (start === "Just exploring") return "warm";
  // Budget already qualifies as 30k+ but start hasn't been answered yet — provisional.
  return "warm";
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

// Accepts 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, +2541XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX
export function normalizeKenyanPhone(input: string): string | null {
  const digits = input.trim().replace(/[\s-]/g, "");
  const match = digits.match(/^(?:\+?254|0)(7\d{8}|1\d{8})$/);
  if (!match) return null;
  return `254${match[1]}`;
}

export const CALENDLY_URL = "https://calendly.com/joemaish084/30min";
export const WHATSAPP_NUMBER = "254704700160";

export function buildCalendlyUrl(name: string, email: string): string {
  const params = new URLSearchParams({ name, email });
  return `${CALENDLY_URL}?${params.toString()}`;
}

export function buildWhatsAppUrl(name?: string, business?: string, need?: string): string {
  let text: string;
  if (!name) {
    text = "Hi Joseph! I have a question — I was chatting with your site assistant.";
  } else {
    const parts = [`Hi Joseph! I'm ${name}`];
    if (business) parts.push(`from ${business}`);
    if (need) parts.push(`— I need help with ${need}`);
    text = `${parts.join(" ")}. I chatted with your site assistant.`;
  }
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export async function createChatLead(fields: ChatLeadFields): Promise<string | null> {
  const status = computeStatus(fields);
  const insert: TablesInsert<"chat_leads"> = {
    ...fields,
    status,
    step: "name",
    source: "chat_widget",
    page_path: typeof window !== "undefined" ? window.location.pathname : null,
  };
  const { data, error } = await supabase.from("chat_leads").insert(insert).select("id").single();
  if (error) {
    console.error("createChatLead error:", error);
    return null;
  }
  return data?.id ?? null;
}

export async function updateChatLead(id: string, fields: ChatLeadFields, step: string): Promise<void> {
  const status = computeStatus(fields);
  const update: TablesUpdate<"chat_leads"> = {
    ...fields,
    status,
    step,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("chat_leads").update(update).eq("id", id);
  if (error) console.error("updateChatLead error:", error);
}

export async function markChatLeadBooked(id: string): Promise<void> {
  const { error } = await supabase
    .from("chat_leads")
    .update({ booked: true, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("markChatLeadBooked error:", error);
}

const EMAILJS_SERVICE_ID = "service_ae81bbn";
const EMAILJS_TEMPLATE_ID = "template_rnofd4m";
const EMAILJS_PUBLIC_KEY = "2H5maWozuCEEd6vtl";

const STATUS_EMOJI: Record<ChatLeadStatus, string> = {
  hot: "🔥",
  warm: "☀️",
  cold: "❄️",
};

export async function notifyLeadByEmail(fields: ChatLeadFields, status: ChatLeadStatus) {
  const summary = [
    `Name: ${fields.name ?? "—"}`,
    `Business: ${fields.business_name ?? "—"}`,
    `Industry: ${fields.industry ?? "—"}`,
    `Sells: ${fields.what_they_sell ?? "—"}`,
    `Need: ${fields.need ?? "—"}`,
    `Budget: ${fields.budget_range ?? "—"}`,
    `Start: ${fields.start_timeframe ?? "—"}`,
    `Email: ${fields.email ?? "—"}`,
    `WhatsApp: ${fields.whatsapp ?? "—"}`,
    `Website/Instagram: ${fields.website_or_social ?? "—"}`,
    `Status: ${status.toUpperCase()}`,
  ].join("\n");

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        from_name: fields.name || "Website visitor",
        from_email: fields.email || "no-email-given@josephmaina.co.ke",
        message: `New chat lead [${status.toUpperCase()}]\n\n${summary}`,
        to_name: "Joseph Maina",
        lead_status: status,
        status_emoji: STATUS_EMOJI[status],
        business_name: fields.business_name || "—",
        need: fields.need || "—",
        budget_range: fields.budget_range || "—",
      },
      EMAILJS_PUBLIC_KEY
    );
  } catch (err) {
    console.error("Chat lead EmailJS error:", err);
  }
}
