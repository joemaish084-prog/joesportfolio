import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Ban, MessageCircle, MoreHorizontal, Pencil, SearchX, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlurFade } from "../../components/motion/blur-fade";
import { EmptyState, SkeletonBlock } from "../../components/ui";
import { SelectField, StageBadge } from "../components/bits";
import { AccessPanel } from "../components/lead/AccessPanel";
import { DealsPanel } from "../components/lead/DealsPanel";
import { LeadOverview } from "../components/lead/LeadOverview";
import { OutreachPanel } from "../components/lead/OutreachPanel";
import { Timeline } from "../components/lead/Timeline";
import { LeadFormDialog } from "../components/LeadFormDialog";
import { useCrm, useDeleteLead, useLead, useMembers, useSaveLead } from "../lib/queries";
import { DRAFT_KINDS, QUALIFICATION, QUALIFICATION_LABEL, STAGES, STAGE_LABEL, type CrmLead, type DraftKind } from "../lib/types";

const TABS = ["overview", "outreach", "timeline", "deals", "access"] as const;
type Tab = (typeof TABS)[number];

export default function LeadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { canEdit, isOwner } = useCrm();
  const lead = useLead(id);
  const members = useMembers();
  const save = useSaveLead();
  const remove = useDeleteLead();
  const [editOpen, setEditOpen] = useState(false);

  const tab: Tab = TABS.includes(params.get("tab") as Tab) ? (params.get("tab") as Tab) : "overview";
  const kindParam = params.get("kind");
  const initialKind = DRAFT_KINDS.includes(kindParam as DraftKind) ? (kindParam as DraftKind) : null;

  if (lead.isLoading) return <SkeletonBlock className="h-96 rounded-[20px]" />;
  if (!lead.data) {
    return (
      <div className="hub-card">
        <EmptyState
          icon={SearchX}
          title="Lead not found"
          description="It may have been deleted, or it isn't shared with you."
          action={
            <Button asChild size="sm" className="rounded-full">
              <Link to="/hub/crm/leads">Back to leads</Link>
            </Button>
          }
        />
      </div>
    );
  }
  const l: CrmLead = lead.data;

  const update = (values: Partial<CrmLead>, message: string) =>
    save.mutate({ id: l.id, values }, { onSuccess: () => toast.success(message), onError: (e) => toast.error(e.message) });

  const markDnc = () => {
    if (!window.confirm(`Mark ${l.name} as do not contact? Follow-ups stop and their email and phone go on the suppression list.`)) return;
    update({ stage: "do_not_contact" }, "Marked do not contact");
  };

  const liftDnc = () => {
    if (!window.confirm("Lift do-not-contact? Remove their entries from the suppression list in Settings too, or messages will still be blocked."))
      return;
    update({ do_not_contact: false, stage: "qualified" }, "Do-not-contact lifted");
  };

  const del = () => {
    if (!window.confirm(`Delete ${l.name} and its whole history? This can't be undone. Suppression entries stay.`)) return;
    remove.mutate(l.id, {
      onSuccess: () => {
        toast.success("Deleted");
        navigate("/hub/crm/leads");
      },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <>
      <BlurFade>
        <Link to="/hub/crm/leads" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Leads
        </Link>
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.125rem]">{l.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[0.9375rem] text-muted-foreground">
              {[l.area, l.business_type].filter(Boolean).join(" · ") || "No details yet"}
              <StageBadge stage={l.stage} />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && !l.do_not_contact && (
              <Button variant="outline" className="rounded-full px-4" onClick={() => setParams({ tab: "outreach", kind: "whatsapp_intro" })}>
                <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
              </Button>
            )}
            {canEdit && (
              <Button variant="outline" className="rounded-full px-4" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-1.5 h-4 w-4" /> Edit
              </Button>
            )}
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="More actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  {!l.do_not_contact ? (
                    <DropdownMenuItem onSelect={markDnc}>
                      <Ban className="mr-2 h-4 w-4" /> Mark do not contact
                    </DropdownMenuItem>
                  ) : (
                    isOwner && <DropdownMenuItem onSelect={liftDnc}>Lift do-not-contact</DropdownMenuItem>
                  )}
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={del} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete lead
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {canEdit && (
          <div className="mb-6 flex flex-wrap gap-2">
            <SelectField
              label="Stage"
              className="w-48"
              value={l.stage}
              disabled={l.do_not_contact || save.isPending}
              onChange={(v) => update({ stage: v as CrmLead["stage"] }, `Moved to ${STAGE_LABEL[v as CrmLead["stage"]]}`)}
              options={STAGES.filter((s) => s !== "do_not_contact" || l.do_not_contact).map((s) => ({ value: s, label: `Stage: ${STAGE_LABEL[s]}` }))}
            />
            <SelectField
              label="Qualification"
              className="w-52"
              value={l.qualification_status}
              disabled={save.isPending}
              onChange={(v) => update({ qualification_status: v as CrmLead["qualification_status"] }, "Qualification updated")}
              options={QUALIFICATION.map((q) => ({ value: q, label: `Qualification: ${QUALIFICATION_LABEL[q]}` }))}
            />
            {isOwner && (
              <SelectField
                label="Assigned to"
                className="w-60"
                value={l.owner_id ?? ""}
                disabled={save.isPending}
                onChange={(v) => update({ owner_id: v || null }, "Reassigned")}
                options={[
                  { value: "", label: "Assigned: nobody" },
                  ...(members.data ?? []).filter((m) => m.role !== "viewer").map((m) => ({ value: m.user_id, label: `Assigned: ${m.email}` })),
                ]}
              />
            )}
          </div>
        )}
      </BlurFade>

      <Tabs value={tab} onValueChange={(v) => setParams(v === "overview" ? {} : { tab: v })}>
        <TabsList className="mb-6 h-auto flex-wrap justify-start gap-1 rounded-2xl bg-secondary p-1">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-xl px-4 py-1.5 capitalize">
              {t === "access" ? "Campaigns & access" : t}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <LeadOverview lead={l} />
        </TabsContent>
        <TabsContent value="outreach">
          <OutreachPanel lead={l} initialKind={initialKind} />
        </TabsContent>
        <TabsContent value="timeline">
          <Timeline lead={l} />
        </TabsContent>
        <TabsContent value="deals">
          <DealsPanel lead={l} />
        </TabsContent>
        <TabsContent value="access">
          <AccessPanel lead={l} />
        </TabsContent>
      </Tabs>

      <LeadFormDialog open={editOpen} onOpenChange={setEditOpen} lead={l} />
    </>
  );
}
