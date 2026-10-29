import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, type Db } from "./harness";

// The Google Calendar refresh token unlocks a whole calendar, so no browser
// role may read or write it, not even the hub admin. Only the Edge Functions,
// running as the service role, use the table.

let db: Db;
let crmManager: string;

const migration = (name: string) => readFileSync(new URL(`../../supabase/migrations/${name}`, import.meta.url), "utf8");

beforeAll(async () => {
  db = await createDb();
  await db.pg.exec(migration("20261029000000_hub_google_calendar.sql"));
  crmManager = await db.addUser("manager");
  await db.admin(
    "insert into public.google_calendar_connections (user_id, google_email, refresh_token) values ($1, 'joe@example.com', 'secret-refresh')",
    [db.owner],
  );
});

afterAll(() => db.close());

describe("google_calendar_connections", () => {
  it("is hidden from the hub admin, CRM members and anon", async () => {
    for (const who of [db.owner, crmManager, "anon"]) {
      await expect(db.as(who, "select refresh_token from public.google_calendar_connections")).rejects.toThrow(/permission denied/);
    }
  });

  it("can't be written from the browser", async () => {
    await expect(
      db.as(db.owner, "insert into public.google_calendar_connections (user_id, refresh_token) values ($1, 'x')", [crmManager]),
    ).rejects.toThrow(/permission denied/);
    await expect(db.as(db.owner, "update public.google_calendar_connections set refresh_token = 'x'")).rejects.toThrow(
      /permission denied/,
    );
    await expect(db.as(db.owner, "delete from public.google_calendar_connections")).rejects.toThrow(/permission denied/);
  });

  it("is read and written by the service role", async () => {
    const rows = await db.as<{ refresh_token: string }>(
      "service_role",
      "select refresh_token from public.google_calendar_connections where user_id = $1",
      [db.owner],
    );
    expect(rows).toEqual([{ refresh_token: "secret-refresh" }]);
    await db.as("service_role", "update public.google_calendar_connections set access_token = 'a' where user_id = $1", [db.owner]);
  });

  it("refuses an empty refresh token and goes when the user does", async () => {
    await expect(
      db.admin("insert into public.google_calendar_connections (user_id, refresh_token) values ($1, ' ')", [crmManager]),
    ).rejects.toThrow(/check/);
    await db.admin("insert into public.google_calendar_connections (user_id, refresh_token) values ($1, 'r')", [crmManager]);
    await db.admin("delete from public.crm_memberships where user_id = $1", [crmManager]);
    await db.admin("delete from auth.users where id = $1", [crmManager]);
    const left = await db.admin("select 1 from public.google_calendar_connections where user_id = $1", [crmManager]);
    expect(left).toHaveLength(0);
  });

  it("rolls back cleanly", async () => {
    await db.pg.exec(migration("20261029000000_hub_google_calendar.rollback.sql"));
    const [{ t }] = await db.admin<{ t: string | null }>("select to_regclass('public.google_calendar_connections')::text as t");
    expect(t).toBeNull();
  });
});
