// Every check an outbound email has to pass before a provider is called.
// The database repeats the critical ones (crm_message_guard), so a bug here
// can't send anything the database would refuse.

export type SendOrg = {
  sending_enabled: boolean;
  email_provider: string;
  daily_send_limit: number;
  send_window_start: string; // "08:00" or "08:00:00"
  send_window_end: string;
  send_days: number[]; // ISO weekdays
  timezone: string;
};

export type SendCheck = {
  org: SendOrg;
  draft: { status: string; channel: string } | null;
  lead: { do_not_contact: boolean; stage: string };
  to: string | null;
  suppressed: boolean;
  sentToday: number;
  campaignPaused: boolean;
  now: Date;
};

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

/** Weekday (1-7, Monday first) and minutes past midnight in the org's timezone. */
export function localClock(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday")) + 1;
  return { weekday, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function withinSendWindow(org: SendOrg, now: Date) {
  const { weekday, minutes: m } = localClock(now, org.timezone);
  return org.send_days.includes(weekday) && m >= minutes(org.send_window_start) && m < minutes(org.send_window_end);
}

/** Reasons the message can't go out. Empty means it may be sent. */
export function sendBlockers(c: SendCheck): string[] {
  const blockers: string[] = [];
  if (!c.org.sending_enabled) blockers.push("Sending is turned off in CRM settings");
  if (c.org.email_provider === "none") blockers.push("No email provider is connected");
  if (!c.draft) blockers.push("There's no draft to send");
  else {
    if (c.draft.status !== "approved") blockers.push("The draft isn't approved");
    if (c.draft.channel !== "email") blockers.push("Only email drafts can be sent from the CRM");
  }
  if (c.lead.do_not_contact || c.lead.stage === "do_not_contact") blockers.push("The lead is marked do not contact");
  if (!c.to) blockers.push("There's no email address");
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.to)) blockers.push("That email address doesn't look right");
  if (c.suppressed) blockers.push("The address is on the suppression list");
  if (c.campaignPaused) blockers.push("The campaign is paused");
  if (c.sentToday >= c.org.daily_send_limit) blockers.push(`Today's limit of ${c.org.daily_send_limit} emails is reached`);
  if (!withinSendWindow(c.org, c.now)) blockers.push("It's outside the permitted sending hours");
  return blockers;
}
