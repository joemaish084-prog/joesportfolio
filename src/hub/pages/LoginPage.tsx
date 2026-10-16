import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHubAuth } from "../auth/HubAuthProvider";

const REASON_MESSAGE = {
  idle: "You were signed out after 30 minutes of inactivity.",
  denied: "This account doesn't have access to Client Hub.",
  manual: null,
} as const;

export default function LoginPage() {
  const { status, reason, signIn } = useHubAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "admin") {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from.startsWith("/hub") && from !== "/hub/login" ? from : "/hub"} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  };

  const notice = error ?? (reason ? REASON_MESSAGE[reason] : null);
  const busy = submitting || (status === "loading" && !!email);

  return (
    <div className="hub-root flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-hub-lg">
            <Lock className="h-6 w-6" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Client Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        <form onSubmit={onSubmit} className="hub-card space-y-4 p-6" noValidate>
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
          <div className="space-y-1.5">
            <Label htmlFor="hub-password" className="hub-label">
              Password
            </Label>
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

          {notice && (
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
          )}

          <Button
            type="submit"
            disabled={busy || !email || !password}
            className="h-11 w-full rounded-xl text-[0.9375rem] font-semibold"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">Private area. Access is by invitation only.</p>
      </div>
    </div>
  );
}
