import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { DOCUMENTS_BUCKET } from "./db";
import { unwrap } from "./queries";
import type { HubDatabase, HubDocument, DocumentKind, DocumentStatus, Lead } from "./types";

// Generic list / save / delete hooks for the phase 2 tables. Every table in a
// solo agency's back office is small, so each one is read whole and cached
// under ["hub", table]; pages filter in memory.

type Tables = HubDatabase["public"]["Tables"];
export type TableName = keyof Tables;
export type Row<T extends TableName> = Tables[T]["Row"];
export type Insert<T extends TableName> = Tables[T]["Insert"];
export type Update<T extends TableName> = Tables[T]["Update"];

// Untyped view of the shared client: the generic helpers below re-apply the
// row types, which keeps TypeScript out of supabase-js's deep generics.
const raw = supabase as unknown as SupabaseClient;

export const tableKey = (table: TableName) => ["hub", table] as const;

export function useRows<T extends TableName>(table: T, orderBy = "created_at", ascending = false) {
  return useQuery({
    queryKey: tableKey(table),
    queryFn: async () => unwrap(await raw.from(table).select("*").order(orderBy, { ascending })) as Row<T>[],
  });
}

/** Insert when there's no id, update when there is. Invalidates the table plus any extra tables named. */
export function useSaveRow<T extends TableName>(table: T, alsoInvalidate: TableName[] = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Insert<T> | Update<T> }) =>
      (id
        ? unwrap(
            await raw
              .from(table)
              .update(values as Record<string, unknown>)
              .eq("id", id)
              .select()
              .single(),
          )
        : unwrap(
            await raw
              .from(table)
              .insert(values as Record<string, unknown>)
              .select()
              .single(),
          )) as Row<T>,
    onSuccess: () => [table, ...alsoInvalidate].forEach((t) => qc.invalidateQueries({ queryKey: tableKey(t) })),
  });
}

export function useDeleteRow<T extends TableName>(table: T, alsoInvalidate: TableName[] = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await raw.from(table).delete().eq("id", id)),
    onSuccess: () => [table, ...alsoInvalidate].forEach((t) => qc.invalidateQueries({ queryKey: tableKey(t) })),
  });
}

// ---------------------------------------------------------------- documents

const storage = () => supabase.storage.from(DOCUMENTS_BUCKET);

function storagePath(clientId: string | null, isTemplate: boolean, fileName: string) {
  const folder = isTemplate ? "templates" : (clientId ?? "general");
  const safe = fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
  return `${folder}/${crypto.randomUUID()}-${safe}`;
}

export type UploadInput = {
  file: File;
  clientId: string | null;
  kind: DocumentKind;
  status: DocumentStatus;
  title: string;
  isTemplate: boolean;
  notes: string | null;
};

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UploadInput) => {
      const path = storagePath(input.clientId, input.isTemplate, input.file.name);
      const { error: uploadError } = await storage().upload(path, input.file, {
        contentType: input.file.type || undefined,
        upsert: false,
      });
      if (uploadError) throw new Error(uploadError.message);
      const { data, error } = await raw
        .from("documents")
        .insert({
          client_id: input.isTemplate ? null : input.clientId,
          kind: input.kind,
          status: input.status,
          title: input.title.trim(),
          is_template: input.isTemplate,
          storage_path: path,
          file_name: input.file.name,
          mime_type: input.file.type || null,
          size_bytes: input.file.size,
          notes: input.notes,
        })
        .select()
        .single();
      if (error) {
        // Don't leave an orphaned file behind if the record couldn't be saved.
        await storage().remove([path]);
        throw new Error(error.message);
      }
      return data as HubDocument;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tableKey("documents") }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: HubDocument) => {
      unwrap(await raw.from("documents").delete().eq("id", doc.id));
      await storage().remove([doc.storage_path]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tableKey("documents") }),
  });
}

/** Copies a template's file into a client's folder as a new draft. */
export function useCreateFromTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ template, clientId, title }: { template: HubDocument; clientId: string; title: string }) => {
      const path = storagePath(clientId, false, template.file_name);
      const { error: copyError } = await storage().copy(template.storage_path, path);
      if (copyError) throw new Error(copyError.message);
      const { data, error } = await raw
        .from("documents")
        .insert({
          client_id: clientId,
          kind: template.kind,
          status: "draft",
          title: title.trim(),
          is_template: false,
          storage_path: path,
          file_name: template.file_name,
          mime_type: template.mime_type,
          size_bytes: template.size_bytes,
        })
        .select()
        .single();
      if (error) {
        await storage().remove([path]);
        throw new Error(error.message);
      }
      return data as HubDocument;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tableKey("documents") }),
  });
}

/** Opens a private file through a one-minute signed URL. */
export async function openDocument(doc: HubDocument, download = false) {
  // Open the tab synchronously so pop-up blockers allow it, then point it at the file.
  const tab = download ? null : window.open("", "_blank");
  const { data, error } = await storage().createSignedUrl(
    doc.storage_path,
    60,
    download ? { download: doc.file_name } : undefined,
  );
  if (error || !data) {
    tab?.close();
    throw new Error(error?.message ?? "Couldn't open the file");
  }
  if (tab) {
    tab.opener = null;
    tab.location.href = data.signedUrl;
  } else {
    window.location.assign(data.signedUrl);
  }
}

// ---------------------------------------------------------------- leads

/** Moves a card to a stage at a position; neighbours are renumbered in one pass. */
export function useMoveLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { id: string; stage: Lead["stage"]; position: number }[]) => {
      for (const u of updates) {
        unwrap(await raw.from("leads").update({ stage: u.stage, position: u.position }).eq("id", u.id));
      }
    },
    onMutate: (updates) => {
      qc.setQueryData<Lead[]>(tableKey("leads"), (leads) =>
        leads?.map((l) => {
          const u = updates.find((x) => x.id === l.id);
          return u ? { ...l, stage: u.stage, position: u.position } : l;
        }),
      );
    },
    onSettled: () => qc.invalidateQueries({ queryKey: tableKey("leads") }),
  });
}

// ---------------------------------------------------------------- reports

export type ReportInput = {
  id?: string;
  client_id: string;
  title: string;
  period_start: string;
  period_end: string;
  summary: string | null;
  document_id: string | null;
  /** KPI id → value; null clears a value. */
  values: Record<string, number | null>;
};

export function useSaveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values, ...report }: ReportInput) => {
      const saved = (
        id
          ? unwrap(await raw.from("reports").update(report).eq("id", id).select().single())
          : unwrap(await raw.from("reports").insert(report).select().single())
      ) as Row<"reports">;
      const set = Object.entries(values).filter(([, v]) => v !== null);
      const cleared = Object.entries(values)
        .filter(([, v]) => v === null)
        .map(([k]) => k);
      if (set.length) {
        unwrap(
          await raw.from("report_metrics").upsert(
            set.map(([client_kpi_id, value]) => ({ report_id: saved.id, client_kpi_id, value })),
            { onConflict: "report_id,client_kpi_id" },
          ),
        );
      }
      if (cleared.length) {
        unwrap(await raw.from("report_metrics").delete().eq("report_id", saved.id).in("client_kpi_id", cleared));
      }
      return saved;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tableKey("reports") });
      qc.invalidateQueries({ queryKey: tableKey("report_metrics") });
    },
  });
}
