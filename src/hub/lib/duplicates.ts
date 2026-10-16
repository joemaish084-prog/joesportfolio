import type { Client } from "./types";

// How the hub decides two clients are probably the same business.

/** "Select Gadgets Ltd." and "select gadgets" are the same business. */
export const nameKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(ltd|limited|co|company|inc|llc|plc|enterprises?|kenya|ke)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Last 9 digits, so 0712…, +254712… and 254712… match. */
export const phoneKey = (s: string | null | undefined) => (s ? s.replace(/\D/g, "").slice(-9) : "");

export const emailKey = (s: string | null | undefined) => (s ? s.trim().toLowerCase() : "");

/** Live clients that look like the one being entered (same name, phone or email). */
export function findSimilarClients(
  clients: Client[],
  entry: { name: string; phone?: string; email?: string },
  excludeId?: string,
) {
  const n = nameKey(entry.name);
  const p = phoneKey(entry.phone);
  const e = emailKey(entry.email);
  return clients.filter((c) => {
    if (c.id === excludeId || c.archived_at) return false;
    if (n.length > 2 && (nameKey(c.name) === n || (c.business_name && nameKey(c.business_name) === n))) return true;
    if (p.length >= 9 && phoneKey(c.phone) === p) return true;
    return !!e && emailKey(c.email) === e;
  });
}
