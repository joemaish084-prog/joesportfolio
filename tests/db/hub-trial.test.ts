import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, migration, type Db } from "./harness";

let db: Db;

beforeAll(async () => {
  db = await createDb();
});
afterAll(() => db?.close());

const addClient = (engagement: string, fee: number | null = 30000) =>
  db.admin<{ id: string }>(
    "insert into public.clients(name,status,engagement_type,monthly_fee,start_date,end_date) values($1,'active',$1,$2,'2026-11-01','2026-11-30') returning id",
    [engagement, fee],
  );

describe("trial engagement type", () => {
  it("accepts trial clients alongside the existing types", async () => {
    for (const t of ["retainer", "contract", "project", "trial"]) {
      expect(await addClient(t)).toHaveLength(1);
    }
  });

  it("still rejects unknown engagement types", async () => {
    await expect(addClient("freebie")).rejects.toThrow(/clients_engagement_type_check/);
  });

  it("keeps the end-after-start rule for trials", async () => {
    await expect(
      db.admin(
        "insert into public.clients(name,engagement_type,start_date,end_date) values('Backwards','trial','2026-11-10','2026-11-01')",
      ),
    ).rejects.toThrow(/clients_end_after_start_check/);
  });

  it("rollback turns trials into unpaid projects and restores the old constraint", async () => {
    await db.pg.exec(migration("20261113000000_hub_trial_engagement.rollback.sql"));
    const [row] = await db.admin<{ engagement_type: string; monthly_fee: string | null; end_date: string }>(
      "select engagement_type, monthly_fee, to_char(end_date,'YYYY-MM-DD') as end_date from public.clients where name='trial'",
    );
    expect(row).toEqual({ engagement_type: "project", monthly_fee: null, end_date: "2026-11-30" });
    await expect(addClient("trial")).rejects.toThrow(/clients_engagement_type_check/);
    // And forward again.
    await db.pg.exec(migration("20261113000000_hub_trial_engagement.sql"));
    expect(await addClient("trial")).toHaveLength(1);
  });
});
