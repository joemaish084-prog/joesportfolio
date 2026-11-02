import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SUPABASE_STUB, migration } from "./harness";

// WhatsApp leads and taps on the Leads dashboard, run against the real
// analytics migrations. pulses and visitors predate the repo's migrations, so
// they're recreated here with just the columns the analytics function reads.

const TRACKER_TABLES = `
create table public.visitors (
  id uuid primary key default gen_random_uuid(),
  device_id text, ip_hash text, user_agent text, browser text, os text, device_type text,
  is_bot boolean not null default false,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  visit_count integer not null default 1
);
create table public.pulses (
  id bigserial primary key,
  visitor_id uuid references public.visitors(id),
  session_id text not null,
  event_type text not null,
  page_path text not null,
  page_title text, element_selector text, element_text text,
  duration_ms integer, referrer text,
  created_at timestamptz not null default now()
);
`;

type Analytics = {
  totals: { leads: number };
  period: { leads: number; prev_leads: number; sessions: number };
  leads: {
    period_total: number;
    conversion_rate: number;
    booked: number;
    by_kind: { kind: string; count: number }[];
    by_status: { status: string; count: number }[];
    by_source: { source: string; count: number }[];
    by_day: { day: string; count: number }[];
    recent: { kind: string; name: string | null; phone: string | null }[];
    whatsapp_clicks?: number;
    whatsapp_click_sessions?: number;
    whatsapp_by_location?: { location: string; count: number }[];
    whatsapp_from_site?: number;
  };
};

let pg: PGlite;
let owner: string;
let stranger: string;

async function as<T>(who: string, sql: string, params: unknown[] = []) {
  const role = who === "anon" || who === "service_role" ? who : "authenticated";
  const jwt = role === "authenticated" ? { sub: who, role } : { role };
  return pg.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(jwt)]);
    await tx.exec(`set local role ${role}`);
    return (await tx.query<T>(sql, params)).rows;
  });
}

const analytics = async (days = 14) =>
  (await as<{ a: Analytics }>("service_role", "select public.get_admin_analytics($1) as a", [days]))[0].a;

beforeAll(async () => {
  pg = new PGlite();
  await pg.exec(SUPABASE_STUB);
  await pg.exec(TRACKER_TABLES);
  await pg.exec(migration("20260923000000_restore_lead_tables_and_add_chat_leads.sql"));
  await pg.exec(migration("20260923000001_extend_chat_leads_for_multi_phase_agents.sql"));
  await pg.exec(migration("20260930000000_expand_admin_analytics.sql"));
  await pg.exec(migration("20261016000000_client_hub_phase1.sql"));
  await pg.exec(migration("20261018000000_hub_site_analytics.sql"));
  await pg.exec(migration("20261102000000_whatsapp_leads.sql"));
  await pg.exec("grant all on all tables in schema public to service_role");
  await pg.exec("grant usage on all sequences in schema public to service_role");

  owner = randomUUID();
  stranger = randomUUID();
  await pg.query("insert into auth.users (id, email) values ($1, 'owner@example.com'), ($2, 'stranger@example.com')", [
    owner,
    stranger,
  ]);
  await pg.query("insert into public.user_roles (user_id, role) values ($1, 'admin')", [owner]);

  // Two sessions on the site, one of which taps WhatsApp twice.
  const [v] = (await pg.query<{ id: string }>("insert into public.visitors default values returning id")).rows;
  await pg.query(
    `insert into public.pulses (visitor_id, session_id, event_type, page_path, element_selector) values
       ($1, 's1', 'page_view', '/', null),
       ($1, 's1', 'click', '/', 'whatsapp:floating_button'),
       ($1, 's1', 'click', '/', 'whatsapp:contact'),
       ($1, 's2', 'page_view', '/agency', null),
       ($1, 's2', 'click', '/agency', 'whatsapp:floating_button'),
       ($1, 's2', 'click', '/agency', 'a.btn')`,
    [v.id],
  );
  await pg.query("insert into public.contact_messages (name, email, message, source) values ('Ann', 'ann@example.com', 'Hi', 'google')");
});

afterAll(() => pg.close());

describe("whatsapp_leads access", () => {
  it("lets the hub admin log and read WhatsApp leads", async () => {
    await as(owner, "insert into public.whatsapp_leads (name, phone, detail, booked) values ('Brian', '0712345678', 'Wants ads', true)");
    await as(owner, "insert into public.whatsapp_leads (phone, source, status) values ('0700000000', 'instagram', 'talking')");
    // Logged late: the chat happened 60 days ago, outside a 14-day range.
    await as(owner, "insert into public.whatsapp_leads (name, created_at) values ('Old chat', now() - interval '60 days')");
    const rows = await as<{ name: string; logged_by: string }>(owner, "select name, logged_by from public.whatsapp_leads");
    expect(rows).toHaveLength(3);
    expect(rows[0].logged_by).toBe(owner);
  });

  it("hides them from signed-in users who aren't the admin", async () => {
    expect(await as(stranger, "select * from public.whatsapp_leads")).toHaveLength(0);
    await expect(as(stranger, "insert into public.whatsapp_leads (name) values ('x')")).rejects.toThrow(/row-level security/);
    expect(await as(stranger, "update public.whatsapp_leads set status = 'won' returning id")).toHaveLength(0);
    expect(await as(stranger, "delete from public.whatsapp_leads returning id")).toHaveLength(0);
  });

  it("rejects anonymous requests outright", async () => {
    await expect(as("anon", "select * from public.whatsapp_leads")).rejects.toThrow(/permission denied/);
    await expect(as("anon", "insert into public.whatsapp_leads (name) values ('x')")).rejects.toThrow(/permission denied/);
  });

  it("needs a name or a phone number, and a known status", async () => {
    await expect(as(owner, "insert into public.whatsapp_leads (detail) values ('no contact')")).rejects.toThrow(/has_contact/);
    await expect(as(owner, "insert into public.whatsapp_leads (name, status) values ('x', 'maybe')")).rejects.toThrow(/status/);
  });
});

describe("get_admin_analytics with WhatsApp", () => {
  it("counts WhatsApp leads in every lead figure", async () => {
    const a = await analytics();
    expect(a.totals.leads).toBe(4); // contact form + 3 WhatsApp, all time
    expect(a.period.leads).toBe(3); // the 60-day-old chat is out of range
    expect(a.leads.period_total).toBe(3);
    expect(a.leads.booked).toBe(1);
    expect(a.leads.by_kind).toContainEqual({ kind: "WhatsApp", count: 2 });
    expect(a.leads.by_kind).toContainEqual({ kind: "Contact form", count: 1 });
    expect(a.leads.by_status).toEqual(expect.arrayContaining([{ status: "new", count: 2 }, { status: "talking", count: 1 }]));
    expect(a.leads.by_source).toEqual(
      expect.arrayContaining([
        { source: "website", count: 1 },
        { source: "instagram", count: 1 },
        { source: "google", count: 1 },
      ]),
    );
    expect(a.leads.by_day.reduce((sum, d) => sum + d.count, 0)).toBe(3);
    expect(a.leads.conversion_rate).toBe(150); // 3 leads over 2 sessions
    expect(a.leads.recent.filter((r) => r.kind === "WhatsApp")).toHaveLength(3);
    expect(a.leads.whatsapp_from_site).toBe(1);
  });

  it("reports WhatsApp taps from the tracker", async () => {
    const a = await analytics();
    expect(a.leads.whatsapp_clicks).toBe(3);
    expect(a.leads.whatsapp_click_sessions).toBe(2);
    expect(a.leads.whatsapp_by_location).toEqual([
      { location: "floating_button", count: 2 },
      { location: "contact", count: 1 },
    ]);
  });

  it("keeps the analytics functions closed to everyone but the service role and the hub admin", async () => {
    await expect(as("anon", "select public.get_admin_analytics(14)")).rejects.toThrow(/permission denied/);
    await expect(as(owner, "select public.get_admin_analytics_base(14)")).rejects.toThrow(/permission denied/);
    const [{ a }] = await as<{ a: Analytics }>(owner, "select public.hub_site_analytics(14) as a");
    expect(a.leads.whatsapp_clicks).toBe(3);
    await expect(as(stranger, "select public.hub_site_analytics(14)")).rejects.toThrow(/not allowed/);
  });

  it("rolls back to the original function", async () => {
    await pg.exec(migration("20261102000000_whatsapp_leads.rollback.sql"));
    const a = await analytics();
    expect(a.leads.whatsapp_clicks).toBeUndefined();
    expect(a.totals.leads).toBe(1);
    await expect(as("anon", "select public.get_admin_analytics(14)")).rejects.toThrow(/permission denied/);
  });
});
