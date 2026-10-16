import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { db } from "../lib/db";
import { hubKeys } from "../lib/queries";
import { markActive } from "./useIdleSignOut";

export type SignOutReason = "idle" | "denied" | "manual";

type Status = "loading" | "signed-out" | "admin";

type HubAuth = {
  status: Status;
  session: Session | null;
  /** Why the last session ended, for the login screen. */
  reason: SignOutReason | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: (reason?: SignOutReason) => Promise<void>;
};

const HubAuthContext = createContext<HubAuth | null>(null);

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
  const [reason, setReason] = useState<SignOutReason | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setSessionLoaded(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(
    async (why: SignOutReason = "manual") => {
      setReason(why);
      await supabase.auth.signOut();
      // Drop every cached hub row so nothing lingers in memory after sign-out.
      qc.removeQueries({ queryKey: hubKeys.all });
    },
    [qc],
  );

  // The role check runs outside onAuthStateChange: awaiting Supabase calls inside
  // that callback can deadlock the auth client.
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    setIsAdmin(null);
    db.rpc("is_hub_admin").then(({ data, error }) => {
      if (cancelled) return;
      if (error || data !== true) {
        setIsAdmin(false);
        void signOut("denied");
      } else {
        setIsAdmin(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId, signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    setReason(null);
    // Before the call, so the idle check that mounts with the session sees it.
    markActive();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? "That email and password don't match." : null };
  }, []);

  const status: Status = !sessionLoaded
    ? "loading"
    : !session
      ? "signed-out"
      : isAdmin === true
        ? "admin"
        : isAdmin === null
          ? "loading"
          : "signed-out";

  const value = useMemo(
    () => ({ status, session, reason, signIn, signOut }),
    [status, session, reason, signIn, signOut],
  );

  return <HubAuthContext.Provider value={value}>{children}</HubAuthContext.Provider>;
}
