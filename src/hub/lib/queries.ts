import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { isOverdue } from "./format";
import type { Client, ClientKpi, ClientType, KpiUnit, OnboardingItem } from "./types";

export const hubKeys = {
  all: ["hub"] as const,
  clientTypes: ["hub", "client-types"] as const,
  clients: ["hub", "clients"] as const,
  kpis: (clientId: string) => ["hub", "kpis", clientId] as const,
  onboarding: ["hub", "onboarding-items"] as const,
};

export function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

// ---------------------------------------------------------------- reads

export function useClientTypes() {
  return useQuery({
    queryKey: hubKeys.clientTypes,
    queryFn: async () =>
      unwrap(await db.from("client_types").select("*").is("archived_at", null).order("sort_order")) as ClientType[],
    staleTime: 5 * 60_000,
  });
}

/** Every client, archived included; callers filter. A solo agency's book fits in one query. */
export function useClients() {
  return useQuery({
    queryKey: hubKeys.clients,
    queryFn: async () =>
      unwrap(await db.from("clients").select("*").order("created_at", { ascending: false })) as Client[],
  });
}

export function useClient(id: string | undefined) {
  const query = useClients();
  return { ...query, data: query.data?.find((c) => c.id === id) };
}

export function useClientKpis(clientId: string | undefined) {
  return useQuery({
    queryKey: hubKeys.kpis(clientId ?? ""),
    enabled: !!clientId,
    queryFn: async () =>
      unwrap(await db.from("client_kpis").select("*").eq("client_id", clientId!).order("sort_order")) as ClientKpi[],
  });
}

export function useOnboardingItems() {
  return useQuery({
    queryKey: hubKeys.onboarding,
    queryFn: async () =>
      unwrap(await db.from("onboarding_items").select("*").order("sort_order").order("created_at")) as OnboardingItem[],
  });
}

export type OnboardingProgress = {
  done: number;
  total: number;
  overdue: number;
  next: OnboardingItem | null;
};

const EMPTY_PROGRESS: OnboardingProgress = { done: 0, total: 0, overdue: 0, next: null };

export function summariseOnboarding(items: OnboardingItem[]): OnboardingProgress {
  let done = 0;
  let overdue = 0;
  let next: OnboardingItem | null = null;
  for (const item of items) {
    if (item.is_done) done += 1;
    else if (!next) next = item;
    if (isOverdue(item.due_date, item.is_done)) overdue += 1;
  }
  return { done, total: items.length, overdue, next };
}

/** Items grouped by client, plus per-client progress. */
export function useOnboardingByClient() {
  const query = useOnboardingItems();
  const grouped = useMemo(() => {
    const items = new Map<string, OnboardingItem[]>();
    for (const item of query.data ?? []) {
      const list = items.get(item.client_id);
      if (list) list.push(item);
      else items.set(item.client_id, [item]);
    }
    const progress = new Map<string, OnboardingProgress>();
    items.forEach((list, clientId) => progress.set(clientId, summariseOnboarding(list)));
    return {
      itemsFor: (clientId: string) => items.get(clientId) ?? [],
      progressFor: (clientId: string) => progress.get(clientId) ?? EMPTY_PROGRESS,
    };
  }, [query.data]);
  return { ...query, ...grouped };
}

// ---------------------------------------------------------------- client writes

export type ClientDraft = Omit<
  Client,
  "id" | "created_at" | "updated_at" | "archived_at" | "currency" | "engagement_type" | "end_date" | "project_fee"
> &
  // Left out = retainer with no end date (the database defaults).
  Partial<Pick<Client, "engagement_type" | "end_date" | "project_fee">>;
export type KpiDraft = { id?: string; name: string; unit: KpiUnit };

export function useSaveClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      client,
      kpis,
      typeChanged,
    }: {
      id?: string;
      client: ClientDraft;
      kpis: KpiDraft[];
      typeChanged?: boolean;
    }) => {
      // New clients get their checklist from a database trigger.
      const saved = id
        ? unwrap(await db.from("clients").update(client).eq("id", id).select().single())
        : unwrap(await db.from("clients").insert(client).select().single());
      await syncKpis((saved as Client).id, kpis);
      // A new type can bring its own extra onboarding steps.
      if (id && typeChanged) unwrap(await db.rpc("hub_apply_onboarding_template", { p_client_id: id }));
      return saved as Client;
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: hubKeys.clients });
      qc.invalidateQueries({ queryKey: hubKeys.kpis(saved.id) });
      qc.invalidateQueries({ queryKey: hubKeys.onboarding });
    },
  });
}

// Updates in place instead of delete-and-reinsert so KPI ids stay stable for
// the report metrics that will reference them.
async function syncKpis(clientId: string, kpis: KpiDraft[]) {
  const existing = unwrap(await db.from("client_kpis").select("id").eq("client_id", clientId)) as Pick<
    ClientKpi,
    "id"
  >[];
  const keep = new Set(kpis.filter((k) => k.id).map((k) => k.id));
  const removed = existing.filter((k) => !keep.has(k.id)).map((k) => k.id);
  if (removed.length) unwrap(await db.from("client_kpis").delete().in("id", removed));

  for (const [index, kpi] of kpis.entries()) {
    const row = { name: kpi.name.trim(), unit: kpi.unit, sort_order: (index + 1) * 10 };
    if (kpi.id) unwrap(await db.from("client_kpis").update(row).eq("id", kpi.id));
    else unwrap(await db.from("client_kpis").insert({ ...row, client_id: clientId }));
  }
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Pick<Client, "status" | "archived_at">> }) =>
      unwrap(await db.from("clients").update(patch).eq("id", id).select().single()) as Client,
    onSuccess: () => qc.invalidateQueries({ queryKey: hubKeys.clients }),
  });
}

// ---------------------------------------------------------------- onboarding writes

export type OnboardingItemPatch = Partial<
  Pick<OnboardingItem, "title" | "is_done" | "due_date" | "note" | "sort_order">
>;

export function useOnboardingMutations() {
  const qc = useQueryClient();

  // Ticks and edits apply instantly; a failed write rolls back on refetch.
  const patchCache = (id: string, patch: OnboardingItemPatch) =>
    qc.setQueryData<OnboardingItem[]>(hubKeys.onboarding, (items) =>
      items?.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  const settle = () => qc.invalidateQueries({ queryKey: hubKeys.onboarding });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: OnboardingItemPatch }) =>
      unwrap(await db.from("onboarding_items").update(patch).eq("id", id)),
    onMutate: ({ id, patch }) => patchCache(id, patch),
    onSettled: settle,
  });

  const add = useMutation({
    mutationFn: async ({ clientId, title, sortOrder }: { clientId: string; title: string; sortOrder: number }) =>
      unwrap(
        await db.from("onboarding_items").insert({ client_id: clientId, title: title.trim(), sort_order: sortOrder }),
      ),
    onSettled: settle,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await db.from("onboarding_items").delete().eq("id", id)),
    onMutate: (id) =>
      qc.setQueryData<OnboardingItem[]>(hubKeys.onboarding, (items) => items?.filter((i) => i.id !== id)),
    onSettled: settle,
  });

  const applyTemplate = useMutation({
    mutationFn: async (clientId: string) =>
      unwrap(await db.rpc("hub_apply_onboarding_template", { p_client_id: clientId })) as number,
    onSettled: settle,
  });

  return { update, add, remove, applyTemplate };
}
