import emailjs from "@emailjs/browser";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export const NEED_OPTIONS = [
  "SEO",
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "Content & social media",
  "Not sure",
] as const;

export const BUDGET_OPTIONS = ["Under 30k", "30k–50k", "50k–100k", "100k+"] as const;

export const START_OPTIONS = ["This month", "1–2 months", "Just exploring"] as const;

export type ChatLeadStatus = "hot" | "warm" | "cold";

export interface ChatLeadFields {
  name?: string;
  business_name?: string;
  what_they_sell?: string;
  need?: string;
  budget_range?: string;
  start_timeframe?: string;
  email?: string;
  whatsapp?: string;
}

const QUALIFIED_BUDGETS = new Set<string>(["30k–50k", "50k–100k", "100k+"]);
const QUALIFIED_STARTS = new Set<string>(["This month", "1–2 months"]);

export function isQualified(budgetRange?: string, startTimeframe?: string): boolean {
  if (!budgetRange || !startTimeframe) return false;
  return QUALIFIED_BUDGETS.has(budgetRange) && QUALIFIED_STARTS.has(startTimeframe);
}

export function computeStatus(fields: ChatLeadFields): ChatLeadStatus {
  if (isQualified(fields.budget_range, fields.start_timeframe)) return "hot";
  if (fields.email || fields.whatsapp || fields.need) return "warm";
  return "cold";
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

export function buildWhatsAppUrl(name: string, need?: string): string {
  const text = need
    ? `Hi Joseph! I'm ${name}. I'm interested in ${need} and chatted with your site assistant.`
    : `Hi Joseph! I'm ${name}, I chatted with your site assistant.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export async function createChatLead(fields: ChatLeadFields): Promise<string | null> {
  const status = computeStatus(fields);
  const insert: TablesInsert<"chat_leads"> = {
    ...fields,
    qualified: isQualified(fields.budget_range, fields.start_timeframe),
    status,
    step: "name",
    source: typeof window !== "undefined" ? window.location.pathname : null,
  };
  const { data, error } = await supabase.from("chat_leads").insert(insert).select("id").single();
  if (error) {
    console.error("createChatLead error:", error);
    return null;
  }
  return data?.id ?? null;
}

export async function updateChatLead(
  id: string,
  fields: ChatLeadFields,
  step: string
): Promise<void> {
  const status = computeStatus(fields);
  const update: TablesUpdate<"chat_leads"> = {
    ...fields,
    qualified: isQualified(fields.budget_range, fields.start_timeframe),
    status,
    step,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("chat_leads").update(update).eq("id", id);
  if (error) console.error("updateChatLead error:", error);
}

const EMAILJS_SERVICE_ID = "service_ae81bbn";
const EMAILJS_TEMPLATE_ID = "template_rnofd4m";
const EMAILJS_PUBLIC_KEY = "2H5maWozuCEEd6vtl";

export async function notifyLeadByEmail(fields: ChatLeadFields, status: ChatLeadStatus) {
  const summary = [
    `Name: ${fields.name ?? "—"}`,
    `Business: ${fields.business_name ?? "—"}`,
    `Sells: ${fields.what_they_sell ?? "—"}`,
    `Need: ${fields.need ?? "—"}`,
    `Budget: ${fields.budget_range ?? "—"}`,
    `Start: ${fields.start_timeframe ?? "—"}`,
    `Email: ${fields.email ?? "—"}`,
    `WhatsApp: ${fields.whatsapp ?? "—"}`,
    `Qualified: ${isQualified(fields.budget_range, fields.start_timeframe) ? "Yes" : "No"}`,
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
      },
      EMAILJS_PUBLIC_KEY
    );
  } catch (err) {
    console.error("Chat lead EmailJS error:", err);
  }
}
