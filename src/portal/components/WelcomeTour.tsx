import { useEffect, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Download, LifeBuoy, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePortal } from "../auth/PortalData";

// A short first-visit tour so nobody has to work the portal out alone. It
// shows once per person per browser and can be reopened from Help.

export const TOUR_EVENT = "portal:open-tour";

const key = (clientId: string) => `portal:tour:${clientId}`;

export function WelcomeTour() {
  const { client, me, settings } = usePortal();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (me.preview) return;
    try {
      if (!localStorage.getItem(key(client.id))) setOpen(true);
    } catch {
      // Storage blocked: skip the automatic tour.
    }
  }, [client.id, me.preview]);

  useEffect(() => {
    const show = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(TOUR_EVENT, show);
    return () => window.removeEventListener(TOUR_EVENT, show);
  }, []);

  const first = (me.full_name || client.contact_person || "").split(" ")[0];
  const steps = [
    {
      icon: Sparkles,
      title: first ? `Welcome, ${first}` : "Welcome",
      text: settings.welcome_message || "This is your private space. Everything we do together lives here, updated as it happens.",
    },
    {
      icon: BarChart3,
      title: "Your numbers, made simple",
      text: "The overview shows how you're doing at a glance. Open Performance for charts, and switch the date range to look further back.",
    },
    {
      icon: Download,
      title: "Take anything with you",
      text: "Every report, table and invoice can be downloaded as a PDF or an Excel file. Look for the Download button.",
    },
    {
      icon: LifeBuoy,
      title: "Never stuck",
      text: "Press Ctrl/⌘ + K to jump to any page, and use Help to ask a question or request something. We read every message.",
    },
  ];
  const s = steps[step]!;
  const last = step === steps.length - 1;

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(key(client.id), "1");
    } catch {
      // Will show again next time; harmless.
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent className="portal-scope max-w-md overflow-hidden rounded-3xl border-border bg-card p-0">
        <div className="relative px-7 pb-6 pt-9 text-center">
          <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
          <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#ff9a4d] text-white shadow-portal-lg">
            <s.icon className="h-7 w-7" />
          </span>
          <DialogTitle className="portal-display relative mt-5 text-2xl font-bold">{s.title}</DialogTitle>
          <DialogDescription className="relative mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{s.text}</DialogDescription>
        </div>
        <div className="flex items-center justify-between border-t border-border/70 px-5 py-4">
          <div className="flex gap-1.5" aria-hidden>
            {steps.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-primary" : "w-1.5 bg-border")} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="rounded-xl">
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={close} className="rounded-xl text-muted-foreground">
                Skip
              </Button>
            )}
            <Button size="sm" onClick={() => (last ? close() : setStep(step + 1))} className="rounded-xl">
              {last ? "Get started" : "Next"}
              {!last && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
