import type { ReactNode } from "react";
import { useHubAuth } from "../auth/HubAuthProvider";

/** Hide admin-only actions; the database independently enforces the same rule. */
export function AdminAction({ children }: { children: ReactNode }) {
  return useHubAuth().status === "admin" ? <>{children}</> : null;
}
