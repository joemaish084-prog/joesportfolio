import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const MIN_PASSWORD = 10;

/** New password + confirm. Used by the reset page and Settings. */
export function ChangePasswordForm({
  onDone,
  submitLabel = "Save new password",
}: {
  onDone: () => void;
  submitLabel?: string;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
    if (password !== confirm) return setError("The two passwords don't match.");
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(
        /reauth|recent/i.test(updateError.message)
          ? "For security, sign out and back in (or use a fresh reset link), then try again."
          : updateError.message,
      );
      return;
    }
    setPassword("");
    setConfirm("");
    onDone();
  };

  const field = "h-11 rounded-xl bg-background pr-11";
  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          aria-label="New password"
          className={field}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <Input
        type={show ? "text" : "password"}
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Type it again"
        aria-label="Confirm new password"
        className={cn(field, "pr-3")}
      />
      <p className="text-xs text-muted-foreground">
        At least {MIN_PASSWORD} characters. A short sentence is easy to remember and hard to guess.
      </p>
      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="h-11 w-full rounded-xl font-semibold" disabled={saving}>
        <KeyRound className="mr-1.5 h-4 w-4" />
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
