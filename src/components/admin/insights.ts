import { DOW_LABELS, computeDelta, formatDuration, formatRangeDates, hostOf } from "./format";
import type { AnalyticsData, PageDetailRow } from "./types";

export type InsightTone = "good" | "warn" | "info";

/**
 * Triage order. `critical` is reserved for things that mean the site is
 * failing at its job right now — no leads, a capture path that looks broken,
 * or telemetry that has stopped arriving. `low` is for observations that are
 * interesting but too thin or too cosmetic to act on.
 */
export type InsightPriority = "critical" | "high" | "medium" | "low";

export const PRIORITY_ORDER: InsightPriority[] = ["critical", "high", "medium", "low"];

const PRIORITY_RANK: Record<InsightPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export type Confidence = "high" | "moderate" | "low";

export type MetricUnit = "%" | "count" | "ms";

/** What the numbers behind an insight are, and what they are not. */
export interface Evidence {
  /** Denominator the insight is a reading of. */
  sampleSize: number;
  /** What one unit of the sample is — "sessions landing on the blog", etc. */
  sampleLabel: string;
  /** Explicit calendar window, not just "last 30 days". */
  rangeLabel: string;
  confidence: Confidence;
  /** Why the confidence is what it is, including any proxy being used. */
  confidenceReason: string;
  /** True only when the figure is computed from human sessions alone. */
  humansOnly: boolean;
  /** True only when declared crawlers are excluded from the denominator. */
  botsExcluded: boolean;
  /** Extra caveat shown beside the flags, where one applies. */
  caveat?: string;
}

/** The change being proposed, and the number that should move if it works. */
export interface RecommendedAction {
  recommended: string;
  targetMetric: string;
  /** Stable key used to store a baseline when the change is marked as made. */
  metricId: string;
  value: number;
  unit: MetricUnit;
  /** Which direction counts as an improvement for this metric. */
  better: "lower" | "higher";
}

export interface Insight {
  id: string;
  tone: InsightTone;
  priority: InsightPriority;
  title: string;
  detail: string;
  evidence: Evidence;
  action: RecommendedAction;
}

/** Minimum sample before a rate is worth commenting on. */
const MIN_ENTRIES = 5;
const MIN_SESSIONS = 10;

/** Blog lives under this prefix; everything else under /agency is a money page. */
const BLOG_PREFIX = /^\/agency\/blog/;
const AGENCY_PREFIX = /^\/agency(\/|$)/;

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
 * Sample-size driven confidence. These cut-offs are deliberately blunt: the
 * point is to stop a 6-session rate being read with the same weight as a
 * 600-session one, not to produce a real confidence interval.
 */
function confidenceFor(n: number): { confidence: Confidence; confidenceReason: string } {
  if (n >= 200) {
    return {
      confidence: "high",
      confidenceReason: `${n.toLocaleString()} in the sample — a rate this well populated is unlikely to swing much on its own.`,
    };
  }
  if (n >= 50) {
    return {
      confidence: "moderate",
      confidenceReason: `${n} in the sample — enough to act on, but expect the figure to move a few points week to week.`,
    };
  }
  return {
    confidence: "low",
    confidenceReason: `only ${n} in the sample — a handful of visits either way would change this number materially.`,
  };
}

/** Caps confidence for figures that rest on a proxy rather than a direct count. */
function capConfidence(
  base: { confidence: Confidence; confidenceReason: string },
  ceiling: Confidence,
  why: string,
): { confidence: Confidence; confidenceReason: string } {
  const rank: Record<Confidence, number> = { low: 0, moderate: 1, high: 2 };
  const confidence = rank[base.confidence] > rank[ceiling] ? ceiling : base.confidence;
  return { confidence, confidenceReason: `${base.confidenceReason} ${why}` };
}

function bouncesOf(p: PageDetailRow): number {
  return Math.round((p.entries * (p.bounce_rate ?? 0)) / 100);
}

/**
 * Derives plain-language observations from a payload. Everything here is a
 * direct reading of the numbers — no modelling, no forecasting — so an insight
 * is only emitted when the underlying sample is big enough to mean something,
 * and each one carries the sample, window and caveats it was read from.
 *
 * Note on bot handling: the payload aggregates page, session and click figures
 * over all traffic. Only the `human_sessions` split excludes declared
 * crawlers, so `botsExcluded` is true on very few insights and false — stated
 * plainly rather than implied — on the rest.
 */
export function buildInsights(d: AnalyticsData): Insight[] {
  const out: Insight[] = [];
  const rangeLabel = formatRangeDates(d.generated_at, d.range_days);
  const periodWords = d.range_days === 1 ? "the last 24 hours" : `the last ${d.range_days} days`;

  /** Default evidence: whole-traffic page/session figures, bots included. */
  const traffic = (sampleSize: number, sampleLabel: string, caveat?: string): Evidence => ({
    sampleSize,
    sampleLabel,
    rangeLabel,
    ...confidenceFor(sampleSize),
    humansOnly: false,
    botsExcluded: false,
    caveat,
  });

  /* ======================================================================= */
  /*  CRITICAL — no leads, capture paths that look broken, telemetry gaps    */
  /* ======================================================================= */

  /* ---- telemetry stopped arriving --------------------------------------- */
  if (d.period.page_views === 0 && d.period.prev_page_views > 0) {
    out.push({
      id: "tracking:collection-stopped",
      tone: "warn",
      priority: "critical",
      title: "No page views recorded at all in this range",
      detail: `The previous period logged ${d.period.prev_page_views.toLocaleString()} views and this one logged none. That is far more likely to be a collection failure than a traffic one.`,
      evidence: {
        ...traffic(d.period.prev_page_views, "page views in the preceding period"),
        confidence: "high",
        confidenceReason:
          "a drop from steady traffic to exactly zero is a tracking signature, not a demand signature.",
      },
      action: {
        recommended:
          "Load the site in a clean browser and confirm pulses reach the database — check the consent gate, the edge function and the client script in that order.",
        targetMetric: "Page views recorded",
        metricId: "page_views",
        value: d.period.page_views,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- click tracking not reporting ------------------------------------- */
  const clickEvents = d.event_mix.find((e) => e.event_type === "click")?.count ?? 0;
  if (clickEvents === 0 && d.period.page_views >= 50) {
    out.push({
      id: "tracking:no-clicks",
      tone: "warn",
      priority: "critical",
      title: `${d.period.page_views.toLocaleString()} page views and not one click event`,
      detail:
        "Page views are landing but click events are not. Every interaction insight, CTA ranking and dead-end check below is blind until this is fixed.",
      evidence: {
        ...traffic(d.period.page_views, "page views"),
        confidence: "high",
        confidenceReason:
          "a non-trivial volume of page views with exactly zero clicks is a broken listener, not visitor behaviour.",
      },
      action: {
        recommended:
          "Check the click listener is attached and that its events pass the same consent gate as page views.",
        targetMetric: "Click events recorded",
        metricId: "click_events",
        value: clickEvents,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- dwell-time heartbeats not reporting ------------------------------ */
  if (
    d.engagement.sessions >= 20 &&
    d.engagement.median_session_duration_ms === 0 &&
    d.engagement.avg_session_duration_ms === 0
  ) {
    out.push({
      id: "tracking:no-duration",
      tone: "warn",
      priority: "critical",
      title: "Session duration is zero across every session",
      detail: `${d.engagement.sessions} sessions recorded, none with any measured time on page. Heartbeat or page-exit events are not arriving, so bounce and engagement figures here are understated.`,
      evidence: {
        ...traffic(d.engagement.sessions, "sessions"),
        confidence: "high",
        confidenceReason: "a universal zero across every session is a missing event type, not real behaviour.",
      },
      action: {
        recommended: "Verify heartbeat and page_exit pulses are being sent and carry a duration_ms value.",
        targetMetric: "Median session duration",
        metricId: "median_session_duration_ms",
        value: d.engagement.median_session_duration_ms,
        unit: "ms",
        better: "higher",
      },
    });
  }

  /* ---- no leads from real demand ---------------------------------------- */
  if (d.period.leads === 0 && d.engagement.human_sessions >= 20) {
    out.push({
      id: "leads:none",
      tone: "warn",
      priority: "critical",
      title: `No leads captured from ${d.engagement.human_sessions} human sessions`,
      detail:
        "Either demand is genuinely absent, or a capture path is broken. A broken form looks exactly like this, so rule that out before concluding anything about demand.",
      evidence: {
        sampleSize: d.engagement.human_sessions,
        sampleLabel: "human sessions",
        rangeLabel,
        ...confidenceFor(d.engagement.human_sessions),
        humansOnly: true,
        botsExcluded: true,
        caveat: "Zero is zero regardless of sample size; the sample only governs how surprising it is.",
      },
      action: {
        recommended:
          "Submit the contact form yourself and confirm the row writes through, then check the email handoff.",
        targetMetric: "Leads captured",
        metricId: "leads",
        value: d.period.leads,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- chat funnel entered but nothing completed ------------------------ */
  const funnelEntered = d.leads.chat_funnel.reduce((s, f) => s + f.count, 0);
  const funnelBooked = d.leads.chat_funnel.reduce((s, f) => s + f.booked, 0);
  if (funnelEntered >= 10 && funnelBooked === 0) {
    const deepest = [...d.leads.chat_funnel].sort((a, b) => b.count - a.count)[0];
    out.push({
      id: "leads:chat-stalled",
      tone: "warn",
      priority: "critical",
      title: `${funnelEntered} people entered the chat funnel and none completed`,
      detail: `The heaviest step is “${deepest?.step ?? "unknown"}” at ${deepest?.count ?? 0}. A funnel that takes entries but books nothing is usually a submit handler or validation failure rather than hesitation.`,
      evidence: {
        sampleSize: funnelEntered,
        sampleLabel: "chat funnel entries",
        rangeLabel,
        ...confidenceFor(funnelEntered),
        humansOnly: false,
        botsExcluded: false,
        caveat:
          "Funnel steps are counted from recorded events, so a final step that fails to record would look identical to one nobody reached.",
      },
      action: {
        recommended:
          "Walk the chat funnel end to end yourself and watch for a step that accepts input but never advances.",
        targetMetric: "Chat funnel bookings",
        metricId: "chat_bookings",
        value: funnelBooked,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- leads arriving without attribution ------------------------------- */
  const recentLeads = d.leads.recent;
  const unattributed = recentLeads.filter((l) => !l.page_path && !l.source).length;
  if (recentLeads.length >= 3 && unattributed === recentLeads.length) {
    out.push({
      id: "tracking:lead-attribution",
      tone: "warn",
      priority: "critical",
      title: "Every recent lead arrived with no page or source attached",
      detail: `All ${recentLeads.length} recent leads are missing both page_path and source, so there is no way to tell which page or channel produced them. Spend decisions made on this data would be guesses.`,
      evidence: {
        sampleSize: recentLeads.length,
        sampleLabel: "recent lead records",
        rangeLabel,
        ...capConfidence(
          confidenceFor(recentLeads.length),
          "moderate",
          "Only the most recent leads are inspected, not every lead in the range.",
        ),
        humansOnly: true,
        botsExcluded: true,
      },
      action: {
        recommended:
          "Pass the current path and referrer into the lead insert so attribution is captured at submit time.",
        targetMetric: "Leads with attribution",
        metricId: "leads_attributed",
        value: recentLeads.length - unattributed,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ======================================================================= */
  /*  HIGH — blog readers not reaching the agency pages                      */
  /* ======================================================================= */

  const blogLandings = d.page_detail.filter(
    (p) => isRealPage(p.page_path) && BLOG_PREFIX.test(p.page_path) && p.entries > 0,
  );
  const blogEntries = blogLandings.reduce((s, p) => s + p.entries, 0);
  const blogBounces = blogLandings.reduce((s, p) => s + bouncesOf(p), 0);
  const blogClicks = blogLandings.reduce((s, p) => s + p.clicks, 0);

  if (blogEntries >= MIN_SESSIONS) {
    const stalledPct = Math.round((blogBounces / blogEntries) * 100);
    const proxyNote =
      "Measured as blog landing sessions that never opened a second page. A session that did continue may have gone to another post rather than an agency page, so the true blog-to-agency rate is at or below the continuation rate shown.";

    if (stalledPct >= 50) {
      out.push({
        id: "blog:no-progression",
        tone: "warn",
        priority: "high",
        title: `${stalledPct}% of blog arrivals never reach a second page`,
        detail: `${blogBounces} of ${blogEntries} sessions landing on the blog left from the post they arrived on, with ${blogClicks} clicks recorded across all blog pages. The blog is pulling readers in without handing them onward to the service pages.`,
        evidence: {
          sampleSize: blogEntries,
          sampleLabel: "sessions landing on a blog page",
          rangeLabel,
          ...capConfidence(confidenceFor(blogEntries), "moderate", proxyNote),
          humansOnly: false,
          botsExcluded: false,
          caveat:
            "Preview and screenshot URLs are filtered out, but declared crawlers are still inside this denominator.",
        },
        action: {
          recommended:
            "Put one specific, relevant service link in the body of each post — mid-article, not only in the footer — and name the outcome it leads to.",
          targetMetric: "Blog landing continuation rate",
          metricId: "blog_continuation_rate",
          value: 100 - stalledPct,
          unit: "%",
          better: "higher",
        },
      });
    } else {
      out.push({
        id: "blog:progression-healthy",
        tone: "good",
        priority: "low",
        title: `${100 - stalledPct}% of blog arrivals go on to a second page`,
        detail: `${blogEntries - blogBounces} of ${blogEntries} blog landing sessions continued past the post they arrived on. The onward path from the blog is working.`,
        evidence: {
          sampleSize: blogEntries,
          sampleLabel: "sessions landing on a blog page",
          rangeLabel,
          ...capConfidence(confidenceFor(blogEntries), "moderate", proxyNote),
          humansOnly: false,
          botsExcluded: false,
        },
        action: {
          recommended: "No change needed — hold this rate as more posts are published.",
          targetMetric: "Blog landing continuation rate",
          metricId: "blog_continuation_rate",
          value: 100 - stalledPct,
          unit: "%",
          better: "higher",
        },
      });
    }
  }

  /* ---- blog drawing traffic the service pages never see ----------------- */
  const blogViews = d.page_detail
    .filter((p) => isRealPage(p.page_path) && BLOG_PREFIX.test(p.page_path))
    .reduce((s, p) => s + p.views, 0);
  const servicePageViews = d.page_detail
    .filter((p) => isRealPage(p.page_path) && AGENCY_PREFIX.test(p.page_path) && !BLOG_PREFIX.test(p.page_path))
    .reduce((s, p) => s + p.views, 0);
  if (blogViews >= 30 && servicePageViews > 0 && blogViews / servicePageViews >= 4) {
    out.push({
      id: "blog:outweighs-services",
      tone: "warn",
      priority: "high",
      title: `Blog pages out-draw the service pages ${Math.round(blogViews / servicePageViews)} to 1`,
      detail: `${blogViews.toLocaleString()} blog views against ${servicePageViews.toLocaleString()} service page views. Readers are arriving for the writing and not crossing over to what you sell.`,
      evidence: {
        ...traffic(blogViews + servicePageViews, "page views across blog and service pages"),
        caveat: "A ratio, not a per-visitor path — the same person may account for views on both sides.",
      },
      action: {
        recommended:
          "Add a service call-to-action block to the highest-traffic posts and link each topic hub to the service it supports.",
        targetMetric: "Service page views",
        metricId: "service_page_views",
        value: servicePageViews,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- traffic trend ---------------------------------------------------- */
  if (d.period.prev_page_views > 0 && d.period.page_views > 0) {
    const { pct, direction } = computeDelta(d.period.page_views, d.period.prev_page_views);
    if (pct !== null && Math.abs(pct) >= 15) {
      const falling = direction === "down";
      out.push({
        id: falling ? "traffic:down" : "traffic:up",
        tone: falling ? "warn" : "good",
        priority: falling ? (Math.abs(pct) >= 40 ? "high" : "medium") : "low",
        title: `Page views ${falling ? "down" : "up"} ${Math.abs(pct)}%`,
        detail: `${d.period.page_views.toLocaleString()} views in ${periodWords}, against ${d.period.prev_page_views.toLocaleString()} in the period before.`,
        evidence: {
          ...traffic(d.period.page_views + d.period.prev_page_views, "page views across both periods"),
          caveat:
            "Period-over-period comparison; a range that straddles a weekend or a publishing burst will swing this on its own.",
        },
        action: {
          recommended: falling
            ? "Check the channel table for which source fell away before changing anything on the site itself."
            : "Note what drove the rise in the channel table so it can be repeated deliberately.",
          targetMetric: "Page views",
          metricId: "page_views",
          value: d.period.page_views,
          unit: "count",
          better: "higher",
        },
      });
    }
  }

  /* ======================================================================= */
  /*  MEDIUM — bounce rate, return rate, dead ends                          */
  /* ======================================================================= */

  /* ---- site-wide bounce ------------------------------------------------- */
  if (d.engagement.sessions >= MIN_SESSIONS) {
    const high = d.engagement.bounce_rate >= 70;
    out.push({
      id: "engagement:bounce",
      tone: high ? "warn" : "good",
      priority: high ? "medium" : "low",
      title: `Bounce rate is ${d.engagement.bounce_rate}%`,
      detail: `${d.engagement.engaged_sessions} of ${d.engagement.sessions} sessions were engaged, with a median length of ${formatDuration(
        d.engagement.median_session_duration_ms,
      )}.`,
      evidence: {
        ...traffic(d.engagement.sessions, "sessions"),
        caveat: `Bot sessions are inside this figure — ${d.engagement.bot_sessions} of the ${d.engagement.sessions} sessions here are declared crawlers, and crawlers bounce by nature.`,
      },
      action: {
        recommended: high
          ? "Work the highest-entry landing page first: one clear next step above the fold, matched to whatever the visitor searched for."
          : "No change needed — keep an eye on it as new landing pages go live.",
        targetMetric: "Bounce rate",
        metricId: "bounce_rate",
        value: d.engagement.bounce_rate,
        unit: "%",
        better: "lower",
      },
    });
  }

  /* ---- worst landing page ----------------------------------------------- */
  const leakiest = d.page_detail
    .filter((p) => isRealPage(p.page_path) && p.entries >= MIN_ENTRIES && p.bounce_rate !== null)
    .sort((a, b) => (b.bounce_rate ?? 0) - (a.bounce_rate ?? 0))[0];
  if (leakiest && (leakiest.bounce_rate ?? 0) >= 60) {
    out.push({
      id: `page:bounce:${leakiest.page_path}`,
      tone: "warn",
      priority: "medium",
      title: `${leakiest.bounce_rate}% of sessions landing on ${leakiest.page_path} go no further`,
      detail: `${leakiest.entries} sessions started there. A clearer next step on that page is the cheapest win available.`,
      evidence: {
        ...traffic(leakiest.entries, `sessions landing on ${leakiest.page_path}`),
        caveat: "Per-page bounce is read from entries on that path only; crawlers are not excluded.",
      },
      action: {
        recommended: `Give ${leakiest.page_path} one obvious next action in the first screenful, pointing at the service it relates to.`,
        targetMetric: `Bounce rate on ${leakiest.page_path}`,
        metricId: `page_bounce:${leakiest.page_path}`,
        value: leakiest.bounce_rate ?? 0,
        unit: "%",
        better: "lower",
      },
    });
  }

  /* ---- repeat visitors -------------------------------------------------- */
  const totalVisitors = d.engagement.new_visitors + d.engagement.repeat_visitors;
  if (totalVisitors >= MIN_SESSIONS) {
    const share = Math.round((d.engagement.repeat_visitors / totalVisitors) * 100);
    const thin = share < 20;
    out.push({
      id: "visitors:return-rate",
      tone: thin ? "warn" : "good",
      priority: thin ? "medium" : "low",
      title: `${share}% of visitors are coming back`,
      detail: `${d.engagement.repeat_visitors} of ${totalVisitors} visitors active in ${periodWords} had visited before.`,
      evidence: {
        ...traffic(totalVisitors, "visitors active in the range"),
        caveat:
          "Return visits are identified by a stored device id, so cleared storage, private windows and new devices all read as first-time visitors. The true return rate is at or above this.",
      },
      action: {
        recommended: thin
          ? "Give readers a reason to return — a named series, a follow-on post linked from the end of each article, or an email capture that promises something specific."
          : "No change needed — the content is earning repeat attention.",
        targetMetric: "Returning visitor share",
        metricId: "repeat_visitor_share",
        value: share,
        unit: "%",
        better: "higher",
      },
    });
  }

  /* ---- pages that get read but never clicked ---------------------------- */
  const deadEnd = d.page_detail
    .filter((p) => isRealPage(p.page_path) && p.views >= MIN_ENTRIES && p.clicks === 0)
    .sort((a, b) => b.views - a.views)[0];
  if (deadEnd && clickEvents > 0) {
    out.push({
      id: `page:dead-end:${deadEnd.page_path}`,
      tone: "warn",
      priority: "medium",
      title: `${deadEnd.page_path} gets ${deadEnd.views} views and zero clicks`,
      detail:
        "Nothing on that page is being interacted with — it may be missing a call to action entirely. Click tracking is working elsewhere on the site, so this is the page, not the telemetry.",
      evidence: {
        ...traffic(deadEnd.views, `views of ${deadEnd.page_path}`),
        caveat: "Clicks on links that navigate away immediately can be lost, so treat zero as near-zero.",
      },
      action: {
        recommended: `Add a single call to action to ${deadEnd.page_path} and confirm it registers a click event.`,
        targetMetric: `Clicks on ${deadEnd.page_path}`,
        metricId: `page_clicks:${deadEnd.page_path}`,
        value: deadEnd.clicks,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- crawler coverage ------------------------------------------------- */
  const google = d.bot_breakdown.find((b) => b.bot === "Googlebot");
  if (!google && d.range_days >= 7) {
    out.push({
      id: "crawl:no-googlebot",
      tone: "warn",
      priority: "medium",
      title: "No Googlebot activity in this range",
      detail: "Worth checking Search Console and your sitemap if this persists over a longer window.",
      evidence: {
        sampleSize: d.range_days,
        sampleLabel: "days observed",
        rangeLabel,
        confidence: d.range_days >= 30 ? "moderate" : "low",
        confidenceReason:
          d.range_days >= 30
            ? `${d.range_days} days with no crawl is long enough to be worth investigating.`
            : `${d.range_days} days is a short window — Googlebot can legitimately be quiet that long on a small site.`,
        humansOnly: false,
        botsExcluded: false,
        caveat:
          "Depends on crawler identification by user agent; a crawl misclassified as human traffic would be missed here.",
      },
      action: {
        recommended:
          "Check sitemap submission and index coverage in Search Console before changing anything on the site.",
        targetMetric: "Googlebot page fetches",
        metricId: "googlebot_fetches",
        value: 0,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- mobile skew ------------------------------------------------------ */
  const totalDevices = d.device_breakdown.reduce((s, x) => s + x.count, 0);
  const mobile = d.device_breakdown.find((x) => x.device_type === "mobile")?.count ?? 0;
  if (totalDevices >= MIN_SESSIONS) {
    const share = Math.round((mobile / totalDevices) * 100);
    const majority = share >= 50;
    out.push({
      id: "devices:mobile-share",
      tone: majority ? "warn" : "info",
      priority: majority ? "medium" : "low",
      title: `${share}% of visitors are on mobile`,
      detail: majority
        ? "The majority are on small screens — test every change at phone width first."
        : "Desktop still leads, but mobile layout is worth a pass on any new page.",
      evidence: {
        ...traffic(totalDevices, "visitors with a detected device type"),
        caveat: "Device type is parsed from the user agent, which crawlers routinely misreport.",
      },
      action: {
        recommended: majority
          ? "Review the main landing pages at 390px width and fix anything that needs a horizontal scroll or a zoom."
          : "Keep checking new pages at phone width as part of the normal pass.",
        targetMetric: "Mobile visitor share",
        metricId: "mobile_share",
        value: share,
        unit: "%",
        better: "higher",
      },
    });
  }

  /* ======================================================================= */
  /*  LOW — thin samples and things already working                          */
  /* ======================================================================= */

  /* ---- best publishing window ------------------------------------------ */
  const peak = [...d.activity_heatmap].sort((a, b) => b.page_views - a.page_views)[0];
  if (peak && peak.page_views >= 3) {
    out.push({
      id: "timing:peak-hour",
      tone: "info",
      priority: "low",
      title: `Busiest window is ${DOW_LABELS[peak.dow]} around ${String(peak.hour).padStart(2, "0")}:00`,
      detail: `${peak.page_views} views landed in that hour (${d.timezone}). That is one bucket out of 168 in the week — treat it as a hint, not a schedule.`,
      evidence: {
        sampleSize: peak.page_views,
        sampleLabel: "page views in the single busiest hour-of-week bucket",
        rangeLabel,
        confidence: "low",
        confidenceReason: `${peak.page_views} views in one of 168 hour-of-week buckets. At this volume the "best" hour is mostly noise and will move between ranges.`,
        humansOnly: false,
        botsExcluded: false,
        caveat: "A single crawler sweep can create the peak hour outright.",
      },
      action: {
        recommended:
          "Do not reschedule publishing on this alone. Revisit once a single hour-of-week bucket holds 30 or more views.",
        targetMetric: "Views in peak hour",
        metricId: "peak_hour_views",
        value: peak.page_views,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- best landing page ------------------------------------------------ */
  const stickiest = d.page_detail
    .filter((p) => isRealPage(p.page_path) && p.entries >= MIN_ENTRIES && p.bounce_rate !== null)
    .sort((a, b) => (a.bounce_rate ?? 100) - (b.bounce_rate ?? 100))[0];
  if (stickiest && (stickiest.bounce_rate ?? 100) <= 40 && stickiest.page_path !== leakiest?.page_path) {
    out.push({
      id: `page:stickiest:${stickiest.page_path}`,
      tone: "good",
      priority: "low",
      title: `${stickiest.page_path} holds attention best`,
      detail: `Only ${stickiest.bounce_rate}% of its ${stickiest.entries} landing sessions bounce. Worth sending more traffic here.`,
      evidence: traffic(stickiest.entries, `sessions landing on ${stickiest.page_path}`),
      action: {
        recommended: `Point more internal links and campaign traffic at ${stickiest.page_path}, and copy whatever it does well onto weaker pages.`,
        targetMetric: `Entries on ${stickiest.page_path}`,
        metricId: `page_entries:${stickiest.page_path}`,
        value: stickiest.entries,
        unit: "count",
        better: "higher",
      },
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
      id: `channel:best:${bestChannel.channel}`,
      tone: "info",
      priority: "low",
      title: `${bestChannel.channel} traffic engages most`,
      detail: `${rate}% of its ${bestChannel.sessions} sessions are engaged, at ${bestChannel.pages_per_session} pages per session.`,
      evidence: traffic(bestChannel.sessions, `${bestChannel.channel} sessions`),
      action: {
        recommended: `Put more effort into ${bestChannel.channel} before trying to fix weaker channels.`,
        targetMetric: `${bestChannel.channel} engaged session rate`,
        metricId: `channel_engagement:${bestChannel.channel}`,
        value: rate,
        unit: "%",
        better: "higher",
      },
    });
  }

  /* ---- top CTA ---------------------------------------------------------- */
  const topClick = d.top_clicks.filter((c) => !c.label.startsWith("input") && !c.label.includes("."))[0];
  if (topClick) {
    out.push({
      id: "clicks:top-element",
      tone: "info",
      priority: "low",
      title: `“${topClick.label}” is the most clicked element`,
      detail: `${topClick.count} clicks across ${topClick.sessions} sessions, most recently on ${topClick.page_path}.`,
      evidence: traffic(topClick.sessions, "sessions that clicked it"),
      action: {
        recommended: `Reuse the wording of “${topClick.label}” on pages whose calls to action are being ignored.`,
        targetMetric: `Clicks on “${topClick.label}”`,
        metricId: `click_label:${topClick.label}`,
        value: topClick.count,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- crawler coverage, healthy ---------------------------------------- */
  if (google) {
    out.push({
      id: "crawl:googlebot",
      tone: "good",
      priority: "low",
      title: "Googlebot is crawling the site",
      detail: `${google.page_views} pages fetched, most recently ${new Date(google.last_seen).toLocaleString()}.`,
      evidence: {
        sampleSize: google.page_views,
        sampleLabel: "Googlebot page fetches",
        rangeLabel,
        ...confidenceFor(google.page_views),
        humansOnly: false,
        botsExcluded: false,
        caveat: "Identified by user agent, which is not verified by reverse DNS here.",
      },
      action: {
        recommended: "No change needed — keep the sitemap current as new posts go live.",
        targetMetric: "Googlebot page fetches",
        metricId: "googlebot_fetches",
        value: google.page_views,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- AI crawlers ------------------------------------------------------ */
  const aiBots = d.bot_breakdown.filter((b) => ["OpenAI", "Anthropic", "Perplexity"].includes(b.bot));
  if (aiBots.length > 0) {
    const fetches = aiBots.reduce((s, b) => s + b.page_views, 0);
    out.push({
      id: "crawl:ai-bots",
      tone: "good",
      priority: "low",
      title: `${aiBots.map((b) => b.bot).join(", ")} ${aiBots.length === 1 ? "is" : "are"} reading your pages`,
      detail: `${fetches} fetches. Your content is reachable by AI answer engines.`,
      evidence: {
        sampleSize: fetches,
        sampleLabel: "AI crawler page fetches",
        rangeLabel,
        ...confidenceFor(fetches),
        humansOnly: false,
        botsExcluded: false,
        caveat: "A fetch means the page was readable, not that it was cited in any answer.",
      },
      action: {
        recommended: "No change needed — keep answer-shaped headings and clear summaries in new posts.",
        targetMetric: "AI crawler fetches",
        metricId: "ai_crawler_fetches",
        value: fetches,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- acquisition source ----------------------------------------------- */
  const topReferrer = d.external_referrers[0];
  if (topReferrer) {
    const host = hostOf(topReferrer.referrer);
    out.push({
      id: "acquisition:top-referrer",
      tone: "info",
      priority: "low",
      title: `${host} is your biggest external source`,
      detail: `${topReferrer.count} page views across ${topReferrer.sessions} sessions came from there.`,
      evidence: {
        ...traffic(topReferrer.sessions, "sessions from that referrer"),
        caveat: "Referrers are absent on direct visits and stripped by many apps, so this undercounts.",
      },
      action: {
        recommended: `Look for a second placement like ${host} rather than assuming this one will keep growing.`,
        targetMetric: `Sessions from ${host}`,
        metricId: `referrer_sessions:${host}`,
        value: topReferrer.sessions,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- campaigns -------------------------------------------------------- */
  if (d.campaigns.length > 0) {
    const c = d.campaigns[0];
    const parts = [c.utm_source, c.utm_medium, c.utm_campaign].filter((v) => v !== "(none)");
    out.push({
      id: "campaigns:top",
      tone: "info",
      priority: "low",
      title: `Top tagged campaign: ${parts.join(" / ") || c.utm_source}`,
      detail: `${c.sessions} sessions landed on ${c.landing_page}. Keep tagging links to keep this table useful.`,
      evidence: traffic(c.sessions, "tagged campaign sessions"),
      action: {
        recommended: "Keep utm tags on every link you share so this stays comparable between ranges.",
        targetMetric: "Tagged campaign sessions",
        metricId: "campaign_sessions",
        value: c.sessions,
        unit: "count",
        better: "higher",
      },
    });
  } else {
    out.push({
      id: "campaigns:none",
      tone: "info",
      priority: "low",
      title: "No utm-tagged links in this range",
      detail:
        "Adding utm_source and utm_medium to the links you share fills in the Campaigns table automatically. Until then, traffic from links you have shared is indistinguishable from direct.",
      evidence: {
        sampleSize: 0,
        sampleLabel: "tagged campaign sessions",
        rangeLabel,
        confidence: "high",
        confidenceReason: "an absence of tagged links is a fact about the links, not an estimate.",
        humansOnly: false,
        botsExcluded: false,
      },
      action: {
        recommended: "Add utm_source and utm_medium to the next batch of links you post.",
        targetMetric: "Tagged campaign sessions",
        metricId: "campaign_sessions",
        value: 0,
        unit: "count",
        better: "higher",
      },
    });
  }

  /* ---- conversion, healthy ---------------------------------------------- */
  if (d.period.leads > 0) {
    out.push({
      id: "leads:captured",
      tone: "good",
      priority: "low",
      title: `${d.period.leads} lead${d.period.leads === 1 ? "" : "s"} captured`,
      detail: `That is ${d.leads.conversion_rate}% of all sessions, with ${d.leads.booked} call${
        d.leads.booked === 1 ? "" : "s"
      } booked.`,
      evidence: {
        sampleSize: d.engagement.human_sessions,
        sampleLabel: "human sessions",
        rangeLabel,
        ...confidenceFor(d.period.leads),
        humansOnly: true,
        botsExcluded: true,
        caveat: `The published conversion rate of ${d.leads.conversion_rate}% is over all ${d.engagement.sessions} sessions, bots included, so the human conversion rate is higher than that figure.`,
      },
      action: {
        recommended:
          "Keep the path that produced these intact, and check the source column before changing any landing page.",
        targetMetric: "Leads captured",
        metricId: "leads",
        value: d.period.leads,
        unit: "count",
        better: "higher",
      },
    });
  }

  return out.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}
