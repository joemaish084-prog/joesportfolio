import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { KeyRound, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useHubAuth } from "../auth/HubAuthProvider";

const REASON_MESSAGE = {
  idle: "You were signed out after 30 minutes of inactivity.",
  denied: "This account doesn't have access to Client Hub.",
  manual: null,
} as const;

type Mode = "sign-in" | "forgot" | "sent";

export default function LoginPage() {
  const { status, reason, signIn } = useHubAuth();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "admin") {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from.startsWith("/hub") && from !== "/hub/login" ? from : "/hub"} replace />;
  }

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  };

  const onRequestReset = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/hub/reset-password`,
    });
    setSubmitting(false);
    // Same answer whether or not the email has an account, so the form can't be used to probe for one.
    if (resetError?.status === 429) setError("Too many requests. Wait a few minutes, then try again.");
    else if (resetError && resetError.status !== 400 && resetError.status !== 422)
      setError("Couldn't send the email right now. Try again in a minute.");
    else switchMode("sent");
  };

  const notice = error ?? (mode === "sign-in" && reason ? REASON_MESSAGE[reason] : null);
  const busy = submitting || (status === "loading" && !!email);

  const emailField = (
    <div className="space-y-1.5">
      <Label htmlFor="hub-email" className="hub-label">
        Email
      </Label>
      <Input
        id="hub-email"
        type="email"
        autoComplete="username"
        autoFocus
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 rounded-xl bg-background"
      />
    </div>
  );

  const noticeBox = notice && (
    <p
      role="alert"
      className={
        error || reason === "denied"
          ? "rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
          : "rounded-xl bg-tint px-3 py-2 text-sm text-on-tint"
      }
    >
      {notice}
    </p>
  );

  const linkButton = "text-sm font-medium text-primary hover:underline";

  return (
    <div className="hub-root flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          {mode === "sign-in" ? (
            <img src="/logo/jm-mark.png" alt="JM Creative" width={260} height={260} className="mb-5 h-20 w-20" />
          ) : (
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-hub-lg">
              {mode === "forgot" ? (
                <KeyRound className="h-6 w-6" strokeWidth={2} />
              ) : (
                <MailCheck className="h-6 w-6" strokeWidth={2} />
              )}
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "sign-in" ? "Client Hub" : mode === "forgot" ? "Reset your password" : "Check your email"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "sign-in"
              ? "Sign in to continue"
              : mode === "forgot"
                ? "We'll email you a link to choose a new one."
                : "If that email has access, a reset link is on its way."}
          </p>
        </div>

        {mode === "sign-in" && (
          <form onSubmit={onSubmit} className="hub-card space-y-4 p-6" noValidate>
            {emailField}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="hub-password" className="hub-label">
                  Password
                </Label>
                <button type="button" onClick={() => switchMode("forgot")} className={linkButton}>
                  Forgot password?
                </button>
              </div>
              <Input
                id="hub-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl bg-background"
              />
            </div>

            {noticeBox}

            <Button
              type="submit"
              disabled={busy || !email || !password}
              className="h-11 w-full rounded-xl text-[0.9375rem] font-semibold"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={onRequestReset} className="hub-card space-y-4 p-6" noValidate>
            {emailField}
            {noticeBox}
            <Button
              type="submit"
              disabled={submitting || !email.includes("@")}
              className="h-11 w-full rounded-xl text-[0.9375rem] font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Email me a reset link"}
            </Button>
            <div className="text-center">
              <button type="button" onClick={() => switchMode("sign-in")} className={linkButton}>
                Back to sign in
              </button>
            </div>
          </form>
        )}

        {mode === "sent" && (
          <div className="hub-card space-y-4 p-6 text-center text-sm">
            <p>
              Open the email on this device and tap the link. It works once and expires after an hour.
            </p>
            <p className="text-muted-foreground">Nothing after a few minutes? Check your spam folder.</p>
            <button type="button" onClick={() => switchMode("sign-in")} className={linkButton}>
              Back to sign in
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">Private area. Access is by invitation only.</p>
      </div>
    </div>
  );
}
