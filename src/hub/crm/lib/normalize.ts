// Duplicate-detection keys. These mirror crm_name_key, crm_domain_key,
// crm_email_key and crm_phone_key in the CRM migration character for
// character (tests/db/crm.test.ts compares them), so what the import preview
// calls a duplicate is what the database stores.

/** btrim() trims spaces only, not tabs or newlines. */
const btrim = (s: string) => s.replace(/^ +| +$/g, "");

/** "Select Motors Ltd." and "select motors" are the same business. */
export function nameKey(s: string | null | undefined): string | null {
  const key = (s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(ltd|limited|co|company|inc|llc|plc|enterprises?|kenya|ke)\b/g, " ")
    .replace(/\s+/g, " ");
  return btrim(key) || null;
}

const NOT_OWN_DOMAIN =
  /(^|\.)(facebook\.com|fb\.com|fb\.me|instagram\.com|tiktok\.com|twitter\.com|x\.com|linkedin\.com|youtube\.com|youtu\.be|wa\.me|whatsapp\.com|linktr\.ee|google\.com|goo\.gl|g\.page|business\.site|wixsite\.com|blogspot\.com|jiji\.co\.ke|cheki\.co\.ke)$/;

/** Bare host of a business's own website; social and link-in-bio hosts don't count. */
export function domainKey(s: string | null | undefined): string | null {
  const host = btrim((s ?? "").toLowerCase())
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
    .split("/")[0]
    .split("?")[0]
    .split("#")[0]
    .split(":")[0]
    .replace(/^www\./, "");
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)) return null;
  if (NOT_OWN_DOMAIN.test(host)) return null;
  return host;
}

/** First address in the cell, lower-cased, if it looks like an email. */
export function emailKey(s: string | null | undefined): string | null {
  const e = btrim((s ?? "").split(",")[0].split(";")[0]).toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : null;
}

/** Last 9 digits of the first number in the cell, so 0712…, +254712… and 254712… match. */
export function phoneKey(s: string | null | undefined): string | null {
  const d = (s ?? "").split("/")[0].split(",")[0].split(";")[0].replace(/\D/g, "");
  return d.length >= 9 ? d.slice(-9) : null;
}

/**
 * Kenyan mobile number in wa.me form (2547XXXXXXXX / 2541XXXXXXXX), or null.
 * Landlines (020…) and anything else can't take a WhatsApp chat link.
 */
export function whatsappNumber(s: string | null | undefined): string | null {
  const key = phoneKey(s);
  return key && /^[17]\d{8}$/.test(key) ? `254${key}` : null;
}

/** Splits "a@x.com; b@y.com" or "0722… / 0733…" into separate values. */
export function splitMulti(s: string | null | undefined): string[] {
  return (s ?? "")
    .split(/[,;/\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}
