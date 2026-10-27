import { describe, expect, it } from "vitest";
import { buildDraftPrompt, checkDraft, splitFacts } from "./draftRules";
import { brevoProvider, getEmailProvider, withOptOut } from "./emailProvider";
import { sendBlockers, withinSendWindow, type SendCheck } from "./sendGuards";

describe("Brevo provider", () => {
  const email = {
    to: "sales@kei.co.ke",
    from: { email: "hello@josephmaina.co.ke", name: "Joseph Maina" },
    replyTo: "joe@example.com",
    subject: "Buyer enquiries",
    text: "Hi Kei Cars team",
    idempotencyKey: "draft:1",
    headers: { "List-Unsubscribe": "<mailto:joe@example.com?subject=unsubscribe>" },
    tags: ["crm-outreach"],
  };

  it("posts to the transactional API with the key in a header, never the body", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fake = async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ messageId: "<m1@brevo>" }), { status: 201 });
    };
    const result = await brevoProvider("xkeysib-test", fake).send(email);
    expect(result).toEqual({ providerMessageId: "<m1@brevo>" });
    expect(calls[0].url).toBe("https://api.brevo.com/v3/smtp/email");
    expect((calls[0].init.headers as Record<string, string>)["api-key"]).toBe("xkeysib-test");
    const sent = JSON.parse(String(calls[0].init.body));
    expect(sent).toMatchObject({
      sender: { email: "hello@josephmaina.co.ke", name: "Joseph Maina" },
      to: [{ email: "sales@kei.co.ke" }],
      replyTo: { email: "joe@example.com" },
      subject: "Buyer enquiries",
      textContent: "Hi Kei Cars team",
    });
    expect(String(calls[0].init.body)).not.toContain("xkeysib-test");
  });

  it("turns Brevo errors into plain messages", async () => {
    const respond = (status: number, body: unknown) => async () => new Response(JSON.stringify(body), { status });
    await expect(brevoProvider("k", respond(401, { message: "Key not found" })).send(email)).rejects.toThrow("Brevo rejected the API key");
    await expect(brevoProvider("k", respond(400, { message: "sender not valid" })).send(email)).rejects.toThrow(/sender not valid/);
  });

  it("is unavailable without its key, and other providers aren't built", () => {
    expect(getEmailProvider("brevo", {})).toBeNull();
    expect(getEmailProvider("brevo", { BREVO_API_KEY: "k" })?.name).toBe("brevo");
    expect(getEmailProvider("gmail", { BREVO_API_KEY: "k" })).toBeNull();
  });

  it("adds an opt-out line once", () => {
    expect(withOptOut("Hello", "joe@example.com")).toMatch(/no thanks" \(joe@example.com\)/);
    const already = "Hello\n\nJust reply no thanks and I won't contact you again.";
    expect(withOptOut(already, null)).toBe(already);
  });
});

describe("draft facts", () => {
  it("never treats scraped presence or ratings as verified facts", () => {
    const { verified, unverified } = splitFacts({
      name: "Kei Cars",
      area: "Kilimani",
      website: "keicars.co.ke",
      google_rating: 4.6,
      google_reviews: 120,
      socials_verified: false,
      findings: [
        { label: "Advertising opportunity", note: "No Meta ads in the Ad Library on 20 Oct", verified: true },
        { label: "Affordability", note: "Looks like 40+ cars in stock", verified: false },
      ],
    });
    expect(verified).toContain("Advertising opportunity: No Meta ads in the Ad Library on 20 Oct");
    expect(verified.join(" ")).not.toMatch(/website|stars|40\+/);
    expect(unverified.join(" ")).toMatch(/website/);
    expect(unverified.join(" ")).toMatch(/120 reviews/);
    expect(unverified.join(" ")).toMatch(/Never say or imply the business lacks/);
  });

  it("puts the sender's identity and the rules in the prompt", () => {
    const { system, user } = buildDraftPrompt("initial_email", { name: "Kei Cars" }, { name: "Joseph Maina", business: "JM Digital" });
    expect(system).toMatch(/Never promise or guarantee/);
    expect(system).toMatch(/Joseph Maina of JM Digital/);
    expect(user).toMatch(/Business name: Kei Cars/);
    expect(user).toMatch(/Sender sign-off block:\nJoseph Maina\nJM Digital/);
  });
});

describe("draft checks", () => {
  const ctx = { leadName: "Kei Cars", senderName: "Joseph Maina" };
  const good =
    "Hi Kei Cars team,\n\nI'm Joseph, a Nairobi marketer who helps dealers get more serious buyer enquiries and follow them up properly. Would a 15-minute call next week be useful?\n\nIf you'd rather not hear from me, just reply \"no thanks\" and I won't contact you again.\n\nJoseph Maina";

  it("passes a clean email", () => {
    expect(checkDraft("initial_email", { subject: "Buyer enquiries at Kei Cars", body: good }, ctx)).toEqual([]);
  });

  it("flags guarantees, invented numbers, fake audits and missing basics", () => {
    const warnings = checkDraft(
      "initial_email",
      { subject: "", body: "We guarantee 30% more sales! I audited your ads and you have no website." },
      ctx,
    );
    expect(warnings).toEqual(
      expect.arrayContaining([
        "Doesn't mention Kei Cars",
        "Promises a guaranteed result",
        "Quotes a percentage; check it isn't an invented statistic",
        "Claims an audit that didn't happen",
        "Says they lack a channel; that isn't verified",
        "Uses an exclamation mark",
        "Doesn't say who it's from",
        "No subject line",
        "No easy way to opt out",
      ]),
    );
  });

  it("doesn't ask WhatsApp messages for a subject or opt-out line", () => {
    expect(checkDraft("whatsapp_intro", { body: "Hello Kei Cars, this is Joseph Maina. Quick question?" }, ctx)).toEqual([]);
  });
});

describe("send guards", () => {
  const base: SendCheck = {
    org: {
      sending_enabled: false,
      email_provider: "none",
      daily_send_limit: 20,
      send_window_start: "08:00:00",
      send_window_end: "17:00:00",
      send_days: [1, 2, 3, 4, 5],
      timezone: "Africa/Nairobi",
    },
    draft: { status: "approved", channel: "email" },
    lead: { do_not_contact: false, stage: "ready_for_outreach" },
    to: "sales@kei.co.ke",
    suppressed: false,
    sentToday: 0,
    campaignPaused: false,
    // Tuesday 3 Nov 2026, 10:00 in Nairobi
    now: new Date("2026-11-03T07:00:00Z"),
  };

  it("blocks everything with the default settings", () => {
    expect(sendBlockers(base)).toEqual(["Sending is turned off in CRM settings", "No email provider is connected"]);
  });

  it("passes only when every condition holds", () => {
    const ready = { ...base, org: { ...base.org, sending_enabled: true, email_provider: "gmail" } };
    expect(sendBlockers(ready)).toEqual([]);
    expect(sendBlockers({ ...ready, draft: { status: "draft", channel: "email" } })).toEqual(["The draft isn't approved"]);
    expect(sendBlockers({ ...ready, suppressed: true })).toEqual(["The address is on the suppression list"]);
    expect(sendBlockers({ ...ready, lead: { do_not_contact: true, stage: "do_not_contact" } })).toHaveLength(1);
    expect(sendBlockers({ ...ready, sentToday: 20 })).toEqual(["Today's limit of 20 emails is reached"]);
    expect(sendBlockers({ ...ready, campaignPaused: true })).toEqual(["The campaign is paused"]);
    expect(sendBlockers({ ...ready, to: "not-an-email" })).toEqual(["That email address doesn't look right"]);
  });

  it("respects sending hours and days in Nairobi time", () => {
    expect(withinSendWindow(base.org, new Date("2026-11-03T04:59:00Z"))).toBe(false); // 07:59
    expect(withinSendWindow(base.org, new Date("2026-11-03T05:00:00Z"))).toBe(true); // 08:00
    expect(withinSendWindow(base.org, new Date("2026-11-03T14:00:00Z"))).toBe(false); // 17:00
    expect(withinSendWindow(base.org, new Date("2026-11-07T07:00:00Z"))).toBe(false); // Saturday
  });
});
