import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Download, MoreHorizontal, Plus, Search, Tag, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { downloadCsv } from "../../lib/csv";
import { BlurFade } from "../../components/motion/blur-fade";
import { EmptyState, PageHeader, Pill, SkeletonBlock, TableCard } from "../../components/ui";
import { FitBadge, PriorityPill, SelectField, StageBadge, useOwnerLabel } from "../components/bits";
import { LeadFormDialog } from "../components/LeadFormDialog";
import { toSafeCsv } from "../lib/exportCsv";
import {
  useAddToCampaign,
  useBulkUpdateLeads,
  useCampaigns,
  useCrm,
  useIndustries,
  useLeadCampaigns,
  useLeads,
  useLogExport,
  useMembers,
} from "../lib/queries";
import { CLOSED_STAGES, QUALIFICATION_LABEL, STAGES, STAGE_LABEL, type CrmLead, type Stage } from "../lib/types";

const PAGE = 50;

type Sort = "name" | "priority" | "weakness" | "fit" | "last_contact" | "next_follow_up" | "added";

const SORT_LABEL: Record<Sort, string> = {
  name: "Name",
  priority: "Priority (A first)",
  weakness: "Weakness score",
  fit: "Fit score",
  last_contact: "Last contact",
  next_follow_up: "Next follow-up",
  added: "Recently added",
};

const day = (v: string | null) => (v ? format(parseISO(v), "d MMM") : "—");

function compare(sort: Sort) {
  const nullsLast = (a: number | string | null, b: number | string | null, dir = 1) =>
    a === b ? 0 : a === null ? 1 : b === null ? -1 : a < b ? -dir : dir;
  return (a: CrmLead, b: CrmLead) => {
    switch (sort) {
      case "priority":
        return nullsLast(a.original_priority, b.original_priority) || a.name.localeCompare(b.name);
      case "weakness":
        return nullsLast(a.weakness_score, b.weakness_score, -1) || a.name.localeCompare(b.name);
      case "fit":
        return nullsLast(a.fit_score, b.fit_score, -1) || a.name.localeCompare(b.name);
      case "last_contact":
        return nullsLast(a.last_contacted_at, b.last_contacted_at, -1);
      case "next_follow_up":
        return nullsLast(a.next_follow_up_on, b.next_follow_up_on);
      case "added":
        return b.created_at.localeCompare(a.created_at);
      default:
        return a.name.localeCompare(b.name);
    }
  };
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isOwner, canEdit } = useCrm();
  const leads = useLeads();
  const industries = useIndustries();
  const campaigns = useCampaigns();
  const leadCampaigns = useLeadCampaigns();
  const members = useMembers();
  const ownerLabel = useOwnerLabel();
  const bulk = useBulkUpdateLeads();
  const addToCampaign = useAddToCampaign();
  const logExport = useLogExport();

  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");
  const [industry, setIndustry] = useState("");
  const [campaign, setCampaign] = useState(() => params.get("campaign") ?? "");
  const [owner, setOwner] = useState("");
  const [tag, setTag] = useState("");
  const [showClosed, setShowClosed] = useState(true);
  const [sort, setSort] = useState<Sort>("priority");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newOpen, setNewOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const industryName = useMemo(() => new Map((industries.data ?? []).map((i) => [i.id, i.name])), [industries.data]);
  const campaignLeads = useMemo(() => {
    if (!campaign) return null;
    return new Set((leadCampaigns.data ?? []).filter((lc) => lc.campaign_id === campaign && lc.status !== "removed").map((lc) => lc.lead_id));
  }, [campaign, leadCampaigns.data]);
  const allTags = useMemo(() => [...new Set((leads.data ?? []).flatMap((l) => l.tags))].sort(), [leads.data]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (leads.data ?? [])
      .filter((l) => !l.archived_at)
      .filter((l) => showClosed || !CLOSED_STAGES.includes(l.stage))
      .filter((l) => !stage || l.stage === stage)
      .filter((l) => !priority || (priority === "none" ? !l.original_priority : l.original_priority === priority))
      .filter((l) => !industry || l.industry_id === industry)
      .filter((l) => !campaignLeads || campaignLeads.has(l.id))
      .filter((l) => !owner || (owner === "none" ? !l.owner_id : l.owner_id === owner))
      .filter((l) => !tag || l.tags.includes(tag))
      .filter(
        (l) =>
          !needle ||
          [l.name, l.area, l.email, l.phone, l.website, l.business_type, l.notes].some((v) => v?.toLowerCase().includes(needle)),
      )
      .sort(compare(sort));
  }, [leads.data, q, stage, priority, industry, campaignLeads, owner, tag, showClosed, sort]);

  const shown = filtered.slice(0, page * PAGE);
  const selectedLeads = filtered.filter((l) => selected.has(l.id));
  const allShownSelected = shown.length > 0 && shown.every((l) => selected.has(l.id));

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const runBulk = (label: string, values: (l: CrmLead) => Partial<CrmLead>) =>
    bulk.mutate(
      selectedLeads.map((l) => ({ id: l.id, values: values(l) })),
      {
        onSuccess: ({ updated, failed }) => {
          if (failed.length) toast.error(`${label}: ${updated} updated, ${failed.length} not allowed`);
          else toast.success(`${label}: ${updated} updated`);
          setSelected(new Set());
        },
        onError: (e) => toast.error(e.message),
      },
    );

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().slice(0, 40);
    if (!t) return;
    runBulk(`Tagged "${t}"`, (l) => ({ tags: [...new Set([...l.tags, t])] }));
    setTagInput("");
  };

  const exportCsv = () => {
    const rows = selectedLeads.length ? selectedLeads : filtered;
    const csv = toSafeCsv(rows, [
      { header: "Business", value: (l) => l.name },
      { header: "Area", value: (l) => l.area },
      { header: "Industry", value: (l) => (l.industry_id ? industryName.get(l.industry_id) : "") },
      { header: "Email", value: (l) => l.email },
      { header: "Email status", value: (l) => l.email_status },
      { header: "Phone", value: (l) => l.phone },
      { header: "Website", value: (l) => l.website },
      { header: "Original priority", value: (l) => l.original_priority },
      { header: "Weakness score", value: (l) => l.weakness_score },
      { header: "Fit score", value: (l) => l.fit_score },
      { header: "Qualification", value: (l) => QUALIFICATION_LABEL[l.qualification_status] },
      { header: "Stage", value: (l) => STAGE_LABEL[l.stage] },
      { header: "Do not contact", value: (l) => (l.do_not_contact ? "Yes" : "No") },
      { header: "Assigned to", value: (l) => ownerLabel(l.owner_id) },
      { header: "Last contact", value: (l) => l.last_contacted_at?.slice(0, 10) },
      { header: "Next follow-up", value: (l) => l.next_follow_up_on },
      { header: "Tags", value: (l) => l.tags.join(", ") },
      { header: "Notes", value: (l) => l.notes },
    ]);
    // Logged before the download so every export is in the audit trail.
    logExport.mutate(
      { rows: rows.length, filters: { q, stage, priority, industry, campaign, owner, tag, selected: selectedLeads.length } },
      {
        onSuccess: () => downloadCsv(`crm-leads-${format(new Date(), "yyyy-MM-dd")}.csv`, csv),
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const anyFilter = q || stage || priority || industry || campaign || owner || tag || !showClosed;

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Leads"
          subtitle={leads.data ? `${filtered.length} of ${leads.data.length} leads` : "Every business you're researching or talking to"}
          actions={
            <>
              {isOwner && (
                <Button variant="outline" className="rounded-full px-4" onClick={exportCsv} disabled={!filtered.length || logExport.isPending}>
                  <Download className="mr-1.5 h-4 w-4" /> Export
                </Button>
              )}
              {isOwner && (
                <Button asChild variant="outline" className="rounded-full px-4">
                  <Link to="/hub/crm/import">
                    <Upload className="mr-1.5 h-4 w-4" /> Import
                  </Link>
                </Button>
              )}
              {canEdit && (
                <Button className="rounded-full px-4" onClick={() => setNewOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" /> New lead
                </Button>
              )}
            </>
          }
        />
      </BlurFade>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search leads"
            placeholder="Search name, area, email, phone"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <SelectField
          label="Stage"
          className="w-40"
          value={stage}
          onChange={setStage}
          options={[{ value: "", label: "All stages" }, ...STAGES.map((s) => ({ value: s, label: STAGE_LABEL[s] }))]}
        />
        <SelectField
          label="Original priority"
          className="w-32"
          value={priority}
          onChange={setPriority}
          options={[
            { value: "", label: "Any priority" },
            { value: "A", label: "Priority A" },
            { value: "B", label: "Priority B" },
            { value: "C", label: "Priority C" },
            { value: "none", label: "No priority" },
          ]}
        />
        <SelectField
          label="Industry"
          className="w-40"
          value={industry}
          onChange={setIndustry}
          options={[{ value: "", label: "All industries" }, ...(industries.data ?? []).map((i) => ({ value: i.id, label: i.name }))]}
        />
        <SelectField
          label="Campaign"
          className="w-44"
          value={campaign}
          onChange={setCampaign}
          options={[{ value: "", label: "Any campaign" }, ...(campaigns.data ?? []).map((c) => ({ value: c.id, label: c.name }))]}
        />
        {isOwner && (
          <SelectField
            label="Assigned to"
            className="w-40"
            value={owner}
            onChange={setOwner}
            options={[
              { value: "", label: "Anyone" },
              { value: "none", label: "Unassigned" },
              ...(members.data ?? []).map((m) => ({ value: m.user_id, label: m.email })),
            ]}
          />
        )}
        {allTags.length > 0 && (
          <SelectField
            label="Tag"
            className="w-36"
            value={tag}
            onChange={setTag}
            options={[{ value: "", label: "Any tag" }, ...allTags.map((t) => ({ value: t, label: t }))]}
          />
        )}
        <SelectField
          label="Sort by"
          className="w-44"
          value={sort}
          onChange={(v) => setSort(v as Sort)}
          options={(Object.keys(SORT_LABEL) as Sort[]).map((s) => ({ value: s, label: `Sort: ${SORT_LABEL[s]}` }))}
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={!showClosed} onCheckedChange={(v) => setShowClosed(!v)} />
          Hide closed
        </label>
        {anyFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => {
              setQ("");
              setStage("");
              setPriority("");
              setIndustry("");
              setCampaign("");
              setOwner("");
              setTag("");
              setShowClosed(true);
            }}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {canEdit && selectedLeads.length > 0 && (
        <div className="hub-card sticky top-16 z-20 mb-3 flex flex-wrap items-center gap-2 p-3 md:top-4" role="region" aria-label="Bulk actions">
          <span className="px-1 text-sm font-medium">{selectedLeads.length} selected</span>
          <div className="flex items-center gap-1">
            <Input
              aria-label="Tag to add"
              placeholder="Tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              className="h-9 w-28 rounded-lg"
            />
            <Button size="sm" variant="outline" className="rounded-lg" onClick={addTag} disabled={!tagInput.trim() || bulk.isPending}>
              <Tag className="mr-1 h-3.5 w-3.5" /> Add tag
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="rounded-lg" disabled={bulk.isPending}>
                More actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Move to stage</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-80 overflow-y-auto rounded-xl">
                  {STAGES.filter((s) => s !== "do_not_contact").map((s) => (
                    <DropdownMenuItem key={s} onSelect={() => runBulk(`Moved to ${STAGE_LABEL[s]}`, () => ({ stage: s as Stage }))}>
                      {STAGE_LABEL[s]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {(campaigns.data?.length ?? 0) > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Add to campaign</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="rounded-xl">
                    {(campaigns.data ?? []).map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        onSelect={() =>
                          addToCampaign.mutate(
                            { campaignId: c.id, leadIds: selectedLeads.map((l) => l.id) },
                            {
                              onSuccess: () => {
                                toast.success(`Added to ${c.name}`);
                                setSelected(new Set());
                              },
                              onError: (e) => toast.error(e.message),
                            },
                          )
                        }
                      >
                        {c.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {isOwner && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Assign to</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="rounded-xl">
                    <DropdownMenuItem onSelect={() => runBulk("Unassigned", () => ({ owner_id: null }))}>Unassigned</DropdownMenuItem>
                    {(members.data ?? [])
                      .filter((m) => m.role !== "viewer")
                      .map((m) => (
                        <DropdownMenuItem key={m.user_id} onSelect={() => runBulk(`Assigned to ${m.email}`, () => ({ owner_id: m.user_id }))}>
                          {m.email}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {tag && (
                <DropdownMenuItem onSelect={() => runBulk(`Removed "${tag}"`, (l) => ({ tags: l.tags.filter((t) => t !== tag) }))}>
                  Remove tag "{tag}"
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="ghost" className="ml-auto rounded-lg" onClick={() => setSelected(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      {leads.isLoading ? (
        <SkeletonBlock className="h-96 rounded-[20px]" />
      ) : leads.isError ? (
        <p role="alert" className="hub-card p-5 text-sm text-destructive">
          Couldn't load leads: {leads.error.message}
        </p>
      ) : filtered.length === 0 ? (
        <div className="hub-card">
          <EmptyState
            icon={Users}
            title={anyFilter ? "No leads match" : "No leads yet"}
            description={anyFilter ? "Try clearing a filter." : "Import a spreadsheet or add a lead by hand."}
          />
        </div>
      ) : (
        <BlurFade delay={0.05}>
          <TableCard>
            <Table className="min-w-[1500px] text-sm">
              <TableHeader>
                <TableRow>
                  {canEdit && (
                    <TableHead className="w-10">
                      <Checkbox
                        aria-label="Select all shown"
                        checked={allShownSelected}
                        onCheckedChange={(v) =>
                          setSelected((s) => {
                            const next = new Set(s);
                            shown.forEach((l) => (v ? next.add(l.id) : next.delete(l.id)));
                            return next;
                          })
                        }
                      />
                    </TableHead>
                  )}
                  <TableHead>Business</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead title="From the original spreadsheet">Priority</TableHead>
                  <TableHead>Fit</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Last contact</TableHead>
                  <TableHead>Next follow-up</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((l) => (
                  <TableRow key={l.id} data-state={selected.has(l.id) ? "selected" : undefined}>
                    {canEdit && (
                      <TableCell>
                        <Checkbox aria-label={`Select ${l.name}`} checked={selected.has(l.id)} onCheckedChange={() => toggle(l.id)} />
                      </TableCell>
                    )}
                    <TableCell className="max-w-[16rem]">
                      <Link to={`/hub/crm/leads/${l.id}`} className="block truncate font-medium hover:underline">
                        {l.name}
                      </Link>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[l.area, l.business_type].filter(Boolean).join(" · ") || "—"}
                      </span>
                      {l.tags.length > 0 && (
                        <span className="mt-1 flex flex-wrap gap-1">
                          {l.tags.slice(0, 3).map((t) => (
                            <Pill key={t} tone="outline" className="px-1.5 text-[0.625rem]">
                              {t}
                            </Pill>
                          ))}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{(l.industry_id && industryName.get(l.industry_id)) || "—"}</TableCell>
                    <TableCell className="max-w-[14rem] truncate">
                      {l.email ?? <span className="text-muted-foreground">—</span>}
                      {l.email_status === "bounced" && (
                        <Pill tone="warning" className="ml-1">
                          Bounced
                        </Pill>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{l.phone ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="max-w-[12rem] truncate">{l.website ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <PriorityPill priority={l.original_priority} />
                    </TableCell>
                    <TableCell>
                      <FitBadge score={l.fit_score} known={l.fit_factors_known} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{QUALIFICATION_LABEL[l.qualification_status]}</TableCell>
                    <TableCell>
                      <StageBadge stage={l.stage} />
                    </TableCell>
                    <TableCell className="max-w-[10rem] truncate text-muted-foreground">{ownerLabel(l.owner_id)}</TableCell>
                    <TableCell className="whitespace-nowrap">{day(l.last_contacted_at)}</TableCell>
                    <TableCell className="whitespace-nowrap">{day(l.next_follow_up_on)}</TableCell>
                    <TableCell className="max-w-[14rem] truncate text-muted-foreground" title={l.notes ?? undefined}>
                      {l.notes ?? "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label={`Actions for ${l.name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem onSelect={() => navigate(`/hub/crm/leads/${l.id}`)}>Open profile</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => navigate(`/hub/crm/leads/${l.id}?tab=outreach`)}>Write outreach</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
          {shown.length < filtered.length && (
            <div className="mt-4 text-center">
              <Button variant="outline" className="rounded-full" onClick={() => setPage((p) => p + 1)}>
                Show more ({filtered.length - shown.length} left)
              </Button>
            </div>
          )}
        </BlurFade>
      )}

      <LeadFormDialog open={newOpen} onOpenChange={setNewOpen} onSaved={(l) => navigate(`/hub/crm/leads/${l.id}`)} />
    </>
  );
}
