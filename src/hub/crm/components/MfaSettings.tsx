import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useHubAuth } from "../../auth/HubAuthProvider";
import { Section } from "../../components/ui";
import { useCrm, useOrg, useSaveOrg } from "../lib/queries";

type Factor = { id: string; status: string; friendly_name?: string | null };

/** Your own authenticator app, plus (owners) requiring one for everyone. */
export function MfaSettings() {
  const { session } = useHubAuth();
  const { isOwner } = useCrm();
  const org = useOrg();
  const saveOrg = useSaveOrg();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [aal, setAal] = useState<string | null>(null);

  const refresh = async () => {
    const [{ data }, level] = await Promise.all([supabase.auth.mfa.listFactors(), supabase.auth.mfa.getAuthenticatorAssuranceLevel()]);
    setFactors((data?.totp ?? []) as Factor[]);
    setAal(level.data?.currentLevel ?? null);
  };
  useEffect(() => {
    void refresh();
  }, [session?.access_token]);

  const verified = factors.filter((f) => f.status === "verified");

  const start = async () => {
    setBusy(true);
    // A half-finished enrolment blocks a new one.
    for (const f of factors.filter((x) => x.status !== "verified")) await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Hub ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Couldn't start setup");
      return;
    }
    const qr = data.totp.qr_code.startsWith("data:") ? data.totp.qr_code : `data:image/svg+xml;utf8,${encodeURIComponent(data.totp.qr_code)}`;
    setEnrolling({ id: data.id, qr, secret: data.totp.secret });
    setCode("");
  };

  const confirm = async () => {
    if (!enrolling) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrolling.id, code: code.replace(/\s/g, "") });
    setBusy(false);
    if (error) {
      toast.error("That code didn't work. Try the newest one.");
      return;
    }
    setEnrolling(null);
    toast.success("Two-step verification is on for your account");
    void refresh();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this authenticator? You'll sign in with your password only.")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) toast.error(error.message.includes("aal2") ? "Sign in with your code first, then remove it." : error.message);
    else {
      toast.success("Authenticator removed");
      void refresh();
    }
  };

  return (
    <Section title="Two-step verification">
      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">{verified.length ? "On for your account" : "Off for your account"}</p>
            <p className="text-muted-foreground">
              Use an authenticator app (Google Authenticator, 1Password, Authy). Once it's on, every sign-in to the hub asks for a code.
            </p>
          </div>
        </div>

        {verified.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-sm">
            <span>{f.friendly_name || "Authenticator"}</span>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => remove(f.id)}>
              Remove
            </Button>
          </div>
        ))}

        {!verified.length && !enrolling && (
          <Button className="rounded-full" onClick={start} disabled={busy}>
            {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Set up an authenticator
          </Button>
        )}

        {enrolling && (
          <div className="grid gap-4 rounded-2xl border border-border/60 p-4 sm:grid-cols-[auto_1fr]">
            <img src={enrolling.qr} alt="QR code to scan with your authenticator app" className="h-40 w-40 rounded-xl bg-white p-2" />
            <div className="space-y-3 text-sm">
              <p>Scan the code, or enter this key by hand:</p>
              <code className="block break-all rounded-lg bg-secondary px-2 py-1 text-xs">{enrolling.secret}</code>
              <div className="flex gap-2">
                <Input
                  aria-label="Code from the app"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-10 w-32 rounded-xl text-center tracking-widest"
                />
                <Button className="rounded-full" onClick={confirm} disabled={busy || code.replace(/\s/g, "").length < 6}>
                  Verify
                </Button>
                <Button variant="ghost" className="rounded-full" onClick={() => setEnrolling(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {isOwner && org.data && (
          <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-4">
            <div className="text-sm">
              <p className="font-medium">Require it for everyone in the CRM</p>
              <p className="text-muted-foreground">
                The database refuses CRM data to any session without a verified code. Turn it on only after each member has set up an app.
                {aal !== "aal2" && " You need to be signed in with your code to turn this on."}
              </p>
            </div>
            <Switch
              aria-label="Require two-step verification"
              checked={org.data.require_mfa}
              disabled={saveOrg.isPending || (!org.data.require_mfa && aal !== "aal2")}
              onCheckedChange={(v) =>
                saveOrg.mutate(
                  { id: org.data!.id, values: { require_mfa: v } },
                  { onSuccess: () => toast.success(v ? "Two-step verification required" : "No longer required"), onError: (e) => toast.error(e.message) },
                )
              }
            />
          </div>
        )}
      </div>
    </Section>
  );
}
