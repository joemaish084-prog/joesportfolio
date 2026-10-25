import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "./queries";

export const FUND_CATEGORIES = ["Equipment", "Subscriptions", "Software & tools", "Marketing", "Other"] as const;
export const FUND_FREQUENCIES = { once: "One-time", monthly: "Monthly", yearly: "Yearly" } as const;
export type BusinessFund = {
  id: string;
  name: string;
  category: typeof FUND_CATEGORIES[number];
  target_amount: number;
  saved_amount: number;
  frequency: keyof typeof FUND_FREQUENCIES;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  notes: string | null;
  completed_at: string | null;
};
export type FundValues = Omit<BusinessFund, "id" | "completed_at" | "saved_amount">;
const raw = supabase as unknown as SupabaseClient;
const KEY = ["hub", "business_funds"] as const;

export function parseFundAmount(value: string): number | null {
  const clean = value.replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const amount = Number(clean);
  return Number.isFinite(amount) && amount < 1e12 ? amount : null;
}

export function useBusinessFunds() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await raw.from("business_funds").select("*").order("created_at", { ascending: false });
      if (error?.code === "PGRST205" || error?.code === "42P01") return { missing: true, funds: [] as BusinessFund[] };
      if (error) throw new Error(error.message);
      return { missing: false, funds: data as BusinessFund[] };
    },
  });
}

type FundAction =
  | { kind: "save"; id?: string; values: FundValues; opening: number }
  | { kind: "add"; id: string; amount: number }
  | { kind: "pay"; id: string }
  | { kind: "delete"; id: string };

export function useFundAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (action: FundAction) => {
      switch (action.kind) {
        case "save":
          return unwrap(await (action.id
            ? raw.from("business_funds").update(action.values).eq("id", action.id)
            : raw.from("business_funds").insert({ ...action.values, saved_amount: action.opening })
          ).select().single());
        case "add": return unwrap(await raw.rpc("hub_add_fund_savings", { p_id: action.id, p_amount: action.amount }));
        case "pay": return unwrap(await raw.rpc("hub_pay_fund", { p_id: action.id }));
        case "delete": return unwrap(await raw.from("business_funds").delete().eq("id", action.id).select().single());
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
