import { useState } from "react";
import { Flag, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pill, Section } from "../../../components/ui";
import {
  useAddToCampaign,
  useCampaigns,
  useCrm,
  useLeadCampaigns,
  useLeadShares,
  useMembers,
  useRemoveLeadCampaign,
  useShareLead,
} from "../../lib/queries";
import { CAMPAIGN_STATUS_LABEL, ROLE_LABEL, type CrmLead } from "../../lib/types";
import { SelectField } from "../bits";

/** Which campaigns the lead is in, and (owners) who else may see it. */
export function AccessPanel({ lead }: { lead: CrmLead }) {
  const { canEdit, isOwner } = useCrm();
  const campaigns = useCampaigns();
  const links = useLeadCampaigns();
  const add = useAddToCampaign();
  const remove = useRemoveLeadCampaign();
  const members = useMembers();
  const shares = useLeadShares(lead.id, isOwner);
  const share = useShareLead();
  const [pick, setPick] = useState("");

  const mine = (links.data ?? []).filter((l) => l.lead_id === lead.id);
  const available = (campaigns.data ?? []).filter((c) => !mine.some((m) => m.campaign_id === c.id));
  const shared = new Set((shares.data ?? []).map((s) => s.user_id));

  return (
    <div className="space-y-6">
      <Section title="Campaigns">
        {mine.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Not in a campaign.</p>
        ) : (
          <ul>
            {mine.map((link) => {
              const c = campaigns.data?.find((x) => x.id === link.campaign_id);
              return (
                <li key={link.id} className="flex items-center gap-3 border-b border-border/60 px-5 py-3 last:border-b-0">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{c?.name ?? "Campaign"}</span>
                  {c && <Pill tone={c.status === "active" ? "accent" : "outline"}>{CAMPAIGN_STATUS_LABEL[c.status]}</Pill>}
                  {canEdit && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg"
                      aria-label={`Remove from ${c?.name ?? "campaign"}`}
                      onClick={() => remove.mutate(link.id, { onError: (e) => toast.error(e.message) })}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {canEdit && available.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-5 py-3">
            <SelectField
              label="Campaign to add"
              className="w-64"
              value={pick}
              onChange={setPick}
              options={[{ value: "", label: "Add to campaign…" }, ...available.map((c) => ({ value: c.id, label: c.name }))]}
            />
            <Button
              size="sm"
              className="rounded-full"
              disabled={!pick || add.isPending}
              onClick={() => add.mutate({ campaignId: pick, leadIds: [lead.id] }, { onSuccess: () => setPick(""), onError: (e) => toast.error(e.message) })}
            >
              Add
            </Button>
          </div>
        )}
      </Section>

      {isOwner && (
        <Section title="Shared with">
          <p className="px-5 pt-4 text-xs text-muted-foreground">
            Managers edit the leads assigned to them. Sharing gives read-only access to this lead; viewers only ever see shared leads.
          </p>
          <ul className="p-2">
            {(members.data ?? [])
              .filter((m) => m.role !== "owner" && m.user_id !== lead.owner_id)
              .map((m) => (
                <li key={m.user_id}>
                  <label className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary">
                    <Checkbox
                      checked={shared.has(m.user_id)}
                      disabled={share.isPending}
                      onCheckedChange={(v) =>
                        share.mutate({ leadId: lead.id, userId: m.user_id, share: v === true }, { onError: (e) => toast.error(e.message) })
                      }
                    />
                    <span className="min-w-0 flex-1 truncate">{m.email}</span>
                    <span className="text-xs text-muted-foreground">{ROLE_LABEL[m.role]}</span>
                  </label>
                </li>
              ))}
            {(members.data ?? []).filter((m) => m.role !== "owner").length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No other members yet. Add them in Settings.</li>
            )}
          </ul>
        </Section>
      )}
    </div>
  );
}
