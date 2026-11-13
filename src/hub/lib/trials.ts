import { addDays, format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { tableKey, useRows, useSaveRow } from "./data";
import { useClientTypes, useSaveClient, useUpdateClient } from "./queries";
import type { Client, Lead, LeadStage } from "./types";

// Trials live on both sides of the hub: a "Trial" lead in the Pipeline is
// linked (converted_client_id) to a client whose engagement is "trial". These
// keep the two in step whichever side you act on.

/** Default trial length when a lead is moved to Trial: two weeks, inclusive. */
export const DEFAULT_TRIAL_DAYS = 14;

type ClientPatch = Partial<Pick<Client, "status" | "engagement_type" | "end_date">>;

/** What the linked trial client should become when its lead moves stage, if anything. */
export function clientPatchForLeadStage(
  client: Pick<Client, "engagement_type" | "status"> | undefined,
  to: LeadStage,
): ClientPatch | null {
  if (!client || client.engagement_type !== "trial" || client.status === "ended") return null;
  if (to === "won") return { engagement_type: "retainer", end_date: null, status: "active" };
  if (to === "lost") return { status: "ended" };
  return null;
}

/** The trial lead linked to a client, if one is still sitting in the Trial column. */
export function trialLeadFor(leads: Lead[] | undefined, clientId: string) {
  return (leads ?? []).find((l) => l.converted_client_id === clientId && l.stage === "trial" && !l.archived_at);
}

/** Trial clients that no pipeline lead points at (added straight on the Clients side). */
export function unlinkedTrialClients(clients: Client[], leads: Lead[]) {
  const linked = new Set(leads.filter((l) => !l.archived_at && l.converted_client_id).map((l) => l.converted_client_id));
  return clients.filter(
    (c) => c.engagement_type === "trial" && c.status !== "ended" && !c.archived_at && !linked.has(c.id),
  );
}

const bottomOf = (leads: Lead[] | undefined, stage: LeadStage) =>
  Math.max(0, ...(leads ?? []).filter((l) => l.stage === stage).map((l) => l.position)) + 1;

export function useTrialSync() {
  const qc = useQueryClient();
  const leads = useRows("leads", "position", true);
  const types = useClientTypes();
  const saveClient = useSaveClient();
  const saveLead = useSaveRow("leads");
  const updateClient = useUpdateClient();

  /** Creates the trial client for a lead and moves the lead to Trial. */
  const startTrial = async (lead: Lead, days = DEFAULT_TRIAL_DAYS) => {
    const type = types.data?.find((t) => t.id === lead.client_type_id);
    const today = new Date();
    const client = await saveClient.mutateAsync({
      client: {
        client_type_id: lead.client_type_id,
        name: lead.name,
        business_name: lead.name,
        contact_person: lead.contact_person,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        industry: lead.industry,
        status: "active",
        start_date: format(today, "yyyy-MM-dd"),
        end_date: format(addDays(today, days - 1), "yyyy-MM-dd"),
        engagement_type: "trial",
        monthly_fee: lead.estimated_value,
        services: lead.services,
        main_goal: null,
        notes: lead.notes,
        custom_fields: {},
      },
      kpis: (type?.default_kpis ?? []).map((k) => ({ ...k })),
    });
    await saveLead.mutateAsync({
      id: lead.id,
      values: {
        stage: "trial",
        converted_client_id: client.id,
        ...(lead.stage === "trial" ? {} : { position: bottomOf(leads.data, "trial") }),
      },
    });
    qc.invalidateQueries({ queryKey: tableKey("leads") });
    return client;
  };

  /** After a lead moves stage: converts or ends its trial client to match. Returns what changed. */
  const syncClient = async (lead: Lead, to: LeadStage, clients: Client[] | undefined) => {
    if (!lead.converted_client_id) return null;
    const patch = clientPatchForLeadStage(
      clients?.find((c) => c.id === lead.converted_client_id),
      to,
    );
    if (!patch) return null;
    await updateClient.mutateAsync({ id: lead.converted_client_id, patch });
    return patch;
  };

  /** After a trial outcome on the client side: moves the linked Trial lead to Won or Lost. */
  const syncLead = async (clientId: string, to: "won" | "lost") => {
    const lead = trialLeadFor(leads.data, clientId);
    if (!lead) return null;
    await saveLead.mutateAsync({ id: lead.id, values: { stage: to, position: bottomOf(leads.data, to) } });
    return lead;
  };

  return { startTrial, syncClient, syncLead, pending: saveClient.isPending || saveLead.isPending };
}
