import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { hubKeys, unwrap } from "./queries";
import type { BusinessProfile, HubSettings, InvoiceDefaults } from "./types";

// Hub settings: one row holding the business profile (printed on invoices),
// invoice defaults and the monthly revenue goal. Until the phase 3 migration
// is applied, the hub runs on these defaults instead of failing.

export const DEFAULT_BUSINESS: BusinessProfile = {
  name: "Joseph Maina",
  tagline: "Digital Marketing",
  location: "Nairobi, Kenya",
  website: "josephmaina.co.ke",
};

export const DEFAULT_INVOICE: Required<Pick<InvoiceDefaults, "due_days">> & InvoiceDefaults = { due_days: 14 };

const settingsKey = ["hub", "settings"] as const;

export type ResolvedSettings = {
  business: BusinessProfile;
  invoice: InvoiceDefaults & { due_days: number };
  revenueGoal: number | null;
  /** False until the settings table exists (migration not applied yet). */
  available: boolean;
};

export function useSettings() {
  const query = useQuery({
    queryKey: settingsKey,
    queryFn: async () => {
      const { data, error } = await db.from("hub_settings").select("*").eq("id", true).maybeSingle();
      if (error) return null; // table not there yet: use defaults
      return data as HubSettings | null;
    },
    staleTime: 5 * 60_000,
  });
  const row = query.data;
  const settings: ResolvedSettings = {
    business: { ...DEFAULT_BUSINESS, ...(row?.business ?? {}) },
    invoice: { ...DEFAULT_INVOICE, ...(row?.invoice_defaults ?? {}) },
    revenueGoal: row?.revenue_goal != null ? Number(row.revenue_goal) : null,
    available: !!row,
  };
  return { ...query, settings };
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Pick<HubSettings, "business" | "invoice_defaults" | "revenue_goal">>) =>
      unwrap(
        await db
          .from("hub_settings")
          .upsert({ id: true, ...patch })
          .select()
          .single(),
      ) as HubSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKey }),
  });
}

/** Moves everything from `drop` onto `keep` and deletes `drop` (see hub_merge_clients). */
export function useMergeClients() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ keep, drop }: { keep: string; drop: string }) =>
      unwrap(await db.rpc("hub_merge_clients", { p_keep: keep, p_drop: drop })),
    onSuccess: () => qc.invalidateQueries({ queryKey: hubKeys.all }),
  });
}

/** The payment lines printed on invoices, e.g. "M-Pesa Till 123456". Empty if none are set. */
export function paymentLines(b: BusinessProfile) {
  const lines: string[] = [];
  if (b.mpesa_till) lines.push(`M-Pesa Buy Goods Till: ${b.mpesa_till}`);
  if (b.mpesa_paybill)
    lines.push(`M-Pesa Paybill: ${b.mpesa_paybill}${b.mpesa_account ? ` · Account: ${b.mpesa_account}` : ""}`);
  if (b.bank_name || b.bank_account_number)
    lines.push(
      ["Bank", b.bank_name, b.bank_account_name, b.bank_account_number && `A/C ${b.bank_account_number}`, b.bank_branch]
        .filter(Boolean)
        .join(" · "),
    );
  return lines;
}
