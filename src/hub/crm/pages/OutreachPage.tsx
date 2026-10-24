import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { AlertTriangle, CheckCheck, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlurFade } from "../../components/motion/blur-fade";
import { EmptyState, PageHeader, Pill, Section, SkeletonBlock } from "../../components/ui";
import { useCrm, useDrafts, useLeads, useOrg, useSaveDraft } from "../lib/queries";
import { DRAFT_KIND_LABEL } from "../lib/types";

type Tab = "review" | "approved" | "sent";

export default function OutreachPage() {
  const { canEdit } = useCrm();
  const org = useOrg();
  const drafts = useDrafts();
  const leads = useLeads();
  const save = useSaveDraft();
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get("tab") === "approved" ? "approved" : params.get("tab") === "sent" ? "sent" : "review";
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const leadById = useMemo(() => new Map((leads.data ?? []).map((l) => [l.id, l])), [leads.data]);
  const list = (drafts.data ?? []).filter((d) =>
    tab === "review" ? d.status === "draft" : tab === "approved" ? d.status === "approved" : d.status === "used",
  );
  const batch = org.data?.sending_mode === "batch_approval";
  // Batch approval is limited to drafts without warnings, so problems always get a look.
  const batchable = list.filter((d) => d.warnings.length === 0 && d.channel !== "notes" && !leadById.get(d.lead_id)?.do_not_contact);

  const approveBatch = async () => {
    const ids = batchable.filter((d) => picked.has(d.id)).map((d) => d.id);
    if (!ids.length || !window.confirm(`Approve ${ids.length} drafts? You'll still send each one yourself.`)) return;
    let ok = 0;
    for (const id of ids) {
      try {
        await save.mutateAsync({ id, values: { status: "approved" } });
        ok += 1;
      } catch {
        // counted below
      }
    }
    setPicked(new Set());
    if (ok === ids.length) toast.success(`${ok} approved`);
    else toast.error(`${ok} of ${ids.length} approved`);
  };

  return (
    <>
      <BlurFade>
        <PageHeader title="Outreach" subtitle="Every draft waits for your approval, and you send each one yourself." />
      </BlurFade>

      <div className="hub-card mb-6 flex items-start gap-3 p-4 text-sm">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="font-medium">Sending from the CRM is off.</p>
          <p className="text-muted-foreground">
            Approved emails open in Gmail and WhatsApp messages open in WhatsApp, with the text filled in. You press Send there, then log it here.
            Mode: {org.data?.sending_mode === "batch_approval" ? "manual approval, batches allowed" : "manual approval, one at a time"}.
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setParams(v === "review" ? {} : { tab: v })}>
        <TabsList className="mb-4 rounded-2xl bg-secondary p-1">
          <TabsTrigger value="review" className="rounded-xl">
            To review ({(drafts.data ?? []).filter((d) => d.status === "draft").length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-xl">
            Approved ({(drafts.data ?? []).filter((d) => d.status === "approved").length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-xl">
            Sent
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {canEdit && tab === "review" && batch && batchable.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setPicked(new Set(batchable.map((d) => d.id)))}>
            Select all without warnings ({batchable.length})
          </Button>
          <Button size="sm" className="rounded-full" onClick={approveBatch} disabled={!picked.size || save.isPending}>
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Approve selected ({picked.size})
          </Button>
        </div>
      )}

      {drafts.isLoading ? (
        <SkeletonBlock className="h-64 rounded-[20px]" />
      ) : list.length === 0 ? (
        <div className="hub-card">
          <EmptyState
            icon={Send}
            title={tab === "review" ? "Nothing waiting for review" : tab === "approved" ? "Nothing approved and unsent" : "Nothing sent yet"}
            description="Write drafts from a lead's Outreach tab."
          />
        </div>
      ) : (
        <Section>
          <ul>
            {list.map((d) => {
              const lead = leadById.get(d.lead_id);
              const canBatch = canEdit && tab === "review" && batch && batchable.includes(d);
              return (
                <li key={d.id} className="flex items-start gap-3 border-b border-border/60 px-5 py-4 last:border-b-0">
                  {canBatch && (
                    <Checkbox
                      className="mt-1"
                      aria-label={`Select draft for ${lead?.name ?? "lead"}`}
                      checked={picked.has(d.id)}
                      onCheckedChange={(v) =>
                        setPicked((s) => {
                          const next = new Set(s);
                          if (v) next.add(d.id);
                          else next.delete(d.id);
                          return next;
                        })
                      }
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm">
                      <Link to={`/hub/crm/leads/${d.lead_id}?tab=outreach`} className="font-medium hover:underline">
                        {lead?.name ?? "Lead"}
                      </Link>
                      <Pill tone="outline">{DRAFT_KIND_LABEL[d.kind]}</Pill>
                      {d.warnings.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-warning">
                          <AlertTriangle className="h-3.5 w-3.5" /> {d.warnings.length} warning{d.warnings.length === 1 ? "" : "s"}
                        </span>
                      )}
                      {d.assumptions.length > 0 && <span className="text-xs text-muted-foreground">{d.assumptions.length} assumptions</span>}
                    </p>
                    {d.subject && <p className="mt-1 truncate text-sm">{d.subject}</p>}
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{d.body}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(parseISO(d.updated_at), { addSuffix: true })}</span>
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link to={`/hub/crm/leads/${d.lead_id}?tab=outreach`}>{tab === "approved" ? "Send" : "Open"}</Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>
      )}
    </>
  );
}
