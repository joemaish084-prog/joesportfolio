import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useHubAuth } from "../auth/HubAuthProvider";
import { db } from "./db";
import { unwrap } from "./queries";
import type { TimeEntry } from "./time";

export const timeKeys = ["hub", "time"] as const;

export function useTimeAccess() {
  const { session, status } = useHubAuth();
  return useQuery({
    queryKey: [...timeKeys, "access", session?.user.id],
    enabled: status === "admin",
    queryFn: async () => unwrap(await db.rpc("is_hub_time_owner")),
    refetchInterval: 60_000,
    retry: false,
  });
}

export function useTimeData(start: string, end: string) {
  const settings = useQuery({
    queryKey: [...timeKeys, "settings"],
    queryFn: async () => unwrap(await db.from("hub_time_settings").select("*").single()),
  });
  const preferences = useQuery({
    queryKey: [...timeKeys, "clients"],
    queryFn: async () => unwrap(await db.from("hub_time_clients").select("*")),
  });
  const entries = useQuery({
    queryKey: [...timeKeys, "entries", start, end],
    queryFn: async () => {
      const result: TimeEntry[] = [];
      for (let offset = 0; ; offset += 500) {
        const page = unwrap(await db.from("hub_time_entries").select("*")
          .gte("entry_date", start).lte("entry_date", end)
          .order("entry_date", { ascending: false }).order("id")
          .range(offset, offset + 499));
        result.push(...page);
        if (page.length < 500) return result;
      }
    },
  });
  const recent = useQuery({
    queryKey: [...timeKeys, "recent"],
    queryFn: async () => unwrap(await db.from("hub_time_entries").select("*")
      .order("entry_date", { ascending: false }).order("created_at", { ascending: false }).order("id").limit(25)),
  });
  return { settings, preferences, entries, recent };
}

export type TimeDraft = Pick<TimeEntry, "id" | "client_id" | "minutes" | "note" | "entry_date">;

export function useSaveTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: TimeDraft) => unwrap(await db.rpc("hub_time_save_entry", {
      p_id: entry.id, p_client_id: entry.client_id, p_minutes: entry.minutes,
      p_note: entry.note.trim(), p_entry_date: entry.entry_date,
    })),
    onSuccess: () => qc.invalidateQueries({ queryKey: timeKeys }),
  });
}

export function useTimeActions() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: timeKeys });
  const hours = useMutation({
    mutationFn: async (value: number) => unwrap(await db.from("hub_time_settings")
      .update({ weekly_agency_hours: value }).eq("id", true).select().single()),
    onSuccess: refresh,
  });
  const archive = useMutation({
    mutationFn: async ({ clientId, archived }: { clientId: string; archived: boolean }) => {
      // Updating only the flag respects the column grants; no upsert of the key.
      const existing = unwrap(await db.from("hub_time_clients").select("client_id").eq("client_id", clientId).maybeSingle());
      return existing
        ? unwrap(await db.from("hub_time_clients").update({ archived }).eq("client_id", clientId).select().single())
        : unwrap(await db.from("hub_time_clients").insert({ client_id: clientId, archived }).select().single());
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await db.from("hub_time_entries").delete().eq("id", id).select("id").single()),
    onSuccess: refresh,
  });
  return { hours, archive, remove };
}
