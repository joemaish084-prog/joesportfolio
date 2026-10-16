import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ExternalLink, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OnboardingChecklist } from "../components/OnboardingChecklist";
import { BlurFade } from "../components/motion/blur-fade";
import { SpotlightCard } from "../components/motion/spotlight-card";
import { ClientAvatar, EmptyState, PageHeader, ProgressBar, SkeletonBlock, StatusBadge } from "../components/ui";
import { useClients, useOnboardingByClient, type OnboardingProgress } from "../lib/queries";
import type { Client, OnboardingItem } from "../lib/types";

function ClientOnboardingCard({
  client,
  progress,
  items,
  open,
  onToggle,
}: {
  client: Client;
  progress: OnboardingProgress;
  items: OnboardingItem[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div role="listitem">
      <SpotlightCard className="hub-card">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full flex-col gap-4 p-5 text-left sm:flex-row sm:items-center"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ClientAvatar name={client.name} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{client.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {progress.next ? `Next: ${progress.next.title}` : progress.total ? "All steps done" : "No steps yet"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:w-80">
            <div className="flex-1">
              <ProgressBar done={progress.done} total={progress.total} />
              {progress.overdue > 0 && (
                <p className="mt-1 text-xs font-medium text-warning">
                  {progress.overdue} overdue {progress.overdue === 1 ? "step" : "steps"}
                </p>
              )}
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </div>
        </button>
        {open && (
          <div className="border-t border-border/60 bg-background/50 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <StatusBadge status={client.status} />
              <Link
                to={`/hub/clients/${client.id}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Open client <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            <OnboardingChecklist client={client} items={items} />
          </div>
        )}
      </SpotlightCard>
    </div>
  );
}

export default function OnboardingPage() {
  const clients = useClients();
  const onboarding = useOnboardingByClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);

  const { progressFor } = onboarding;
  const { inProgress, done } = useMemo(() => {
    const live = (clients.data ?? []).filter((c) => !c.archived_at && c.status !== "ended");
    const rows = live.map((client) => ({ client, progress: progressFor(client.id) }));
    const isComplete = (p: OnboardingProgress) => p.total > 0 && p.done === p.total;
    const inProgress = rows
      .filter(
        ({ client, progress }) =>
          !isComplete(progress) &&
          (progress.total > 0 || client.status === "onboarding" || client.status === "prospect"),
      )
      .sort(
        (a, b) =>
          b.progress.overdue - a.progress.overdue ||
          a.progress.done / Math.max(a.progress.total, 1) - b.progress.done / Math.max(b.progress.total, 1),
      );
    return { inProgress, done: rows.filter(({ progress }) => isComplete(progress)) };
  }, [clients.data, progressFor]);

  const loading = clients.isLoading || onboarding.isLoading;

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Onboarding"
          subtitle={
            loading ? " " : `${inProgress.length} ${inProgress.length === 1 ? "client" : "clients"} in progress`
          }
        />
      </BlurFade>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-24 rounded-[20px]" />
          ))}
        </div>
      ) : inProgress.length === 0 ? (
        <div className="hub-card">
          <EmptyState
            icon={ListChecks}
            title="Nobody is onboarding right now"
            description="New clients get a checklist automatically from your template."
            action={
              <Button asChild size="sm" className="rounded-full">
                <Link to="/hub/clients/new">Add a client</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div role="list" className="space-y-3">
          {inProgress.map(({ client, progress }, index) => (
            <BlurFade key={client.id} delay={0.05 + Math.min(index, 8) * 0.03}>
              <ClientOnboardingCard
                key={client.id}
                client={client}
                progress={progress}
                items={onboarding.itemsFor(client.id)}
                open={openId === client.id}
                onToggle={() => setOpenId((id) => (id === client.id ? null : client.id))}
              />
            </BlurFade>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="mt-10">
          <button
            type="button"
            onClick={() => setShowDone((s) => !s)}
            className="hub-section-title flex items-center gap-1 hover:text-foreground"
            aria-expanded={showDone}
          >
            Completed ({done.length})
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showDone && "rotate-180")} />
          </button>
          {showDone && (
            <div role="list" className="space-y-3">
              {done.map(({ client, progress }) => (
                <ClientOnboardingCard
                  key={client.id}
                  client={client}
                  progress={progress}
                  items={onboarding.itemsFor(client.id)}
                  open={openId === client.id}
                  onToggle={() => setOpenId((id) => (id === client.id ? null : client.id))}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
