import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, BarChart3, FileDown, KeyRound, Loader2, MailCheck, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePortalAuth } from "../auth/PortalAuthProvider";
import { NairobiSkyline } from "../components/art";
import { BorderBeam, DotPattern } from "../components/magic/magic";
import { ManagerAvatar } from "../components/people";

const emailSchema = z.object({ email: z.string().trim().min(1, "Enter your email").email("That doesn't look like an email") });
const passwordSchema = emailSchema.extend({ password: z.string().min(1, "Enter your password") });
const codeSchema = z.object({ code: z.string().trim().regex(/^\d{6,8}$/, "Enter the 6-digit code from the email") });

type Method = "link" | "password";

const POINTS = [
  { icon: BarChart3, title: "Live results", text: "Your numbers, month by month, in plain English." },
  { icon: FileDown, title: "Reports on demand", text: "Download any report as PDF or Excel in one click." },
  { icon: ShieldCheck, title: "Private to you", text: "Only you and your team can see this space." },
];

export default function LoginPage() {
  const { status, sendLink, verifyCode, signInWithPassword } = usePortalAuth();
  const [method, setMethod] = useState<Method>("link");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const linkForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  });
  const codeForm = useForm<z.infer<typeof codeSchema>>({ resolver: zodResolver(codeSchema), defaultValues: { code: "" } });

  if (status === "signed-in") return <Navigate to="/portal" replace />;

  const onLink = linkForm.handleSubmit(async ({ email }) => {
    setNotice(null);
    const { error } = await sendLink(email);
    if (error) setNotice(error);
    else setSentTo(email);
  });

  const onPassword = passwordForm.handleSubmit(async ({ email, password }) => {
    setNotice(null);
    const { error } = await signInWithPassword(email, password);
    if (error) setNotice(error);
  });

  const onCode = codeForm.handleSubmit(async ({ code }) => {
    setNotice(null);
    const { error } = await verifyCode(sentTo ?? "", code);
    if (error) setNotice(error);
  });

  const busy = linkForm.formState.isSubmitting || passwordForm.formState.isSubmitting || codeForm.formState.isSubmitting;
  const field = "h-12 rounded-xl border-border bg-background/60 text-[0.9375rem]";
  const error = (msg?: string) => (msg ? <p className="mt-1.5 text-xs text-destructive">{msg}</p> : null);

  return (
    <div className="portal-root portal-backdrop grid content-start lg:grid-cols-[1.05fr_1fr] lg:content-stretch">
      {/* ---- brand panel: always the warm dark look, with Nairobi underneath the words */}
      <aside className="portal-hero relative hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0">
          <NairobiSkyline tall />
        </div>
        <div aria-hidden className="absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-[#110e0c]/80 via-[#110e0c]/40 to-transparent" />
        <DotPattern className="text-white/[0.06] [mask-image:radial-gradient(70%_50%_at_30%_20%,#000,transparent)]" />

        <div className="relative flex items-center gap-3">
          <img src="/logo/jm-mark.png" alt="" width={260} height={260} className="h-11 w-11" />
          <span className="portal-display text-lg font-semibold">JM Creative</span>
        </div>

        <div className="relative -mt-44 max-w-md self-start">
          <p className="portal-eyebrow flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" /> Client portal · Nairobi
          </p>
          <h1 className="portal-display mt-3 text-[2.75rem] font-bold leading-[1.05] tracking-tight">
            Your growth, <span className="text-primary">in one place.</span>
          </h1>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-white/70">
            Results, reports, invoices and everything we're building together. Always up to date, never a chase.
          </p>
          <ul className="mt-9 space-y-4 [@media(max-height:820px)]:hidden">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-[#ffb27a] ring-1 ring-white/10 backdrop-blur">
                  <Icon className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-white/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3.5">
          <ManagerAvatar className="h-12 w-12 ring-offset-[#110e0c]" />
          <div>
            <p className="text-sm font-semibold">Joseph Maina</p>
            <p className="text-xs text-white/60">Your growth partner · JM Creative, Nairobi, Kenya</p>
          </div>
        </div>
      </aside>

      {/* ---- phones and tablets: Nairobi across the top, full width */}
      <div className="portal-hero relative h-48 overflow-hidden border-b border-white/10 lg:hidden">
        <NairobiSkyline />
        <div className="absolute inset-x-0 top-0 flex items-center gap-3 p-5">
          <img src="/logo/jm-mark.png" alt="" width={260} height={260} className="h-9 w-9" />
          <span className="portal-display text-base font-semibold">JM Creative</span>
        </div>
      </div>

      {/* ---- form */}
      <main className="flex items-start justify-center px-5 py-8 lg:min-h-dvh lg:items-center lg:py-12">
        <div className="w-full max-w-[26rem]">
          <div className="portal-card p-7 sm:p-8">
            <BorderBeam size={180} duration={10} />

            {sentTo ? (
              <form onSubmit={onCode} noValidate className="space-y-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tint text-on-tint ring-1 ring-primary/20">
                  <MailCheck className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="portal-display text-2xl font-bold">Check your email</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    We sent a sign-in link to <span className="font-medium text-foreground">{sentTo}</span>. Open it on this
                    device, or type the 6-digit code from the email.
                  </p>
                </div>
                <div>
                  <Label htmlFor="portal-code" className="mb-1.5 block text-sm text-muted-foreground">
                    Code
                  </Label>
                  <Input
                    id="portal-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className={cn(field, "portal-tabular text-center text-lg tracking-[0.35em]")}
                    {...codeForm.register("code")}
                  />
                  {error(codeForm.formState.errors.code?.message)}
                </div>
                {notice && (
                  <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {notice}
                  </p>
                )}
                <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl text-[0.9375rem] font-semibold">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setSentTo(null);
                    setNotice(null);
                  }}
                  className="block w-full text-center text-sm font-medium text-primary hover:underline"
                >
                  Use a different email
                </button>
              </form>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="portal-display text-2xl font-bold">Karibu tena</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">Welcome back. Sign in to see how your business is growing.</p>
                </div>

                <div role="tablist" aria-label="Sign-in method" className="mb-6 grid grid-cols-2 rounded-xl bg-secondary p-1 text-sm">
                  {(
                    [
                      ["link", "Email me a link", Sparkles],
                      ["password", "Password", KeyRound],
                    ] as const
                  ).map(([id, label, Icon]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={method === id}
                      onClick={() => {
                        setMethod(id);
                        setNotice(null);
                      }}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg py-2 font-medium transition-colors",
                        method === id ? "bg-card text-foreground shadow-portal" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>

                {method === "link" ? (
                  <form onSubmit={onLink} noValidate className="space-y-4">
                    <div>
                      <Label htmlFor="portal-email" className="mb-1.5 block text-sm text-muted-foreground">
                        Email
                      </Label>
                      <Input
                        id="portal-email"
                        type="email"
                        autoComplete="username"
                        autoFocus
                        placeholder="you@company.com"
                        className={field}
                        {...linkForm.register("email")}
                      />
                      {error(linkForm.formState.errors.email?.message)}
                    </div>
                    {notice && (
                      <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {notice}
                      </p>
                    )}
                    <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl text-[0.9375rem] font-semibold">
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Email me a sign-in link <ArrowRight className="ml-1.5 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">No password to remember. The link works once.</p>
                  </form>
                ) : (
                  <form onSubmit={onPassword} noValidate className="space-y-4">
                    <div>
                      <Label htmlFor="portal-email-pw" className="mb-1.5 block text-sm text-muted-foreground">
                        Email
                      </Label>
                      <Input
                        id="portal-email-pw"
                        type="email"
                        autoComplete="username"
                        className={field}
                        {...passwordForm.register("email")}
                      />
                      {error(passwordForm.formState.errors.email?.message)}
                    </div>
                    <div>
                      <Label htmlFor="portal-password" className="mb-1.5 block text-sm text-muted-foreground">
                        Password
                      </Label>
                      <Input
                        id="portal-password"
                        type="password"
                        autoComplete="current-password"
                        className={field}
                        {...passwordForm.register("password")}
                      />
                      {error(passwordForm.formState.errors.password?.message)}
                    </div>
                    {notice && (
                      <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {notice}
                      </p>
                    )}
                    <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl text-[0.9375rem] font-semibold">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Private area. Access is by invitation. Need help? Email{" "}
            <a href="mailto:joemaish084@gmail.com" className="font-medium text-foreground hover:underline">
              joemaish084@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
