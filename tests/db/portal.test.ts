import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, type Db } from "./harness";

// The client portal's access rules, run against the real migration. A client
// must only ever see their own client's shared data, in the columns meant for
// them, and never anything of another client's.

let db: Db;
let alice: string; // member of Acme
let bob: string; // member of Birch
let stranger: string; // signed in, no portal access
let acme: string;
let birch: string;

type Snapshot = {
  client: { id: string; name: string };
  settings: { modules: string[] };
  me: { preview: boolean };
  kpis: { id: string; name: string }[];
  reports: { id: string; title: string }[];
  report_metrics: { value: number }[];
  work: Record<string, unknown>[];
  milestones: { title: string }[];
  updates: { id: string; kind: string; resolved_at: string | null }[];
  invoices: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  documents: ({ title: string } & Record<string, unknown>)[];
  messages: unknown[];
  business: Record<string, string>;
} | null;

const snapshot = async (who: string, clientId: string | null = null) =>
  (await db.as<{ s: Snapshot }>(who, "select public.portal_snapshot($1) as s", [clientId]))[0].s;

async function mkClient(name: string) {
  const [row] = await db.admin<{ id: string }>("insert into public.clients (name) values ($1) returning id", [name]);
  return row.id;
}

async function mkUser(email: string, clientId?: string) {
  const id = crypto.randomUUID();
  await db.admin("insert into auth.users (id, email) values ($1, $2)", [id, email]);
  if (clientId) {
    await db.admin("insert into public.client_users (client_id, user_id, email) values ($1, $2, $3)", [clientId, id, email]);
  }
  return id;
}

beforeAll(async () => {
  db = await createDb();
  acme = await mkClient("Acme");
  birch = await mkClient("Birch");
  alice = await mkUser("alice@acme.test", acme);
  bob = await mkUser("bob@birch.test", birch);
  stranger = await mkUser("eve@nowhere.test");

  const [kpi] = await db.admin<{ id: string }>(
    "insert into public.client_kpis (client_id, name, unit) values ($1, 'Revenue', 'kes') returning id",
    [acme],
  );
  await db.admin("insert into public.client_kpis (client_id, name) values ($1, 'Secret Birch KPI')", [birch]);

  const mkReport = async (title: string, visible: boolean, value: number) => {
    const [r] = await db.admin<{ id: string }>(
      `insert into public.reports (client_id, title, period_start, period_end, client_visible)
       values ($1, $2, '2026-09-01', '2026-09-30', $3) returning id`,
      [acme, title, visible],
    );
    await db.admin("insert into public.report_metrics (report_id, client_kpi_id, value) values ($1, $2, $3)", [
      r.id,
      kpi.id,
      value,
    ]);
    return r.id;
  };
  await mkReport("Shared September", true, 1000);
  await mkReport("Draft October", false, 9999);

  await db.admin(
    `insert into public.work_log (client_id, title, details, minutes, client_visible) values
       ($1, 'Shared task', 'visible detail', 120, true),
       ($1, 'Hidden task', 'internal', 30, false),
       ($2, 'Birch task', 'x', 10, true)`,
    [acme, birch],
  );
  await db.admin(
    `insert into public.documents (client_id, title, storage_path, file_name, client_visible, notes) values
       ($1, 'Shared contract', 'acme/shared.pdf', 'shared.pdf', true, 'private note'),
       ($1, 'Internal brief', 'acme/internal.pdf', 'internal.pdf', false, null),
       ($2, 'Birch contract', 'birch/contract.pdf', 'contract.pdf', true, null)`,
    [acme, birch],
  );
  await db.admin(
    `insert into public.invoices (client_id, number, amount, status, notes) values
       ($1, 'INV-1', 5000, 'sent', 'internal invoice note'),
       ($1, 'INV-2', 7000, 'draft', null),
       ($1, 'INV-3', 100, 'void', null)`,
    [acme],
  );
  await db.admin("insert into public.payments (client_id, amount, notes) values ($1, 2000, 'internal payment note')", [acme]);
  await db.admin("insert into public.expenses (client_id, description, amount) values ($1, 'Secret ad spend', 500)", [acme]);
  await db.admin(
    `insert into public.client_milestones (client_id, title, status)
     values ($1, 'Launch site', 'in_progress'), ($2, 'Birch plan', 'planned')`,
    [acme, birch],
  );
});

afterAll(() => db?.close());

describe("who can read what", () => {
  it("turns away anonymous requests outright", async () => {
    await expect(db.as("anon", "select public.portal_snapshot()")).rejects.toThrow(/permission denied/);
    await expect(db.as("anon", "select * from public.client_users")).rejects.toThrow(/permission denied/);
    await expect(db.as("anon", "select * from public.client_messages")).rejects.toThrow(/permission denied/);
  });

  it("gives a signed-in stranger nothing", async () => {
    expect(await snapshot(stranger)).toBeNull();
    expect(await db.as(stranger, "select * from public.client_users")).toEqual([]);
    expect(await db.as(stranger, "select * from public.client_updates")).toEqual([]);
  });

  it("gives a client only their own client", async () => {
    const mine = await snapshot(alice);
    expect(mine?.client.name).toBe("Acme");
    expect(mine?.milestones.map((m) => m.title)).toEqual(["Launch site"]);
    const theirs = await snapshot(bob);
    expect(theirs?.client.name).toBe("Birch");
    expect(theirs?.milestones.map((m) => m.title)).toEqual(["Birch plan"]);
    expect(theirs?.kpis.map((k) => k.name)).toEqual(["Secret Birch KPI"]);
  });

  it("refuses another client's id", async () => {
    expect(await snapshot(alice, birch)).toBeNull();
  });

  it("never lets a client read tables directly", async () => {
    for (const table of ["clients", "reports", "work_log", "invoices", "payments", "expenses", "documents", "client_users"]) {
      expect(await db.as(alice, `select * from public.${table}`), table).toEqual([]);
    }
  });

  it("lets the hub admin preview any client", async () => {
    const view = await snapshot(db.owner, birch);
    expect(view?.client.name).toBe("Birch");
    expect(view?.me.preview).toBe(true);
    expect(await snapshot(db.owner)).toBeNull();
  });
});

describe("what a client sees", () => {
  it("shows only shared reports and the numbers behind them", async () => {
    const s = await snapshot(alice);
    expect(s?.reports.map((r) => r.title)).toEqual(["Shared September"]);
    expect(s?.report_metrics.map((m) => Number(m.value))).toEqual([1000]);
  });

  it("shows only shared work, without minutes", async () => {
    const s = await snapshot(alice);
    expect(s?.work).toHaveLength(1);
    expect(s?.work[0]).toMatchObject({ title: "Shared task" });
    expect(Object.keys(s!.work[0])).not.toContain("minutes");
  });

  it("shows only shared documents, without notes", async () => {
    const s = await snapshot(alice);
    expect(s?.documents.map((d) => d.title)).toEqual(["Shared contract"]);
    expect(Object.keys(s!.documents[0])).not.toContain("notes");
  });

  it("hides drafts and void invoices and every internal note", async () => {
    const s = await snapshot(alice);
    expect(s?.invoices.map((i) => i.number)).toEqual(["INV-1"]);
    expect(JSON.stringify(s)).not.toMatch(/internal invoice note|internal payment note|Secret ad spend|private note/);
    expect(Object.keys(s!.invoices[0])).not.toContain("notes");
    expect(Object.keys(s!.payments[0])).not.toContain("notes");
  });

  it("includes a sent invoice's PDF, but not before the invoice is sent", async () => {
    const [doc] = await db.admin<{ id: string }>(
      `insert into public.documents (client_id, title, storage_path, file_name, client_visible)
       values ($1, 'Invoice PDF', 'acme/inv.pdf', 'inv.pdf', false) returning id`,
      [acme],
    );
    expect((await snapshot(alice))?.documents.map((d) => d.title)).not.toContain("Invoice PDF");
    await db.admin("update public.invoices set document_id = $1 where number = 'INV-1'", [doc.id]);
    expect((await snapshot(alice))?.documents.map((d) => d.title)).toContain("Invoice PDF");
    await db.admin("update public.invoices set document_id = null where number = 'INV-1'");
  });
});

describe("modules", () => {
  it("drops the sections you switch off", async () => {
    await db.admin(
      "insert into public.client_portal_settings (client_id, modules) values ($1, array['overview', 'results', 'help'])",
      [acme],
    );
    const s = await snapshot(alice);
    expect(s?.invoices).toEqual([]);
    expect(s?.payments).toEqual([]);
    expect(s?.work).toEqual([]);
    expect(s?.milestones).toEqual([]);
    expect(s?.documents).toEqual([]);
    expect(s?.reports).toHaveLength(1);
    await db.admin("delete from public.client_portal_settings where client_id = $1", [acme]);
  });

  it("closes the portal for a client when it is disabled, but not for the admin preview", async () => {
    await db.admin("insert into public.client_portal_settings (client_id, enabled) values ($1, false)", [acme]);
    expect(await snapshot(alice)).toBeNull();
    expect((await snapshot(db.owner, acme))?.client.name).toBe("Acme");
    await db.admin("delete from public.client_portal_settings where client_id = $1", [acme]);
  });

  it("rejects unknown module names", async () => {
    await expect(
      db.admin("insert into public.client_portal_settings (client_id, modules) values ($1, array['nope'])", [birch]),
    ).rejects.toThrow(/check constraint/);
  });
});

describe("business details", () => {
  beforeAll(async () => {
    await db.admin(
      `update public.hub_settings set business = business || $1::jsonb`,
      [
        JSON.stringify({
          phone: "+254 700 000 000",
          kra_pin: "A000000000Z",
          mpesa_till: "123456",
          mpesa_paybill: "400200",
          bank_account_number: "0100-9999",
        }),
      ],
    );
  });

  it("shows your contact details and, with billing on, how to pay", async () => {
    const b = (await snapshot(alice))?.business;
    expect(b).toMatchObject({ phone: "+254 700 000 000", mpesa_till: "123456", mpesa_paybill: "400200", kra_pin: "A000000000Z" });
    expect(b).not.toHaveProperty("mpesa_account"); // unset fields are left out, not null
  });

  it("keeps payment details back when the billing section is off", async () => {
    await db.admin(
      "insert into public.client_portal_settings (client_id, modules) values ($1, array['overview', 'results', 'help'])",
      [acme],
    );
    const b = (await snapshot(alice))?.business;
    expect(b).toMatchObject({ phone: "+254 700 000 000" });
    expect(JSON.stringify(b)).not.toMatch(/123456|400200|A000000000Z|0100-9999/);
    await db.admin("delete from public.client_portal_settings where client_id = $1", [acme]);
  });

  it("cannot be read directly by a client", async () => {
    await expect(db.as(alice, "select public.portal_business(true)")).rejects.toThrow(/permission denied/);
  });
});

describe("file access", () => {
  const canRead = async (who: string, path: string) =>
    (await db.as<{ ok: boolean }>(who, "select public.portal_can_read_file($1) as ok", [path]))[0].ok;

  it("opens a shared file for its own client only", async () => {
    expect(await canRead(alice, "acme/shared.pdf")).toBe(true);
    expect(await canRead(bob, "acme/shared.pdf")).toBe(false);
    expect(await canRead(stranger, "acme/shared.pdf")).toBe(false);
  });

  it("keeps unshared and other clients' files closed", async () => {
    expect(await canRead(alice, "acme/internal.pdf")).toBe(false);
    expect(await canRead(alice, "birch/contract.pdf")).toBe(false);
  });

  it("opens a published report's PDF without sharing the document separately", async () => {
    const [doc] = await db.admin<{ id: string }>(
      `insert into public.documents (client_id, title, storage_path, file_name)
       values ($1, 'Sept PDF', 'acme/sept.pdf', 'sept.pdf') returning id`,
      [acme],
    );
    expect(await canRead(alice, "acme/sept.pdf")).toBe(false);
    await db.admin("update public.reports set document_id = $1 where title = 'Shared September'", [doc.id]);
    expect(await canRead(alice, "acme/sept.pdf")).toBe(true);
  });

  it("applies the storage policy to the signed-in client", async () => {
    await db.admin("grant select on storage.objects to authenticated");
    await db.admin(
      `insert into storage.objects (bucket_id, name)
       values ('hub-documents', 'acme/shared.pdf'), ('hub-documents', 'acme/internal.pdf'), ('hub-documents', 'birch/contract.pdf')`,
    );
    const seen = await db.as<{ name: string }>(alice, "select name from storage.objects order by name");
    expect(seen.map((o) => o.name)).toEqual(["acme/shared.pdf"]);
  });
});

describe("actions", () => {
  it("lets a client resolve their own action item and nobody else's", async () => {
    const [mine] = await db.admin<{ id: string }>(
      "insert into public.client_updates (client_id, kind, title) values ($1, 'action', 'Send brand assets') returning id",
      [acme],
    );
    await expect(db.as(bob, "select public.portal_resolve_update($1)", [mine.id])).rejects.toThrow(/Not found/);
    await db.as(alice, "select public.portal_resolve_update($1)", [mine.id]);
    const s = await snapshot(alice);
    expect(s?.updates.find((u) => u.id === mine.id)?.resolved_at).not.toBeNull();
  });

  it("does not let a plain update be resolved", async () => {
    const [note] = await db.admin<{ id: string }>(
      "insert into public.client_updates (client_id, kind, title) values ($1, 'update', 'FYI') returning id",
      [acme],
    );
    await expect(db.as(alice, "select public.portal_resolve_update($1)", [note.id])).rejects.toThrow(/Not found/);
  });

  it("stores a client's message against their own client", async () => {
    await db.as(alice, "select public.portal_send_message('question', 'Hello', 'Can we talk?')");
    const rows = await db.admin<{ client_id: string; subject: string }>("select client_id, subject from public.client_messages");
    expect(rows).toEqual([{ client_id: acme, subject: "Hello" }]);
    expect((await snapshot(alice))?.messages).toHaveLength(1);
    expect((await snapshot(bob))?.messages).toHaveLength(0);
  });

  it("rejects messages from non-members, bad types, empty text and floods", async () => {
    await expect(db.as(stranger, "select public.portal_send_message('question', 'Hi', 'Hi')")).rejects.toThrow(/Not allowed/);
    await expect(db.as(alice, "select public.portal_send_message('spam', 'Hi', 'Hi')")).rejects.toThrow(/Invalid message type/);
    await expect(db.as(alice, "select public.portal_send_message('question', ' ', 'Hi')")).rejects.toThrow(/Invalid message/);
    await expect(db.as(alice, "select public.portal_send_message('question', 'Hi', $1)", ["x".repeat(4001)])).rejects.toThrow(
      /Invalid message/,
    );
    // One message was stored above, so nine more reach the limit of ten an hour.
    for (let i = 0; i < 9; i++) await db.as(alice, "select public.portal_send_message('request', 'Again', 'More')");
    await expect(db.as(alice, "select public.portal_send_message('request', 'Again', 'More')")).rejects.toThrow(/Too many/);
  });

  it("keeps the inbox itself admin-only", async () => {
    expect(await db.as(alice, "select * from public.client_messages")).toEqual([]);
    await db.as(alice, "update public.client_messages set status = 'done'");
    expect(await db.admin("select 1 from public.client_messages where status = 'done'")).toHaveLength(0);
  });
});

describe("granting access", () => {
  it("is for the hub admin only", async () => {
    await expect(db.as(alice, "select public.portal_link_user($1, 'x@y.test')", [acme])).rejects.toThrow(/Not allowed/);
  });

  it("links an existing account straight away and waits for a new one", async () => {
    const existing = await mkUser("carol@acme.test");
    const [linked] = await db.as<{ r: { linked: boolean } }>(
      db.owner,
      "select public.portal_link_user($1, 'Carol@Acme.test', 'Carol') as r",
      [acme],
    );
    expect(linked.r.linked).toBe(true);
    expect((await snapshot(existing))?.client.name).toBe("Acme");

    const [pending] = await db.as<{ r: { linked: boolean } }>(db.owner, "select public.portal_link_user($1, 'dan@acme.test') as r", [
      acme,
    ]);
    expect(pending.r.linked).toBe(false);
    expect(await db.admin("select user_id from public.client_users where email = 'dan@acme.test'")).toEqual([{ user_id: null }]);
  });

  it("does not create the same person twice", async () => {
    await db.as(db.owner, "select public.portal_link_user($1, 'DAN@acme.test')", [acme]);
    expect(await db.admin("select 1 from public.client_users where lower(email) = 'dan@acme.test'")).toHaveLength(1);
  });
});

describe("milestones", () => {
  it("stamps completion when a milestone is marked done and clears it again", async () => {
    const [m] = await db.admin<{ id: string; completed_at: string | null }>(
      "insert into public.client_milestones (client_id, title) values ($1, 'Go live') returning id, completed_at",
      [acme],
    );
    expect(m.completed_at).toBeNull();
    const [done] = await db.admin<{ completed_at: string | null }>(
      "update public.client_milestones set status = 'done' where id = $1 returning completed_at",
      [m.id],
    );
    expect(done.completed_at).not.toBeNull();
    const [reopened] = await db.admin<{ completed_at: string | null }>(
      "update public.client_milestones set status = 'in_progress' where id = $1 returning completed_at",
      [m.id],
    );
    expect(reopened.completed_at).toBeNull();
  });
});
