import { createContext, useCallback, useContext } from "react";
import { formatKES } from "./format";

// "Hide amounts" privacy mode, like a banking app's hide-balance switch.
// Every money figure in the hub goes through useKes() / <Money>, so one
// switch masks them all. The choice is remembered on this device.

export const PRIVACY_STORAGE_KEY = "hub:hide-amounts";
export const MASK = "KES ••••••";

export type PrivacyState = {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  toggle: () => void;
};

export const PrivacyContext = createContext<PrivacyState>({
  hidden: false,
  setHidden: () => {},
  toggle: () => {},
});

export const usePrivacy = () => useContext(PrivacyContext);

/** formatKES that respects the switch: "KES 45,000" or "KES ••••••". */
export function useKes() {
  const { hidden } = usePrivacy();
  return useCallback(
    (value: number | null | undefined) =>
      value === null || value === undefined ? formatKES(value) : hidden ? MASK : formatKES(value),
    [hidden],
  );
}

export function readStoredPrivacy() {
  try {
    return localStorage.getItem(PRIVACY_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function storePrivacy(hidden: boolean) {
  try {
    localStorage.setItem(PRIVACY_STORAGE_KEY, hidden ? "1" : "0");
  } catch {
    // Not remembered; still applies for this visit.
  }
}
