import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// SheetJS 0.20.3, vendored: the npm registry copy (0.18.5) has known parsing
// advisories, and Supabase's bundler won't fetch from cdn.sheetjs.com.
// Same file as node_modules/xlsx/xlsx.mjs (Apache-2.0, see vendor/xlsx-LICENSE.txt).
import * as XLSX from "../_shared/vendor/xlsx-0.20.3.mjs";
import { corsHeaders, json, rateLimited, requireAccess, userClient } from "../_shared/crm/http.ts";
import { MAX_UPLOAD_BYTES, detectSheetKind, readWorkbook, sha256Hex } from "../_shared/crm/sheet.ts";

// Agency Command Centre: reads an uploaded XLSX or CSV of leads and returns its
// sheets as text for the import preview. Owners only. The file is read in
// memory and never stored; nothing is written to the database here. The hub
// shows the preview, you map columns and decide on duplicates, and only then
// does crm_commit_import save anything.

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const declared = Number(req.headers.get("content-length") ?? "0");
    if (declared > MAX_UPLOAD_BYTES + 64 * 1024) return json({ error: "Files can be up to 2 MB" }, 413);

    const supabase = userClient(req);
    const access = await requireAccess(supabase, ["owner"]);
    if (access instanceof Response) return access;
    if (await rateLimited(supabase, "parse-sheet", 20, 3600)) {
      return json({ error: "Too many uploads. Try again in an hour." }, 429);
    }

    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) return json({ error: "Attach a file" }, 400);
    if (file.size === 0) return json({ error: "That file is empty" }, 400);
    if (file.size > MAX_UPLOAD_BYTES) return json({ error: "Files can be up to 2 MB" }, 413);

    const filename = file.name.replace(/[^\w.\- ()]+/g, "_").slice(-120);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = detectSheetKind(filename, bytes);
    if (!kind) return json({ error: "Upload an .xlsx or .csv file" }, 415);

    let sheets;
    try {
      sheets = readWorkbook(XLSX, bytes, kind);
    } catch (e) {
      console.error("crm-parse-sheet read failed:", e instanceof Error ? e.message : "unknown");
      return json({ error: "That file couldn't be read. Save it again as .xlsx or .csv and retry." }, 422);
    }
    if (sheets.length === 0) return json({ error: "No sheets in that file" }, 422);

    return json({ filename, size: file.size, sha256: await sha256Hex(bytes), kind, sheets });
  } catch (e) {
    console.error("crm-parse-sheet error:", e instanceof Error ? e.message : "unknown");
    return json({ error: "Unexpected error" }, 500);
  }
});
