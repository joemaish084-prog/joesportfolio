import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { functionError } from "../crm/lib/queries";

// Google Calendar through the google-calendar Edge Function. The browser never
// holds a Google token: it asks the function, which acts on the stored
// connection. Events are cached per visible range under ["hub", "gcal", …].

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  allDay: boolean;
  /** ISO date-time, or yyyy-MM-dd for all-day events */
  start: string;
  /** exclusive end, as in Google */
  end: string;
  htmlLink: string | null;
  meetLink: string | null;
  editable: boolean;
};

export type EventInput = {
  title: string;
  description: string | null;
  location: string | null;
  allDay: boolean;
  start: string;
  end: string;
  timeZone: string;
};

export type GoogleStatus = { configured: boolean; connected: boolean; email?: string | null };

const KEY = ["hub", "gcal"] as const;
const STATUS_KEY = [...KEY, "status"] as const;

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("google-calendar", { body });
  if (error) throw new Error(await functionError(error, "google-calendar"));
  return data as T;
}

export function useGoogleStatus() {
  return useQuery({ queryKey: STATUS_KEY, queryFn: () => call<GoogleStatus>({ action: "status" }), retry: false });
}

export function useGoogleEvents(timeMin: Date, timeMax: Date, enabled: boolean) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: [...KEY, "events", timeMin.toISOString(), timeMax.toISOString()],
    enabled,
    staleTime: 60_000,
    // Picks up changes made in Google when you come back to the tab.
    refetchOnWindowFocus: true,
    retry: false,
    queryFn: async () => {
      try {
        return (await call<{ events: CalendarEvent[] }>({
          action: "list",
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
        })).events;
      } catch (e) {
        // Google may have dropped the connection; let the page show "Connect" again.
        void qc.invalidateQueries({ queryKey: STATUS_KEY });
        throw e;
      }
    },
  });
}

/** Sends the browser to Google's consent screen; Google returns to /hub/calendar. */
export function useConnectGoogle() {
  return useMutation({
    mutationFn: async () => {
      const { url } = await call<{ url: string }>({ action: "connect" });
      window.location.assign(url);
    },
  });
}

export function useDisconnectGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => call({ action: "disconnect" }),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSaveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, event }: { id?: string; event: EventInput }) =>
      call<{ event: CalendarEvent }>(id ? { action: "update", id, event } : { action: "create", event }),
    onSettled: () => qc.invalidateQueries({ queryKey: [...KEY, "events"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => call({ action: "delete", id }),
    onSettled: () => qc.invalidateQueries({ queryKey: [...KEY, "events"] }),
  });
}

export const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
