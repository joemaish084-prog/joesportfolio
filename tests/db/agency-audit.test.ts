import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SUPABASE_STUB, migration } from "./harness";

let pg: PGlite;
const forward = "20261119000000_agency_audit_leads.sql";
const rollback = "20261119000000_agency_audit_leads.rollback.sql";
const audit = `insert into agency_leads (name, phone, business_name, budget_range, service_interest)
  values ('Sam', '+254700123456', 'Sample business', 'Still deciding', 'Free Marketing Audit')`;

beforeAll(async () => {
  pg = new PGlite();
  await pg.exec(SUPABASE_STUB);
  await pg.exec(migration("20260923000000_restore_lead_tables_and_add_chat_leads.sql"));
  await pg.exec("insert into agency_leads (name, email) values ('Existing lead', 'existing@example.com')");
  await pg.exec(migration(forward));
  // Supabase grants table privileges to API roles; RLS decides which rows they can access.
  await pg.exec("grant select, insert, update, delete on agency_leads to anon, authenticated");
});

afterAll(() => pg.close());

function as(role: "anon" | "authenticated", sql: string) {
  return pg.transaction(async tx => {
    await tx.exec(`set local role ${role}`);
    return tx.query(sql);
  });
}

describe("agency audit leads", () => {
  it("accepts a phone-only audit and preserves the email-based brief", async () => {
    await as("anon", audit);
    await as("authenticated", "insert into agency_leads (name, email) values ('Another lead', 'another@example.com')");
    expect((await pg.query("select email, phone from agency_leads where name = 'Sam'")).rows)
      .toEqual([{ email: null, phone: "+254700123456" }]);
    expect((await pg.query("select email from agency_leads where name = 'Existing lead'")).rows)
      .toEqual([{ email: "existing@example.com" }]);
  });

  it("blocks incomplete audit rows and phone-only records for other services", async () => {
    for (const invalid of [
      audit.replace("+254700123456", "abc"),
      audit.replace("'Sample business'", "null"),
      audit.replace("Still deciding", "Unknown budget"),
      audit.replace("'Free Marketing Audit'", "null"),
    ]) {
      await expect(as("anon", invalid)).rejects.toThrow(/agency_leads_require_contact/);
    }
  });

  it("keeps publicly submitted data private", async () => {
    for (const role of ["anon", "authenticated"] as const) {
      expect((await as(role, "select * from agency_leads")).rows).toHaveLength(0);
      expect((await as(role, "update agency_leads set phone = '1' returning id")).rows).toHaveLength(0);
      expect((await as(role, "delete from agency_leads returning id")).rows).toHaveLength(0);
    }
  });

  it("rolls back future phone-only writes without discarding existing leads", async () => {
    await pg.exec(migration(rollback));
    await expect(as("anon", audit)).rejects.toThrow(/agency_leads_email_required/);
    expect((await pg.query("select name from agency_leads where email is null")).rows).toEqual([{ name: "Sam" }]);
    await pg.exec(migration(forward));
    await as("anon", audit);
  });
});
