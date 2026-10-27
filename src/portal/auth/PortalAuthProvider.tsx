import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthError, Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isDemo } from "../lib/api";

type Status = "loading" | "signed-out" | "signed-in";

type Result = { error: string | null };

type PortalAuth = {
  status: Status;
  session: Session | null;
  /** Emails a sign-in link (and 6-digit code). Only works for people you've invited. */
  sendLink: (email: string) => Promise<Result>;
  verifyCode: (email: string, code: string) => Promise<Result>;
  signInWithPassword: (email: string, password: string) => Promise<Result>;
  signOut: () => Promise<void>;
};

const PortalAuthContext = createContext<PortalAuth | null>(null);

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error("usePortalAuth must be used inside PortalAuthProvider");
  return ctx;
}

// Messages never say whether an email has an account, so the form can't be used to probe for clients.
function friendly(error: AuthError, fallback: string) {
  if (error.status === 429) return "Too many attempts. Wait a few minutes, then try again.";
  return fallback;
}

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoaded(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoaded(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const sendLink = useCallback(async (email: string): Promise<Result> => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      // Invited people only: this never creates an account.
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/portal` },
    });
    // "User not found" looks the same as success, so the form can't be used to probe for clients.
    if (!error || error.status === 400 || error.status === 422) return { error: null };
    return { error: friendly(error, "Couldn't send the email right now. Try again in a minute.") };
  }, []);

  const verifyCode = useCallback(async (email: string, code: string): Promise<Result> => {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.replace(/\s/g, ""), type: "email" });
    return { error: error ? friendly(error, "That code didn't work. Check it, or request a new one.") : null };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<Result> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? friendly(error, "That email and password don't match.") : null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // Nothing of the client's lingers in memory after sign-out.
    qc.removeQueries({ queryKey: ["portal"] });
  }, [qc]);

  const demo = isDemo();
  const status: Status = demo ? "signed-in" : !loaded ? "loading" : session ? "signed-in" : "signed-out";

  const value = useMemo(
    () => ({ status, session, sendLink, verifyCode, signInWithPassword, signOut }),
    [status, session, sendLink, verifyCode, signInWithPassword, signOut],
  );

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}
