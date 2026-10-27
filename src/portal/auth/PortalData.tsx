import { createContext, useContext, type ReactNode } from "react";
import type { PortalSnapshot } from "../lib/types";

// The signed-in client's snapshot, provided once the gate has loaded it so
// every page can read it synchronously.

const PortalDataContext = createContext<PortalSnapshot | null>(null);

export function PortalDataProvider({ snapshot, children }: { snapshot: PortalSnapshot; children: ReactNode }) {
  return <PortalDataContext.Provider value={snapshot}>{children}</PortalDataContext.Provider>;
}

export function usePortal() {
  const ctx = useContext(PortalDataContext);
  if (!ctx) throw new Error("usePortal must be used inside PortalDataProvider");
  return ctx;
}
