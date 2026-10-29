import { describe, expect, it } from "vitest";
import { authUrl, emailFromIdToken, isEventId, signState, toGoogleBody, toHubEvent, verifyState } from "./calendar";

describe("OAuth state", () => {
  const user = "4f1c2a9e-0000-4000-8000-000000000001";

  it("round-trips the user id", async () => {
    expect(await verifyState(await signState(user, "secret"), "secret")).toBe(user);
  });

  it("rejects another secret, tampering and expiry", async () => {
    const state = await signState(user, "secret");
    expect(await verifyState(state, "other")).toBeNull();

    const [payload, sig] = state.split(".");
    const forged = btoa(JSON.stringify({ u: "someone-else", e: Date.now() + 60_000, n: "x" })).replace(/=+$/, "");
    expect(await verifyState(`${forged}.${sig}`, "secret")).toBeNull();
    expect(await verifyState(`${payload}.${sig}x`, "secret")).toBeNull();
    expect(await verifyState(`${payload}`, "secret")).toBeNull();
    expect(await verifyState("", "secret")).toBeNull();

    const old = await signState(user, "secret", Date.now() - 11 * 60 * 1000);
    expect(await verifyState(old, "secret")).toBeNull();
  });
});

describe("authUrl", () => {
  it("asks for offline access to calendar events", () => {
    const url = new URL(authUrl("cid", "https://x.supabase.co/functions/v1/google-oauth-callback", "st"));
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("prompt")).toBe("consent");
    expect(url.searchParams.get("scope")).toContain("https://www.googleapis.com/auth/calendar.events");
    expect(url.searchParams.get("state")).toBe("st");
  });
});

it("reads the email from an id_token", () => {
  const claims = btoa(JSON.stringify({ email: "joe@example.com" })).replace(/=+$/, "");
  expect(emailFromIdToken(`h.${claims}.s`)).toBe("joe@example.com");
  expect(emailFromIdToken(undefined)).toBeNull();
  expect(emailFromIdToken("garbage")).toBeNull();
});

describe("toHubEvent", () => {
  it("maps timed and all-day events", () => {
    expect(
      toHubEvent({
        id: "a",
        summary: "Call",
        start: { dateTime: "2026-11-02T10:00:00+03:00" },
        end: { dateTime: "2026-11-02T10:30:00+03:00" },
        hangoutLink: "https://meet.google.com/x",
      }),
    ).toMatchObject({ id: "a", title: "Call", allDay: false, meetLink: "https://meet.google.com/x", editable: true });
    expect(toHubEvent({ id: "b", start: { date: "2026-11-03" }, end: { date: "2026-11-04" } })).toMatchObject({
      title: "(No title)",
      allDay: true,
      start: "2026-11-03",
      end: "2026-11-04",
    });
  });

  it("drops cancelled events and locks recurring or others' events", () => {
    const t = { start: { date: "2026-11-03" }, end: { date: "2026-11-04" } };
    expect(toHubEvent({ id: "c", status: "cancelled", ...t })).toBeNull();
    expect(toHubEvent({ id: "d", recurringEventId: "r", ...t })?.editable).toBe(false);
    expect(toHubEvent({ id: "e", organizer: { self: false }, ...t })?.editable).toBe(false);
  });
});

describe("toGoogleBody", () => {
  it("shapes timed and all-day events", () => {
    const timed = toGoogleBody({
      title: " Review ",
      allDay: false,
      start: "2026-11-02T10:00:00+03:00",
      end: "2026-11-02T11:00:00+03:00",
      timeZone: "Africa/Nairobi",
    });
    expect(timed).toEqual({
      body: {
        summary: "Review",
        description: null,
        location: null,
        start: { date: null, dateTime: "2026-11-02T07:00:00.000Z", timeZone: "Africa/Nairobi" },
        end: { date: null, dateTime: "2026-11-02T08:00:00.000Z", timeZone: "Africa/Nairobi" },
      },
    });
    const day = toGoogleBody({ title: "Off", allDay: true, start: "2026-11-03", end: "2026-11-04" });
    expect(day).toMatchObject({ body: { start: { date: "2026-11-03", dateTime: null } } });
  });

  it("refuses bad input", () => {
    expect(toGoogleBody({ title: "", allDay: true, start: "2026-11-03", end: "2026-11-04" })).toHaveProperty("error");
    expect(toGoogleBody({ title: "x", allDay: true, start: "2026-11-04", end: "2026-11-04" })).toHaveProperty("error");
    expect(toGoogleBody({ title: "x", allDay: false, start: "soon", end: "later" })).toHaveProperty("error");
    expect(toGoogleBody(null)).toHaveProperty("error");
    // A bogus time zone is dropped rather than sent to Google.
    const r = toGoogleBody({ title: "x", allDay: false, start: "2026-11-02T10:00:00Z", end: "2026-11-02T11:00:00Z", timeZone: "../etc" });
    expect(r).toMatchObject({ body: { start: { timeZone: null } } });
  });
});

it("accepts only plain event ids", () => {
  expect(isEventId("abc123_def")).toBe(true);
  expect(isEventId("../calendars")).toBe(false);
  expect(isEventId("")).toBe(false);
  expect(isEventId(5)).toBe(false);
});
