import { DOW_LABELS, computeDelta, formatDuration, hostOf } from "./format";
import type { AnalyticsData } from "./types";

export type InsightTone = "good" | "warn" | "info";

export interface Insight {
  tone: InsightTone;
  title: string;
  detail: string;
}

/** Minimum sample before a rate is worth commenting on. */
const MIN_ENTRIES = 5;
const MIN_SESSIONS = 10;

/**
 * Query parameters that mark a URL as belonging to preview or screenshot
 * tooling rather than a real visitor. Traffic on these paths is dominated by
 * headless browsers, so page-quality insights would otherwise report on
 * automation instead of people.
 */
const SYNTHETIC_PARAMS = /[?&](forceHideBadge|__vercel|_vercel_share|lovable(Preview|_preview))=/i;

function isRealPage(path: string): boolean {
  return !SYNTHETIC_PARAMS.test(path);
}

/**
 * Derives plain-language observations from a payload. Everything here is a
 * direct reading of the numbers — no modelling, no forecasting — so an insight
 * is only emitted when the underlying sample is big enough to mean something.
 */
export function buildInsights(d: AnalyticsData): Insight[] {
  const out: Insight[] = [];
  const rangeLabel = d.range_days === 1 ? "the last 24 hours" : `the last ${d.range_days} days`;

  /* ---- traffic trend --------------------------------------------------- */
  if (d.period.prev_page_views > 0) {
    const { pct, direction } = computeDelta(d.period.page_views, d.period.prev_page_views);
    if (pct !== null && Math.abs(pct) >= 15) {
      out.push({
        tone: direction === "up" ? "good" : "warn",
        title: `Page views ${direction === "up" ? "up" : "down"} ${Math.abs(pct)}%`,
        detail: `${d.period.page_views.toLocaleString()} views in ${rangeLabel}, against ${d.period.prev_page_views.toLocaleString()} in the period before.`,
      });
    }
  }

  /* ---- best publishing window ------------------------------------------ */
  const peak = [...d.activity_heatmap].sort((a, b) => b.page_views - a.page_views)[0];
  if (peak && peak.page_views >= 3) {
    out.push({
      tone: "info",
      title: `Busiest window is ${DOW_LABELS[peak.dow]} around ${String(peak.hour).padStart(2, "0")}:00`,
      detail: `${peak.page_views} views landed in that hour. Publishing or posting just before it puts new work in front of the most people (${d.timezone}).`,
    });
  }

  /* ---- worst landing page ---------------------------------------------- */
  const leakiest = d.page_detail
    .filter((p) => isRealPage(p.page_path) && p.entries >= MIN_ENTRIES && p.bounce_rate !== null)
    .sort((a, b) => (b.bounce_rate ?? 0) - (a.bounce_rate ?? 0))[0];
  if (leakiest && (leakiest.bounce_rate ?? 0) >= 60) {
    out.push({
      tone: "warn",
      title: `${leakiest.bounce_rate}% of sessions landing on ${leakiest.page_path} go no further`,
      detail: `${leakiest.entries} sessions started there. A clearer next step on that page is the cheapest win available.`,
    });
  }

  /* ---- best landing page ----------------------------------------------- */
  const stickiest = d.page_detail
    .filter((p) => isRealPage(p.page_path) && p.entries >= MIN_ENTRIES && p.bounce_rate !== null)
    .sort((a, b) => (a.bounce_rate ?? 100) - (b.bounce_rate ?? 100))[0];
  if (stickiest && (stickiest.bounce_rate ?? 100) <= 40 && stickiest.page_path !== leakiest?.page_path) {
    out.push({
      tone: "good",
      title: `${stickiest.page_path} holds attention best`,
      detail: `Only ${stickiest.bounce_rate}% of its ${stickiest.entries} landing sessions bounce. Worth sending more traffic here.`,
    });
  }

  /* ---- channel quality -------------------------------------------------- */
  const channels = d.channels.filter((c) => c.channel !== "Internal" && c.sessions >= MIN_SESSIONS);
  const bestChannel = [...channels].sort(
    (a, b) => b.engaged_sessions / b.sessions - a.engaged_sessions / a.sessions,
  )[0];
  if (bestChannel) {
    const rate = Math.round((bestChannel.engaged_sessions / bestChannel.sessions) * 100);
    out.push({
      tone: "info",
      title: `${bestChannel.channel} traffic engages most`,
      detail: `${rate}% of its ${bestChannel.sessions} sessions are engaged, at ${bestChannel.pages_per_session} pages per session.`,
    });
  }

  /* ---- top CTA ---------------------------------------------------------- */
  const topClick = d.top_clicks.filter((c) => !c.label.startsWith("input") && !c.label.includes("."))[0];
  if (topClick) {
    out.push({
      tone: "info",
      title: `“${topClick.label}” is the most clicked element`,
      detail: `${topClick.count} clicks across ${topClick.sessions} sessions, most recently on ${topClick.page_path}.`,
    });
  }

  /* ---- pages that get read but never clicked ---------------------------- */
  const deadEnd = d.page_detail
    .filter((p) => isRealPage(p.page_path) && p.views >= MIN_ENTRIES && p.clicks === 0)
    .sort((a, b) => b.views - a.views)[0];
  if (deadEnd) {
    out.push({
      tone: "warn",
      title: `${deadEnd.page_path} gets ${deadEnd.views} views and zero clicks`,
      detail: "Nothing on that page is being interacted with — it may be missing a call to action entirely.",
    });
  }

  /* ---- repeat visitors -------------------------------------------------- */
  const totalVisitors = d.engagement.new_visitors + d.engagement.repeat_visitors;
  if (totalVisitors >= MIN_SESSIONS) {
    const share = Math.round((d.engagement.repeat_visitors / totalVisitors) * 100);
    out.push({
      tone: share >= 20 ? "good" : "info",
      title: `${share}% of visitors are coming back`,
      detail: `${d.engagement.repeat_visitors} of ${totalVisitors} visitors active in ${rangeLabel} had visited before.`,
    });
  }

  /* ---- crawler coverage ------------------------------------------------- */
  const google = d.bot_breakdown.find((b) => b.bot === "Googlebot");
  if (google) {
    out.push({
      tone: "good",
      title: "Googlebot is crawling the site",
      detail: `${google.page_views} pages fetched, most recently ${new Date(google.last_seen).toLocaleString()}.`,
    });
  } else if (d.range_days >= 7) {
    out.push({
      tone: "warn",
      title: "No Googlebot activity in this range",
      detail: "Worth checking Search Console and your sitemap if this persists over a longer window.",
    });
  }

  /* ---- AI crawlers ------------------------------------------------------ */
  const aiBots = d.bot_breakdown.filter((b) => ["OpenAI", "Anthropic", "Perplexity"].includes(b.bot));
  if (aiBots.length > 0) {
    out.push({
      tone: "good",
      title: `${aiBots.map((b) => b.bot).join(", ")} ${aiBots.length === 1 ? "is" : "are"} reading your pages`,
      detail: `${aiBots.reduce((s, b) => s + b.page_views, 0)} fetches. Your content is reachable by AI answer engines.`,
    });
  }

  /* ---- acquisition source ---------------------------------------------- */
  const topReferrer = d.external_referrers[0];
  if (topReferrer) {
    out.push({
      tone: "info",
      title: `${hostOf(topReferrer.referrer)} is your biggest external source`,
      detail: `${topReferrer.count} page views across ${topReferrer.sessions} sessions came from there.`,
    });
  }

  /* ---- campaigns -------------------------------------------------------- */
  if (d.campaigns.length > 0) {
    const c = d.campaigns[0];
    const parts = [c.utm_source, c.utm_medium, c.utm_campaign].filter((v) => v !== "(none)");
    out.push({
      tone: "info",
      title: `Top tagged campaign: ${parts.join(" / ") || c.utm_source}`,
      detail: `${c.sessions} sessions landed on ${c.landing_page}. Keep tagging links to keep this table useful.`,
    });
  } else {
    out.push({
      tone: "info",
      title: "No utm-tagged links in this range",
      detail: "Adding utm_source and utm_medium to the links you share fills in the Campaigns table automatically.",
    });
  }

  /* ---- mobile skew ------------------------------------------------------ */
  const devices = d.device_breakdown;
  const totalDevices = devices.reduce((s, x) => s + x.count, 0);
  const mobile = devices.find((x) => x.device_type === "mobile")?.count ?? 0;
  if (totalDevices >= MIN_SESSIONS) {
    const share = Math.round((mobile / totalDevices) * 100);
    out.push({
      tone: share >= 50 ? "warn" : "info",
      title: `${share}% of visitors are on mobile`,
      detail:
        share >= 50
          ? "The majority are on small screens — test every change at phone width first."
          : "Desktop still leads, but mobile layout is worth a pass on any new page.",
    });
  }

  /* ---- session depth ---------------------------------------------------- */
  if (d.engagement.sessions >= MIN_SESSIONS) {
    out.push({
      tone: d.engagement.bounce_rate >= 70 ? "warn" : "good",
      title: `Bounce rate is ${d.engagement.bounce_rate}%`,
      detail: `${d.engagement.engaged_sessions} of ${d.engagement.sessions} sessions were engaged, with a median length of ${formatDuration(
        d.engagement.median_session_duration_ms,
      )}.`,
    });
  }

  /* ---- conversion ------------------------------------------------------- */
  if (d.period.leads === 0 && d.engagement.human_sessions >= 20) {
    out.push({
      tone: "warn",
      title: `No leads captured from ${d.engagement.human_sessions} human sessions`,
      detail:
        "Either demand is genuinely absent, or a capture path is broken. Worth submitting the contact form yourself to confirm it writes through.",
    });
  } else if (d.period.leads > 0) {
    out.push({
      tone: "good",
      title: `${d.period.leads} lead${d.period.leads === 1 ? "" : "s"} captured`,
      detail: `That is ${d.leads.conversion_rate}% of all sessions, with ${d.leads.booked} call${
        d.leads.booked === 1 ? "" : "s"
      } booked.`,
    });
  }

  return out;
}
