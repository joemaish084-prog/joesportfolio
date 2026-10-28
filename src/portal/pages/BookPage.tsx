import { Suspense, lazy } from "react";
import { CalendarCheck, Clock, ExternalLink, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortal } from "../auth/PortalData";
import { BlurFade } from "../components/magic/magic";
import { ManagerCard } from "../components/people";
import { PageHeader, Skeleton } from "../components/ui";

const CalEmbed = lazy(() => import("../components/CalEmbed"));

// Fallback when no Cal.com link is set: the booking page the main site already uses.
const FALLBACK_URL = "https://calendly.com/joemaish084/30min";

/** "name/strategy-call" from either a handle or a full cal.com URL. */
function calHandle(raw: string | null | undefined) {
  const value = (raw ?? "").trim();
  if (!value) return null;
  return value.replace(/^https?:\/\/(www\.)?cal\.com\//i, "").replace(/^\/+|\/+$/g, "") || null;
}

export default function BookPage() {
  const { settings, me, client } = usePortal();
  const handle = calHandle(settings.call_link) ?? calHandle(import.meta.env.VITE_CAL_LINK as string | undefined);
  const dark = document.documentElement.classList.contains("portal-dark");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Book a call"
        title="Let's talk strategy"
        description="Pick a time that works for you. We'll review your results and plan what's next."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <BlurFade>
          <div className="portal-card min-h-[34rem] overflow-hidden p-2 md:p-3">
            {handle ? (
              <div className="h-[34rem] md:h-[40rem]">
                <Suspense fallback={<Skeleton className="h-full" />}>
                  <CalEmbed
                    calLink={handle}
                    theme={dark ? "dark" : "light"}
                    name={me.full_name || client.contact_person || undefined}
                    email={me.preview ? undefined : (me.email ?? undefined)}
                  />
                </Suspense>
              </div>
            ) : (
              <div className="flex h-full min-h-[30rem] flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#ff9a4d] text-white">
                  <CalendarCheck className="h-7 w-7" />
                </span>
                <h2 className="portal-display text-2xl font-bold">Choose a time</h2>
                <p className="max-w-sm text-sm text-muted-foreground">Our booking page opens in a new tab. Pick any slot and you'll get a calendar invite straight away.</p>
                <Button asChild className="h-11 rounded-xl px-6">
                  <a href={FALLBACK_URL} target="_blank" rel="noopener noreferrer">
                    Open booking page <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </BlurFade>

        <BlurFade delay={0.08} className="space-y-4">
          <ManagerCard />
          <aside className="portal-card space-y-4 p-5">
            <h2 className="portal-display font-semibold">What to expect</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block font-medium">30 minutes</span>
                  <span className="text-muted-foreground">Short, focused and no preparation needed.</span>
                </span>
              </li>
              <li className="flex gap-3">
                <Video className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block font-medium">Online or by phone</span>
                  <span className="text-muted-foreground">You'll get the link in your calendar invite.</span>
                </span>
              </li>
              <li className="flex gap-3">
                <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block font-medium">Your numbers, together</span>
                  <span className="text-muted-foreground">We'll walk through your latest results and agree the next steps.</span>
                </span>
              </li>
            </ul>
          </aside>
        </BlurFade>
      </div>
    </div>
  );
}
