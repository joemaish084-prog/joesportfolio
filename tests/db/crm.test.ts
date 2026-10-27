import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { domainKey, emailKey, nameKey, phoneKey } from "@/hub/crm/lib/normalize";
import { createDb, type Db } from "./harness";

// Access control and the safety triggers, run against the real migration.

let db: Db;
let manager: string;
let otherManager: string;
let viewer: string;
let outsider: string;

beforeAll(async () => {
  db = await createDb();
  manager = await db.addUser("manager");
  otherManager = await db.addUser("manager");
  viewer = await db.addUser("viewer");
  outsider = crypto.randomUUID();
  await db.admin("insert into auth.users (id, email) values ($1, 'outsider@example.com')", [outsider]);
});

afterAll(() => db?.close());

const leadNames = async (who: string) =>
  (await db.as<{ name: string }>(who, "select name from public.crm_leads order by name")).map((r) => r.name);

async function approvedDraft(lead: string, kind = "initial_email") {
  const [draft] = await db.as<{ id: string }>(
    db.owner,
    `insert into public.crm_outreach_drafts (lead_id, kind, channel, subject, body)
     values ($1, $2, 'email', 'Hello', 'Body') returning id`,
    [lead, kind],
  );
  await db.as(db.owner, "update public.crm_outreach_drafts set status = 'approved' where id = $1", [draft.id]);
  return draft.id;
}

describe("access control", () => {
  it("rejects anonymous requests outright", async () => {
    await expect(db.as("anon", "select * from public.crm_leads")).rejects.toThrow(/permission denied/);
    await expect(db.as("anon", "select * from public.crm_suppression_list")).rejects.toThrow(/permission denied/);
  });

  it("shows nothing to a signed-in user without a membership", async () => {
    await db.addLead({ name: "Invisible Motors" });
    expect(await leadNames(outsider)).toEqual([]);
    await expect(
      db.as(outsider, "insert into public.crm_leads (org_id, name, owner_id) values ($1, 'X', $2)", [db.org, outsider]),
    ).rejects.toThrow(/row-level security/);
    expect(await db.as(outsider, "select public.crm_my_access() as a")).toEqual([{ a: null }]);
  });

  it("gives managers their assigned and shared leads only", async () => {
    const mine = await db.addLead({ name: "Assigned Autos", owner_id: manager });
    const shared = await db.addLead({ name: "Shared Cars", owner_id: otherManager });
    await db.addLead({ name: "Someone Elses Motors", owner_id: otherManager });
    await db.admin("insert into public.crm_lead_shares (lead_id, user_id) values ($1, $2)", [shared, manager]);

    const names = await leadNames(manager);
    expect(names).toContain("Assigned Autos");
    expect(names).toContain("Shared Cars");
    expect(names).not.toContain("Someone Elses Motors");

    // edits the assigned lead
    expect(await db.as(manager, "update public.crm_leads set notes = 'ok' where id = $1 returning id", [mine])).toHaveLength(1);
    // read-only on a shared lead
    expect(await db.as(manager, "update public.crm_leads set notes = 'no' where id = $1 returning id", [shared])).toHaveLength(0);
    // can't hand the lead to someone else
    await expect(
      db.as(manager, "update public.crm_leads set owner_id = $2 where id = $1", [mine, otherManager]),
    ).rejects.toThrow(/row-level security/);
    // can't delete
    expect(await db.as(manager, "delete from public.crm_leads where id = $1 returning id", [mine])).toHaveLength(0);
    // new leads must be their own
    await expect(
      db.as(manager, "insert into public.crm_leads (org_id, name, owner_id) values ($1, 'Grab', $2)", [db.org, otherManager]),
    ).rejects.toThrow(/row-level security/);
    expect(
      await db.as(manager, "insert into public.crm_leads (org_id, name, owner_id) values ($1, 'Own Lead', $2) returning id", [
        db.org,
        manager,
      ]),
    ).toHaveLength(1);
  });

  it("keeps viewers read-only on explicitly shared leads", async () => {
    const shared = await db.addLead({ name: "Viewer Visible" });
    await db.addLead({ name: "Viewer Hidden" });
    await db.admin("insert into public.crm_lead_shares (lead_id, user_id) values ($1, $2)", [shared, viewer]);

    expect(await leadNames(viewer)).toEqual(["Viewer Visible"]);
    expect(await db.as(viewer, "update public.crm_leads set notes = 'x' where id = $1 returning id", [shared])).toHaveLength(0);
    await expect(
      db.as(viewer, "insert into public.crm_lead_contacts (lead_id, name) values ($1, 'Jane')", [shared]),
    ).rejects.toThrow(/row-level security/);
    await expect(
      db.as(viewer, "insert into public.crm_activities (lead_id, type, summary, actor_id) values ($1, 'note', 'hi', $2)", [
        shared,
        viewer,
      ]),
    ).rejects.toThrow(/row-level security/);
    expect(await db.as(viewer, "select * from public.crm_suppression_list")).toEqual([]);
  });

  it("lets only owners change settings, and audits it", async () => {
    expect(
      await db.as(manager, "update public.crm_organisations set sending_enabled = true where id = $1 returning id", [db.org]),
    ).toHaveLength(0);
    await db.as(db.owner, "update public.crm_organisations set require_mfa = false, sender_name = 'Joseph' where id = $1", [db.org]);
    const sending = await db.admin<{ sending_enabled: boolean }>("select sending_enabled from public.crm_organisations");
    expect(sending[0].sending_enabled).toBe(false);
  });

  it("requires a second factor once the organisation turns on MFA", async () => {
    await db.admin("update public.crm_organisations set require_mfa = true");
    try {
      expect(await leadNames(db.owner)).toEqual([]);
      expect((await db.as(db.owner, "select name from public.crm_leads", [], { aal: "aal2" })).length).toBeGreaterThan(0);
      const [{ a }] = await db.as<{ a: { mfa_ok: boolean } }>(db.owner, "select public.crm_my_access() as a");
      expect(a.mfa_ok).toBe(false);
    } finally {
      await db.admin("update public.crm_organisations set require_mfa = false");
    }
  });

  it("protects the audit log and the last owner", async () => {
    expect((await db.as(db.owner, "select * from public.crm_audit_logs")).length).toBeGreaterThan(0);
    expect(await db.as(manager, "select * from public.crm_audit_logs")).toEqual([]);
    await expect(
      db.as(db.owner, "insert into public.crm_audit_logs (org_id, action, entity) values ($1, 'fake', 'x')", [db.org]),
    ).rejects.toThrow(/permission denied/);
    await expect(db.as(db.owner, "delete from public.crm_audit_logs")).rejects.toThrow(/permission denied/);
    await expect(
      db.as(db.owner, "update public.crm_memberships set role = 'manager' where user_id = $1", [db.owner]),
    ).rejects.toThrow(/at least one owner/);
  });

  it("keeps organisations apart", async () => {
    const [{ id: org2 }] = await db.admin<{ id: string }>(
      "insert into public.crm_organisations (name) values ('Other Agency') returning id",
    );
    const owner2 = crypto.randomUUID();
    await db.admin("insert into auth.users (id, email) values ($1, 'owner2@example.com')", [owner2]);
    await db.admin("insert into public.crm_memberships (org_id, user_id, role) values ($1, $2, 'owner')", [org2, owner2]);
    const lead = await db.addLead({ name: "Org One Lead" });

    expect(await leadNames(owner2)).toEqual([]);
    await expect(
      db.as(owner2, "insert into public.crm_lead_contacts (lead_id, name) values ($1, 'Spy')", [lead]),
    ).rejects.toThrow(/row-level security/);
    // A forged org_id on a child row is replaced by the lead's own organisation.
    await db.as(db.owner, "insert into public.crm_lead_contacts (org_id, lead_id, name) values ($1, $2, 'Real')", [org2, lead]);
    const [contact] = await db.admin<{ org_id: string }>("select org_id from public.crm_lead_contacts where lead_id = $1", [lead]);
    expect(contact.org_id).toBe(db.org);
  });

  it("only lets owners lift do-not-contact", async () => {
    const lead = await db.addLead({ owner_id: manager, do_not_contact: true });
    await expect(
      db.as(manager, "update public.crm_leads set do_not_contact = false, stage = 'new' where id = $1", [lead]),
    ).rejects.toThrow(/Only an owner/);
    const [row] = await db.admin<{ stage: string }>("select stage from public.crm_leads where id = $1", [lead]);
    expect(row.stage).toBe("do_not_contact");
  });
});

describe("drafts and sending", () => {
  it("never accepts a pre-approved draft and stamps approval from the session", async () => {
    const lead = await db.addLead({ owner_id: manager });
    const [draft] = await db.as<{ id: string; status: string }>(
      manager,
      `insert into public.crm_outreach_drafts (lead_id, kind, channel, body, status, approved_by)
       values ($1, 'initial_email', 'email', 'Hi', 'approved', $2) returning id, status`,
      [lead, db.owner],
    );
    expect(draft.status).toBe("draft");

    await db.as(manager, "update public.crm_outreach_drafts set status = 'approved', approved_by = $2 where id = $1", [
      draft.id,
      db.owner,
    ]);
    let [row] = await db.admin<{ status: string; approved_by: string }>(
      "select status, approved_by from public.crm_outreach_drafts where id = $1",
      [draft.id],
    );
    expect(row).toEqual({ status: "approved", approved_by: manager });

    // Changing the text after approval needs a fresh approval.
    await db.as(manager, "update public.crm_outreach_drafts set body = 'Changed' where id = $1", [draft.id]);
    [row] = await db.admin("select status, approved_by from public.crm_outreach_drafts where id = $1", [draft.id]);
    expect(row).toEqual({ status: "draft", approved_by: null });
  });

  it("refuses to log a message for a draft that isn't approved", async () => {
    const lead = await db.addLead();
    const [draft] = await db.as<{ id: string }>(
      db.owner,
      "insert into public.crm_outreach_drafts (lead_id, kind, channel, body) values ($1, 'initial_email', 'email', 'Hi') returning id",
      [lead],
    );
    await expect(
      db.as(
        db.owner,
        "insert into public.crm_outreach_messages (lead_id, draft_id, channel, direction, status) values ($1, $2, 'email', 'outbound', 'sent_manually')",
        [lead, draft.id],
      ),
    ).rejects.toThrow(/Approve the draft/);
  });

  it("keeps provider sending off by default, for people and the service role", async () => {
    const lead = await db.addLead({ email: "sales@sendtest.co.ke" });
    const draft = await approvedDraft(lead);
    const sendSql = `insert into public.crm_outreach_messages (lead_id, draft_id, channel, direction, status, provider, to_address)
                     values ($1, $2, 'email', 'outbound', 'sent', 'gmail', 'sales@sendtest.co.ke') returning id`;

    await expect(db.as(db.owner, sendSql, [lead, draft])).rejects.toThrow(/Sending is disabled/);
    await expect(db.as("service_role", sendSql, [lead, draft])).rejects.toThrow(/Sending is disabled/);

    // Sending can't even be switched on without a provider.
    await expect(db.admin("update public.crm_organisations set sending_enabled = true where id = $1", [db.org])).rejects.toThrow(
      /sending_ready/,
    );
    await db.admin("update public.crm_organisations set sending_enabled = true, email_provider = 'gmail' where id = $1", [db.org]);
    try {
      // Even with sending on, people can't write provider statuses themselves.
      await expect(db.as(db.owner, sendSql, [lead, draft])).rejects.toThrow(/row-level security/);
      expect(await db.as("service_role", sendSql, [lead, draft])).toHaveLength(1);
    } finally {
      await db.admin("update public.crm_organisations set sending_enabled = false, email_provider = 'none' where id = $1", [db.org]);
    }
  });

  it("accepts Brevo only with a From address, and records a Brevo send", async () => {
    // Seeded From address
    const [org] = await db.admin<{ from_email: string }>("select from_email from public.crm_organisations where id = $1", [db.org]);
    expect(org.from_email).toBe("hello@josephmaina.co.ke");
    // Sending can't be on without a From address
    await expect(
      db.admin("update public.crm_organisations set email_provider = 'brevo', from_email = null, sending_enabled = true where id = $1", [db.org]),
    ).rejects.toThrow(/sending_ready/);

    const lead = await db.addLead({ email: "sales@brevotest.co.ke", stage: "ready_for_outreach" });
    const draft = await approvedDraft(lead);
    await db.admin(
      "update public.crm_organisations set email_provider = 'brevo', from_email = 'hello@josephmaina.co.ke', sending_enabled = true where id = $1",
      [db.org],
    );
    try {
      await db.as(
        "service_role",
        `insert into public.crm_outreach_messages
           (lead_id, draft_id, channel, direction, status, provider, provider_message_id, idempotency_key, to_address)
         values ($1, $2, 'email', 'outbound', 'sent', 'brevo', '<abc@smtp-relay.mailin.fr>', $3, 'sales@brevotest.co.ke')`,
        [lead, draft, `draft:${draft}`],
      );
      // Same draft can't be recorded twice
      await expect(
        db.as(
          "service_role",
          `insert into public.crm_outreach_messages (lead_id, channel, direction, status, provider, idempotency_key)
           values ($1, 'email', 'outbound', 'sent', 'brevo', $2)`,
          [lead, `draft:${draft}`],
        ),
      ).rejects.toThrow();
      const [l] = await db.admin<{ stage: string; tasks: number }>(
        "select stage, (select count(*)::int from public.crm_follow_up_tasks where lead_id = $1) as tasks from public.crm_leads where id = $1",
        [lead],
      );
      expect(l).toEqual({ stage: "contacted", tasks: 2 });
      expect(await db.as("service_role", "select public.crm_is_suppressed($1, 'email', 'x@y.co') as s", [db.org])).toEqual([{ s: false }]);
    } finally {
      await db.admin("update public.crm_organisations set sending_enabled = false, email_provider = 'none' where id = $1", [db.org]);
    }
  });

  it("blocks suppressed addresses and do-not-contact leads", async () => {
    const lead = await db.addLead({ email: "info@blocked.co.ke", phone: "0722 111 222" });
    await db.as(db.owner, "insert into public.crm_suppression_list (org_id, kind, value, value_key, reason) values ($1, 'email', ' INFO@blocked.co.ke', '', 'manual')", [
      db.org,
    ]);
    // A manual suppression doesn't mark the lead do-not-contact, but the address is blocked.
    await expect(
      db.as(
        db.owner,
        "insert into public.crm_outreach_messages (lead_id, channel, direction, status, to_address) values ($1, 'email', 'outbound', 'sent_manually', 'info@blocked.co.ke')",
        [lead],
      ),
    ).rejects.toThrow(/suppression list/);
    // The phone still works, until the lead opts out.
    await db.as(
      db.owner,
      "insert into public.crm_outreach_messages (lead_id, channel, direction, status, to_address) values ($1, 'whatsapp', 'outbound', 'sent_manually', '+254722111222')",
      [lead],
    );
    await db.as(db.owner, "update public.crm_leads set stage = 'do_not_contact' where id = $1", [lead]);
    await expect(
      db.as(
        db.owner,
        "insert into public.crm_outreach_messages (lead_id, channel, direction, status, to_address) values ($1, 'whatsapp', 'outbound', 'sent_manually', '0722111222')",
        [lead],
      ),
    ).rejects.toThrow(/do not contact/);
    const sup = await db.admin<{ kind: string }>(
      "select kind from public.crm_suppression_list where lead_id = $1 and reason = 'do_not_contact' order by kind",
      [lead],
    );
    expect(sup.map((s) => s.kind)).toEqual(["phone"]); // the email was already suppressed
  });
});

describe("follow-ups", () => {
  async function sendInitial(lead: string, sentAt: string, campaign: string | null = null) {
    const draft = await approvedDraft(lead);
    await db.as(
      db.owner,
      `insert into public.crm_outreach_messages (lead_id, draft_id, campaign_id, channel, direction, status, to_address, sent_at)
       values ($1, $2, $3, 'email', 'outbound', 'sent_manually', 'a@b.co.ke', $4)`,
      [lead, draft, campaign, sentAt],
    );
    return draft;
  }

  const tasks = (lead: string) =>
    db.admin<{ kind: string; due_on: string; status: string; status_reason: string | null }>(
      "select kind, to_char(due_on, 'YYYY-MM-DD') as due_on, status, status_reason from public.crm_follow_up_tasks where lead_id = $1 order by step",
      [lead],
    );

  it("schedules the sequence in business days when the first message goes out", async () => {
    const lead = await db.addLead({ stage: "ready_for_outreach" });
    // Friday 6 Nov 2026, 10:00 Nairobi
    const draft = await sendInitial(lead, "2026-11-06T07:00:00Z");
    expect(await tasks(lead)).toEqual([
      { kind: "follow_up_1", due_on: "2026-11-12", status: "pending", status_reason: null },
      { kind: "follow_up_2", due_on: "2026-11-20", status: "pending", status_reason: null },
    ]);
    const [l] = await db.admin<{ stage: string; next: string }>(
      "select stage, to_char(next_follow_up_on, 'YYYY-MM-DD') as next from public.crm_leads where id = $1",
      [lead],
    );
    expect(l).toEqual({ stage: "contacted", next: "2026-11-12" });
    const [d] = await db.admin<{ status: string }>("select status from public.crm_outreach_drafts where id = $1", [draft]);
    expect(d.status).toBe("used");
  });

  it("marks a follow-up done when it's sent, and cancels the rest on a reply", async () => {
    const lead = await db.addLead();
    await sendInitial(lead, "2026-11-02T07:00:00Z");
    const fu1 = await approvedDraft(lead, "follow_up_1");
    await db.as(
      db.owner,
      "insert into public.crm_outreach_messages (lead_id, draft_id, channel, direction, status) values ($1, $2, 'email', 'outbound', 'sent_manually')",
      [lead, fu1],
    );
    expect((await tasks(lead)).map((t) => t.status)).toEqual(["done", "pending"]);

    await db.as(
      db.owner,
      "insert into public.crm_outreach_messages (lead_id, channel, direction, status) values ($1, 'email', 'inbound', 'received')",
      [lead],
    );
    const after = await tasks(lead);
    expect(after[1]).toMatchObject({ status: "cancelled", status_reason: "Prospect replied" });
    const [l] = await db.admin<{ stage: string; next: string | null }>(
      "select stage, next_follow_up_on as next from public.crm_leads where id = $1",
      [lead],
    );
    expect(l).toEqual({ stage: "replied", next: null });
  });

  it("cancels follow-ups when the stage closes or the contact opts out", async () => {
    const closed = await db.addLead();
    await sendInitial(closed, "2026-11-02T07:00:00Z");
    await db.as(db.owner, "update public.crm_leads set stage = 'not_interested' where id = $1", [closed]);
    expect((await tasks(closed)).every((t) => t.status === "cancelled")).toBe(true);

    const optOut = await db.addLead({ email: "md@optout.co.ke" });
    await sendInitial(optOut, "2026-11-02T07:00:00Z");
    await db.as(
      manager,
      "insert into public.crm_suppression_list (org_id, kind, value, value_key, reason) values ($1, 'email', 'md@optout.co.ke', '', 'opted_out')",
      [db.org],
    );
    expect((await tasks(optOut)).every((t) => t.status === "cancelled")).toBe(true);
    const [l] = await db.admin<{ do_not_contact: boolean; stage: string }>(
      "select do_not_contact, stage from public.crm_leads where id = $1",
      [optOut],
    );
    expect(l).toEqual({ do_not_contact: true, stage: "do_not_contact" });
  });

  it("pauses and resumes follow-ups with the campaign", async () => {
    const [{ id: campaign }] = await db.as<{ id: string }>(
      db.owner,
      "insert into public.crm_campaigns (org_id, name, status) values ($1, 'Pause test', 'active') returning id",
      [db.org],
    );
    const lead = await db.addLead();
    await sendInitial(lead, "2026-11-02T07:00:00Z", campaign);
    await db.as(db.owner, "update public.crm_campaigns set status = 'paused' where id = $1", [campaign]);
    expect((await tasks(lead)).map((t) => t.status)).toEqual(["paused", "paused"]);
    await db.as(db.owner, "update public.crm_campaigns set status = 'active' where id = $1", [campaign]);
    expect((await tasks(lead)).map((t) => t.status)).toEqual(["pending", "pending"]);
  });
});

describe("provider events", () => {
  it("processes each webhook event once and suppresses bounced addresses", async () => {
    const lead = await db.addLead({ email: "bounce@dealer.co.ke" });
    const draft = await approvedDraft(lead);
    await db.admin("update public.crm_organisations set sending_enabled = true, email_provider = 'gmail' where id = $1", [db.org]);
    try {
      await db.as(
        "service_role",
        `insert into public.crm_outreach_messages (lead_id, draft_id, channel, direction, status, provider, provider_message_id, to_address)
         values ($1, $2, 'email', 'outbound', 'sent', 'gmail', 'msg-1', 'bounce@dealer.co.ke')`,
        [lead, draft],
      );
    } finally {
      await db.admin("update public.crm_organisations set sending_enabled = false, email_provider = 'none' where id = $1", [db.org]);
    }

    const call = "select public.crm_record_provider_event('gmail', 'evt-1', 'msg-1', 'bounced', '{}'::jsonb, now()) as ok";
    await expect(db.as(db.owner, call)).rejects.toThrow(/permission denied/);
    expect(await db.as("service_role", call)).toEqual([{ ok: true }]);
    expect(await db.as("service_role", call)).toEqual([{ ok: false }]);

    const [l] = await db.admin<{ email_status: string }>("select email_status from public.crm_leads where id = $1", [lead]);
    expect(l.email_status).toBe("bounced");
    const events = await db.admin("select id from public.crm_outreach_events where provider_event_id = 'evt-1'");
    expect(events).toHaveLength(1);
    const sup = await db.admin("select reason from public.crm_suppression_list where value_key = 'bounce@dealer.co.ke'");
    expect(sup).toEqual([{ reason: "bounced" }]);
  });
});

describe("deals", () => {
  it("moves the lead to Won when a deal is won", async () => {
    const lead = await db.addLead({ stage: "negotiation" });
    await db.as(
      db.owner,
      "insert into public.crm_deals (lead_id, proposed_service, expected_monthly_retainer, expected_ad_budget, status) values ($1, 'Meta Ads', 60000, 150000, 'won')",
      [lead],
    );
    const [l] = await db.admin<{ stage: string }>("select stage from public.crm_leads where id = $1", [lead]);
    expect(l.stage).toBe("won");
  });
});

describe("import", () => {
  const payload = (rows: unknown[]) => ({
    filename: "Nairobi_Car_Dealer_Leads.xlsx",
    file_sha256: "a".repeat(64),
    file_size: 1234,
    sheet_name: "Leads",
    column_mapping: { Dealership: "name" },
    methodology: ["Weakness score: higher means weaker marketing"],
    rows,
  });
  const row = (n: number, fingerprint: string, lead: Record<string, unknown>, decision = "create", extra = {}) => ({
    row_number: n,
    fingerprint,
    decision,
    raw: { Dealership: lead.name },
    lead,
    ...extra,
  });

  it("is owner-only", async () => {
    await expect(
      db.as(manager, "select public.crm_commit_import($1, $2::jsonb)", [db.org, JSON.stringify(payload([]))]),
    ).rejects.toThrow(/Only an owner/);
  });

  it("creates leads, never applies a row twice, and merges only into blanks", async () => {
    const first = payload([
      row(2, "fp-1", { name: "Import Motors", phone: "0711 000 001", weakness_score: 7, original_priority: "High" }),
      row(3, "fp-2", { name: "Second Autos", email: "sales@second.co.ke" }),
      row(4, "fp-bad", { name: "" }),
    ]);
    const [{ r }] = await db.as<{ r: Record<string, number> }>(db.owner, "select public.crm_commit_import($1, $2::jsonb) as r", [
      db.org,
      JSON.stringify(first),
    ]);
    expect(r).toMatchObject({ created: 2, merged: 0, skipped: 0, errors: 1 });

    const [again] = await db.as<{ r: Record<string, number> }>(db.owner, "select public.crm_commit_import($1, $2::jsonb) as r", [
      db.org,
      JSON.stringify(first),
    ]);
    expect(again.r).toMatchObject({ created: 0, skipped: 2, errors: 1 });

    const [existing] = await db.admin<{ id: string }>("select id from public.crm_leads where name = 'Import Motors'");
    const merge = payload([
      row(2, "fp-3", { name: "Import Motors", phone: "0799 999 999", website: "https://importmotors.co.ke" }, "merge", {
        merge_lead_id: existing.id,
      }),
    ]);
    const [m] = await db.as<{ r: Record<string, number> }>(db.owner, "select public.crm_commit_import($1, $2::jsonb) as r", [
      db.org,
      JSON.stringify(merge),
    ]);
    expect(m.r).toMatchObject({ merged: 1 });
    const [lead] = await db.admin<{ phone: string; website: string; weakness_score: string; imports: number }>(
      "select phone, website, weakness_score, jsonb_array_length(source_data -> 'imports') as imports from public.crm_leads where id = $1",
      [existing.id],
    );
    expect(lead).toEqual({ phone: "0711 000 001", website: "https://importmotors.co.ke", weakness_score: "7.00", imports: 2 });
  });
});

describe("analytics", () => {
  it("separates zero from no data and never counts ad budget as revenue", async () => {
    const metrics = async (who: string, industry: string | null = null) =>
      (
        await db.as<{ m: Record<string, unknown> }>(
          who,
          "select public.crm_dashboard_metrics($1, '2026-01-01', '2027-01-01', $2) as m",
          [db.org, industry],
        )
      )[0].m;

    const [{ id: clinics }] = await db.admin<{ id: string }>("select id from public.crm_industries where slug = 'clinic'");
    let m = await metrics(db.owner, clinics);
    expect(m).toMatchObject({ total_leads: 0, contacted: 0, response_rate: null, meeting_rate: null, revenue_won: 0 });

    const a = await db.addLead({ industry_id: clinics });
    const b = await db.addLead({ industry_id: clinics });
    for (const lead of [a, b]) {
      await db.as(
        db.owner,
        "insert into public.crm_outreach_messages (lead_id, channel, direction, status, sent_at) values ($1, 'email', 'outbound', 'sent_manually', '2026-11-03')",
        [lead],
      );
    }
    await db.as(
      db.owner,
      "insert into public.crm_outreach_messages (lead_id, channel, direction, status) values ($1, 'email', 'inbound', 'received')",
      [a],
    );
    await db.as(db.owner, "update public.crm_leads set stage = 'meeting_booked' where id = $1", [a]);
    await db.as(
      db.owner,
      "insert into public.crm_deals (lead_id, proposed_service, expected_monthly_retainer, expected_ad_budget, status, won_on) values ($1, 'Google Ads', 50000, 200000, 'won', '2026-11-20')",
      [a],
    );
    await db.as(
      db.owner,
      "insert into public.crm_deals (lead_id, proposed_service, status, won_on) values ($1, 'SEO', 'won', '2026-11-21')",
      [b],
    );

    m = await metrics(db.owner, clinics);
    expect(m).toMatchObject({
      total_leads: 2,
      contacted: 2,
      replies: 1,
      meetings_booked: 1,
      clients_won: 2,
      revenue_won: 50000,
      won_missing_value: 1,
      response_rate: 0.5,
      meeting_rate: 0.5,
    });

    // A viewer only counts what they can see.
    expect(await metrics(viewer, clinics)).toMatchObject({ total_leads: 0, contacted: 0 });
  });
});

describe("rate limits", () => {
  it("allows up to the limit per window", async () => {
    const take = () => db.as<{ ok: boolean }>(manager, "select public.crm_take_rate_token('test', 2, 3600) as ok");
    expect((await take())[0].ok).toBe(true);
    expect((await take())[0].ok).toBe(true);
    expect((await take())[0].ok).toBe(false);
    await expect(db.as("anon", "select public.crm_take_rate_token('test', 2, 3600)")).rejects.toThrow(/permission denied/);
  });
});

describe("normalisation", () => {
  const samples = [
    "Select Motors Ltd.",
    "  SELECT  motors (Kenya) Limited ",
    "Auto Express Co.",
    "Toyota Kenya",
    "Kéntucky Cars & Co",
    "https://www.ExampleMotors.co.ke/stock?page=2",
    "http://examplemotors.co.ke:8080",
    "examplemotors.co.ke/",
    "https://www.facebook.com/somedealer",
    "instagram.com/dealer",
    "dealer.business.site",
    "not a url",
    "Sales@Dealer.co.ke; md@dealer.co.ke",
    "bad@",
    " info@cars.ke ",
    "0722 123 456 / 0733 000 111",
    "+254 722 123456",
    "254722123456",
    "020 123",
    "",
  ];

  it("matches the database keys exactly", async () => {
    for (const s of samples) {
      const [sql] = await db.admin<Record<string, string | null>>(
        "select public.crm_name_key($1) n, public.crm_domain_key($1) d, public.crm_email_key($1) e, public.crm_phone_key($1) p",
        [s],
      );
      expect({ s, n: nameKey(s), d: domainKey(s), e: emailKey(s), p: phoneKey(s) }).toEqual({ s, ...sql });
    }
  });
});
