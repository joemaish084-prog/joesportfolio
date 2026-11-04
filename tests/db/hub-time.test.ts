import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, migration, type Db } from "./harness";

let db: Db;
let otherAdmin: string;
let editor: string;
let outsider: string;
let client: string;
let today: string;
let saved: string;
const save = "select public.hub_time_save_entry($1,$2,$3,$4,$5) as id";

beforeAll(async () => {
  db = await createDb();
  // The production email isn't a fixture account: setup must fail closed.
  expect(await db.admin("select * from public.hub_time_settings")).toEqual([]);
  expect((await db.as<{ ok: boolean }>(db.owner, "select public.is_hub_time_owner() as ok"))[0].ok).toBe(false);
  await db.admin("insert into public.hub_time_settings(owner_user_id) values($1)", [db.owner]);
  otherAdmin = crypto.randomUUID(); editor = crypto.randomUUID(); outsider = await db.addUser("viewer");
  await db.admin("insert into auth.users(id,email) values($1,'admin@time.test'),($2,'editor@time.test')", [otherAdmin, editor]);
  await db.as(db.owner, "select public.hub_save_member('admin@time.test','Admin','','','admin',true)");
  await db.as(db.owner, "select public.hub_save_member('editor@time.test','Editor','','','editor',true)");
  client = (await db.admin<{ id: string }>("insert into public.clients(name,status,monthly_fee) values('Real fixture','active',10000) returning id"))[0].id;
  today = (await db.admin<{ day: string }>("select to_char(now() at time zone 'Africa/Nairobi','YYYY-MM-DD') as day"))[0].day;
});
afterAll(() => db?.close());

describe("personal time permissions and persistence", () => {
  it("allows the bound owner to save and read time and settings", async () => {
    expect((await db.as<{ ok: boolean }>(db.owner, "select public.is_hub_time_owner() as ok"))[0].ok).toBe(true);
    const [settings] = await db.as<{ weekly_agency_hours: string }>(db.owner, "select weekly_agency_hours from public.hub_time_settings");
    expect(Number(settings.weekly_agency_hours)).toBe(15);
    await db.as(db.owner, "update public.hub_time_settings set weekly_agency_hours=20");
    saved = crypto.randomUUID();
    await db.as(db.owner, save, [saved, client, 30, "Strategy", today]);
    expect(await db.as(db.owner, "select id,minutes,note from public.hub_time_entries")).toEqual([{ id: saved, minutes: 30, note: "Strategy" }]);
  });
  it("denies other admins, editors, CRM members and anonymous callers", async () => {
    for (const who of [otherAdmin, editor, outsider]) {
      expect((await db.as<{ ok: boolean }>(who, "select public.is_hub_time_owner() as ok"))[0].ok).toBe(false);
      for (const table of ["hub_time_entries", "hub_time_settings", "hub_time_clients"]) {
        expect(await db.as(who, `select * from public.${table}`)).toEqual([]);
      }
      expect(await db.as(who, "delete from public.hub_time_entries returning id")).toEqual([]);
      expect(await db.as(who, "update public.hub_time_settings set weekly_agency_hours=1 returning id")).toEqual([]);
      await expect(db.as(who, "insert into public.hub_time_entries(client_id,minutes,entry_date) values($1,15,$2)", [client, today])).rejects.toThrow(/row-level security/);
      await expect(db.as(who, "insert into public.hub_time_clients(client_id,archived) values($1,true)", [client])).rejects.toThrow(/row-level security/);
      await expect(db.as(who, save, [crypto.randomUUID(), client, 15, "Forbidden", today])).rejects.toThrow(/Personal time access required/);
    }
    await expect(db.as("anon", "select * from public.hub_time_entries")).rejects.toThrow(/permission denied/);
    await expect(db.as("anon", "select public.is_hub_time_owner()")).rejects.toThrow(/permission denied/);
  });
  it("prevents ownership takeover, forged timestamps and entry rewrites even for the owner", async () => {
    for (const who of [db.owner, otherAdmin, editor]) {
      await expect(db.as(who, "update public.hub_time_settings set owner_user_id=$1", [who])).rejects.toThrow(/permission denied/);
      await expect(db.as(who, "insert into public.hub_time_settings(owner_user_id) values($1)", [who])).rejects.toThrow(/permission denied/);
    }
    await expect(db.as(db.owner, "insert into public.hub_time_entries(client_id,minutes,entry_date,created_at) values($1,15,$2,'2000-01-01')", [client, today])).rejects.toThrow(/permission denied/);
    await expect(db.as(db.owner, "update public.hub_time_entries set minutes=999 where id=$1", [saved])).rejects.toThrow(/permission denied/);
    // Claiming the owner's email in a token doesn't grant their account ID.
    expect((await db.as<{ ok: boolean }>(otherAdmin, "select public.is_hub_time_owner() as ok", [], { email: "joemukunya67@gmail.com" }))[0].ok).toBe(false);
  });
  it("saves retries exactly once and rejects conflicting UUID reuse", async () => {
    await db.as(db.owner, save, [saved, client, 30, "Strategy", today]);
    expect((await db.as(db.owner, "select id from public.hub_time_entries where id=$1", [saved])).length).toBe(1);
    await expect(db.as(db.owner, save, [saved, client, 60, "Different", today])).rejects.toThrow(/different details/);
  });
  it("validates hours, time, dates, notes and client references", async () => {
    for (const hours of [0, -1, 169]) await expect(db.as(db.owner, "update public.hub_time_settings set weekly_agency_hours=$1", [hours])).rejects.toThrow(/check constraint/);
    for (const minutes of [0, -1, 525601]) await expect(db.as(db.owner, save, [crypto.randomUUID(), client, minutes, "", today])).rejects.toThrow(/check constraint/);
    await expect(db.as(db.owner, save, [crypto.randomUUID(), crypto.randomUUID(), 15, "", today])).rejects.toThrow(/foreign key/);
    await expect(db.as(db.owner, save, [crypto.randomUUID(), client, 15, "x".repeat(2001), today])).rejects.toThrow(/check constraint/);
    await expect(db.as(db.owner, save, [crypto.randomUUID(), client, 15, "", "2999-01-01"])).rejects.toThrow(/check constraint/);
  });
  it("archives personal tracking without changing shared clients or deleting history", async () => {
    await db.as(db.owner, "insert into public.hub_time_clients(client_id,archived) values($1,true)", [client]);
    expect(await db.as(editor, "update public.hub_time_clients set archived=false returning client_id")).toEqual([]);
    expect((await db.as(db.owner, "select id from public.hub_time_entries where client_id=$1", [client])).length).toBe(1);
    expect((await db.as<{ status: string }>(editor, "select status from public.clients where id=$1", [client]))[0].status).toBe("active");
    await expect(db.admin("delete from public.clients where id=$1", [client])).rejects.toThrow(/foreign key/);
    await db.as(db.owner, "update public.hub_time_clients set archived=false where client_id=$1", [client]);
  });
  it("keeps access bound to the ID across an email change, and requires current hub admin access", async () => {
    await db.admin("update auth.users set email='renamed@time.test' where id=$1", [db.owner]);
    expect((await db.as<{ ok: boolean }>(db.owner, "select public.is_hub_time_owner() as ok"))[0].ok).toBe(true);
    await db.admin("delete from public.user_roles where user_id=$1", [db.owner]);
    expect(await db.as(db.owner, "select * from public.hub_time_entries")).toEqual([]);
    await db.admin("insert into public.user_roles(user_id,role) values($1,'admin')", [db.owner]);
  });
  it("preserves private time when the owner merges clients and blocks other admins from moving it", async () => {
    const [duplicate] = await db.admin<{ id: string }>("insert into public.clients(name) values('Duplicate fixture') returning id");
    const id = crypto.randomUUID();
    await db.as(db.owner, save, [id, duplicate.id, 15, "Keep history", today]);
    await db.as(db.owner, "insert into public.hub_time_clients(client_id,archived) values($1,true)", [duplicate.id]);
    await expect(db.as(otherAdmin, "select public.hub_merge_clients($1,$2)", [client, duplicate.id])).rejects.toThrow(/personal time owner/);
    // Invalid merges must roll back private record moves as well.
    await expect(db.as(db.owner, "select public.hub_merge_clients($1,$2)", [crypto.randomUUID(), duplicate.id])).rejects.toThrow();
    expect((await db.as<{ client_id: string }>(db.owner, "select client_id from public.hub_time_entries where id=$1", [id]))[0].client_id).toBe(duplicate.id);
    await db.as(db.owner, "select public.hub_merge_clients($1,$2)", [client, duplicate.id]);
    expect((await db.as<{ client_id: string }>(db.owner, "select client_id from public.hub_time_entries where id=$1", [id]))[0].client_id).toBe(client);
    expect(await db.as(db.owner, "select id from public.clients where id=$1", [duplicate.id])).toEqual([]);
    await db.as(db.owner, "delete from public.hub_time_entries where id=$1", [id]);
  });
  it("allows owner deletion and rolls back without touching shared records", async () => {
    expect(await db.as(db.owner, "delete from public.hub_time_entries where id=$1 returning id", [saved])).toEqual([{ id: saved }]);
    await db.pg.exec(migration("20261104010000_hub_time.rollback.sql"));
    expect((await db.as(editor, "select id from public.clients where id=$1", [client])).length).toBe(1);
    expect((await db.admin<{ table: string | null }>("select to_regclass('public.hub_time_entries')::text as table"))[0].table).toBeNull();
  });
  it("binds the configured existing email to its stable account ID when applied", async () => {
    await db.admin("update auth.users set email='joemukunya67@gmail.com' where id=$1", [db.owner]);
    await db.pg.exec(migration("20261104010000_hub_time.sql"));
    expect(await db.admin("select owner_user_id from public.hub_time_settings")).toEqual([{ owner_user_id: db.owner }]);
    expect((await db.as<{ ok: boolean }>(db.owner, "select public.is_hub_time_owner() as ok"))[0].ok).toBe(true);
    expect((await db.as<{ ok: boolean }>(otherAdmin, "select public.is_hub_time_owner() as ok"))[0].ok).toBe(false);
  });
});
