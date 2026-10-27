import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DOCUMENTS_BUCKET } from "@/hub/lib/db";
import { demoSnapshot } from "./demo";
import type { MessageKind, PortalDocument, PortalSnapshot } from "./types";

// Everything the portal reads comes from one function, portal_snapshot(), which
// returns only the signed-in client's own, shared data. Nothing here touches a
// table.

const rpc = (name: string, args?: Record<string, unknown>) =>
  (supabase as unknown as { rpc: (n: string, a?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }> }).rpc(
    name,
    args,
  );

const PREVIEW_KEY = "portal:preview";
const DEMO_KEY = "portal:demo";

function readStore(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Reads ?preview=<clientId> and ?demo from the URL once, then remembers them for the tab. */
export function captureEntryParams() {
  const params = new URLSearchParams(window.location.search);
  try {
    const preview = params.get("preview");
    if (preview) sessionStorage.setItem(PREVIEW_KEY, preview);
    if (import.meta.env.DEV && params.has("demo")) sessionStorage.setItem(DEMO_KEY, "1");
    if (import.meta.env.DEV && params.get("demo") === "off") sessionStorage.removeItem(DEMO_KEY);
  } catch {
    // Storage blocked: the params only apply to this page load.
  }
}

/** The client the hub admin is previewing, if any. */
export const previewClientId = () => new URLSearchParams(window.location.search).get("preview") ?? readStore(PREVIEW_KEY);
export const isDemo = () => import.meta.env.DEV && (new URLSearchParams(window.location.search).has("demo") || readStore(DEMO_KEY) === "1");

export function stopPreview() {
  try {
    sessionStorage.removeItem(PREVIEW_KEY);
  } catch {
    // Nothing stored.
  }
}

export const snapshotKey = (preview: string | null) => ["portal", "snapshot", preview ?? "me"] as const;

export function usePortalSnapshot(enabled: boolean) {
  const preview = previewClientId();
  return useQuery({
    queryKey: [...snapshotKey(preview), isDemo() ? "demo" : "live"],
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<PortalSnapshot | null> => {
      if (isDemo()) return demoSnapshot;
      const { data, error } = await rpc("portal_snapshot", { p_client_id: preview });
      if (error) throw new Error(error.message);
      return (data as PortalSnapshot | null) ?? null;
    },
  });
}

export function useResolveAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemo()) return;
      const { error } = await rpc("portal_resolve_update", { p_id: id });
      if (error) throw new Error(error.message);
    },
    onMutate: async (id) => {
      // Tick it off straight away; the server confirms on refetch.
      const key = [...snapshotKey(previewClientId()), isDemo() ? "demo" : "live"];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<PortalSnapshot | null>(key);
      if (previous) {
        qc.setQueryData<PortalSnapshot | null>(key, {
          ...previous,
          updates: previous.updates.map((u) => (u.id === id ? { ...u, resolved_at: new Date().toISOString() } : u)),
        });
      }
      return { previous, key };
    },
    onError: (_e, _id, ctx) => ctx && qc.setQueryData(ctx.key, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: ["portal", "snapshot"] }),
  });
}

export type MessageInput = { kind: MessageKind; subject: string; body: string };

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MessageInput) => {
      if (isDemo()) return;
      const { error } = await rpc("portal_send_message", {
        p_kind: input.kind,
        p_subject: input.subject,
        p_body: input.body,
        p_client_id: previewClientId(),
      });
      if (error) {
        throw new Error(/Too many/.test(error.message) ? "You've sent a lot of messages in the last hour. Please wait a bit." : "Couldn't send that. Try again in a minute.");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal", "snapshot"] }),
  });
}

/** Marks the member's visit (a no-op in preview and demo). */
export async function touchPortal() {
  if (isDemo() || previewClientId()) return;
  await rpc("portal_touch");
}

/** Opens a shared file through a short-lived signed link. `save` downloads instead of previewing. */
export async function openPortalFile(doc: Pick<PortalDocument, "storage_path" | "file_name">, save = false) {
  if (isDemo()) throw new Error("Files open in the live portal. This is demo data.");
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(doc.storage_path, 60, save ? { download: doc.file_name } : undefined);
  if (error || !data) throw new Error("That file isn't available right now.");
  const a = document.createElement("a");
  a.href = data.signedUrl;
  a.rel = "noopener";
  if (!save) a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
