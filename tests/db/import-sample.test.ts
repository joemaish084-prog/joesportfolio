import { existsSync, readFileSync } from "node:fs";
import { afterAll, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { buildRows, commitPayload, reviewRows, suggestMapping, type ExistingLead } from "@/hub/crm/lib/importMapping";
import { detectSheetKind, readWorkbook, sha256Hex } from "../../supabase/functions/_shared/crm/sheet";
import { createDb, type Db } from "./harness";

// End to end with the real prospect file: parse, review, commit, then import
// the same file again. Runs only when CRM_IMPORT_SAMPLE points at the file,
// which stays out of the repo.

const sample = process.env.CRM_IMPORT_SAMPLE;
let db: Db | undefined;
afterAll(() => db?.close());

it.skipIf(!sample || !existsSync(sample))("imports all 81 dealers once, and a second import changes nothing", async () => {
  db = await createDb();
  const bytes = new Uint8Array(readFileSync(sample as string));
  const sheets = readWorkbook(XLSX, bytes, detectSheetKind(sample as string, bytes) as "xlsx");
  const leads = sheets.find((s) => s.name === "Leads")!;
  const methodology = sheets.find((s) => s.name === "How to read this")!;
  const mapping = suggestMapping(leads.headers);
  const [{ id: industryId }] = await db.admin<{ id: string }>("select id from public.crm_industries where slug = 'car_dealership'");
  const [{ id: campaignId }] = await db.admin<{ id: string }>("select id from public.crm_campaigns limit 1");

  const run = async () => {
    const existing = await db!.as<ExistingLead>(db!.owner, "select id, name, name_key, domain_key, email_key, phone_key from public.crm_leads");
    const reviewed = await reviewRows(buildRows(leads.headers, leads.rows, mapping), existing);
    const payload = commitPayload(
      {
        filename: "Nairobi_Car_Dealer_Leads.xlsx",
        fileSha256: await sha256Hex(bytes),
        fileSize: bytes.length,
        sheetName: "Leads",
        mapping,
        methodology: [methodology.headers[0], ...methodology.rows.map((r) => r[0] ?? "")].filter(Boolean),
        industryId,
        campaignId,
      },
      reviewed,
    );
    const [{ r }] = await db!.as<{ r: Record<string, number> }>(db!.owner, "select public.crm_commit_import($1, $2::jsonb) as r", [
      db!.org,
      JSON.stringify(payload),
    ]);
    return { r, reviewed };
  };

  const first = await run();
  expect(first.r).toMatchObject({ created: 81, merged: 0, skipped: 0, errors: 0 });

  const [stats] = await db.admin<Record<string, number>>(`
    select count(*)::int as leads,
           count(*) filter (where email is not null)::int as with_email,
           count(*) filter (where weakness_score is not null and original_priority is not null)::int as scored,
           count(*) filter (where stage = 'new')::int as new_stage,
           (select count(*)::int from public.crm_lead_contacts) as contacts,
           (select count(*)::int from public.crm_lead_campaigns) as in_campaign,
           (select jsonb_array_length(methodology) from public.crm_lead_sources limit 1) as methodology_lines
    from public.crm_leads`);
  expect(stats).toEqual({
    leads: 81,
    with_email: 24, // only what the sheet has; nothing invented
    scored: 81,
    new_stage: 81,
    contacts: 0, // owner names and direct lines are still blank in the sheet
    in_campaign: 81,
    methodology_lines: 8,
  });

  // Every row now matches an existing lead, so the review suggests skipping,
  // and the database would refuse to apply the same rows again anyway.
  const second = await run();
  expect(second.reviewed.every((r) => r.decision === "skip")).toBe(true);
  expect(second.r).toMatchObject({ created: 0, merged: 0, skipped: 81 });
  const [{ n }] = await db.admin<{ n: number }>("select count(*)::int as n from public.crm_leads");
  expect(n).toBe(81);
});
