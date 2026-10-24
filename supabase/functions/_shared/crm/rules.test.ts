import { describe, expect, it } from "vitest";
import { buildDraftPrompt, checkDraft, splitFacts } from "./draftRules";
import { sendBlockers, withinSendWindow, type SendCheck } from "./sendGuards";

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
  });

  it("respects sending hours and days in Nairobi time", () => {
    expect(withinSendWindow(base.org, new Date("2026-11-03T04:59:00Z"))).toBe(false); // 07:59
    expect(withinSendWindow(base.org, new Date("2026-11-03T05:00:00Z"))).toBe(true); // 08:00
    expect(withinSendWindow(base.org, new Date("2026-11-03T14:00:00Z"))).toBe(false); // 17:00
    expect(withinSendWindow(base.org, new Date("2026-11-07T07:00:00Z"))).toBe(false); // Saturday
  });
});
