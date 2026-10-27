import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

// Runs the real Supabase migrations in an in-process Postgres (PGlite), with
// just enough of Supabase around them: the anon/authenticated/service_role
// roles, auth.users, auth.uid()/auth.jwt() read from request.jwt.claims the
// way PostgREST sets them, and the storage tables the hub migration touches.

const SUPABASE_STUB = `
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to service_role;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;
create table auth.users (id uuid primary key, email text unique);
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
create function auth.uid() returns uuid language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid
$$;

create schema storage;
grant usage on schema storage to authenticated;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
`;

const migration = (name: string) => readFileSync(new URL(`../../supabase/migrations/${name}`, import.meta.url), "utf8");

export type Db = Awaited<ReturnType<typeof createDb>>;
export type Role = "owner" | "manager" | "viewer";

export async function createDb() {
  const pg = new PGlite();
  await pg.exec(SUPABASE_STUB);
  await pg.exec(migration("20261016000000_client_hub_phase1.sql"));

  // The hub admin exists before the CRM migration, so the seed makes them the owner.
  const owner = randomUUID();
  await pg.query("insert into auth.users (id, email) values ($1, 'owner@example.com')", [owner]);
  await pg.query("insert into public.user_roles (user_id, role) values ($1, 'admin')", [owner]);

  await pg.exec(migration("20261024000000_crm_core.sql"));
  await pg.exec(migration("20261027000000_crm_brevo.sql"));
  for (const t of ["crm_organisations", "crm_memberships", "crm_leads"]) {
    await pg.exec(`grant all on public.${t} to service_role`);
  }
  await pg.exec("grant all on all tables in schema public to service_role");
  await pg.exec("grant execute on all functions in schema public to service_role");

  const org = (await pg.query<{ id: string }>("select id from public.crm_organisations")).rows[0].id;

  /** Runs one statement as a signed-in user (or anon / the service role), like PostgREST would. */
  async function as<T = Record<string, unknown>>(
    who: string | "anon" | "service_role",
    sql: string,
    params: unknown[] = [],
    claims: Record<string, unknown> = {},
  ) {
    const role = who === "anon" || who === "service_role" ? who : "authenticated";
    const jwt = role === "authenticated" ? { sub: who, role, aal: "aal1", ...claims } : { role, ...claims };
    return pg.transaction(async (tx) => {
      await tx.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(jwt)]);
      await tx.exec(`set local role ${role}`);
      return (await tx.query<T>(sql, params)).rows;
    });
  }

  /** As the superuser, bypassing RLS: test setup and assertions only. */
  async function admin<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
    return (await pg.query<T>(sql, params)).rows;
  }

  async function addUser(role: Role, email = `${role}-${randomUUID().slice(0, 6)}@example.com`) {
    const id = randomUUID();
    await admin("insert into auth.users (id, email) values ($1, $2)", [id, email]);
    await admin("insert into public.crm_memberships (org_id, user_id, role) values ($1, $2, $3)", [org, id, role]);
    return id;
  }

  async function addLead(values: Record<string, unknown> = {}) {
    const row = { name: `Lead ${randomUUID().slice(0, 6)}`, ...values };
    const cols = Object.keys(row);
    const rows = await admin<{ id: string }>(
      `insert into public.crm_leads (org_id, ${cols.join(", ")}) values ($1, ${cols.map((_, i) => `$${i + 2}`).join(", ")}) returning id`,
      [org, ...Object.values(row)],
    );
    return rows[0].id;
  }

  return { pg, org, owner, as, admin, addUser, addLead, close: () => pg.close() };
}
