import { useMemo, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { AlertTriangle, ChevronRight, ListChecks, Plus, Sparkles, UserCheck, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { ShineBorder } from "@/components/ui/shine-border";
import { cn } from "@/lib/utils";
import { AnimatedList } from "../components/motion/animated-list";
import { BlurFade } from "../components/motion/blur-fade";
import { KesTicker, NumberTicker } from "../components/motion/number-ticker";
import { SpotlightCard } from "../components/motion/spotlight-card";
import {
  ClientAvatar,
  EmptyState,
  PageHeader,
  ProgressBar,
  Section,
  SkeletonBlock,
  StatusBadge,
} from "../components/ui";
import { formatDate, greeting, isOverdue } from "../lib/format";
import { useClients, useClientTypes, useOnboardingByClient } from "../lib/queries";

// The shared BentoCard renders plain <a href> links; route them through the
// router so moving around the hub never reloads the page.
function useRouterLinks() {
  const navigate = useNavigate();
  return (e: MouseEvent<HTMLElement>) => {
    const anchor = (e.target as HTMLElement).closest("a");
    const href = anchor?.getAttribute("href");
    if (!href?.startsWith("/") || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate(href);
  };
}

const bentoCardClass =
  "col-span-1 rounded-[20px] border border-border/70 bg-card shadow-hub [&_h3]:text-base [&_h3]:leading-snug [&_p]:text-xs md:[&_h3]:text-lg md:[&_p]:text-sm [&_svg.h-12]:h-9 [&_svg.h-12]:w-9";

function Stat({ value, warn, delay }: { value: number | undefined; warn?: boolean; delay: number }) {
  return (
    <div className="p-4 pb-0">
      {value === undefined ? (
        <SkeletonBlock className="h-10 w-16" />
      ) : (
        <NumberTicker
          value={value}
          delay={delay}
          className={cn("text-[2.5rem] font-bold leading-none", warn && "text-warning")}
        />
      )}
    </div>
  );
}

export default function OverviewPage() {
  const clients = useClients();
  const types = useClientTypes();
  const onboarding = useOnboardingByClient();
  const routeLinks = useRouterLinks();

  const live = useMemo(() => (clients.data ?? []).filter((c) => !c.archived_at), [clients.data]);
  const typeName = useMemo(() => new Map((types.data ?? []).map((t) => [t.id, t.name])), [types.data]);

  const stats = useMemo(() => {
    if (!clients.data || !onboarding.data) return null;
    const liveIds = new Set(live.map((c) => c.id));
    const openItems = onboarding.data.filter((i) => liveIds.has(i.client_id) && !i.is_done);
    const overdueItems = openItems
      .filter((i) => isOverdue(i.due_date, i.is_done))
      .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));
    const active = live.filter((c) => c.status === "active");
    return {
      active: active.length,
      retainer: active.reduce((sum, c) => sum + (c.monthly_fee ?? 0), 0),
      onboarding: live.filter((c) => c.status === "onboarding").length,
      openTasks: openItems.length,
      attentionClients: new Set(overdueItems.map((i) => i.client_id)).size,
      overdueItems,
    };
  }, [clients.data, onboarding.data, live]);

  const clientName = (id: string) => live.find((c) => c.id === id)?.name ?? "Client";
  // Oldest first: Animated List drops each new item on top, so the newest lands first.
  const recent = live.slice(0, 5).reverse();
  const loading = clients.isLoading || onboarding.isLoading;
  const loadError = clients.error ?? onboarding.error;
  const attention = stats?.attentionClients ?? 0;

  return (
    <>
      <BlurFade>
        <PageHeader
          title={`${greeting()}, Joseph`}
          subtitle={format(new Date(), "EEEE, d MMMM")}
          actions={
            <Button asChild className="rounded-full px-4">
              <Link to="/hub/clients/new">
                <Plus className="mr-1 h-4 w-4" /> New client
              </Link>
            </Button>
          }
        />
      </BlurFade>

      {loadError && (
        <p className="mb-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn't load your data: {loadError.message}
        </p>
      )}

      <BlurFade delay={0.05}>
        <BentoGrid className="auto-rows-[15rem] grid-cols-2 gap-3 md:auto-rows-[15.5rem] md:gap-4 lg:grid-cols-3">
          <BentoCard
            name="Active clients"
            description="Currently retained"
            Icon={UserCheck}
            href="/hub/clients?status=active"
            cta="View active"
            className={bentoCardClass}
            background={<Stat value={stats?.active} delay={0} />}
            onClickCapture={routeLinks}
          />
          <BentoCard
            name="Monthly retainer"
            description="From active clients"
            Icon={Wallet}
            href="/hub/clients?status=active"
            cta="See clients"
            className={bentoCardClass}
            background={
              <div className="p-4 pb-0">
                {stats ? (
                  <KesTicker
                    value={stats.retainer}
                    delay={0.05}
                    className="text-[1.375rem] font-bold leading-none sm:text-[1.75rem] md:text-[2rem]"
                  />
                ) : (
                  <SkeletonBlock className="h-10 w-32" />
                )}
              </div>
            }
            onClickCapture={routeLinks}
          />
          <BentoCard
            name="Onboarding"
            description="Getting set up"
            Icon={Sparkles}
            href="/hub/onboarding"
            cta="Open onboarding"
            className={bentoCardClass}
            background={<Stat value={stats?.onboarding} delay={0.1} />}
            onClickCapture={routeLinks}
          />
          <BentoCard
            name="Open tasks"
            description="Onboarding steps left"
            Icon={ListChecks}
            href="/hub/onboarding"
            cta="Work through them"
            className={bentoCardClass}
            background={<Stat value={stats?.openTasks} delay={0.15} />}
            onClickCapture={routeLinks}
          />
          <BentoCard
            name="Needs attention"
            description={attention ? "Clients with overdue steps" : "Nothing overdue. All caught up."}
            Icon={AlertTriangle}
            href="/hub/onboarding"
            cta="Review onboarding"
            className={cn(bentoCardClass, "col-span-2 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1")}
            background={
              <>
                <ShineBorder
                  borderWidth={1}
                  duration={16}
                  shineColor={["hsl(var(--primary) / 0.45)", "hsl(var(--primary) / 0.15)"]}
                />
                <Stat value={stats?.attentionClients} warn={attention > 0} delay={0.2} />
                {!!stats?.overdueItems.length && (
                  <ul className="relative z-10 mt-4 hidden space-y-1 px-2 lg:block">
                    {stats.overdueItems.slice(0, 3).map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/hub/clients/${item.client_id}?tab=onboarding`}
                          className="flex items-start gap-2.5 rounded-xl px-2 py-1.5 transition-colors duration-150 hover:bg-secondary"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{item.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {clientName(item.client_id)} · due {formatDate(item.due_date, "d MMM")}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            }
            onClickCapture={routeLinks}
          />
        </BentoGrid>
      </BlurFade>

      <BlurFade delay={0.1} className="mt-8">
        <Section
          title="Recent clients"
          action={
            live.length > 0 && (
              <Link to="/hub/clients" className="text-sm font-medium text-primary hover:underline">
                See all
              </Link>
            )
          }
        >
          {loading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <SkeletonBlock key={i} className="h-12" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients yet"
              description="Add your first client to start tracking onboarding and progress."
              action={
                <Button asChild size="sm" className="rounded-full">
                  <Link to="/hub/clients/new">Add a client</Link>
                </Button>
              }
            />
          ) : (
            <AnimatedList className="divide-y divide-border/60">
              {recent.map((client) => {
                const progress = onboarding.progressFor(client.id);
                return (
                  <SpotlightCard key={client.id}>
                    <Link to={`/hub/clients/${client.id}`} className="flex items-center gap-3 px-5 py-3.5">
                      <ClientAvatar name={client.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.9375rem] font-medium">{client.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {(client.client_type_id && typeName.get(client.client_type_id)) || "No type"}
                        </p>
                      </div>
                      <div className="hidden w-32 sm:block">
                        <ProgressBar done={progress.done} total={progress.total} showLabel={false} />
                        <p className="hub-tabular mt-1 text-right text-[0.6875rem] text-muted-foreground">
                          {progress.done}/{progress.total}
                        </p>
                      </div>
                      <StatusBadge status={client.status} />
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    </Link>
                  </SpotlightCard>
                );
              })}
            </AnimatedList>
          )}
        </Section>
      </BlurFade>
    </>
  );
}
