/**
 * Shape of the payload returned by the `admin-analytics` edge function, which
 * proxies the `get_admin_analytics` Postgres function.
 */

export interface Totals {
  visitors: number;
  human_visitors: number;
  bot_visitors: number;
  pulses: number;
  page_views: number;
  clicks: number;
  sessions: number;
  leads: number;
}

export interface Period {
  page_views: number;
  prev_page_views: number;
  visitors: number;
  prev_visitors: number;
  clicks: number;
  prev_clicks: number;
  sessions: number;
  prev_sessions: number;
  leads: number;
  prev_leads: number;
}

export interface Engagement {
  sessions: number;
  prev_sessions: number;
  bounce_rate: number;
  engaged_sessions: number;
  pages_per_session: number;
  avg_session_duration_ms: number;
  median_session_duration_ms: number;
  clicks_per_session: number;
  new_visitors: number;
  repeat_visitors: number;
  first_time_visitors: number;
  bot_sessions: number;
  human_sessions: number;
}

export interface DayRow {
  day: string;
  page_views: number;
  unique_visitors: number;
  clicks: number;
  sessions: number;
  new_visitors: number;
}

export interface PageDetailRow {
  page_path: string;
  page_title: string;
  views: number;
  unique_visitors: number;
  sessions: number;
  clicks: number;
  avg_duration_ms: number;
  entries: number;
  exits: number;
  bounce_rate: number | null;
}

export interface SessionRow {
  session_ref: string;
  started_at: string;
  ended_at: string;
  page_views: number;
  distinct_pages: number;
  clicks: number;
  dur_ms: number;
  entry_page: string | null;
  exit_page: string | null;
  channel: string;
  device_type: string;
  browser: string;
  os: string;
  is_bot: boolean;
  is_engaged: boolean;
}

export interface VisitorRow {
  visitor_ref: string;
  first_seen: string;
  last_seen: string;
  visit_count: number;
  device_type: string;
  browser: string;
  os: string;
  is_bot: boolean;
  sessions: number;
  page_views: number;
  clicks: number;
  dur_ms: number;
  last_page: string | null;
}

export interface LeadRow {
  created_at: string;
  kind: string;
  name: string | null;
  email: string | null;
  business_name: string | null;
  detail: string | null;
  budget_range: string | null;
  status: string | null;
  page_path: string | null;
  source: string | null;
  booked: boolean;
  step: string | null;
  phone: string | null;
  industry: string | null;
  start_timeframe: string | null;
}

export interface ActivityRow {
  created_at: string;
  event_type: string;
  page_path: string;
  page_title: string | null;
  element_text: string | null;
  element_selector: string | null;
  duration_ms: number | null;
  referrer: string | null;
  session_ref: string | null;
  visitor_ref: string | null;
  is_bot: boolean;
  browser: string | null;
  device_type: string | null;
  os: string | null;
}

export interface AnalyticsData {
  range_days: number;
  generated_at: string;
  timezone: string;
  totals: Totals;
  period: Period;
  engagement: Engagement;
  visits_by_day: DayRow[];
  visits_by_hour_of_day: { hour: number; page_views: number; sessions: number }[];
  activity_heatmap: { dow: number; hour: number; page_views: number; sessions: number }[];
  top_pages: { page_path: string; views: number }[];
  top_pages_clean: {
    page_path: string;
    views: number;
    sessions: number;
    unique_visitors: number;
    clicks: number;
  }[];
  avg_time_on_page: { page_path: string; avg_duration_ms: number; sessions: number }[];
  page_detail: PageDetailRow[];
  entry_pages: { page_path: string; count: number }[];
  exit_pages: { page_path: string; count: number }[];
  campaigns: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    page_views: number;
    sessions: number;
    visitors: number;
    landing_page: string;
  }[];
  ad_clicks: { network: string; page_views: number; sessions: number }[];
  device_breakdown: { device_type: string; count: number }[];
  browser_breakdown: { browser: string; count: number }[];
  os_breakdown: { os: string; count: number }[];
  visitor_mix: { label: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  external_referrers: { referrer: string; count: number; sessions: number }[];
  channels: {
    channel: string;
    sessions: number;
    engaged_sessions: number;
    pages_per_session: number;
  }[];
  top_clicks: {
    label: string;
    element_selector: string | null;
    count: number;
    sessions: number;
    page_path: string;
  }[];
  event_mix: { event_type: string; count: number }[];
  recent_sessions: SessionRow[];
  visitor_detail: VisitorRow[];
  bot_breakdown: { bot: string; visitors: number; page_views: number; last_seen: string }[];
  leads: {
    period_total: number;
    conversion_rate: number;
    booked: number;
    by_kind: { kind: string; count: number }[];
    by_status: { status: string; count: number }[];
    by_source: { source: string; count: number }[];
    chat_funnel: { step: string; count: number; booked: number }[];
    by_day: { day: string; count: number }[];
    recent: LeadRow[];
  };
  recent_activity: ActivityRow[];
}
