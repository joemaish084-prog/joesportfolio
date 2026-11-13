import { useEffect, useMemo, useState, type DragEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { isSameMonth, parseISO } from "date-fns";
import {
  Archive,
  ArrowRightLeft,
  BellRing,
  CalendarClock,
  Filter,
  FlaskConical,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Target,
  Trophy,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { BlurFade } from "../components/motion/blur-fade";
import { KesTicker, NumberTicker } from "../components/motion/number-ticker";
import { SpotlightCard } from "../components/motion/spotlight-card";
import { LeadDialog } from "../components/pipeline/LeadDialog";
import { ClientAvatar, EmptyState, PageHeader, Pill, SkeletonBlock, StatTile } from "../components/ui";
import { TimeLeft } from "../components/engagement";
import { tableKey, useMoveLead, useRows, useSaveRow } from "../lib/data";
import { formatDate, isOverdue } from "../lib/format";
import { useKes } from "../lib/privacy";
import { useClients, useClientTypes, useSaveClient } from "../lib/queries";
import { DEFAULT_TRIAL_DAYS, unlinkedTrialClients, useTrialSync } from "../lib/trials";
import {
  LEAD_SOURCE_LABEL,
  LEAD_STAGES,
  LEAD_STAGE_LABEL,
  OPEN_LEAD_STAGES,
  type Client,
  type Lead,
  type LeadStage,
} from "../lib/types";
import { useQueryClient } from "@tanstack/react-query";

const OPEN_STAGES = OPEN_LEAD_STAGES;
/** Columns you can add a fresh lead to (a trial needs a client, so it starts from a lead). */
const ADDABLE_STAGES: readonly LeadStage[] = ["new", "contacted", "meeting", "proposal"];

/** A trial client added on the Clients side, shown in the Trial column so nothing on trial is missed. */
function TrialClientCard({ client }: { client: Client }) {
  const kes = useKes();
  return (
    <SpotlightCard className="hub-card rounded-2xl border border-dashed border-warning/40">
      <Link to={`/hub/clients/${client.id}`} className="block p-3.5">
        <div className="flex items-start gap-2">
          <ClientAvatar name={client.name} className="h-7 w-7 rounded-lg text-[0.6875rem]" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium leading-snug">{client.name}</p>
            {client.contact_person && (
              <p className="truncate text-xs text-muted-foreground">{client.contact_person}</p>
            )}
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {client.monthly_fee != null && (
            <span className="hub-tabular text-sm font-semibold">
              {kes(Number(client.monthly_fee))}
              <span className="text-xs font-normal text-muted-foreground">/mo after</span>
            </span>
          )}
          <Pill tone="outline" className="ml-auto">
            Client
          </Pill>
        </div>
        <TimeLeft client={client} className="mt-2" />
      </Link>
    </SpotlightCard>
  );
}

function LeadCard({
  lead,
  client,
  onEdit,
  onMove,
  onConvert,
  onTrial,
  onArchive,
}: {
  lead: Lead;
  /** The linked client, once converted or on trial. */
  client?: Client;
  onEdit: () => void;
  onMove: (stage: LeadStage) => void;
  onConvert: () => void;
  onTrial: () => void;
  onArchive: () => void;
}) {
  const kes = useKes();
  const due =
    lead.next_follow_up &&
    OPEN_STAGES.includes(lead.stage) &&
    (isOverdue(lead.next_follow_up, false) || lead.next_follow_up === new Date().toISOString().slice(0, 10));
  return (
    <SpotlightCard
      className="hub-card cursor-grab rounded-2xl active:cursor-grabbing"
      draggable
      onDragStart={(e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/lead-id", lead.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <div className="p-3.5">
        <div className="flex items-start gap-2">
          <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
            <p className="truncate font-medium leading-snug">{lead.name}</p>
            {lead.contact_person && <p className="truncate text-xs text-muted-foreground">{lead.contact_person}</p>}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-1 -mt-1 h-7 w-7 shrink-0 rounded-lg"
                aria-label={`Actions for ${lead.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Move to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-xl">
                  {LEAD_STAGES.map((s) => (
                    <DropdownMenuItem key={s} disabled={s === lead.stage} onSelect={() => onMove(s)}>
                      {LEAD_STAGE_LABEL[s]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {!lead.converted_client_id && lead.stage !== "lost" && (
                <DropdownMenuItem onSelect={onTrial}>
                  <FlaskConical className="mr-2 h-4 w-4" /> Start a {DEFAULT_TRIAL_DAYS}-day trial
                </DropdownMenuItem>
              )}
              {!lead.converted_client_id && lead.stage !== "lost" && (
                <DropdownMenuItem onSelect={onConvert}>
                  <UserPlus className="mr-2 h-4 w-4" /> Convert to client
                </DropdownMenuItem>
              )}
              {lead.converted_client_id && (
                <DropdownMenuItem asChild>
                  <Link to={`/hub/clients/${lead.converted_client_id}`}>
                    <UserPlus className="mr-2 h-4 w-4" /> Open client
                  </Link>
                </DropdownMenuItem>
              )}
              {lead.phone && (
                <DropdownMenuItem asChild>
                  <a href={`tel:${lead.phone}`}>
                    <Phone className="mr-2 h-4 w-4" /> Call {lead.phone}
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onArchive}>
                <Archive className="mr-2 h-4 w-4" /> Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {lead.estimated_value != null && (
            <span className="hub-tabular text-sm font-semibold">
              {kes(Number(lead.estimated_value))}
              <span className="text-xs font-normal text-muted-foreground">/mo</span>
            </span>
          )}
          <Pill tone="outline" className="ml-auto">
            {LEAD_SOURCE_LABEL[lead.source]}
          </Pill>
        </div>
        {lead.next_follow_up && OPEN_STAGES.includes(lead.stage) && (
          <p
            className={cn(
              "mt-2 flex items-center gap-1 text-xs",
              due ? "font-medium text-warning" : "text-muted-foreground",
            )}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Follow up {formatDate(lead.next_follow_up, "d MMM")}
          </p>
        )}
        {lead.stage === "lost" && lead.lost_reason && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{lead.lost_reason}</p>
        )}
        {lead.stage === "trial" && client?.engagement_type === "trial" && (
          <TimeLeft client={client} className="mt-2" />
        )}
        {lead.converted_client_id && lead.stage !== "trial" && (
          <Pill tone="accent" className="mt-2">
            Client
          </Pill>
        )}
      </div>
    </SpotlightCard>
  );
}

export default function PipelinePage() {
  const kes = useKes();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const leads = useRows("leads", "position", true);
  const types = useClientTypes();
  const saveLead = useSaveRow("leads");
  const move = useMoveLead();
  const saveClient = useSaveClient();
  const clients = useClients();
  const trialSync = useTrialSync();
  const [dialog, setDialog] = useState<{ open: boolean; lead?: Lead | null; stage?: LeadStage }>({ open: false });
  const [dragOver, setDragOver] = useState<LeadStage | null>(null);

  useEffect(() => {
    if (params.get("new") === "lead") {
      setDialog({ open: true });
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const live = useMemo(() => (leads.data ?? []).filter((l) => !l.archived_at), [leads.data]);
  const columns = useMemo(() => {
    const map = new Map<LeadStage, Lead[]>(LEAD_STAGES.map((s) => [s, []]));
    for (const l of live) map.get(l.stage)?.push(l);
    map.forEach((list) => list.sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at)));
    return map;
  }, [live]);

  const clientById = useMemo(() => new Map((clients.data ?? []).map((c) => [c.id, c])), [clients.data]);
  // Trial clients added on the Clients side, with no card here: shown in the Trial column too.
  const soloTrials = useMemo(
    () => unlinkedTrialClients(clients.data ?? [], leads.data ?? []),
    [clients.data, leads.data],
  );
  const soloTrialValue = soloTrials.reduce((s, c) => s + Number(c.monthly_fee ?? 0), 0);

  const open = live.filter((l) => OPEN_STAGES.includes(l.stage));
  const pipelineValue = open.reduce((s, l) => s + Number(l.estimated_value ?? 0), 0) + soloTrialValue;
  const now = new Date();
  const wonThisMonth = live.filter((l) => l.stage === "won" && isSameMonth(parseISO(l.updated_at), now));
  const won = live.filter((l) => l.stage === "won").length;
  const lost = live.filter((l) => l.stage === "lost").length;
  const todayIso = now.toISOString().slice(0, 10);
  const followUps = open.filter((l) => l.next_follow_up && l.next_follow_up <= todayIso);

  const startTrial = (lead: Lead) => {
    if (trialSync.pending) return;
    trialSync.startTrial(lead).then(
      (client) =>
        toast.success(`${client.name} is on a ${DEFAULT_TRIAL_DAYS}-day trial`, {
          description: "Added to Clients as a trial. Change the end date there if needed.",
          action: { label: "Open", onClick: () => navigate(`/hub/clients/${client.id}`) },
        }),
      (e: Error) => toast.error(e.message),
    );
  };

  const moveTo = (lead: Lead, stage: LeadStage) => {
    if (lead.stage === stage) return;
    if (stage === "won" && !lead.converted_client_id) return convert(lead, false);
    if (stage === "trial" && !lead.converted_client_id) return startTrial(lead);
    const position = Math.max(0, ...(columns.get(stage) ?? []).map((l) => l.position)) + 1;
    move.mutate([{ id: lead.id, stage, position }], {
      onSuccess: () => afterStageChange(lead, stage),
      onError: (e) => toast.error(e.message),
    });
  };

  // A trial lead that's won or lost takes its trial client with it.
  const afterStageChange = (lead: Lead, stage: LeadStage) =>
    trialSync.syncClient(lead, stage, clients.data).then(
      (patch) =>
        toast.success(
          !patch
            ? `${lead.name} → ${LEAD_STAGE_LABEL[stage]}`
            : patch.engagement_type === "retainer"
              ? `${lead.name} won · their trial is now a monthly retainer`
              : `${lead.name} lost · their trial is marked ended`,
        ),
      (e: Error) => toast.error(e.message),
    );

  const onDrop = (stage: LeadStage) => (e: DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/lead-id");
    const lead = live.find((l) => l.id === id);
    if (lead) moveTo(lead, stage);
  };

  const archive = (lead: Lead) =>
    saveLead.mutate(
      { id: lead.id, values: { archived_at: new Date().toISOString() } },
      { onSuccess: () => toast.success(`${lead.name} archived`), onError: (e) => toast.error(e.message) },
    );

  // Creates the client from the lead (with the type's suggested KPIs) in
  // onboarding and marks the lead won. Runs on its own when a lead is moved to
  // Won; "Convert to client" also opens the new client to finish the profile.
  const convert = (lead: Lead, open = true) => {
    if (saveClient.isPending) return;
    const type = types.data?.find((t) => t.id === lead.client_type_id);
    const position = Math.max(0, ...(columns.get("won") ?? []).map((l) => l.position)) + 1;
    saveClient.mutate(
      {
        client: {
          client_type_id: lead.client_type_id,
          name: lead.name,
          business_name: lead.name,
          contact_person: lead.contact_person,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          industry: lead.industry,
          status: "onboarding",
          start_date: todayIso,
          monthly_fee: lead.estimated_value,
          services: lead.services,
          main_goal: null,
          notes: lead.notes,
          custom_fields: {},
        },
        kpis: (type?.default_kpis ?? []).map((k) => ({ ...k })),
      },
      {
        onSuccess: async (client) => {
          await saveLead.mutateAsync({
            id: lead.id,
            values: { stage: "won", converted_client_id: client.id, ...(lead.stage === "won" ? {} : { position }) },
          });
          qc.invalidateQueries({ queryKey: tableKey("leads") });
          if (open) {
            toast.success(`${client.name} is now a client`);
            navigate(`/hub/clients/${client.id}`);
          } else {
            toast.success(`${client.name} won and added to clients as onboarding`, {
              action: { label: "Open", onClick: () => navigate(`/hub/clients/${client.id}`) },
            });
          }
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Pipeline"
          subtitle="Leads from first contact to signed client. Drag cards between stages."
          actions={
            <Button className="rounded-full px-4" onClick={() => setDialog({ open: true })}>
              <Plus className="mr-1 h-4 w-4" /> New lead
            </Button>
          }
        />
      </BlurFade>

      <BlurFade delay={0.05} className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Open pipeline"
          icon={Target}
          hint={`${open.length} open ${open.length === 1 ? "lead" : "leads"} · per month`}
        >
          <KesTicker value={pipelineValue} />
        </StatTile>
        <StatTile
          label="Won this month"
          icon={Trophy}
          hint={kes(wonThisMonth.reduce((s, l) => s + Number(l.estimated_value ?? 0), 0)) + "/mo"}
        >
          <NumberTicker value={wonThisMonth.length} />
        </StatTile>
        <StatTile label="Win rate" icon={Filter} hint={`${won} won · ${lost} lost`}>
          {won + lost ? `${Math.round((won / (won + lost)) * 100)}%` : "—"}
        </StatTile>
        <StatTile
          label="Follow-ups due"
          icon={BellRing}
          warn={followUps.length > 0}
          hint={
            followUps.length
              ? followUps
                  .slice(0, 2)
                  .map((l) => l.name)
                  .join(", ")
              : "None today"
          }
        >
          <NumberTicker value={followUps.length} />
        </StatTile>
      </BlurFade>

      {leads.isLoading ? (
        <SkeletonBlock className="h-96 rounded-[20px]" />
      ) : live.length === 0 && soloTrials.length === 0 ? (
        <div className="hub-card">
          <EmptyState
            icon={Target}
            title="Your pipeline is empty"
            description="Add the businesses you're talking to and move them along as the conversation progresses."
            action={
              <Button size="sm" className="rounded-full" onClick={() => setDialog({ open: true })}>
                Add a lead
              </Button>
            }
          />
        </div>
      ) : (
        <BlurFade delay={0.1}>
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
            {LEAD_STAGES.map((stage) => {
              const list = columns.get(stage) ?? [];
              const extra = stage === "trial" ? soloTrials : [];
              const value =
                list.reduce((s, l) => s + Number(l.estimated_value ?? 0), 0) +
                (stage === "trial" ? soloTrialValue : 0);
              return (
                <section
                  key={stage}
                  aria-label={LEAD_STAGE_LABEL[stage]}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(stage);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
                  }}
                  onDrop={onDrop(stage)}
                  className={cn(
                    "flex w-[17rem] shrink-0 snap-start flex-col rounded-[20px] bg-secondary/60 p-2 transition-colors duration-150",
                    dragOver === stage && "bg-tint ring-2 ring-primary/40",
                  )}
                >
                  <header className="flex items-center justify-between px-2 pb-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          stage === "won"
                            ? "bg-primary"
                            : stage === "lost"
                              ? "bg-muted-foreground/40"
                              : stage === "trial"
                                ? "bg-warning"
                                : "bg-primary/50",
                        )}
                      />
                      <h2 className="text-sm font-semibold">{LEAD_STAGE_LABEL[stage]}</h2>
                      <span className="hub-tabular text-xs text-muted-foreground">{list.length + extra.length}</span>
                    </div>
                    {value > 0 && <span className="hub-tabular text-xs text-muted-foreground">{kes(value)}</span>}
                  </header>
                  <div className="flex min-h-24 flex-1 flex-col gap-2">
                    {list.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        client={lead.converted_client_id ? clientById.get(lead.converted_client_id) : undefined}
                        onEdit={() => setDialog({ open: true, lead })}
                        onMove={(s) => moveTo(lead, s)}
                        onConvert={() => convert(lead)}
                        onTrial={() => startTrial(lead)}
                        onArchive={() => archive(lead)}
                      />
                    ))}
                    {extra.map((c) => (
                      <TrialClientCard key={c.id} client={c} />
                    ))}
                    {stage === "trial" && list.length + extra.length === 0 && (
                      <p className="px-3 py-4 text-center text-xs leading-relaxed text-muted-foreground">
                        Drag a lead here to start a {DEFAULT_TRIAL_DAYS}-day trial on their ads.
                      </p>
                    )}
                    {ADDABLE_STAGES.includes(stage) && (
                      <button
                        type="button"
                        onClick={() => setDialog({ open: true, stage })}
                        className="flex items-center justify-center gap-1 rounded-xl py-2 text-xs text-muted-foreground transition-colors duration-150 hover:bg-card hover:text-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </BlurFade>
      )}

      <LeadDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
        lead={dialog.lead}
        stage={dialog.stage}
        onWon={(lead) => convert(lead, false)}
        onTrial={startTrial}
        onStageChange={afterStageChange}
      />
    </>
  );
}
