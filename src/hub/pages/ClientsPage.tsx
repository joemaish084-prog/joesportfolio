import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Archive, LayoutGrid, List, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnimatedCircularProgressBar } from "../components/motion/animated-circular-progress-bar";
import { BlurFade } from "../components/motion/blur-fade";
import { KesTicker } from "../components/motion/number-ticker";
import { SpotlightCard } from "../components/motion/spotlight-card";
import { ClientAvatar, EmptyState, PageHeader, ProgressBar, SkeletonBlock, StatusBadge } from "../components/ui";
import { EngagementBadge, TimeLeft } from "../components/engagement";
import { ENGAGEMENT, feeOf, isMonthly, timeLeft } from "../lib/engagement";
import { useClients, useClientTypes, useOnboardingByClient } from "../lib/queries";
import {
  CLIENT_STATUSES,
  ENGAGEMENT_TYPES,
  STATUS_LABEL,
  type Client,
  type ClientStatus,
  type EngagementType,
} from "../lib/types";

type View = "cards" | "table";
const VIEW_KEY = "hub:clients-view";

function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === "table" ? "table" : "cards";
  } catch {
    return "cards";
  }
}

export default function ClientsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const clients = useClients();
  const types = useClientTypes();
  const onboarding = useOnboardingByClient();

  const [query, setQuery] = useState("");
  const [view, setViewState] = useState<View>(readView);
  const status = (CLIENT_STATUSES as readonly string[]).includes(params.get("status") ?? "")
    ? (params.get("status") as ClientStatus)
    : "all";
  const typeFilter = params.get("type") ?? "all";
  const workFilter = (ENGAGEMENT_TYPES as readonly string[]).includes(params.get("work") ?? "")
    ? (params.get("work") as EngagementType)
    : "all";
  const showArchived = params.get("archived") === "1";

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const setView = (next: View) => {
    setViewState(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Not remembered; fine.
    }
  };

  const typeName = useMemo(() => new Map((types.data ?? []).map((t) => [t.id, t.name])), [types.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (clients.data ?? []).filter((c) => {
      if (showArchived ? !c.archived_at : c.archived_at) return false;
      if (status !== "all" && c.status !== status) return false;
      if (typeFilter !== "all" && c.client_type_id !== typeFilter) return false;
      if (workFilter !== "all" && (c.engagement_type ?? "retainer") !== workFilter) return false;
      if (!q) return true;
      return [c.name, c.business_name, c.contact_person, c.email, c.phone, c.industry]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [clients.data, query, status, typeFilter, workFilter, showArchived]);

  const archivedCount = (clients.data ?? []).filter((c) => c.archived_at).length;
  const hasFilters = !!query || status !== "all" || typeFilter !== "all" || workFilter !== "all";
  const typeLabel = (c: Client) => (c.client_type_id && typeName.get(c.client_type_id)) || "No type";

  return (
    <>
      <BlurFade>
        <PageHeader
          title={showArchived ? "Archived clients" : "Clients"}
          subtitle={
            clients.data
              ? `${filtered.length} ${filtered.length === 1 ? "client" : "clients"}${hasFilters ? " match" : ""}`
              : " "
          }
          actions={
            <Button asChild className="rounded-full px-4">
              <Link to="/hub/clients/new">
                <Plus className="mr-1 h-4 w-4" /> New client
              </Link>
            </Button>
          }
        />
      </BlurFade>

      <BlurFade delay={0.05} className="mb-5 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search name, contact, email or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 rounded-xl border-transparent bg-secondary pl-10 focus-visible:bg-card"
              aria-label="Search clients"
            />
          </div>
          <div className="flex gap-2">
            <Select value={workFilter} onValueChange={(v) => setParam("work", v === "all" ? null : v)}>
              <SelectTrigger
                className="h-10 w-full rounded-xl border-transparent bg-secondary sm:w-44"
                aria-label="How you work together"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All engagements</SelectItem>
                {ENGAGEMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ENGAGEMENT[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setParam("type", v === "all" ? null : v)}>
              <SelectTrigger
                className="h-10 w-full rounded-xl border-transparent bg-secondary sm:w-52"
                aria-label="Client type"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {types.data?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex shrink-0 rounded-xl bg-secondary p-1" role="radiogroup" aria-label="View">
              {(
                [
                  ["cards", LayoutGrid],
                  ["table", List],
                ] as const
              ).map(([v, Icon]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={view === v}
                  aria-label={v === "cards" ? "Cards" : "Table"}
                  onClick={() => setView(v)}
                  className={cn(
                    "flex h-8 w-9 items-center justify-center rounded-lg transition-all duration-150",
                    view === v ? "bg-card text-foreground shadow-hub" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {(["all", ...CLIENT_STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setParam("status", s === "all" ? null : s)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors duration-150",
                status === s
                  ? "bg-foreground font-medium text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
            </button>
          ))}
          {(archivedCount > 0 || showArchived) && (
            <button
              type="button"
              onClick={() => setParam("archived", showArchived ? null : "1")}
              className={cn(
                "ml-auto flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors duration-150",
                showArchived ? "bg-tint font-medium text-on-tint" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Archive className="h-3.5 w-3.5" />
              {showArchived ? "Back to clients" : `Archived (${archivedCount})`}
            </button>
          )}
        </div>
      </BlurFade>

      {clients.error && (
        <p className="mb-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn't load clients: {clients.error.message}
        </p>
      )}

      {clients.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-44 rounded-[20px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="hub-card">
          {hasFilters ? (
            <EmptyState icon={Search} title="No matches" description="Try a different search or clear the filters." />
          ) : showArchived ? (
            <EmptyState icon={Archive} title="Nothing archived" description="Archived clients will show up here." />
          ) : (
            <EmptyState
              icon={Users}
              title="No clients yet"
              description="Add a client to set up their profile and onboarding checklist."
              action={
                <Button asChild size="sm" className="rounded-full">
                  <Link to="/hub/clients/new">Add a client</Link>
                </Button>
              }
            />
          )}
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client, index) => {
            const progress = onboarding.progressFor(client.id);
            return (
              <BlurFade key={client.id} delay={0.08 + Math.min(index, 8) * 0.03}>
                <SpotlightCard className="hub-card hub-card-interactive h-full">
                  <Link to={`/hub/clients/${client.id}`} className="flex h-full flex-col p-5">
                    <div className="flex items-start gap-3">
                      <ClientAvatar name={client.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{client.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{typeLabel(client)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <StatusBadge status={client.status} />
                          <EngagementBadge type={client.engagement_type} />
                        </div>
                      </div>
                      <AnimatedCircularProgressBar
                        value={progress.done}
                        max={Math.max(progress.total, 1)}
                        className="size-14 shrink-0 text-xs"
                        label={progress.total ? `${Math.round((progress.done / progress.total) * 100)}%` : "–"}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {client.services.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-secondary px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))}
                      {client.services.length > 3 && (
                        <span className="px-1 text-[0.6875rem] text-muted-foreground">
                          +{client.services.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto space-y-1.5 pt-5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Onboarding</span>
                        <span
                          className={cn(
                            "hub-tabular",
                            progress.overdue ? "font-medium text-warning" : "text-muted-foreground",
                          )}
                        >
                          {progress.total ? `${progress.done} of ${progress.total} done` : "No steps"}
                          {progress.overdue > 0 && ` · ${progress.overdue} overdue`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{feeOf(client).label}</span>
                        <KesTicker value={feeOf(client).amount} className="font-medium" />
                      </div>
                      {timeLeft(client) && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {client.engagement_type === "project" ? "Deadline" : "Contract ends"}
                          </span>
                          <TimeLeft client={client} />
                        </div>
                      )}
                    </div>
                  </Link>
                </SpotlightCard>
              </BlurFade>
            );
          })}
        </div>
      ) : (
        <div className="hub-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left">
                {["Client", "Type", "Status", "Onboarding", "Fee"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const progress = onboarding.progressFor(client.id);
                return (
                  <tr
                    key={client.id}
                    onClick={() => navigate(`/hub/clients/${client.id}`)}
                    className="cursor-pointer border-b border-border/60 transition-colors duration-150 last:border-b-0 hover:bg-secondary/60"
                  >
                    <td className="px-5 py-3">
                      <Link
                        to={`/hub/clients/${client.id}`}
                        className="flex items-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ClientAvatar name={client.name} className="h-8 w-8 rounded-lg text-xs" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{client.name}</span>
                          {client.contact_person && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {client.contact_person}
                            </span>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{typeLabel(client)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={client.status} />
                        <EngagementBadge type={client.engagement_type} />
                      </div>
                    </td>
                    <td className="w-48 px-5 py-3">
                      <ProgressBar done={progress.done} total={progress.total} showLabel={false} />
                      <span
                        className={cn(
                          "hub-tabular mt-1 block text-xs",
                          progress.overdue ? "text-warning" : "text-muted-foreground",
                        )}
                      >
                        {progress.done}/{progress.total}
                        {progress.overdue > 0 && ` · ${progress.overdue} overdue`}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <KesTicker value={feeOf(client).amount} />
                      <span className="block text-xs text-muted-foreground">
                        {isMonthly(client) ? "per month" : "project total"}
                      </span>
                      <TimeLeft client={client} className="mt-0.5" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
