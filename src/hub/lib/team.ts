import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "./queries";

export type HubProfile = { role: "admin" | "editor"; full_name: string; job_title: string; phone: string };
export type TeamMember = HubProfile & { user_id: string; email: string; active: boolean; legacy_admin: boolean };
export type MemberDraft = Omit<TeamMember, "user_id" | "legacy_admin">;
const raw = supabase as unknown as SupabaseClient;
const key = ["hub", "team"] as const;

export async function readHubProfile(): Promise<HubProfile | null> {
  const { data, error } = await raw.rpc("hub_my_access");
  // Legacy admins can still sign in while the new migration is being deployed.
  if (error?.code === "PGRST202" || error?.code === "42883") return null;
  if (error) throw error;
  return data as HubProfile | null;
}

export function useTeam() {
  return useQuery({ queryKey: key, queryFn: async () => unwrap(await raw.rpc("hub_team_list")) as TeamMember[] });
}

export function useSaveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ draft, invite }: { draft: MemberDraft; invite: boolean }) => {
      if (invite) {
        const { data, error } = await supabase.functions.invoke("hub-invite", { body: draft });
        if (error) throw new Error("Could not add this user. Check that the team migration and hub-invite function are deployed.");
        if (data?.error) throw new Error(data.error);
        return data as { status: "invited" | "linked" };
      }
      unwrap(await raw.rpc("hub_save_member", {
        _email: draft.email, _full_name: draft.full_name, _job_title: draft.job_title,
        _phone: draft.phone, _role: draft.role, _active: draft.active,
      }));
      return { status: "saved" as const };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export async function saveHubProfile(profile: Omit<HubProfile, "role">) {
  unwrap(await raw.rpc("hub_save_profile", {
    _full_name: profile.full_name, _job_title: profile.job_title, _phone: profile.phone,
  }));
}
