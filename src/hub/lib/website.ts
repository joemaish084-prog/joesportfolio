import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AnalyticsData, LeadRow } from "@/components/admin/types";
import { unwrap } from "./queries";
import type { Lead } from "./types";

// Website analytics, the same numbers as the admin dashboard, read through
// hub_site_analytics() so only the signed-in hub admin can see them.

const raw = supabase as unknown as SupabaseClient;

export const RANGE_DAYS = [7, 14, 30, 90] as const;
export type RangeDays = (typeof RANGE_DAYS)[number];

export type SiteAnalytics = { status: "ok"; data: AnalyticsData } | { status: "missing" };

export function useSiteAnalytics(days: RangeDays) {
  return useQuery({
    queryKey: ["hub", "site", days],
    queryFn: async (): Promise<SiteAnalytics> => {
      const { data, error } = await raw.rpc("hub_site_analytics", { p_days: days });
      // Not set up yet (migration not applied): say so instead of failing.
      if (error?.code === "PGRST202" || error?.code === "42883") return { status: "missing" };
      if (error) throw new Error(error.message);
      if (!data) return { status: "missing" };
      return { status: "ok", data: data as AnalyticsData };
    },
    staleTime: 2 * 60_000,
    retry: 1,
  });
}

/** Percent change, or null when there's nothing to compare against. */
export function pctChange(now: number, before: number) {
  if (!before) return now ? null : 0;
  return Math.round(((now - before) / before) * 100);
}

const sameEmail = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** The pipeline lead that already came from this website enquiry, if any. */
export function matchingLead(row: LeadRow, leads: Lead[]) {
  return leads.find(
    (l) =>
      sameEmail(l.email, row.email) ||
      (!!row.phone && !!l.phone && l.phone.replace(/\D/g, "").slice(-9) === row.phone.replace(/\D/g, "").slice(-9)),
  );
}

/** Turns a website enquiry into a new lead at the top of "New". */
export function useAddToPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: LeadRow) => {
      const notes = [
        row.detail,
        row.budget_range && `Budget: ${row.budget_range}`,
        row.start_timeframe && `Start: ${row.start_timeframe}`,
        row.page_path && `From page: ${row.page_path}`,
        `Website ${row.kind} enquiry, ${new Date(row.created_at).toLocaleDateString("en-KE")}`,
      ]
        .filter(Boolean)
        .join("\n");
      return unwrap(
        await raw
          .from("leads")
          .insert({
            name: row.business_name || row.name || row.email || "Website enquiry",
            contact_person: row.business_name ? row.name : null,
            email: row.email,
            phone: row.phone,
            industry: row.industry,
            source: "website",
            stage: "new",
            position: -1,
            notes,
          })
          .select()
          .single(),
      ) as Lead;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hub", "leads"] }),
  });
}

export function formatMs(ms: number) {
  if (!ms) return "0s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

export function pageName(path: string) {
  const clean = path.split("?")[0];
  if (clean === "/" || clean === "") return "Home";
  return clean.replace(/\/$/, "");
}
