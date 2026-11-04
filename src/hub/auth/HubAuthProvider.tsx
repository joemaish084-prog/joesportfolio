import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AuthError, Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { db } from "../lib/db";
import { hubKeys } from "../lib/queries";
import type { CrmAccess } from "../crm/lib/types";
import { markActive } from "./useIdleSignOut";
import { readHubProfile, type HubProfile } from "../lib/team";

export type SignOutReason = "idle" | "denied" | "manual";

/**
 * admin: the full hub. member: operational editor. crm: CRM-only access.
 * mfa: signed in but the account's second factor isn't verified yet.
 */
type Status = "loading" | "signed-out" | "mfa" | "admin" | "member" | "crm";

type HubAuth = {
  status: Status;
  session: Session | null;
  profile: HubProfile | null;
  displayName: string;
  refreshProfile: () => Promise<void>;
  /** The caller's CRM membership, or null (not a member, or the CRM isn't set up yet). */
  crm: CrmAccess | null;
  /** Why the last session ended, for the login screen. */
  reason: SignOutReason | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Checks a TOTP code for the account's verified factor. */
  verifyMfa: (code: string) => Promise<{ error: string | null }>;
  signOut: (reason?: SignOutReason) => Promise<void>;
};

/** The assurance level inside the access token: aal2 once a second factor is verified. */
function tokenAal(session: Session | null) {
  try {
    const payload = session?.access_token.split(".")[1];
    if (!payload) return null;
    return (JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { aal?: string }).aal ?? null;
  } catch {
    return null;
  }
}

const HubAuthContext = createContext<HubAuth | null>(null);

/** Only a wrong email or password should read as one; anything else is a setup or network problem. */
function signInMessage(error: AuthError) {
  if (error.code === "invalid_credentials") return "That email and password don't match.";
  if (error.status === 429) return "Too many attempts. Wait a few minutes, then try again.";
  return "Sign-in isn't working right now. Try again in a minute.";
}

export function useHubAuth() {
  const ctx = useContext(HubAuthContext);
  if (!ctx) throw new Error("useHubAuth must be used inside HubAuthProvider");
  return ctx;
}

export function HubAuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [crm, setCrm] = useState<CrmAccess | null>(null);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [profile, setProfile] = useState<HubProfile | null>(null);
  const accessScope = useRef<string | null>(null);
  const sessionUser = useRef<string | null>(null);
  const [reason, setReason] = useState<SignOutReason | null>(null);

  useEffect(() => {
    const applySession = (next: Session | null) => {
      const nextUser = next?.user.id ?? null;
      if (sessionUser.current !== nextUser) {
        qc.removeQueries({ queryKey: hubKeys.all });
        setIsAdmin(null);
        setProfile(null);
        setCrm(null);
        sessionUser.current = nextUser;
      }
      setSession(next);
      setSessionLoaded(true);
    };
    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      applySession(next);
    });
    return () => data.subscription.unsubscribe();
  }, [qc]);

  const signOut = useCallback(
    async (why: SignOutReason = "manual") => {
      setReason(why);
      await supabase.auth.signOut();
      // Drop every cached hub row so nothing lingers in memory after sign-out.
      qc.removeQueries({ queryKey: hubKeys.all });
      setProfile(null);
    },
    [qc],
  );

  // The role check runs outside onAuthStateChange: awaiting Supabase calls inside
  // that callback can deadlock the auth client. It reruns when the session's
  // assurance level changes, i.e. right after the second factor is verified.
  const userId = session?.user.id;
  const aal = tokenAal(session);
  useEffect(() => {
    if (!userId) {
      setIsAdmin(null);
      setCrm(null);
      setNeedsMfa(false);
      setProfile(null);
      return;
    }
    let cancelled = false;
    setIsAdmin(null);
    const checkAccess = () => Promise.all([
      db.rpc("is_hub_admin"),
      // Missing until the CRM migration is applied; the hub carries on without it.
      supabase.rpc("crm_my_access" as never),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      readHubProfile(),
    ]).then(([admin, access, level, hubProfile]) => {
      if (cancelled) return;
      const hubAdmin = !admin.error && admin.data === true;
      const membership = access.error ? null : ((access.data as CrmAccess | null) ?? null);
      const scope = JSON.stringify([userId, hubAdmin, hubProfile?.role, membership]);
      if (accessScope.current !== null && accessScope.current !== scope) qc.removeQueries({ queryKey: hubKeys.all });
      accessScope.current = scope;
      if (!hubAdmin && !hubProfile && !membership) {
        setIsAdmin(false);
        void signOut("denied");
        return;
      }
      // Anyone who has enrolled a factor must use it, whatever the org setting.
      setNeedsMfa(level.data?.nextLevel === "aal2" && level.data.currentLevel !== "aal2");
      setCrm(membership);
      setProfile(hubProfile);
      setIsAdmin(hubAdmin);
    }).catch(() => {
      if (!cancelled) void signOut("denied");
    });
    void checkAccess();
    const timer = window.setInterval(() => void checkAccess(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [userId, aal, signOut, qc]);

  const refreshProfile = useCallback(async () => setProfile(await readHubProfile()), []);
  const metadataName = session?.user.user_metadata?.full_name;
  const displayName = profile?.full_name.trim() || (typeof metadataName === "string" ? metadataName.trim() : "") || session?.user.email?.split("@")[0] || "there";

  const verifyMfa = useCallback(async (code: string) => {
    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp.find((f) => f.status === "verified");
    if (listError || !factor) return { error: "No authenticator is set up for this account." };
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.replace(/\s/g, "") });
    if (!error) return { error: null };
    if (error.status === 429) return { error: "Too many attempts. Wait a few minutes, then try again." };
    return { error: "That code didn't work. Check your authenticator app and try again." };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setReason(null);
    // Before the call, so the idle check that mounts with the session sees it.
    markActive();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? signInMessage(error) : null };
  }, []);

  const status: Status = !sessionLoaded
    ? "loading"
    : !session
      ? "signed-out"
      : isAdmin === null
        ? "loading"
        : needsMfa
          ? "mfa"
          : isAdmin
            ? "admin"
            : profile
              ? "member"
              : crm
                ? "crm"
                : "signed-out";

  const value = useMemo(
    () => ({ status, session, profile, displayName, refreshProfile, crm, reason, signIn, verifyMfa, signOut }),
    [status, session, profile, displayName, refreshProfile, crm, reason, signIn, verifyMfa, signOut],
  );

  return <HubAuthContext.Provider value={value}>{children}</HubAuthContext.Provider>;
}
