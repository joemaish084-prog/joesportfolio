import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Flag, Pause, Pencil, Play, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlurFade } from "../../components/motion/blur-fade";
import { Field, FormDialog, inputClass } from "../../components/form";
import { EmptyState, PageHeader, Pill, SkeletonBlock } from "../../components/ui";
import { SelectField } from "../components/bits";
import { useCampaigns, useCrm, useIndustries, useLeadCampaigns, useLeads, useMessageFacts, useSaveCampaign } from "../lib/queries";
import { CAMPAIGN_STATUS_LABEL, type Campaign } from "../lib/types";

function CampaignDialog({ campaign, open, onOpenChange }: { campaign: Campaign | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { orgId } = useCrm();
  const industries = useIndustries();
  const save = useSaveCampaign();
  const [v, setV] = useState({ name: "", industry_id: "", starts_on: "", ends_on: "", description: "", status: "draft" as Campaign["status"] });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setError(null);
    setV({
      name: campaign?.name ?? "",
      industry_id: campaign?.industry_id ?? "",
      starts_on: campaign?.starts_on ?? "",
      ends_on: campaign?.ends_on ?? "",
      description: campaign?.description ?? "",
      status: campaign?.status ?? "draft",
    });
  }, [open, campaign]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={campaign ? "Edit campaign" : "New campaign"}
      pending={save.isPending}
      error={error}
      onSubmit={() => {
        if (!v.name.trim()) return setError("Name the campaign.");
        if (v.starts_on && v.ends_on && v.ends_on < v.starts_on) return setError("The end date is before the start.");
        save.mutate(
          {
            id: campaign?.id,
            values: {
              ...(campaign ? {} : { org_id: orgId }),
              name: v.name.trim(),
              industry_id: v.industry_id || null,
              starts_on: v.starts_on || null,
              ends_on: v.ends_on || null,
              description: v.description.trim() || null,
              status: v.status,
            },
          },
          { onSuccess: () => onOpenChange(false), onError: (e) => setError(e.message) },
        );
      }}
    >
      <Field label="Name" htmlFor="camp-name">
        <Input id="camp-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Industry">
          <SelectField
            label="Industry"
            value={v.industry_id}
            onChange={(x) => setV({ ...v, industry_id: x })}
            options={[{ value: "", label: "Any" }, ...(industries.data ?? []).map((i) => ({ value: i.id, label: i.name }))]}
          />
        </Field>
        <Field label="Status">
          <SelectField
            label="Status"
            value={v.status}
            onChange={(x) => setV({ ...v, status: x as Campaign["status"] })}
            options={(Object.keys(CAMPAIGN_STATUS_LABEL) as Campaign["status"][]).map((s) => ({ value: s, label: CAMPAIGN_STATUS_LABEL[s] }))}
          />
        </Field>
        <Field label="Starts" htmlFor="camp-start">
          <Input id="camp-start" type="date" value={v.starts_on} onChange={(e) => setV({ ...v, starts_on: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Ends" htmlFor="camp-end">
          <Input id="camp-end" type="date" value={v.ends_on} onChange={(e) => setV({ ...v, ends_on: e.target.value })} className={inputClass} />
        </Field>
      </div>
      <Field label="Goal and angle" htmlFor="camp-desc">
        <Textarea id="camp-desc" rows={3} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} className="rounded-xl bg-background" />
      </Field>
    </FormDialog>
  );
}

export default function CampaignsPage() {
  const { canEdit } = useCrm();
  const campaigns = useCampaigns();
  const industries = useIndustries();
  const links = useLeadCampaigns();
  const leads = useLeads();
  const messages = useMessageFacts();
  const save = useSaveCampaign();
  const [dialog, setDialog] = useState<{ open: boolean; campaign: Campaign | null }>({ open: false, campaign: null });

  const stats = useMemo(() => {
    const contacted = new Set((messages.data ?? []).filter((m) => m.direction === "outbound").map((m) => m.lead_id));
    const replied = new Set((messages.data ?? []).filter((m) => m.direction === "inbound").map((m) => m.lead_id));
    const visible = new Set((leads.data ?? []).map((l) => l.id));
    const out = new Map<string, { leads: number; contacted: number; replied: number }>();
    for (const link of links.data ?? []) {
      if (link.status === "removed" || !visible.has(link.lead_id)) continue;
      const s = out.get(link.campaign_id) ?? { leads: 0, contacted: 0, replied: 0 };
      s.leads += 1;
      if (contacted.has(link.lead_id)) s.contacted += 1;
      if (replied.has(link.lead_id)) s.replied += 1;
      out.set(link.campaign_id, s);
    }
    return out;
  }, [links.data, leads.data, messages.data]);

  const toggle = (c: Campaign) =>
    save.mutate(
      { id: c.id, values: { status: c.status === "paused" ? "active" : "paused" } },
      {
        onSuccess: () => toast.success(c.status === "paused" ? `${c.name} resumed` : `${c.name} paused. Its pending follow-ups are on hold.`),
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Campaigns"
          subtitle="Group leads by push. Pausing a campaign holds its follow-ups."
          actions={
            canEdit && (
              <Button className="rounded-full px-4" onClick={() => setDialog({ open: true, campaign: null })}>
                <Plus className="mr-1 h-4 w-4" /> New campaign
              </Button>
            )
          }
        />
      </BlurFade>

      {campaigns.isLoading ? (
        <SkeletonBlock className="h-64 rounded-[20px]" />
      ) : (campaigns.data ?? []).length === 0 ? (
        <div className="hub-card">
          <EmptyState icon={Flag} title="No campaigns yet" />
        </div>
      ) : (
        <BlurFade delay={0.05} className="grid gap-3 md:grid-cols-2">
          {(campaigns.data ?? []).map((c) => {
            const s = stats.get(c.id) ?? { leads: 0, contacted: 0, replied: 0 };
            return (
              <article key={c.id} className="hub-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-[1.0625rem] font-semibold">{c.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {industries.data?.find((i) => i.id === c.industry_id)?.name ?? "Any industry"}
                      {c.starts_on && ` · ${format(parseISO(c.starts_on), "d MMM")}`}
                      {c.ends_on && ` to ${format(parseISO(c.ends_on), "d MMM yyyy")}`}
                    </p>
                  </div>
                  <Pill tone={c.status === "active" ? "accent" : c.status === "paused" ? "warning" : "outline"}>{CAMPAIGN_STATUS_LABEL[c.status]}</Pill>
                </div>
                {c.description && <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>}
                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  {[
                    ["Leads", s.leads],
                    ["Contacted", s.contacted],
                    ["Replied", s.replied],
                  ].map(([label, n]) => (
                    <div key={label}>
                      <dt className="hub-label">{label}</dt>
                      <dd className="hub-tabular text-xl font-bold">{n}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link to={`/hub/crm/leads?campaign=${c.id}`}>Leads</Link>
                  </Button>
                  {canEdit && (c.status === "active" || c.status === "paused") && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => toggle(c)} disabled={save.isPending}>
                      {c.status === "paused" ? <Play className="mr-1.5 h-3.5 w-3.5" /> : <Pause className="mr-1.5 h-3.5 w-3.5" />}
                      {c.status === "paused" ? "Resume" : "Pause"}
                    </Button>
                  )}
                  {canEdit && (
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setDialog({ open: true, campaign: c })}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </BlurFade>
      )}

      <CampaignDialog campaign={dialog.campaign} open={dialog.open} onOpenChange={(o) => setDialog((s) => ({ ...s, open: o }))} />
    </>
  );
}
