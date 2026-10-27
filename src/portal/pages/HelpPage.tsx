import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BarChart3, Check, Compass, Download, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePortal } from "../auth/PortalData";
import { useSendMessage, type MessageInput } from "../lib/api";
import { friendlyDate } from "../lib/format";
import { BlurFade } from "../components/magic/magic";
import { TOUR_EVENT } from "../components/WelcomeTour";
import { PageHeader, Pill } from "../components/ui";

const schema = z.object({
  kind: z.enum(["question", "request", "feedback"]),
  subject: z.string().trim().min(3, "Add a short subject").max(140, "Keep the subject under 140 characters"),
  body: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(4000, "That's too long. Keep it under 4,000 characters"),
});
type Values = z.infer<typeof schema>;

const KINDS = [
  { id: "question", label: "Question", hint: "Ask us anything" },
  { id: "request", label: "Request", hint: "Ask for something new" },
  { id: "feedback", label: "Feedback", hint: "Tell us what you think" },
] as const;

const GUIDE = [
  { icon: BarChart3, title: "Read your results", text: "Overview shows how you're doing. Performance has charts and a month-by-month table, with a date range switch." },
  { icon: Download, title: "Download anything", text: "Use the Download button on any page for a PDF or an Excel file you can share with your team." },
  { icon: Compass, title: "Find things fast", text: "Press Ctrl + K (⌘ + K on Mac) from anywhere to jump straight to a page." },
];

export default function HelpPage() {
  const { messages } = usePortal();
  const send = useSendMessage();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { kind: "question", subject: "", body: "" } });
  const kind = form.watch("kind");
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) =>
    send.mutate(values as MessageInput, {
      onSuccess: () => {
        toast.success("Message sent. We'll get back to you soon.");
        form.reset({ kind: values.kind, subject: "", body: "" });
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Help" title="How can we help?" description="Send us a question or a request. It goes straight to us and we reply by email." />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <BlurFade>
          <form onSubmit={onSubmit} noValidate className="portal-card space-y-5 p-5 md:p-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-muted-foreground">What's this about?</legend>
              <div className="grid grid-cols-3 gap-2">
                {KINDS.map((k) => (
                  <label
                    key={k.id}
                    className={cn(
                      "cursor-pointer rounded-xl border px-3 py-2.5 text-center transition-colors",
                      kind === k.id ? "border-primary/60 bg-tint text-on-tint" : "border-border hover:bg-secondary",
                    )}
                  >
                    <input type="radio" value={k.id} className="sr-only" {...form.register("kind")} />
                    <span className="block text-sm font-semibold">{k.label}</span>
                    <span className="hidden text-[0.6875rem] text-muted-foreground sm:block">{k.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <Label htmlFor="help-subject" className="mb-1.5 block text-sm text-muted-foreground">
                Subject
              </Label>
              <Input id="help-subject" className="h-11 rounded-xl bg-background/60" aria-invalid={!!errors.subject} {...form.register("subject")} />
              {errors.subject && <p className="mt-1.5 text-xs text-destructive">{errors.subject.message}</p>}
            </div>

            <div>
              <Label htmlFor="help-body" className="mb-1.5 block text-sm text-muted-foreground">
                Message
              </Label>
              <Textarea id="help-body" rows={6} className="rounded-xl bg-background/60" aria-invalid={!!errors.body} {...form.register("body")} />
              {errors.body && <p className="mt-1.5 text-xs text-destructive">{errors.body.message}</p>}
            </div>

            <Button type="submit" disabled={send.isPending} className="h-11 rounded-xl px-6">
              {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send message
            </Button>
          </form>
        </BlurFade>

        <div className="space-y-4">
          <BlurFade delay={0.06}>
            <section className="portal-card p-5">
              <h2 className="portal-display font-semibold">Using the portal</h2>
              <ul className="mt-4 space-y-4">
                {GUIDE.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tint text-on-tint">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{title}</span>
                      <span className="text-sm text-muted-foreground">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-5 w-full rounded-xl" onClick={() => window.dispatchEvent(new Event(TOUR_EVENT))}>
                Replay the welcome tour
              </Button>
            </section>
          </BlurFade>

          <BlurFade delay={0.1}>
            <section className="portal-card p-5">
              <h2 className="portal-display font-semibold">Prefer email?</h2>
              <a href="mailto:joemaish084@gmail.com" className="mt-2 flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <Mail className="h-4 w-4" /> joemaish084@gmail.com
              </a>
            </section>
          </BlurFade>
        </div>
      </div>

      {messages.length > 0 && (
        <BlurFade delay={0.12}>
          <section className="portal-card p-5 md:p-6">
            <h2 className="portal-display mb-4 font-semibold">Your messages</h2>
            <ul className="divide-y divide-border/60">
              {messages.map((m) => (
                <li key={m.id} className="flex flex-wrap items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{m.subject}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{m.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{friendlyDate(m.created_at)}</p>
                  </div>
                  <Pill tone={m.status === "done" ? "success" : m.status === "read" ? "accent" : "muted"}>
                    {m.status === "done" ? (
                      <>
                        <Check className="h-3 w-3" /> Answered
                      </>
                    ) : m.status === "read" ? (
                      "Seen"
                    ) : (
                      "Sent"
                    )}
                  </Pill>
                </li>
              ))}
            </ul>
          </section>
        </BlurFade>
      )}
    </div>
  );
}
