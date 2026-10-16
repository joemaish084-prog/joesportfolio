import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { HubDatabase } from "./types";

// The same client (and auth session) as the rest of the app, typed against the
// hub tables. A second createClient would start a competing auth instance.
export const db = supabase as unknown as SupabaseClient<HubDatabase>;

export const DOCUMENTS_BUCKET = "hub-documents";

// The documents bucket is private, so files are only ever opened through a
// short-lived signed URL.
export async function getSignedFileUrl(path: string, expiresInSeconds = 60) {
  const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
