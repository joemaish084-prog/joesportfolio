import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHubAuth } from "../../auth/HubAuthProvider";
import { useSaveMember, useTeam, type MemberDraft, type TeamMember } from "../../lib/team";
import { ClientAvatar, SkeletonBlock } from "../ui";

const NEW_MEMBER: MemberDraft = { email: "", full_name: "", job_title: "", phone: "", role: "editor", active: true };

export function TeamSettings() {
  const team = useTeam();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [version, setVersion] = useState(0);
  const reset = () => { setEditing(null); setVersion(v => v + 1); };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section>
        <h2 className="hub-section-title">Your team</h2>
        <div className="hub-card p-5 sm:p-6">
          <p className="mb-4 text-sm text-muted-foreground">Everyone works in the same business workspace. CRM and client portal access are managed separately.</p>
          {team.isLoading ? <SkeletonBlock className="h-40" /> : team.error ? (
            <p role="alert" className="text-sm text-destructive">Team management is not available yet. Your administrator needs to finish setup.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {team.data?.map(member => (
                <li key={member.user_id} className="flex items-start gap-3 py-4">
                  <ClientAvatar name={member.full_name || member.email} className="h-10 w-10 shrink-0 rounded-full text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold">{member.full_name || member.email}</p>
                    <p className="break-all text-xs text-muted-foreground">{member.email}</p>
                    {member.job_title && <p className="mt-1 break-words text-xs text-muted-foreground">{member.job_title}</p>}
                    <p className="mt-2 text-xs"><span className={member.active ? "text-on-tint" : "text-muted-foreground"}>{member.role === "admin" ? "Admin" : "Editor"} · {member.active ? "Active" : "Access disabled"}</span></p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => setEditing(member)} aria-label={`Edit ${member.full_name || member.email}`}><Pencil className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
          )}
          <Button type="button" variant="secondary" className="mt-4 rounded-full" onClick={reset}><Plus className="mr-1.5 h-4 w-4" />Add another person</Button>
        </div>
      </section>
      <MemberForm key={`${editing?.user_id ?? "new"}-${version}`} member={editing} onDone={reset} />
    </div>
  );
}

function MemberForm({ member, onDone }: { member: TeamMember | null; onDone: () => void }) {
  const { session, refreshProfile } = useHubAuth();
  const save = useSaveMember();
  const [draft, setDraft] = useState<MemberDraft>(member ?? NEW_MEMBER);
  const locked = member?.legacy_admin || member?.user_id === session?.user.id;
  const set = <K extends keyof MemberDraft>(key: K, value: MemberDraft[K]) => setDraft(d => ({ ...d, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await save.mutateAsync({ draft, invite: !member });
      if (member?.user_id === session?.user.id) await refreshProfile();
      toast.success(result.status === "invited" ? "Invitation sent" : result.status === "linked" ? "User added to the hub" : "Team member updated");
      onDone();
    } catch { /* Mutation error stays visible in the form. */ }
  };
  return (
    <section>
      <h2 className="hub-section-title">{member ? "Edit team member" : "Add a team member"}</h2>
      <form onSubmit={submit} className="hub-card space-y-4 p-5 sm:p-6">
        <p className="flex items-start gap-2 text-sm text-muted-foreground"><Users className="mt-0.5 h-4 w-4 shrink-0" />{member ? "Update their details, role or access." : "New users receive an email to set their password. Existing users keep their login."}</p>
        <div className="space-y-1.5"><Label htmlFor="member-name">Full name</Label><Input id="member-name" value={draft.full_name} onChange={e => set("full_name", e.target.value)} required maxLength={120} /></div>
        <div className="space-y-1.5"><Label htmlFor="member-email">Email</Label><Input id="member-email" type="email" value={draft.email} onChange={e => set("email", e.target.value)} required maxLength={200} readOnly={!!member} autoComplete="off" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="member-title">Job title</Label><Input id="member-title" value={draft.job_title} onChange={e => set("job_title", e.target.value)} maxLength={120} /></div>
          <div className="space-y-1.5"><Label htmlFor="member-phone">Phone</Label><Input id="member-phone" type="tel" value={draft.phone} onChange={e => set("phone", e.target.value)} maxLength={40} /></div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="member-role">Role</Label>
          <Select value={draft.role} onValueChange={v => set("role", v as MemberDraft["role"])} disabled={!!locked}>
            <SelectTrigger id="member-role"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="editor">Editor</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
          </Select>
          <p className="text-xs leading-relaxed text-muted-foreground">{draft.role === "admin" ? "Full hub access, including finances, business funds, settings and team management." : "Can view all shared client and finance records and create or update daily work. Cannot manage users, business funds, settings, or permanently delete records."}</p>
        </div>
        {member && <div className="flex items-center gap-2"><Checkbox id="member-active" checked={draft.active} disabled={!!locked} onCheckedChange={v => set("active", v === true)} /><Label htmlFor="member-active">Allow access to the hub</Label></div>}
        {locked && <p className="text-xs text-muted-foreground">Your own admin access and original administrator accounts are protected.</p>}
        {save.error && <p role="alert" className="text-sm text-destructive">{save.error.message}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={save.isPending || !draft.full_name.trim()} className="rounded-full">{save.isPending ? "Saving…" : member ? "Save changes" : "Add user"}</Button>
          {member && <Button type="button" variant="secondary" onClick={onDone} className="rounded-full">Cancel</Button>}
        </div>
      </form>
    </section>
  );
}
