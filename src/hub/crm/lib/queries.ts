import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FunctionsFetchError, FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useHubAuth } from "../../auth/HubAuthProvider";
import { unwrap } from "../../lib/queries";
import type {
  Activity,
  AuditLog,
  Campaign,
  CrmLead,
  CrmMember,
  CrmOrganisation,
  DashboardMetrics,
  Deal,
  DraftKind,
  FollowUpTask,
  ImportJob,
  Industry,
  LeadCampaign,
  LeadContact,
  OutreachDraft,
  OutreachMessage,
  Suppression,
} from "./types";

// Data hooks for the CRM. Every read and write goes through the signed-in
// user's session, so RLS in the database decides what comes back; the role
// checks in the UI only hide buttons that would fail anyway.
//
// Everything is cached under ["hub", "crm", …]: sign-out already clears
// ["hub"], and a write simply refreshes the whole CRM cache. A campaign of a
// few hundred leads is small enough for that.

const raw = supabase as unknown as SupabaseClient;

export const crmKey = (...parts: unknown[]) => ["hub", "crm", ...parts] as const;

export function useCrm() {
  const { crm } = useHubAuth();
  const role = crm?.role ?? null;
  return {
    access: crm,
    orgId: crm?.org_id ?? "",
    role,
    isOwner: role === "owner",
    canEdit: role === "owner" || role === "manager",
  };
}

function useInvalidateCrm() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: crmKey() });
}

/** The message from an edge function's JSON error body, when there is one. */
export async function functionError(error: unknown, fn?: string) {
  if (error instanceof FunctionsHttpError) {
    const status = (error.context as Response).status;
    try {
      const body = await (error.context as Response).json();
      if (body?.code === "NOT_FOUND" || (status === 404 && !body?.error)) {
        return `The ${fn ?? "server"} function isn't deployed to Supabase yet.`;
      }
      if (body?.error) return String(body.error);
      if (Array.isArray(body?.blockers)) return body.blockers.join(" · ");
      if (body?.message) return String(body.message);
    } catch {
      // not JSON
    }
    if (status === 404) return `The ${fn ?? "server"} function isn't deployed to Supabase yet.`;
    return `The server answered with an error (${status}).`;
  }
  if (error instanceof FunctionsFetchError) {
    return `Couldn't reach the ${fn ?? "server"} function. Check it's deployed and you're online.`;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

// ---------------------------------------------------------------- reads

export function useOrg() {
  const { orgId } = useCrm();
  return useQuery({
    queryKey: crmKey("org", orgId),
    enabled: !!orgId,
    queryFn: async () =>
      unwrap(await raw.from("crm_organisations").select("*").eq("id", orgId).single()) as CrmOrganisation,
  });
}

const listQuery = <T,>(key: string, query: () => PromiseLike<{ data: unknown; error: { message: string } | null }>) => ({
  queryKey: crmKey(key),
  queryFn: async () => unwrap((await query()) as { data: T[] | null; error: { message: string } | null }) as T[],
});

export function useIndustries() {
  return useQuery({ ...listQuery<Industry>("industries", () => raw.from("crm_industries").select("*").order("name")), staleTime: 5 * 60_000 });
}

export function useCampaigns() {
  return useQuery(listQuery<Campaign>("campaigns", () => raw.from("crm_campaigns").select("*").order("created_at", { ascending: false })));
}

export function useLeads() {
  return useQuery(listQuery<CrmLead>("leads", () => raw.from("crm_leads").select("*").order("name").limit(5000)));
}

export function useLead(id: string | undefined) {
  const q = useLeads();
  return { ...q, data: q.data?.find((l) => l.id === id) };
}

export type LeadSource = { id: string; kind: string; name: string; filename: string | null; methodology: string[]; imported_at: string | null };

export function useSources() {
  return useQuery({
    ...listQuery<LeadSource>("sources", () => raw.from("crm_lead_sources").select("*").order("created_at", { ascending: false })),
    staleTime: 5 * 60_000,
  });
}

export function useLeadCampaigns() {
  return useQuery(listQuery<LeadCampaign>("lead-campaigns", () => raw.from("crm_lead_campaigns").select("*").limit(20000)));
}

export function useMembers() {
  const { orgId } = useCrm();
  return useQuery({
    queryKey: crmKey("members", orgId),
    enabled: !!orgId,
    staleTime: 5 * 60_000,
    queryFn: async () => unwrap(await raw.rpc("crm_members", { _org: orgId })) as CrmMember[],
  });
}

const forLead = <T,>(table: string, key: string, leadId: string | undefined, order = "created_at") =>
  ({
    queryKey: crmKey(key, leadId),
    enabled: !!leadId,
    queryFn: async () =>
      unwrap(await raw.from(table).select("*").eq("lead_id", leadId!).order(order, { ascending: false })) as T[],
  }) as const;

export const useLeadContacts = (leadId?: string) => useQuery(forLead<LeadContact>("crm_lead_contacts", "contacts", leadId));
export const useLeadDrafts = (leadId?: string) => useQuery(forLead<OutreachDraft>("crm_outreach_drafts", "lead-drafts", leadId));
export const useLeadMessages = (leadId?: string) =>
  useQuery(forLead<OutreachMessage>("crm_outreach_messages", "lead-messages", leadId));
export const useLeadActivities = (leadId?: string) =>
  useQuery(forLead<Activity>("crm_activities", "activities", leadId, "occurred_at"));
export const useLeadDeals = (leadId?: string) => useQuery(forLead<Deal>("crm_deals", "lead-deals", leadId));
export const useLeadFollowUps = (leadId?: string) =>
  useQuery(forLead<FollowUpTask>("crm_follow_up_tasks", "lead-follow-ups", leadId, "due_on"));

/** Open drafts across all visible leads, for the outreach queue. */
export function useDrafts() {
  return useQuery(
    listQuery<OutreachDraft>("drafts", () =>
      raw
        .from("crm_outreach_drafts")
        .select("*")
        .in("status", ["draft", "approved", "used"])
        .order("created_at", { ascending: false })
        .limit(500),
    ),
  );
}

export function useFollowUps() {
  return useQuery(
    listQuery<FollowUpTask>("follow-ups", () =>
      raw.from("crm_follow_up_tasks").select("*").in("status", ["pending", "paused"]).order("due_on").limit(2000),
    ),
  );
}

export function useDeals() {
  return useQuery(listQuery<Deal>("deals", () => raw.from("crm_deals").select("*").order("created_at", { ascending: false })));
}

/** Slim message list for analytics breakdowns. */
export function useMessageFacts() {
  return useQuery(
    listQuery<Pick<OutreachMessage, "lead_id" | "direction" | "status" | "sent_at" | "created_at">>("message-facts", () =>
      raw.from("crm_outreach_messages").select("lead_id, direction, status, sent_at, created_at").limit(20000),
    ),
  );
}

export function useSuppression(enabled = true) {
  return useQuery({
    ...listQuery<Suppression>("suppression", () =>
      raw.from("crm_suppression_list").select("*").order("created_at", { ascending: false }),
    ),
    enabled,
  });
}

export function useAuditLog(enabled: boolean) {
  return useQuery({
    ...listQuery<AuditLog>("audit", () => raw.from("crm_audit_logs").select("*").order("created_at", { ascending: false }).limit(200)),
    enabled,
  });
}

export function useImportJobs(enabled: boolean) {
  return useQuery({
    ...listQuery<ImportJob>("imports", () => raw.from("crm_import_jobs").select("*").order("created_at", { ascending: false })),
    enabled,
  });
}

export type MetricFilters = { from: string; to: string; industry: string | null; campaign: string | null; owner: string | null };

export function useMetrics(f: MetricFilters) {
  const { orgId } = useCrm();
  return useQuery({
    queryKey: crmKey("metrics", orgId, f),
    enabled: !!orgId,
    queryFn: async () =>
      unwrap(
        await raw.rpc("crm_dashboard_metrics", {
          _org: orgId,
          _from: f.from,
          _to: f.to,
          _industry: f.industry,
          _campaign: f.campaign,
          _owner: f.owner,
        }),
      ) as DashboardMetrics,
  });
}

// ---------------------------------------------------------------- writes

/** Insert when there's no id, update when there is. */
function useSave<T>(table: string) {
  const invalidate = useInvalidateCrm();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) =>
      (id
        ? unwrap(await raw.from(table).update(values).eq("id", id).select().single())
        : unwrap(await raw.from(table).insert(values).select().single())) as T,
    onSuccess: invalidate,
  });
}

function useDelete(table: string) {
  const invalidate = useInvalidateCrm();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await raw.from(table).delete().eq("id", id)),
    onSuccess: invalidate,
  });
}

export const useSaveLead = () => useSave<CrmLead>("crm_leads");
export const useDeleteLead = () => useDelete("crm_leads");
export const useSaveContact = () => useSave<LeadContact>("crm_lead_contacts");
export const useDeleteContact = () => useDelete("crm_lead_contacts");
export const useSaveDraft = () => useSave<OutreachDraft>("crm_outreach_drafts");
export const useSaveDeal = () => useSave<Deal>("crm_deals");
export const useDeleteDeal = () => useDelete("crm_deals");
export const useSaveFollowUp = () => useSave<FollowUpTask>("crm_follow_up_tasks");
export const useSaveCampaign = () => useSave<Campaign>("crm_campaigns");
export const useSaveOrg = () => useSave<CrmOrganisation>("crm_organisations");
export const useSaveIndustry = () => useSave<Industry>("crm_industries");
export const useRemoveSuppression = () => useDelete("crm_suppression_list");
export const useRemoveLeadCampaign = () => useDelete("crm_lead_campaigns");

export function useBulkUpdateLeads() {
  const invalidate = useInvalidateCrm();
  return useMutation({
    mutationFn: async (changes: { id: string; values: Partial<CrmLead> }[]) => {
      // One request per lead keeps RLS errors attributable; batches are small.
      const failed: string[] = [];
      for (const c of changes) {
        const { data, error } = await raw.from("crm_leads").update(c.values).eq("id", c.id).select("id");
        if (error || !data?.length) failed.push(c.id);
      }
      return { updated: changes.length - failed.length, failed };
    },
    onSuccess: invalidate,
  });
}

export function useAddToCampaign() {
  const invalidate = useInvalidateCrm();
  const { orgId } = useCrm();
  return useMutation({
    mutationFn: async ({ campaignId, leadIds }: { campaignId: string; leadIds: string[] }) =>
      unwrap(
        await raw
          .from("crm_lead_campaigns")
          .upsert(
            leadIds.map((lead_id) => ({ lead_id, campaign_id: campaignId, org_id: orgId })),
            { onConflict: "lead_id,campaign_id", ignoreDuplicates: true },
          ),
      ),
    onSuccess: invalidate,
  });
}

export function useLogMessage() {
  const invalidate = useInvalidateCrm();
  return useMutation({
    mutationFn: async (values: {
      lead_id: string;
      channel: OutreachMessage["channel"];
      direction: "outbound" | "inbound";
      draft_id?: string | null;
      campaign_id?: string | null;
      to_address?: string | null;
      subject?: string | null;
      body?: string | null;
    }) =>
      unwrap(
        await raw
          .from("crm_outreach_messages")
          .insert({ ...values, status: values.direction === "inbound" ? "received" : "sent_manually" })
          .select()
          .single(),
      ) as OutreachMessage,
    onSuccess: invalidate,
  });
}

/** Records that a compose screen was opened. Not a delivery. */
export function useLogComposeOpened() {
  const invalidate = useInvalidateCrm();
  return useMutation({
    mutationFn: async (values: { lead_id: string; type: "whatsapp_opened" | "email_compose_opened" | "instagram_opened" }) =>
      unwrap(await raw.from("crm_outreach_events").insert(values)),
    onSuccess: invalidate,
  });
}

export function useAddNote() {
  const invalidate = useInvalidateCrm();
  const { session } = useHubAuth();
  return useMutation({
    mutationFn: async (values: { lead_id: string; type: "note" | "call" | "meeting"; summary: string }) =>
      unwrap(await raw.from("crm_activities").insert({ ...values, actor_id: session?.user.id })),
    onSuccess: invalidate,
  });
}

export function useAddSuppression() {
  const invalidate = useInvalidateCrm();
  const { orgId } = useCrm();
  return useMutation({
    mutationFn: async (values: { kind: Suppression["kind"]; value: string; reason: Suppression["reason"]; lead_id?: string | null; note?: string }) =>
      // value_key is filled in by the database from value.
      unwrap(await raw.from("crm_suppression_list").insert({ ...values, org_id: orgId, value_key: "" })),
    onSuccess: invalidate,
  });
}

export function useGenerateDraft() {
  const invalidate = useInvalidateCrm();
  return useMutation({
    mutationFn: async (body: { lead_id: string; kind: DraftKind; contact_id?: string | null; campaign_id?: string | null; instructions?: string }) => {
      const { data, error } = await supabase.functions.invoke("crm-draft", { body });
      if (error) throw new Error(await functionError(error, "crm-draft"));
      return (data as { draft: OutreachDraft }).draft;
    },
    onSuccess: invalidate,
  });
}

/** Sends one approved email draft through the connected provider (Brevo). */
export function useSendEmail() {
  const invalidate = useInvalidateCrm();
  return useMutation({
    mutationFn: async ({ draftId, to }: { draftId: string; to: string }) => {
      const { data, error } = await supabase.functions.invoke("crm-send-email", { body: { draft_id: draftId, to } });
      if (error) throw new Error(await functionError(error, "crm-send-email"));
      return data as { sent: boolean; warning?: string };
    },
    onSettled: invalidate,
  });
}

export type ParsedUpload = {
  filename: string;
  size: number;
  sha256: string;
  kind: "xlsx" | "csv";
  sheets: { name: string; headers: string[]; rows: (string | null)[][]; truncated: boolean }[];
};

export function useParseSheet() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const { data, error } = await supabase.functions.invoke("crm-parse-sheet", { body: form });
      if (error) throw new Error(await functionError(error, "crm-parse-sheet"));
      return data as ParsedUpload;
    },
  });
}

export function useCommitImport() {
  const invalidate = useInvalidateCrm();
  const { orgId } = useCrm();
  return useMutation({
    mutationFn: async (payload: unknown) =>
      unwrap(await raw.rpc("crm_commit_import", { _org: orgId, _payload: payload })) as {
        job_id: string;
        created: number;
        merged: number;
        skipped: number;
        errors: number;
      },
    onSuccess: invalidate,
  });
}

export function useLogExport() {
  const invalidate = useInvalidateCrm();
  const { orgId } = useCrm();
  return useMutation({
    mutationFn: async ({ rows, filters }: { rows: number; filters: Record<string, unknown> }) =>
      unwrap(await raw.rpc("crm_log_export", { _org: orgId, _rows: rows, _filters: filters })),
    onSuccess: invalidate,
  });
}

export function useAddMember() {
  const invalidate = useInvalidateCrm();
  const { orgId } = useCrm();
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) =>
      unwrap(await raw.rpc("crm_add_member", { _org: orgId, _email: email, _role: role })),
    onSuccess: invalidate,
  });
}

export function useUpdateMember() {
  const invalidate = useInvalidateCrm();
  const { orgId } = useCrm();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string | null }) =>
      role
        ? unwrap(await raw.from("crm_memberships").update({ role }).eq("org_id", orgId).eq("user_id", userId))
        : unwrap(await raw.from("crm_memberships").delete().eq("org_id", orgId).eq("user_id", userId)),
    onSuccess: invalidate,
  });
}

export function useShareLead() {
  const invalidate = useInvalidateCrm();
  return useMutation({
    mutationFn: async ({ leadId, userId, share }: { leadId: string; userId: string; share: boolean }) =>
      share
        ? unwrap(await raw.from("crm_lead_shares").insert({ lead_id: leadId, user_id: userId }))
        : unwrap(await raw.from("crm_lead_shares").delete().eq("lead_id", leadId).eq("user_id", userId)),
    onSuccess: invalidate,
  });
}

export function useLeadShares(leadId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: crmKey("shares", leadId),
    enabled: !!leadId && enabled,
    queryFn: async () =>
      unwrap(await raw.from("crm_lead_shares").select("user_id").eq("lead_id", leadId!)) as { user_id: string }[],
  });
}

export function usePurgeStale() {
  const invalidate = useInvalidateCrm();
  const { orgId } = useCrm();
  return useMutation({
    mutationFn: async () => unwrap(await raw.rpc("crm_purge_stale_leads", { _org: orgId })) as number,
    onSuccess: invalidate,
  });
}

export function useClearImportRaw() {
  const invalidate = useInvalidateCrm();
  return useMutation({
    mutationFn: async (jobId: string) => unwrap(await raw.rpc("crm_clear_import_raw", { _job: jobId })),
    onSuccess: invalidate,
  });
}
