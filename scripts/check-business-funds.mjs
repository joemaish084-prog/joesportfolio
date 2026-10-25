// Local PostgreSQL checks; never connects to the live database.
// Run: node scripts/check-business-funds.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const admin = "00000000-0000-0000-0000-000000000001";
try {
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create function auth.uid() returns uuid language sql as $$
      select nullif(current_setting('test.uid', true), '')::uuid
    $$;
    grant usage on schema auth to authenticated;
    create function public.has_role(uid uuid, role_name text) returns boolean language sql as $$
      select uid = '${admin}'::uuid and role_name = 'admin'
    $$;
    create function public.hub_set_updated_at() returns trigger language plpgsql as $$
      begin new.updated_at := now(); return new; end
    $$;
  `);
  await db.exec(await readFile(new URL("../supabase/migrations/20261026000000_hub_business_funds.sql", import.meta.url), "utf8"));
  await db.exec(`set role authenticated; set test.uid = '${admin}'`);
  const create = async (name, frequency = "once", due = null) => (await db.query(
    `insert into business_funds (name, target_amount, frequency, due_date) values ($1, 100, $2, $3) returning id`,
    [name, frequency, due],
  )).rows[0].id;
  const fund = await create("Annual tool", "yearly", "2028-02-29");
  const add = (id, amount) => db.query("select hub_add_fund_savings($1, $2)", [id, amount]);
  // Select composite as one value so volatile functions execute exactly once.
  const pay = (id) => db.query("select hub_pay_fund($1)", [id]);
  await assert.rejects(add(fund, -1));
  await assert.rejects(add(fund, 0.001));
  await assert.rejects(pay(fund));
  await add(fund, 75);
  await add(fund, 50);
  assert.equal(Number((await db.query("select saved_amount from business_funds where id=$1", [fund])).rows[0].saved_amount), 125);
  await pay(fund);
  let row = (await db.query("select saved_amount, due_date::text, completed_at from business_funds where id=$1", [fund])).rows[0];
  assert.equal(Number(row.saved_amount), 25);
  assert.equal(row.due_date, "2029-02-28");
  assert.equal(row.completed_at, null);
  await assert.rejects(pay(fund));
  const monthly = await create("Monthly tool", "monthly", "2027-01-31");
  await add(monthly, 100);
  await pay(monthly);
  assert.equal((await db.query("select due_date::text from business_funds where id=$1", [monthly])).rows[0].due_date, "2027-02-28");
  const once = await create("Camera");
  await add(once, 130);
  await pay(once);
  row = (await db.query("select saved_amount, completed_at from business_funds where id=$1", [once])).rows[0];
  assert.equal(Number(row.saved_amount), 30);
  assert.ok(row.completed_at);
  await assert.rejects(pay(once));
  await assert.rejects(add(once, 1));
  await assert.rejects(create("Missing recurring date", "monthly"));
  await assert.rejects(db.exec("insert into business_funds (name, target_amount) values ('Invalid target', 0)"));
  await db.exec("set test.uid = '00000000-0000-0000-0000-000000000002'");
  assert.equal((await db.query("select * from business_funds")).rows.length, 0, "CRM member must not see funds");
  await assert.rejects(create("Forbidden"));
  await assert.rejects(add(fund, 10));
  await assert.rejects(pay(fund));
  assert.equal((await db.query("update business_funds set name='Forbidden' returning id")).rows.length, 0);
  assert.equal((await db.query("delete from business_funds returning id")).rows.length, 0);
  await db.exec("reset role; set role anon");
  await assert.rejects(db.query("select * from business_funds"));
  await assert.rejects(create("Anonymous"));
  await assert.rejects(add(fund, 10));
  await assert.rejects(pay(fund));
  await db.exec("reset role");
  await db.exec(await readFile(new URL("../supabase/migrations/20261026000000_hub_business_funds.rollback.sql", import.meta.url), "utf8"));
  console.log("Business Funds: savings, payment cycles, validation, admin-only access, and rollback passed.");
} finally {
  await db.close();
}
