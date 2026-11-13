import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns";
import {
  AlertTriangle,
  BarChart3,
  Banknote,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Filter,
  FlaskConical,
  FolderUp,
  ListChecks,
  NotebookPen,
  Plus,
  Receipt,
  Rocket,
  FileSignature,
  SquareKanban,
  Target,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AnimatedList } from "../components/motion/animated-list";
import { BlurFade } from "../components/motion/blur-fade";
import { Ring, Sparkline, StageColumns } from "../components/overview/visuals";
import { BusinessSnapshot } from "../components/overview/BusinessSnapshot";
import { KesTicker, NumberTicker } from "../components/motion/number-ticker";
import { SpotlightCard } from "../components/motion/spotlight-card";
import { PrivacyToggle, PrivateBlur } from "../components/privacy";
import { ClientAvatar, EmptyState, ProgressBar, SkeletonBlock, StatusBadge } from "../components/ui";
import { useRows } from "../lib/data";
import { invoiceState, paidByInvoice, sumAmounts } from "../lib/finance";
import { change, inRange, previousRange } from "../lib/financeStats";
import { formatDate, greeting, isOverdue } from "../lib/format";
import {
  buildActivity,
  buildAgenda,
  moneyInByMonth,
  type ActivityKind,
  type AgendaItem,
  type AgendaKind,
} from "../lib/overview";
import { useKes } from "../lib/privacy";
import { useClients, useClientTypes, useOnboardingByClient } from "../lib/queries";
import { billsMonthly } from "../lib/engagement";
import { useSettings } from "../lib/settings";
import { pctChange, useSiteAnalytics } from "../lib/website";
import { LEAD_STAGE_LABEL, STATUS_LABEL, type ClientStatus, type LeadStage } from "../lib/types";
import { useHubAuth } from "../auth/HubAuthProvider";

function MetricCard({ title, value, hint, to, icon: Icon, aside, loading }: {
  title: string;
  value: ReactNode;
  hint: string;
  to: string;
  icon: LucideIcon;
  aside?: ReactNode;
  loading?: boolean;
}) {
  return (
    <Link to={to} className="hub-card hub-card-interactive group flex min-w-0 flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{title}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-primary" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        {loading ? <SkeletonBlock className="h-9 w-24" /> : <div className="hub-tabular min-w-0 text-2xl font-bold tracking-tight md:text-3xl">{value}</div>}
        {!loading && aside}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </Link>
  );
}

function Card({
  title,
  hint,
  action,
  children,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("hub-card flex min-w-0 flex-col p-5", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold leading-snug">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

const QUICK_ACTIONS: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "New task", to: "/hub/tasks?new=task", icon: SquareKanban },
  { label: "New client", to: "/hub/clients/new", icon: UserPlus },
  { label: "New invoice", to: "/hub/finance?new=invoice", icon: FileText },
  { label: "Record payment", to: "/hub/finance?new=payment", icon: Banknote },
  { label: "Add expense", to: "/hub/finance?new=expense", icon: Receipt },
  { label: "New lead", to: "/hub/pipeline?new=lead", icon: Target },
  { label: "Upload document", to: "/hub/documents?new=upload", icon: FolderUp },
  { label: "New report", to: "/hub/reports?new=report", icon: BarChart3 },
];

const AGENDA_ICON: Record<AgendaKind, LucideIcon> = {
  step: ListChecks,
  invoice: FileText,
  followup: Target,
  report: BarChart3,
  deadline: Rocket,
  contract: FileSignature,
  trial: FlaskConical,
};

const ACTIVITY_ICON: Record<ActivityKind, LucideIcon> = {
  payment: Banknote,
  invoice: FileText,
  work: NotebookPen,
  document: FolderUp,
  lead: Target,
  client: UserPlus,
  report: BarChart3,
  step: CheckCircle2,
};

function dayLabel(date: string | null) {
  if (!date) return "To do";
  const d = parseISO(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE d MMM");
}

// ---------------------------------------------------------------- page

export default function OverviewPage() {
  const { displayName, status } = useHubAuth();
  const clients = useClients();
  const types = useClientTypes();
  const onboarding = useOnboardingByClient();
  const invoices = useRows("invoices", "issue_date");
  const payments = useRows("payments", "paid_on");
  const leads = useRows("leads", "position", true);
  const reports = useRows("reports", "period_end");
  const work = useRows("work_log", "worked_on");
  const documents = useRows("documents");
  const kes = useKes();
  const { settings } = useSettings();

  const live = useMemo(() => (clients.data ?? []).filter((c) => !c.archived_at), [clients.data]);
  const typeName = useMemo(() => new Map((types.data ?? []).map((t) => [t.id, t.name])), [types.data]);
  const nameOf = useMemo(() => new Map(live.map((c) => [c.id, c.name])), [live]);
  const clientName = (id: string) => nameOf.get(id) ?? "Client";

  const ready = !!clients.data && !!onboarding.data;
  const financeReady = !!invoices.data && !!payments.data;

  // ---- headline numbers
  const stats = useMemo(() => {
    if (!clients.data || !onboarding.data) return null;
    const liveIds = new Set(live.map((c) => c.id));
    const openItems = onboarding.data.filter((i) => liveIds.has(i.client_id) && !i.is_done);
    const active = live.filter((c) => c.status === "active");
    const allItems = onboarding.data.filter((i) => liveIds.has(i.client_id));
    return {
      active: active.length,
      activeNames: active.map((c) => c.name),
      stepsDone: allItems.length - openItems.length,
      stepsTotal: allItems.length,
      // Monthly income only: retainers and contracts still in term. Projects are one-off.
      retainer: active.filter((c) => billsMonthly(c)).reduce((sum, c) => sum + Number(c.monthly_fee ?? 0), 0),
      projects: live.filter((c) => c.engagement_type === "project" && c.status !== "ended").length,
      onboarding: live.filter((c) => c.status === "onboarding").length,
      openTasks: openItems.length,
      overdueSteps: openItems
        .filter((i) => isOverdue(i.due_date, i.is_done))
        .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? "")),
    };
  }, [clients.data, onboarding.data, live]);

  const money = useMemo(() => {
    if (!payments.data) return null;
    const now = new Date();
    const monthKey = format(now, "yyyy-MM");
    const thisMonth = sumAmounts(payments.data.filter((p) => p.paid_on.startsWith(monthKey)));
    const prev = previousRange("this_month", now);
    const before = sumAmounts(payments.data.filter((p) => inRange(p.paid_on, prev)));
    return { thisMonth, delta: change(thisMonth, before), series: moneyInByMonth(payments.data) };
  }, [payments.data]);

  const pipeline = useMemo(() => {
    if (!leads.data) return null;
    const openStages: LeadStage[] = ["new", "contacted", "meeting", "proposal"];
    const open = leads.data.filter((l) => !l.archived_at && openStages.includes(l.stage));
    return {
      value: open.reduce((s, l) => s + Number(l.estimated_value ?? 0), 0),
      count: open.length,
      stages: openStages.map((s) => {
        const rows = open.filter((l) => l.stage === s);
        return { stage: s, count: rows.length, value: rows.reduce((t, l) => t + Number(l.estimated_value ?? 0), 0) };
      }),
      wonThisMonth: leads.data.filter(
        (l) => l.stage === "won" && l.updated_at.startsWith(format(new Date(), "yyyy-MM")),
      ).length,
    };
  }, [leads.data]);

  // ---- late things (Needs attention)
  const attentionItems = useMemo(() => {
    if (!stats || !invoices.data || !payments.data || !leads.data) return null;
    const paid = paidByInvoice(payments.data);
    const today = format(new Date(), "yyyy-MM-dd");
    const items: { id: string; title: string; detail: string; to: string; date: string }[] = [
      ...stats.overdueSteps.map((i) => ({
        id: i.id,
        title: i.title,
        detail: `${clientName(i.client_id)} · due ${formatDate(i.due_date, "d MMM")}`,
        to: `/hub/clients/${i.client_id}?tab=onboarding`,
        date: i.due_date ?? "",
      })),
      ...invoices.data
        .filter((i) => invoiceState(i, paid.get(i.id) ?? 0) === "overdue")
        .map((i) => ({
          id: i.id,
          title: `${i.number} overdue`,
          detail: `${clientName(i.client_id)} · ${kes(Number(i.amount) - (paid.get(i.id) ?? 0))}`,
          to: `/hub/finance/invoices/${i.id}`,
          date: i.due_date ?? "",
        })),
      ...leads.data
        .filter(
          (l) =>
            !l.archived_at &&
            ["new", "contacted", "meeting", "proposal"].includes(l.stage) &&
            l.next_follow_up &&
            l.next_follow_up < today,
        )
        .map((l) => ({
          id: l.id,
          title: `Follow up with ${l.name}`,
          detail: `Lead · was due ${formatDate(l.next_follow_up, "d MMM")}`,
          to: "/hub/pipeline",
          date: l.next_follow_up ?? "",
        })),
      // Projects past their deadline and not marked done.
      ...live
        .filter((c) => c.engagement_type === "project" && c.status !== "ended" && c.end_date && c.end_date < today)
        .map((c) => ({
          id: `deadline-${c.id}`,
          title: `${c.name} project is past its deadline`,
          detail: `Was due ${formatDate(c.end_date, "d MMM")} · mark it done or move the date`,
          to: `/hub/clients/${c.id}`,
          date: c.end_date ?? "",
        })),
      // Trials that have run out without a decision.
      ...live
        .filter((c) => c.engagement_type === "trial" && c.status !== "ended" && c.end_date && c.end_date < today)
        .map((c) => ({
          id: `trial-${c.id}`,
          title: `${c.name} trial has ended`,
          detail: `Ended ${formatDate(c.end_date, "d MMM")} · convert them, or end the trial`,
          to: `/hub/clients/${c.id}`,
          date: c.end_date ?? "",
        })),
    ];
    return items.sort((a, b) => a.date.localeCompare(b.date));
    // clientName reads `live`, a dependency through stats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, invoices.data, payments.data, leads.data, kes]);
  const attention = attentionItems?.length ?? 0;

  // ---- upcoming + recent
  const agenda = useMemo(
    () =>
      clients.data && onboarding.data && invoices.data && payments.data && leads.data && reports.data
        ? buildAgenda({
            clients: clients.data,
            items: onboarding.data,
            invoices: invoices.data,
            payments: payments.data,
            leads: leads.data,
            reports: reports.data,
          })
        : null,
    [clients.data, onboarding.data, invoices.data, payments.data, leads.data, reports.data],
  );

  const activity = useMemo(
    () =>
      buildActivity({
        clients: clients.data ?? [],
        items: onboarding.data ?? [],
        invoices: invoices.data ?? [],
        payments: payments.data ?? [],
        leads: leads.data ?? [],
        reports: reports.data ?? [],
        work: work.data ?? [],
        documents: documents.data ?? [],
      }),
    [clients.data, onboarding.data, invoices.data, payments.data, leads.data, reports.data, work.data, documents.data],
  );

  const statusMix = useMemo(() => {
    const order: ClientStatus[] = ["active", "onboarding", "prospect", "paused"];
    const counts = order.map((s) => ({ status: s, count: live.filter((c) => c.status === s).length }));
    return { counts, max: Math.max(1, ...counts.map((c) => c.count)) };
  }, [live]);

  const loadError = clients.error ?? onboarding.error ?? invoices.error ?? payments.error ?? leads.error ?? reports.error;
  const dueToday = agenda?.today.length ?? 0;

  // One line under the greeting that says what the day looks like.
  const summary = !agenda || !attentionItems
    ? null
    : attention === 0 && dueToday === 0
      ? "Nothing late and nothing due today."
      : [
          attention ? `${attention} ${attention === 1 ? "thing needs" : "things need"} attention` : null,
          dueToday ? `${dueToday} due today` : null,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <>
      <BlurFade>
        <header className="relative mb-6 md:mb-8">
          {/* A soft warm glow behind the greeting. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-24 -z-10 h-56 w-full max-w-xl rounded-full bg-primary/10 blur-3xl dark:bg-primary/[0.07]"
          />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.125rem]">
                {greeting()}, {displayName.split(/\s+/)[0]}
              </h1>
              <p className="mt-1 text-[0.9375rem] text-muted-foreground">
                {format(new Date(), "EEEE, d MMMM")}
                {summary && (
                  <>
                    {" · "}
                    <span className={cn(attention ? "font-medium text-warning" : "text-foreground")}>{summary}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 items-center gap-2 rounded-xl bg-secondary px-3 text-xs font-medium"><CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />{format(new Date(), "MMMM yyyy")}</span>
              <PrivacyToggle className="h-9 px-3 text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-9 rounded-full px-3"><MoreHorizontal className="mr-1.5 h-4 w-4" />More</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl">
                  {QUICK_ACTIONS.slice(2).map(({ label, to, icon: Icon }) => (
                    <DropdownMenuItem key={to} asChild><Link to={to}><Icon className="mr-2 h-4 w-4" />{label}</Link></DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button asChild variant="secondary" size="sm" className="h-9 rounded-full px-3"><Link to="/hub/clients/new"><UserPlus className="mr-1.5 h-4 w-4" />New client</Link></Button>
              <Button asChild size="sm" className="h-9 rounded-full px-4"><Link to="/hub/tasks?new=task"><Plus className="mr-1.5 h-4 w-4" />New task</Link></Button>
            </div>
          </div>
        </header>
      </BlurFade>

      {loadError && (
        <p className="mb-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn't load your data: {loadError.message}
        </p>
      )}

      <BlurFade delay={0.05}>
        <BusinessSnapshot stats={stats} received={money?.thisMonth ?? null} delta={money?.delta ?? null}
          goal={settings.revenueGoal} daysLeft={differenceInCalendarDays(endOfMonth(new Date()), new Date())}
          month={format(new Date(), "MMMM")} kes={kes} />
      </BlurFade>

      <BlurFade delay={0.08} className="mt-4 grid gap-3 md:grid-cols-3 md:gap-4">
        <MetricCard title="Open tasks" value={<NumberTicker value={stats?.openTasks ?? 0} />} loading={!stats}
          hint={stats ? `${stats.stepsDone} of ${stats.stepsTotal} onboarding steps complete` : "Loading onboarding steps…"}
          to="/hub/onboarding" icon={ListChecks}
          aside={!!stats?.stepsTotal && <Ring value={stats.stepsDone} total={stats.stepsTotal} size={40} />} />
        <MetricCard title="Pipeline" value={<KesTicker value={pipeline?.value} className="text-xl md:text-lg xl:text-2xl" />} loading={!pipeline}
          hint={pipeline ? `${pipeline.count} open ${pipeline.count === 1 ? "lead" : "leads"} · estimated monthly value` : "Loading open leads…"}
          to="/hub/pipeline" icon={Filter}
          aside={!!pipeline?.count && <div className="hidden xl:block"><StageColumns stages={pipeline.stages.map(s => ({ label: LEAD_STAGE_LABEL[s.stage], count: s.count }))} /></div>} />
        <MetricCard title="Due today" value={<NumberTicker value={dueToday} />} loading={!agenda}
          hint={agenda ? dueToday ? "Your next steps are in the agenda below" : "Nothing scheduled for today" : "Checking your agenda…"}
          to="/hub/calendar" icon={CalendarCheck2} />
      </BlurFade>

      {/* ---- agenda + money + pipeline */}
      <BlurFade delay={0.1} className="mt-6 grid items-start gap-4 lg:grid-cols-3">
        <Card
          title="Coming up"
          hint="What's due in the next 30 days. Late items are in Needs attention."
          className="lg:col-span-2"
        >
          {!agenda ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <SkeletonBlock key={i} className="h-11" />
              ))}
            </div>
          ) : agenda.today.length + agenda.week.length + agenda.later.length + agenda.todo.length === 0 ? (
            <EmptyState
              icon={CalendarCheck2}
              title="A clear calendar"
              description="Add due dates to onboarding steps, invoices and lead follow-ups and they'll show up here."
              className="py-8"
            />
          ) : (
            <div className="space-y-5">
              {(
                [
                  ["Today", agenda.today],
                  ["This week", agenda.week],
                  ["Later this month", agenda.later],
                  ["To do", agenda.todo],
                ] as const
              ).map(([label, list]) =>
                list.length ? (
                  <div key={label}>
                    <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      {label}
                      <span className="hub-tabular rounded-full bg-secondary px-1.5 font-medium">{list.length}</span>
                    </p>
                    <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60">
                      {list.slice(0, label === "To do" ? 4 : 6).map((item) => (
                        <AgendaRow key={item.id} item={item} kes={kes} highlight={label === "Today"} />
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </div>
          )}
        </Card>

        <Card title="Needs attention" hint="Late work, overdue invoices and missed follow-ups."
          action={attentionItems && <span className={cn("hub-tabular rounded-full px-2 py-0.5 text-xs font-semibold", attention ? "bg-warning-soft text-warning" : "bg-tint text-on-tint")}>{attention}</span>}>
          {!attentionItems ? <SkeletonBlock className="h-24" /> : attention === 0 ? (
            <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><p className="text-sm font-medium">You're all caught up</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">No overdue items. Keep things moving with your upcoming work.</p></div>
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-border/60">
              {attentionItems.map(item => (
                <li key={item.id}><Link to={item.to} className="group flex items-start gap-2.5 rounded-xl px-2 py-3 hover:bg-secondary/60">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span></span>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" />
                </Link></li>
              ))}
            </ul>
          )}
        </Card>

      </BlurFade>

      <BlurFade delay={0.12} className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card
          title="Money in"
          hint="Payments received, last 6 months."
          action={
            <Link to="/hub/finance" className="text-xs font-medium text-primary hover:underline">
              Details
            </Link>
          }
        >
          {!financeReady || !money ? (
            <SkeletonBlock className="h-32" />
          ) : money.series.every((m) => m.amount === 0) ? (
            <p className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
              No payments recorded yet.
            </p>
          ) : (
            <PrivateBlur>
              <MiniBars data={money.series} kes={kes} />
            </PrivateBlur>
          )}
        </Card>

        <Card
          title="Pipeline"
          hint="Open leads by stage."
          action={
            <Link to="/hub/pipeline" className="text-xs font-medium text-primary hover:underline">
              Open
            </Link>
          }
        >
          {!pipeline ? (
            <SkeletonBlock className="h-32" />
          ) : pipeline.count === 0 ? (
            <p className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
              No open leads.
            </p>
          ) : (
            <Funnel stages={pipeline.stages} wonThisMonth={pipeline.wonThisMonth} kes={kes} />
          )}
        </Card>
        {status === "admin" && <WebsiteCard />}
      </BlurFade>

      {/* ---- activity + clients */}
      <BlurFade delay={0.15} className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Recent activity" hint="The latest things that happened." className="lg:col-span-2">
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Activity shows up here as you work.</p>
          ) : (
            // Oldest first: Animated List drops each new item on top, so the newest lands first.
            <AnimatedList className="divide-y divide-border/60">
              {[...activity].reverse().map((a) => {
                const Icon = ACTIVITY_ICON[a.kind];
                return (
                  <Link
                    key={a.id}
                    to={a.to}
                    className="flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors duration-150 hover:bg-secondary/60"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tint text-on-tint">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="line-clamp-1">
                        {a.text} {a.subject && <span className="font-medium">{a.subject}</span>}
                        {a.amount !== undefined && (
                          <span className="hub-tabular text-muted-foreground"> · {kes(a.amount)}</span>
                        )}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNowStrict(parseISO(a.at), { addSuffix: true })}
                    </span>
                  </Link>
                );
              })}
            </AnimatedList>
          )}
        </Card>

        <Card
          title="Clients at a glance"
          hint="Where your clients are right now."
          action={
            <Link to="/hub/clients" className="text-xs font-medium text-primary hover:underline">
              All clients
            </Link>
          }
        >
          {!ready ? (
            <SkeletonBlock className="h-40" />
          ) : live.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients yet"
              action={
                <Button asChild size="sm" className="rounded-full">
                  <Link to="/hub/clients/new">
                    <Plus className="mr-1 h-4 w-4" /> Add a client
                  </Link>
                </Button>
              }
              className="py-6"
            />
          ) : (
            <div className="space-y-5">
              <ul className="space-y-2.5">
                {statusMix.counts.map(({ status, count }) => (
                  <li key={status}>
                    <Link to={`/hub/clients?status=${status}`} className="group block">
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <span className="group-hover:text-primary">{STATUS_LABEL[status]}</span>
                        <span className="hub-tabular font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full transition-[width] duration-300"
                          style={{
                            width: `${count ? Math.max(4, (count / statusMix.max) * 100) : 0}%`,
                            background: "var(--chart-in)",
                          }}
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div>
                <p className="mb-1 text-xs font-semibold text-muted-foreground">Newest</p>
                <ul className="-mx-2">
                  {live.slice(0, 3).map((client) => {
                    const progress = onboarding.progressFor(client.id);
                    return (
                      <li key={client.id}>
                        <SpotlightCard className="rounded-xl">
                          <Link to={`/hub/clients/${client.id}`} className="flex items-center gap-3 px-2 py-2">
                            <ClientAvatar name={client.name} className="h-8 w-8 rounded-lg text-xs" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{client.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {(client.client_type_id && typeName.get(client.client_type_id)) || "No type"}
                              </span>
                              {client.status === "onboarding" && progress.total > 0 && (
                                <ProgressBar
                                  done={progress.done}
                                  total={progress.total}
                                  showLabel={false}
                                  className="mt-1"
                                />
                              )}
                            </span>
                            <StatusBadge status={client.status} />
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                          </Link>
                        </SpotlightCard>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </BlurFade>
    </>
  );
}

// ---------------------------------------------------------------- pieces

/** Last 7 days on the website: visitors trend and enquiries. */
function WebsiteCard() {
  const site = useSiteAnalytics(7);
  const data = site.data?.status === "ok" ? site.data.data : null;
  if (site.data?.status === "missing") return null;
  const change = data ? pctChange(data.period.visitors, data.period.prev_visitors) : null;
  return (
    <Card
      title="Website"
      hint="Last 7 days."
      action={
        <Link to="/hub/website" className="text-xs font-medium text-primary hover:underline">
          Details
        </Link>
      }
    >
      {!data ? (
        <SkeletonBlock className="h-24" />
      ) : (
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="hub-tabular text-[2rem] font-bold leading-none tracking-tight">
              {data.period.visitors.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              visitors
              {change !== null && change !== 0 && (
                <span className={cn("ml-1 font-medium", change > 0 ? "text-foreground" : "text-warning")}>
                  {change > 0 ? "+" : "−"}
                  {Math.abs(change)}%
                </span>
              )}
            </p>
            <p className="mt-3 text-sm">
              <span className="font-semibold">{data.period.leads}</span>{" "}
              <span className="text-muted-foreground">{data.period.leads === 1 ? "enquiry" : "enquiries"}</span>
            </p>
          </div>
          {data.visits_by_day.some((d) => d.unique_visitors > 0) && (
            <Sparkline
              values={data.visits_by_day.map((d) => d.unique_visitors)}
              label="Visitors per day, last 7 days"
              isMoney={false}
              className="pb-1"
            />
          )}
        </div>
      )}
    </Card>
  );
}

function AgendaRow({ item, kes, highlight }: { item: AgendaItem; kes: (v: number) => string; highlight?: boolean }) {
  const Icon = AGENDA_ICON[item.kind];
  return (
    <li>
      <Link
        to={item.to}
        className={cn(
          "flex items-center gap-3 px-3.5 py-2.5 transition-colors duration-150 hover:bg-secondary/60",
          highlight && "bg-tint/40",
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{item.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {item.detail}
            {item.amount !== undefined && <span className="hub-tabular"> · {kes(item.amount)}</span>}
          </span>
        </span>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 text-xs",
            highlight ? "font-medium text-on-tint" : "text-muted-foreground",
          )}
        >
          <CalendarClock className="h-3.5 w-3.5" />
          {dayLabel(item.date)}
        </span>
      </Link>
    </li>
  );
}

/** Six slim bars, one colour; this month stands out, earlier months recede. */
function MiniBars({
  data,
  kes,
}: {
  data: { key: string; label: string; amount: number }[];
  kes: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  const last = data[data.length - 1];
  return (
    <div>
      <p className="hub-tabular mb-3 text-sm">
        <span className="text-lg font-bold">{kes(last.amount)}</span>
        <span className="ml-1.5 text-xs text-muted-foreground">this month</span>
      </p>
      <div className="flex h-24 items-end gap-2" role="img" aria-label="Money received per month">
        {data.map((d, i) => (
          <div
            key={d.key}
            className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            title={`${d.label}: ${kes(d.amount)}`}
          >
            <div
              className="w-full max-w-7 rounded-t-[4px] transition-[height] duration-300 group-hover:brightness-110"
              style={{
                height: `${d.amount ? Math.max(4, (d.amount / max) * 100) : 2}%`,
                background: "var(--chart-in)",
                opacity: i === data.length - 1 ? 1 : 0.4,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2">
        {data.map((d, i) => (
          <span
            key={d.key}
            className={cn(
              "flex-1 text-center text-[0.6875rem]",
              i === data.length - 1 ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Lead counts per open stage, as a narrowing funnel. */
function Funnel({
  stages,
  wonThisMonth,
  kes,
}: {
  stages: { stage: LeadStage; count: number; value: number }[];
  wonThisMonth: number;
  kes: (v: number) => string;
}) {
  const max = Math.max(1, ...stages.map((s) => s.count));
  return (
    <div className="space-y-2.5">
      {stages.map((s) => (
        <div key={s.stage} title={`${LEAD_STAGE_LABEL[s.stage]}: ${s.count} · ${kes(s.value)}/mo`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span>{LEAD_STAGE_LABEL[s.stage]}</span>
            <span className="hub-tabular text-muted-foreground">
              <span className="font-medium text-foreground">{s.count}</span>
              {s.value > 0 && ` · ${kes(s.value)}`}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full"
              style={{ width: `${s.count ? Math.max(4, (s.count / max) * 100) : 0}%`, background: "var(--chart-in)" }}
            />
          </div>
        </div>
      ))}
      <p className="pt-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{wonThisMonth}</span> won this month
      </p>
    </div>
  );
}
