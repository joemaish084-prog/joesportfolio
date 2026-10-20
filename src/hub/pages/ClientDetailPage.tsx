import { Suspense, lazy, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Pencil,
  Presentation,
  Target,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OnboardingChecklist } from "../components/OnboardingChecklist";
import { BlurFade } from "../components/motion/blur-fade";
import { KesTicker } from "../components/motion/number-ticker";
import { ClientAvatar, EmptyState, ProgressBar, Row, Section, SkeletonBlock, StatusBadge } from "../components/ui";
import { EngagementBadge, TimeLeft } from "../components/engagement";
import { ENGAGEMENT, durationLabel, feeOf } from "../lib/engagement";
import { formatDate } from "../lib/format";
import { useClient, useClientKpis, useClientTypes, useOnboardingByClient, useUpdateClient } from "../lib/queries";
import {
  CLIENT_STATUSES,
  GOAL_LABEL,
  KPI_UNIT_LABEL,
  STATUS_LABEL,
  type Client,
  type CustomFieldValue,
  type FieldDefinition,
} from "../lib/types";

// Tab panels load on first open.
const DocumentsPanel = lazy(() =>
  import("../components/documents/DocumentsPanel").then((m) => ({ default: m.DocumentsPanel })),
);
const ProgressPanel = lazy(() =>
  import("../components/reports/ProgressPanel").then((m) => ({ default: m.ProgressPanel })),
);
const WorkLogPanel = lazy(() =>
  import("../components/worklog/WorkLogPanel").then((m) => ({ default: m.WorkLogPanel })),
);
const FinancePanel = lazy(() =>
  import("../components/finance/FinancePanel").then((m) => ({ default: m.FinancePanel })),
);
const tabFallback = <SkeletonBlock className="h-64 rounded-[20px]" />;

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "onboarding", label: "Onboarding" },
  { value: "documents", label: "Documents" },
  { value: "progress", label: "Progress" },
  { value: "worklog", label: "Work log" },
  { value: "finance", label: "Finance" },
] as const;

/** Kenyan local numbers (07…, 01…) become 2547…/2541… for wa.me links. */
function whatsappLink(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) digits = `254${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function externalUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function renderCustomValue(def: FieldDefinition | undefined, value: CustomFieldValue): ReactNode {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return "—";
  if (Array.isArray(value)) return value.join(", ");
  switch (def?.type) {
    case "currency":
      return <KesTicker value={Number(value)} />;
    case "percent":
      return `${value}%`;
    case "url":
      return (
        <a href={externalUrl(String(value))} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          {String(value)}
        </a>
      );
    default:
      return <span className="whitespace-pre-wrap">{String(value)}</span>;
  }
}

function OverviewTab({ client }: { client: Client }) {
  const types = useClientTypes();
  const kpis = useClientKpis(client.id);
  const type = types.data?.find((t) => t.id === client.client_type_id);
  const defs = type?.field_definitions ?? [];
  // Values saved under a field that was later removed from the type still show.
  const orphanKeys = Object.keys(client.custom_fields ?? {}).filter((k) => !defs.some((d) => d.key === k));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <BlurFade>
        <Section title="Contact">
          <dl>
            <Row label="Contact person">{client.contact_person || "—"}</Row>
            <Row label="Email">
              {client.email ? (
                <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                  {client.email}
                </a>
              ) : (
                "—"
              )}
            </Row>
            <Row label="Phone / WhatsApp">
              {client.phone ? (
                <span className="flex flex-wrap items-center gap-x-3">
                  <a href={`tel:${client.phone}`} className="hover:underline">
                    {client.phone}
                  </a>
                  <a
                    href={whatsappLink(client.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    WhatsApp
                  </a>
                </span>
              ) : (
                "—"
              )}
            </Row>
            <Row label="Website">
              {client.website ? (
                <a
                  href={externalUrl(client.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {client.website.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                "—"
              )}
            </Row>
            <Row label="Industry">{client.industry || "—"}</Row>
          </dl>
        </Section>
      </BlurFade>
      <BlurFade delay={0.04}>
        <Section title="Engagement">
          <dl>
            <Row label="Status">
              <StatusBadge status={client.status} />
            </Row>
            <Row label="Works as">
              <span className="flex flex-wrap items-center gap-2">
                <EngagementBadge type={client.engagement_type} />
                <span className="text-sm text-muted-foreground">
                  {ENGAGEMENT[client.engagement_type ?? "retainer"].description}
                </span>
              </span>
            </Row>
            <Row label="Start date">{formatDate(client.start_date)}</Row>
            {client.engagement_type && client.engagement_type !== "retainer" && (
              <Row label={ENGAGEMENT[client.engagement_type].endLabel}>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {formatDate(client.end_date)}
                  {durationLabel(client.start_date, client.end_date) && (
                    <span className="text-sm text-muted-foreground">
                      {durationLabel(client.start_date, client.end_date)} in total
                    </span>
                  )}
                  <TimeLeft client={client} />
                </span>
              </Row>
            )}
            <Row label={feeOf(client).label}>
              <KesTicker value={feeOf(client).amount} />
            </Row>
            <Row label="Main goal">{client.main_goal ? GOAL_LABEL[client.main_goal] : "—"}</Row>
            <Row label="Services">
              {client.services.length ? (
                <span className="flex flex-wrap gap-1.5">
                  {client.services.map((s) => (
                    <span key={s} className="rounded-full bg-tint px-2.5 py-0.5 text-xs font-medium text-on-tint">
                      {s}
                    </span>
                  ))}
                </span>
              ) : (
                "—"
              )}
            </Row>
          </dl>
        </Section>
      </BlurFade>
      <BlurFade delay={0.08}>
        <Section title={type ? `${type.name} details` : "Details"}>
          {defs.length === 0 && orphanKeys.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">
              {type ? "This client type has no extra fields." : "Pick a client type to get tailored fields."}
            </p>
          ) : (
            <dl>
              {defs.map((def) => (
                <Row key={def.key} label={def.label}>
                  {renderCustomValue(def, client.custom_fields?.[def.key] ?? null)}
                </Row>
              ))}
              {orphanKeys.map((key) => (
                <Row key={key} label={key.replace(/_/g, " ")}>
                  {renderCustomValue(undefined, client.custom_fields[key] ?? null)}
                </Row>
              ))}
            </dl>
          )}
        </Section>
      </BlurFade>
      <BlurFade delay={0.12}>
        <Section title="Key KPIs">
          {kpis.isLoading ? (
            <div className="p-5">
              <SkeletonBlock className="h-10" />
            </div>
          ) : !kpis.data?.length ? (
            <EmptyState
              icon={Target}
              title="No KPIs yet"
              description="Choose the metrics you'll report on. Progress charts will use them."
              className="py-8"
            />
          ) : (
            <ul>
              {kpis.data.map((kpi) => (
                <li
                  key={kpi.id}
                  className="flex items-center justify-between border-b border-border/60 px-5 py-3 last:border-b-0"
                >
                  <span className="text-[0.9375rem]">{kpi.name}</span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                    {KPI_UNIT_LABEL[kpi.unit]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </BlurFade>
      {client.notes && (
        <Section title="Notes" className="lg:col-span-2">
          <p className="whitespace-pre-wrap px-5 py-4 text-[0.9375rem]">{client.notes}</p>
        </Section>
      )}
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { data: client, isLoading } = useClient(id);
  const types = useClientTypes();
  const onboarding = useOnboardingByClient();
  const updateClient = useUpdateClient();

  const tab = TABS.some((t) => t.value === params.get("tab")) ? params.get("tab")! : "overview";
  const items = id ? onboarding.itemsFor(id) : [];
  const progress = id ? onboarding.progressFor(id) : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-16 w-72" />
        <SkeletonBlock className="h-64 rounded-[20px]" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="hub-card">
        <EmptyState
          icon={UserX}
          title="Client not found"
          description="It may have been removed."
          action={
            <Button asChild variant="secondary" size="sm" className="rounded-full">
              <Link to="/hub/clients">Back to clients</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const typeName = types.data?.find((t) => t.id === client.client_type_id)?.name;

  const patch = (p: Partial<Pick<Client, "status" | "archived_at">>, message: string) =>
    updateClient.mutate(
      { id: client.id, patch: p },
      { onSuccess: () => toast.success(message), onError: (e) => toast.error(e.message) },
    );

  return (
    <>
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/hub/clients"))}
        className="-ml-1 mb-4 flex items-center gap-0.5 text-sm text-primary transition-opacity duration-150 hover:opacity-80"
      >
        <ChevronLeft className="h-4 w-4" /> Clients
      </button>

      {client.archived_at && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm">
          <Archive className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-muted-foreground">Archived on {formatDate(client.archived_at)}.</span>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full"
            onClick={() => patch({ archived_at: null }, "Client restored")}
          >
            <ArchiveRestore className="mr-1.5 h-4 w-4" /> Restore
          </Button>
        </div>
      )}

      <BlurFade>
        <header className="mb-6 flex flex-col gap-5 md:mb-8 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <ClientAvatar name={client.name} className="h-14 w-14 rounded-2xl text-lg" />
            <div className="min-w-0">
              <h1 className="truncate text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.125rem]">
                {client.name}
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                {[client.business_name !== client.name && client.business_name, typeName].filter(Boolean).join(" · ") ||
                  "No type"}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <EngagementBadge type={client.engagement_type} />
                <TimeLeft client={client} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {client.engagement_type === "project" && client.status !== "ended" && !client.archived_at && (
              <Button
                className="rounded-full"
                onClick={() => patch({ status: "ended" }, "Project marked done. Nice work.")}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark project done
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-full transition-opacity duration-150 hover:opacity-80"
                  aria-label="Change status"
                >
                  <StatusBadge status={client.status} className="py-1" />
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {CLIENT_STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    disabled={s === client.status}
                    onSelect={() => patch({ status: s }, `Status changed to ${STATUS_LABEL[s]}`)}
                    className="rounded-lg"
                  >
                    {STATUS_LABEL[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild variant="secondary" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <Link to={`/hub/clients/${client.id}/present`} title="A clean full-screen view for client meetings">
                <Presentation className="mr-1.5 h-4 w-4" /> Present
              </Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full">
              <Link to={`/hub/clients/${client.id}/edit`}>
                <Pencil className="mr-1.5 h-4 w-4" /> Edit
              </Link>
            </Button>
            {!client.archived_at && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="rounded-full text-muted-foreground">
                    <Archive className="mr-1.5 h-4 w-4" /> Archive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archive {client.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      They'll be hidden from your lists and dashboard. Nothing is deleted, and you can restore them any
                      time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-full"
                      onClick={() => patch({ archived_at: new Date().toISOString() }, `${client.name} archived`)}
                    >
                      Archive
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </header>
      </BlurFade>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          const next = new URLSearchParams(params);
          if (v === "overview") next.delete("tab");
          else next.set("tab", v);
          setParams(next, { replace: true });
        }}
      >
        <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="h-auto rounded-xl bg-secondary p-1">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-lg px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-hub"
              >
                {t.label}
                {t.value === "onboarding" && progress && progress.total > 0 && (
                  <span className="hub-tabular ml-1.5 text-xs text-muted-foreground">
                    {progress.done}/{progress.total}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <OverviewTab client={client} />
        </TabsContent>
        <TabsContent value="onboarding" className="mt-0">
          {onboarding.isLoading ? (
            <SkeletonBlock className="h-64 rounded-[20px]" />
          ) : (
            <div className="max-w-3xl">
              <OnboardingChecklist client={client} items={items} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="documents" className="mt-0">
          <Suspense fallback={tabFallback}>
            <DocumentsPanel clientId={client.id} />
          </Suspense>
        </TabsContent>
        <TabsContent value="progress" className="mt-0">
          <Suspense fallback={tabFallback}>
            <ProgressPanel clientId={client.id} />
          </Suspense>
        </TabsContent>
        <TabsContent value="worklog" className="mt-0">
          <Suspense fallback={tabFallback}>
            <div className="max-w-3xl">
              <WorkLogPanel clientId={client.id} />
            </div>
          </Suspense>
        </TabsContent>
        <TabsContent value="finance" className="mt-0">
          <Suspense fallback={tabFallback}>
            <FinancePanel clientId={client.id} />
          </Suspense>
        </TabsContent>
      </Tabs>

      {progress && progress.total > 0 && tab === "overview" && (
        <button
          type="button"
          onClick={() => setParams({ tab: "onboarding" }, { replace: true })}
          className="hub-card hub-card-interactive mt-6 block w-full p-5 text-left"
        >
          <p className="mb-3 text-sm font-medium">Onboarding</p>
          <ProgressBar done={progress.done} total={progress.total} />
        </button>
      )}
    </>
  );
}
