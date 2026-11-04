import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHubAuth } from "../../auth/HubAuthProvider";
import { saveHubProfile } from "../../lib/team";

export function ProfileSettings() {
  const { profile, session, refreshProfile } = useHubAuth();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [title, setTitle] = useState(profile?.job_title ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveHubProfile({ full_name: name.trim(), job_title: title.trim(), phone: phone.trim() });
      await refreshProfile();
      toast.success("Profile saved");
    } catch {
      setError("Could not save your profile. Check your connection or ask your administrator to finish team setup.");
    } finally { setSaving(false); }
  };

  return (
    <section className="mb-6">
      <h2 className="hub-section-title">Your profile</h2>
      <form onSubmit={submit} className="hub-card space-y-4 p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">Your name appears in the hub greeting and account menu.</p>
        <div className="space-y-1.5"><Label htmlFor="profile-name">Full name</Label><Input id="profile-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} required maxLength={120} /></div>
        <div className="space-y-1.5"><Label htmlFor="profile-title">Job title</Label><Input id="profile-title" autoComplete="organization-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} /></div>
        <div className="space-y-1.5"><Label htmlFor="profile-phone">Phone</Label><Input id="profile-phone" type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={40} /></div>
        <p className="break-all text-xs text-muted-foreground">Login: {session?.user.email}</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={saving || !name.trim()} className="rounded-full">{saving ? "Saving…" : "Save profile"}</Button>
      </form>
    </section>
  );
}
