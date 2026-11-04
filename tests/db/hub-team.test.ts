import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, migration, type Db } from "./harness";

let db: Db;
let editor: string;
let stranger: string;
let client: string;
const saveMember = "select public.hub_save_member($1, $2, '', '', $3, $4)";

beforeAll(async () => {
  db = await createDb();
  editor = crypto.randomUUID();
  stranger = crypto.randomUUID();
  await db.admin("insert into auth.users(id,email) values($1,'editor@example.test'),($2,'stranger@example.test')", [editor, stranger]);
  await db.as(db.owner, saveMember, ["editor@example.test", "Alex Team", "editor", true]);
  const [row] = await db.admin<{ id: string }>("insert into public.clients(name) values('Shared client') returning id");
  client = row.id;
  await db.pg.exec(migration("20261026000000_hub_business_funds.sql"));
});
afterAll(() => db?.close());

describe("shared hub permissions", () => {
  it("keeps original admins and separates editor access from admin access", async () => {
    expect((await db.as<{ ok: boolean }>(db.owner, "select public.is_hub_admin() as ok"))[0].ok).toBe(true);
    const [row] = await db.as<{ access: { role: string; full_name: string }; admin: boolean }>(editor,
      "select public.hub_my_access() as access, public.is_hub_admin() as admin");
    expect(row.access).toMatchObject({ role: "editor", full_name: "Alex Team" });
    expect(row.admin).toBe(false);
    expect((await db.as<{ access: unknown }>(stranger, "select public.hub_my_access() as access"))[0].access).toBeNull();
    await expect(db.as("anon", "select public.hub_my_access()")).rejects.toThrow(/permission denied/);
  });

  it("lets editors enter and update shared clients, tasks and finance with unforgeable attribution", async () => {
    for (const [table, values] of [
      ["clients", "(name) values ('New shared client')"],
      ["tasks", "(title) values ('Prepare report')"],
      ["invoices", `(client_id,number,amount) values ('${client}','TEAM-1',5000)`],
      ["payments", `(client_id,amount) values ('${client}',1000)`],
      ["expenses", "(description,amount) values ('Team purchase',100)"],
    ]) {
      const [created] = await db.as<{ id: string; created_by: string; updated_by: string }>(editor,
        `insert into public.${table} ${values} returning id,created_by,updated_by`);
      expect(created.created_by).toBe(editor);
      expect(created.updated_by).toBe(editor);
      const [changed] = await db.as<{ created_by: string; updated_by: string }>(editor,
        `update public.${table} set created_by = $1, updated_by = $1 where id = $2 returning created_by, updated_by`, [db.owner, created.id]);
      expect(changed).toEqual({ created_by: editor, updated_by: editor });
      expect(await db.as(editor, `delete from public.${table} where id = $1 returning id`, [created.id])).toEqual([]);
    }
    expect((await db.as(editor, "select * from public.clients where id=$1", [client])).length).toBe(1);
    await expect(db.as(stranger, "insert into public.tasks(title) values('forbidden')")).rejects.toThrow(/row-level security/);
  });

  it("prevents profile-based promotion and access to team controls and settings writes", async () => {
    await db.as(editor, "select public.hub_save_profile('Alex Updated', 'Designer', '+254700000000')");
    const [profile] = await db.as<{ access: { full_name: string; role: string } }>(editor, "select public.hub_my_access() as access");
    expect(profile.access).toMatchObject({ full_name: "Alex Updated", role: "editor" });
    await expect(db.as(editor, "update public.hub_team_members set role='admin' where user_id=$1", [editor])).rejects.toThrow(/permission denied/);
    await expect(db.as(editor, saveMember, ["stranger@example.test", "Stranger", "admin", true])).rejects.toThrow(/Only admins/);
    await expect(db.as(editor, "select * from public.hub_team_list()")).rejects.toThrow(/Only admins/);
    expect(await db.as(editor, "update public.hub_settings set revenue_goal=100 returning id")).toEqual([]);
    expect(await db.as(editor, "select * from public.client_users")).toEqual([]);
    expect(await db.as(editor, "select * from public.crm_memberships")).toEqual([]);
    expect(await db.as(editor, "select * from public.business_funds")).toEqual([]);
    await expect(db.as(editor, "insert into public.business_funds(name,target_amount) values('Private',1000)")).rejects.toThrow(/row-level security/);
    await expect(db.as("service_role", saveMember, ["editor@example.test", "Forged", "admin", true])).rejects.toThrow(/Only admins/);
    await expect(db.as(editor, "select public.hub_merge_clients($1,$1)", [client])).rejects.toThrow(/Only admins/);
    await expect(db.as(editor, "select public.hub_merge_clients_team_impl($1,$1)", [client])).rejects.toThrow(/permission denied/);
    await expect(db.as(db.owner, "select public.hub_merge_clients($1,$1)", [client])).rejects.toThrow(/Choose two/);
  });

  it("preserves business records and attribution when an Auth account is deleted", async () => {
    const departing = crypto.randomUUID();
    await db.admin("insert into auth.users(id,email) values($1,'departing@example.test')", [departing]);
    await db.as(db.owner, saveMember, ["departing@example.test", "Departing", "editor", true]);
    const [row] = await db.as<{ id: string }>(departing, "insert into public.tasks(title) values('Keep this task') returning id");
    await db.admin("delete from auth.users where id=$1", [departing]);
    expect((await db.admin<{ created_by: string }>("select created_by from public.tasks where id=$1", [row.id]))[0].created_by).toBe(departing);
  });

  it("supports admin promotion, demotion and immediate revocation without self-lockout", async () => {
    await db.as(db.owner, saveMember, ["stranger@example.test", "Second Admin", "admin", true]);
    expect((await db.as<{ ok: boolean }>(stranger, "select public.is_hub_admin() as ok"))[0].ok).toBe(true);
    expect((await db.as(stranger, "update public.hub_settings set revenue_goal=250000 returning id")).length).toBe(1);
    await expect(db.as(stranger, saveMember, ["stranger@example.test", "Second Admin", "editor", true])).rejects.toThrow(/own admin/);
    await expect(db.as(db.owner, saveMember, ["owner@example.com", "Owner", "editor", true])).rejects.toThrow(/Original admins/);
    await db.as(db.owner, saveMember, ["stranger@example.test", "Second Admin", "editor", false]);
    expect(await db.as(stranger, "select * from public.clients")).toEqual([]);
    await expect(db.as(stranger, "select public.hub_save_profile('Reactivate','','')")).rejects.toThrow(/No hub access/);
    expect((await db.as<{ ok: boolean }>(stranger, "select public.is_hub_admin() as ok"))[0].ok).toBe(false);
  });

  it("rolls back team permissions while preserving original admins and operational records", async () => {
    await db.pg.exec(migration("20261104000000_hub_team.rollback.sql"));
    expect(await db.as(editor, "select * from public.clients")).toEqual([]);
    expect((await db.as(db.owner, "select * from public.clients where id=$1", [client])).length).toBe(1);
    expect((await db.as<{ ok: boolean }>(db.owner, "select public.is_hub_admin() as ok"))[0].ok).toBe(true);
  });
});
