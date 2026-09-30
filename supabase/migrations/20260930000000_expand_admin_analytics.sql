-- Expands get_admin_analytics into a full-detail analytics payload.
--
-- Backwards compatible: every key the previous version returned is still
-- returned with the same shape, so an older frontend keeps working. Everything
-- else is additive.
--
-- Hour-of-day figures are bucketed in Africa/Nairobi so "best time to publish"
-- reads in local time rather than UTC.

-- Groups a referrer string into an acquisition channel.
--
-- The SPA tracker sends the *previous in-app path* as the referrer on client-side
-- navigations, and a full reload sends our own domain. Both are internal movement,
-- not acquisition, so they collapse to 'Internal' and can be excluded from
-- acquisition reporting.
create or replace function public.pulse_channel(ref text)
returns text
language sql
immutable
as $$
  select case
    when ref is null or btrim(ref) = '' then 'Direct'
    when ref like '/%' then 'Internal'
    when ref ~* '(josephmaina\.co\.ke|joesportfolio|lovableproject\.com|lovable\.app)' then 'Internal'
    when ref ~* '(chatgpt|openai|perplexity|claude\.ai|gemini|copilot|bard)' then 'AI'
    when ref ~* '(google|bing|duckduckgo|yahoo|baidu|yandex|ecosia|brave|search)' then 'Search'
    when ref ~* '(linkedin|facebook|instagram|tiktok|youtube|reddit|pinterest|whatsapp|t\.co/|twitter|x\.com|telegram)' then 'Social'
    when ref ~* '(lovable\.dev|vercel\.com|github)' then 'Tooling'
    else 'Referral'
  end
$$;

-- Collapses a bot user-agent down to a recognisable crawler name.
create or replace function public.pulse_bot_name(ua text)
returns text
language sql
immutable
as $$
  select case
    when ua is null or btrim(ua) = '' then 'Unknown'
    when ua ~* 'googlebot|google-inspectiontool' then 'Googlebot'
    when ua ~* 'bingbot|bingpreview' then 'Bingbot'
    when ua ~* 'gptbot|oai-searchbot|chatgpt-user' then 'OpenAI'
    when ua ~* 'claudebot|anthropic' then 'Anthropic'
    when ua ~* 'perplexitybot' then 'Perplexity'
    when ua ~* 'ahrefsbot' then 'AhrefsBot'
    when ua ~* 'semrushbot' then 'SemrushBot'
    when ua ~* 'applebot' then 'Applebot'
    when ua ~* 'yandexbot' then 'YandexBot'
    when ua ~* 'baiduspider' then 'Baiduspider'
    when ua ~* 'duckduckbot' then 'DuckDuckBot'
    when ua ~* 'petalbot' then 'PetalBot'
    when ua ~* 'facebookexternalhit|meta-external' then 'Facebook'
    when ua ~* 'linkedinbot' then 'LinkedInBot'
    when ua ~* 'slackbot' then 'Slackbot'
    when ua ~* 'whatsapp' then 'WhatsApp'
    when ua ~* 'telegrambot' then 'Telegram'
    when ua ~* 'discordbot' then 'Discord'
    when ua ~* 'headlesschrome|phantomjs' then 'Headless browser'
    when ua ~* 'curl|wget|python-requests|python-urllib|go-http-client|okhttp|node-fetch|axios|postmanruntime|scrapy' then 'Script / tool'
    else 'Other crawler'
  end
$$;

create or replace function public.get_admin_analytics(p_days integer default 14)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  result jsonb;
  tz constant text := 'Africa/Nairobi';
  period_start timestamptz := now() - (p_days || ' days')::interval;
  prev_period_start timestamptz := now() - (p_days * 2 || ' days')::interval;
  -- Session-level facts for the current period, derived once and reused by
  -- every section below. Sessions are the unit most engagement metrics need,
  -- and recomputing them per-section made the function quadratic on pulses.
  sessions_total bigint;
  prev_sessions_total bigint;
begin
  create temp table _sess on commit drop as
  with base as (
    select
      p.session_id,
      (array_agg(p.visitor_id order by p.created_at) filter (where p.visitor_id is not null))[1] as visitor_id,
      min(p.created_at) as first_ts,
      max(p.created_at) as last_ts,
      count(*) filter (where p.event_type = 'page_view') as page_views,
      count(*) filter (where p.event_type = 'click') as clicks,
      count(distinct p.page_path) filter (where p.event_type = 'page_view') as distinct_pages
    from pulses p
    where p.created_at >= period_start
    group by p.session_id
  ),
  edges as (
    select
      session_id,
      (array_agg(page_path order by created_at asc, id asc))[1] as entry_page,
      (array_agg(page_path order by created_at desc, id desc))[1] as exit_page,
      (array_agg(referrer order by created_at asc, id asc))[1] as first_referrer
    from pulses
    where event_type = 'page_view' and created_at >= period_start
    group by session_id
  ),
  -- Heartbeats report elapsed time since the page mounted, so the largest value
  -- per (session, page) is that page's dwell time. Summing those gives session time.
  dur as (
    select session_id, sum(d)::bigint as dur_ms
    from (
      select session_id, page_path, max(duration_ms) as d
      from pulses
      where event_type in ('heartbeat', 'page_exit')
        and duration_ms is not null
        and created_at >= period_start
      group by 1, 2
    ) x
    group by 1
  )
  select
    b.session_id,
    b.visitor_id,
    b.first_ts,
    b.last_ts,
    b.page_views,
    b.clicks,
    b.distinct_pages,
    e.entry_page,
    e.exit_page,
    e.first_referrer,
    pulse_channel(e.first_referrer) as channel,
    coalesce(d.dur_ms, 0) as dur_ms,
    coalesce(v.is_bot, false) as is_bot,
    coalesce(v.device_type, 'unknown') as device_type,
    coalesce(v.browser, 'unknown') as browser,
    coalesce(v.os, 'unknown') as os,
    (b.page_views > 1 or b.clicks > 0 or coalesce(d.dur_ms, 0) >= 15000) as is_engaged
  from base b
  left join edges e on e.session_id = b.session_id
  left join dur d on d.session_id = b.session_id
  left join visitors v on v.id = b.visitor_id;

  create index on _sess (session_id);

  select count(*) into sessions_total from _sess;
  select count(distinct session_id) into prev_sessions_total
  from pulses
  where created_at >= prev_period_start and created_at < period_start;

  select jsonb_build_object(
    'range_days', p_days,
    'generated_at', now(),
    'timezone', tz,

    -- ---------- all-time totals ----------
    'totals', jsonb_build_object(
      'visitors', (select count(*) from visitors),
      'human_visitors', (select count(*) from visitors where not is_bot),
      'bot_visitors', (select count(*) from visitors where is_bot),
      'pulses', (select count(*) from pulses),
      'page_views', (select count(*) from pulses where event_type = 'page_view'),
      'clicks', (select count(*) from pulses where event_type = 'click'),
      'sessions', (select count(distinct session_id) from pulses),
      'leads', (select (select count(*) from chat_leads) + (select count(*) from agency_leads) + (select count(*) from contact_messages))
    ),

    -- ---------- current period vs the period before it ----------
    'period', jsonb_build_object(
      'page_views', (select count(*) from pulses where event_type = 'page_view' and created_at >= period_start),
      'prev_page_views', (select count(*) from pulses where event_type = 'page_view' and created_at >= prev_period_start and created_at < period_start),
      'visitors', (select count(distinct visitor_id) from pulses where created_at >= period_start),
      'prev_visitors', (select count(distinct visitor_id) from pulses where created_at >= prev_period_start and created_at < period_start),
      'clicks', (select count(*) from pulses where event_type = 'click' and created_at >= period_start),
      'prev_clicks', (select count(*) from pulses where event_type = 'click' and created_at >= prev_period_start and created_at < period_start),
      'sessions', sessions_total,
      'prev_sessions', prev_sessions_total,
      'leads', (
        select (select count(*) from chat_leads where created_at >= period_start)
             + (select count(*) from agency_leads where created_at >= period_start)
             + (select count(*) from contact_messages where created_at >= period_start)
      ),
      'prev_leads', (
        select (select count(*) from chat_leads where created_at >= prev_period_start and created_at < period_start)
             + (select count(*) from agency_leads where created_at >= prev_period_start and created_at < period_start)
             + (select count(*) from contact_messages where created_at >= prev_period_start and created_at < period_start)
      )
    ),

    -- ---------- engagement quality ----------
    'engagement', jsonb_build_object(
      'sessions', sessions_total,
      'prev_sessions', prev_sessions_total,
      'bounce_rate', (select case when count(*) = 0 then 0
                        else round(100.0 * count(*) filter (where not is_engaged) / count(*), 1) end from _sess),
      'engaged_sessions', (select count(*) from _sess where is_engaged),
      'pages_per_session', (select case when count(*) = 0 then 0
                              else round(avg(page_views)::numeric, 2) end from _sess),
      'avg_session_duration_ms', (select coalesce(round(avg(dur_ms) filter (where dur_ms > 0)), 0) from _sess),
      'median_session_duration_ms', (select coalesce(round(percentile_cont(0.5) within group (order by dur_ms)), 0) from _sess where dur_ms > 0),
      'clicks_per_session', (select case when count(*) = 0 then 0
                               else round(avg(clicks)::numeric, 2) end from _sess),
      -- New vs repeat is keyed off visitors.visit_count (lifetime, maintained by
      -- touch_visitor) rather than first_seen, so a visitor who came back counts as
      -- repeat even on a site too young for a full previous period to exist.
      'new_visitors', (select count(*) from visitors v
                       where v.visit_count <= 1
                         and exists (select 1 from _sess s where s.visitor_id = v.id)),
      'repeat_visitors', (select count(*) from visitors v
                          where v.visit_count > 1
                            and exists (select 1 from _sess s where s.visitor_id = v.id)),
      'first_time_visitors', (select count(*) from visitors where first_seen >= period_start),
      'bot_sessions', (select count(*) from _sess where is_bot),
      'human_sessions', (select count(*) from _sess where not is_bot)
    ),

    -- ---------- time series (gap-filled so quiet days read as zero, not as a gap) ----------
    'visits_by_day', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          d::date as day,
          coalesce(p.page_views, 0) as page_views,
          coalesce(p.unique_visitors, 0) as unique_visitors,
          coalesce(p.clicks, 0) as clicks,
          coalesce(p.sessions, 0) as sessions,
          coalesce(nv.new_visitors, 0) as new_visitors
        from generate_series(date_trunc('day', period_start), date_trunc('day', now()), interval '1 day') d
        left join (
          select date_trunc('day', created_at) as day,
                 count(*) filter (where event_type = 'page_view') as page_views,
                 count(distinct visitor_id) as unique_visitors,
                 count(*) filter (where event_type = 'click') as clicks,
                 count(distinct session_id) as sessions
          from pulses
          where created_at >= period_start
          group by 1
        ) p on p.day = d
        left join (
          select date_trunc('day', first_seen) as day, count(*) as new_visitors
          from visitors
          where first_seen >= period_start
          group by 1
        ) nv on nv.day = d
        order by 1
      ) t
    ),

    'visits_by_hour_of_day', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select h as hour,
               coalesce(x.page_views, 0) as page_views,
               coalesce(x.sessions, 0) as sessions
        from generate_series(0, 23) h
        left join (
          select extract(hour from created_at at time zone tz)::int as hour,
                 count(*) filter (where event_type = 'page_view') as page_views,
                 count(distinct session_id) as sessions
          from pulses
          where created_at >= period_start
          group by 1
        ) x on x.hour = h
        order by 1
      ) t
    ),

    -- Day-of-week x hour grid. 0 = Sunday, matching extract(dow).
    'activity_heatmap', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select extract(dow from created_at at time zone tz)::int as dow,
               extract(hour from created_at at time zone tz)::int as hour,
               count(*) filter (where event_type = 'page_view') as page_views,
               count(distinct session_id) as sessions
        from pulses
        where created_at >= period_start
        group by 1, 2
        order by 1, 2
      ) t
    ),
    -- ---------- pages ----------
    'top_pages', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select page_path, count(*) filter (where event_type = 'page_view') as views
        from pulses
        where created_at >= period_start
        group by page_path
        order by views desc
        limit 10
      ) t
    ),

    'avg_time_on_page', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select page_path, round(avg(dur)) as avg_duration_ms, count(*) as sessions
        from (
          select session_id, page_path, max(duration_ms) as dur
          from pulses
          where event_type in ('heartbeat', 'page_exit') and duration_ms is not null and created_at >= period_start
          group by session_id, page_path
        ) s
        group by page_path
        order by avg_duration_ms desc
        limit 10
      ) t
    ),

    -- Per-page breakdown: traffic, engagement, and how the page behaves as an
    -- entry and exit point. This is the table to read when deciding what to fix.
    'page_detail', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          pv.page_path,
          pv.views,
          pv.unique_visitors,
          pv.sessions,
          pv.clicks,
          coalesce(dw.avg_duration_ms, 0) as avg_duration_ms,
          coalesce(en.entries, 0) as entries,
          coalesce(ex.exits, 0) as exits,
          case when coalesce(en.entries, 0) = 0 then null
               else round(100.0 * coalesce(en.bounces, 0) / en.entries, 1) end as bounce_rate,
          coalesce(pt.page_title, '') as page_title
        from (
          select page_path,
                 count(*) filter (where event_type = 'page_view') as views,
                 count(distinct visitor_id) as unique_visitors,
                 count(distinct session_id) as sessions,
                 count(*) filter (where event_type = 'click') as clicks
          from pulses
          where created_at >= period_start
          group by page_path
        ) pv
        left join (
          select page_path, round(avg(dur)) as avg_duration_ms
          from (
            select session_id, page_path, max(duration_ms) as dur
            from pulses
            where event_type in ('heartbeat', 'page_exit') and duration_ms is not null and created_at >= period_start
            group by 1, 2
          ) s
          group by page_path
        ) dw on dw.page_path = pv.page_path
        left join (
          select entry_page as page_path,
                 count(*) as entries,
                 count(*) filter (where not is_engaged) as bounces
          from _sess
          where entry_page is not null
          group by 1
        ) en on en.page_path = pv.page_path
        left join (
          select exit_page as page_path, count(*) as exits
          from _sess
          where exit_page is not null
          group by 1
        ) ex on ex.page_path = pv.page_path
        left join (
          select distinct on (page_path) page_path, page_title
          from pulses
          where page_title is not null and page_title <> '' and created_at >= period_start
          order by page_path, created_at desc
        ) pt on pt.page_path = pv.page_path
        order by pv.views desc
        limit 40
      ) t
    ),

    'entry_pages', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select entry_page as page_path, count(*) as count
        from _sess where entry_page is not null
        group by 1 order by count desc limit 10
      ) t
    ),

    'exit_pages', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select exit_page as page_path, count(*) as count
        from _sess where exit_page is not null
        group by 1 order by count desc limit 10
      ) t
    ),

    -- Query strings (utm tags, forceHideBadge, fbclid) split one page across many
    -- rows in top_pages. This is the same traffic grouped by the path alone.
    'top_pages_clean', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          split_part(page_path, '?', 1) as page_path,
          count(*) filter (where event_type = 'page_view') as views,
          count(distinct session_id) as sessions,
          count(distinct visitor_id) as unique_visitors,
          count(*) filter (where event_type = 'click') as clicks
        from pulses
        where created_at >= period_start
        group by 1
        order by views desc
        limit 20
      ) t
    ),

    -- Campaign attribution, read out of the utm_* query parameters the tracker
    -- already stores on page_path. Nothing extra needs to be instrumented.
    'campaigns', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          coalesce(nullif(substring(page_path from 'utm_source=([^&]*)'), ''), '(none)') as utm_source,
          coalesce(nullif(substring(page_path from 'utm_medium=([^&]*)'), ''), '(none)') as utm_medium,
          coalesce(nullif(substring(page_path from 'utm_campaign=([^&]*)'), ''), '(none)') as utm_campaign,
          coalesce(nullif(substring(page_path from 'utm_content=([^&]*)'), ''), '(none)') as utm_content,
          count(*) filter (where event_type = 'page_view') as page_views,
          count(distinct session_id) as sessions,
          count(distinct visitor_id) as visitors,
          split_part(page_path, '?', 1) as landing_page
        from pulses
        where created_at >= period_start
          and page_path ~ 'utm_(source|medium|campaign)='
        group by 1, 2, 3, 4, 8
        order by page_views desc
        limit 20
      ) t
    ),

    -- Sessions that arrived with an ad click id, i.e. paid traffic the utm tags
    -- alone would miss.
    'ad_clicks', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          case
            when page_path ~ 'fbclid=' then 'Meta (fbclid)'
            when page_path ~ 'gclid=' then 'Google Ads (gclid)'
            when page_path ~ 'ttclid=' then 'TikTok (ttclid)'
            when page_path ~ 'msclkid=' then 'Microsoft (msclkid)'
          end as network,
          count(*) filter (where event_type = 'page_view') as page_views,
          count(distinct session_id) as sessions
        from pulses
        where created_at >= period_start
          and page_path ~ '(fbclid|gclid|ttclid|msclkid)='
        group by 1
        order by page_views desc
      ) t
    ),

    -- ---------- audience ----------
    'device_breakdown', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select coalesce(v.device_type, 'unknown') as device_type, count(distinct v.id) as count
        from visitors v
        where exists (select 1 from pulses p where p.visitor_id = v.id and p.created_at >= period_start)
        group by 1
        order by count desc
      ) t
    ),

    'browser_breakdown', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select coalesce(v.browser, 'unknown') as browser, count(distinct v.id) as count
        from visitors v
        where exists (select 1 from pulses p where p.visitor_id = v.id and p.created_at >= period_start)
        group by 1
        order by count desc
        limit 8
      ) t
    ),

    'os_breakdown', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select coalesce(v.os, 'unknown') as os, count(distinct v.id) as count
        from visitors v
        where exists (select 1 from pulses p where p.visitor_id = v.id and p.created_at >= period_start)
        group by 1
        order by count desc
        limit 8
      ) t
    ),

    'visitor_mix', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select 'New' as label, count(*) as count from visitors v
        where v.visit_count <= 1 and exists (select 1 from _sess s where s.visitor_id = v.id)
        union all
        select 'Repeat', count(*) from visitors v
        where v.visit_count > 1 and exists (select 1 from _sess s where s.visitor_id = v.id)
      ) t
    ),

    -- ---------- acquisition ----------
    -- Referrers as captured, kept for continuity with the previous payload.
    'referrers', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select coalesce(nullif(referrer, ''), 'Direct') as referrer, count(*) as count
        from pulses
        where event_type = 'page_view' and created_at >= period_start
        group by 1
        order by count desc
        limit 8
      ) t
    ),

    -- External referrers only: in-app navigation and self-referrals removed, so
    -- this reads as actual acquisition rather than internal movement.
    'external_referrers', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select referrer, count(*) as count, count(distinct session_id) as sessions
        from pulses
        where event_type = 'page_view'
          and created_at >= period_start
          and pulse_channel(referrer) not in ('Internal', 'Direct')
        group by 1
        order by count desc
        limit 12
      ) t
    ),

    'channels', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select channel, count(*) as sessions,
               count(*) filter (where is_engaged) as engaged_sessions,
               round(avg(page_views)::numeric, 2) as pages_per_session
        from _sess
        group by 1
        order by sessions desc
      ) t
    ),

    -- ---------- interaction ----------
    -- What visitors actually click, which is the closest thing to CTA performance.
    'top_clicks', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          coalesce(nullif(btrim(element_text), ''), element_selector, '(unlabelled)') as label,
          element_selector,
          count(*) as count,
          count(distinct session_id) as sessions,
          (array_agg(page_path order by created_at desc))[1] as page_path
        from pulses
        where event_type = 'click' and created_at >= period_start
        group by 1, 2
        order by count desc
        limit 20
      ) t
    ),

    'event_mix', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select event_type, count(*) as count
        from pulses
        where created_at >= period_start
        group by 1
        order by count desc
      ) t
    ),
    -- ---------- sessions ----------
    'recent_sessions', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          left(session_id, 8) as session_ref,
          first_ts as started_at,
          last_ts as ended_at,
          page_views,
          distinct_pages,
          clicks,
          dur_ms,
          entry_page,
          exit_page,
          channel,
          device_type,
          browser,
          os,
          is_bot,
          is_engaged
        from _sess
        order by first_ts desc
        limit 60
      ) t
    ),

    -- ---------- individual visitors ----------
    -- visit_count is lifetime; the period columns come from this window only.
    'visitor_detail', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          left(v.id::text, 8) as visitor_ref,
          v.first_seen,
          v.last_seen,
          v.visit_count,
          coalesce(v.device_type, 'unknown') as device_type,
          coalesce(v.browser, 'unknown') as browser,
          coalesce(v.os, 'unknown') as os,
          v.is_bot,
          s.sessions,
          s.page_views,
          s.clicks,
          s.dur_ms,
          s.last_page
        from visitors v
        join (
          select
            p.visitor_id,
            count(distinct p.session_id) as sessions,
            count(*) filter (where p.event_type = 'page_view') as page_views,
            count(*) filter (where p.event_type = 'click') as clicks,
            coalesce((select sum(z.dur_ms) from _sess z where z.visitor_id = p.visitor_id), 0) as dur_ms,
            (array_agg(p.page_path order by p.created_at desc))[1] as last_page
          from pulses p
          where p.created_at >= period_start and p.visitor_id is not null
          group by p.visitor_id
        ) s on s.visitor_id = v.id
        order by s.page_views desc, v.last_seen desc
        limit 50
      ) t
    ),

    -- ---------- crawlers ----------
    -- Which crawlers reach the site, and how deep. Useful for confirming that
    -- search and AI crawlers are actually indexing new pages.
    'bot_breakdown', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          pulse_bot_name(v.user_agent) as bot,
          count(distinct v.id) as visitors,
          count(p.id) filter (where p.event_type = 'page_view') as page_views,
          max(p.created_at) as last_seen
        from visitors v
        join pulses p on p.visitor_id = v.id and p.created_at >= period_start
        where v.is_bot
        group by 1
        order by page_views desc
        limit 15
      ) t
    ),

    -- ---------- leads and conversion ----------
    -- The three capture surfaces (chat agent, agency enquiry form, contact form)
    -- unified into one stream, plus the chat funnel so drop-off is visible.
    'leads', jsonb_build_object(
      'period_total', (
        select (select count(*) from chat_leads where created_at >= period_start)
             + (select count(*) from agency_leads where created_at >= period_start)
             + (select count(*) from contact_messages where created_at >= period_start)
      ),
      'conversion_rate', (
        case when sessions_total = 0 then 0
        else round(100.0 * (
          (select count(*) from chat_leads where created_at >= period_start)
          + (select count(*) from agency_leads where created_at >= period_start)
          + (select count(*) from contact_messages where created_at >= period_start)
        ) / sessions_total, 2) end
      ),
      'booked', (select count(*) from chat_leads where booked and created_at >= period_start),
      'by_kind', (
        select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
          select 'Chat agent' as kind, count(*) as count from chat_leads where created_at >= period_start
          union all
          select 'Agency enquiry', count(*) from agency_leads where created_at >= period_start
          union all
          select 'Contact form', count(*) from contact_messages where created_at >= period_start
        ) t
      ),
      'by_status', (
        select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
          select status, count(*) as count from (
            select status from chat_leads where created_at >= period_start
            union all select status from agency_leads where created_at >= period_start
            union all select status from contact_messages where created_at >= period_start
          ) s
          group by 1 order by count desc
        ) t
      ),
      'by_source', (
        select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
          select coalesce(nullif(source, ''), 'unknown') as source, count(*) as count from (
            select source from chat_leads where created_at >= period_start
            union all select source from agency_leads where created_at >= period_start
            union all select source from contact_messages where created_at >= period_start
          ) s
          group by 1 order by count desc limit 10
        ) t
      ),
      -- Where each chat lead stalled, so an abandoned funnel step is obvious.
      'chat_funnel', (
        select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
          select step, count(*) as count,
                 count(*) filter (where booked) as booked
          from chat_leads
          where created_at >= period_start
          group by 1 order by count desc
        ) t
      ),
      'by_day', (
        select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
          select d::date as day, coalesce(x.count, 0) as count
          from generate_series(date_trunc('day', period_start), date_trunc('day', now()), interval '1 day') d
          left join (
            select date_trunc('day', created_at) as day, count(*) as count from (
              select created_at from chat_leads where created_at >= period_start
              union all select created_at from agency_leads where created_at >= period_start
              union all select created_at from contact_messages where created_at >= period_start
            ) s
            group by 1
          ) x on x.day = d
          order by 1
        ) t
      ),
      'recent', (
        select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
          select * from (
            select
              created_at, 'Chat agent' as kind, name, email, business_name,
              coalesce(need, what_they_sell) as detail, budget_range, status,
              page_path, source, booked, step, whatsapp as phone, industry, start_timeframe
            from chat_leads
            union all
            select
              created_at, 'Agency enquiry', name, email, business_name,
              coalesce(goals, service_interest), budget_range, status,
              null, source, false, null, phone, null, null
            from agency_leads
            union all
            select
              created_at, 'Contact form', name, email, null,
              message, null, status,
              null, source, false, null, null, null, null
            from contact_messages
          ) u
          order by created_at desc
          limit 50
        ) t
      )
    ),

    -- ---------- raw event feed ----------
    'recent_activity', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          p.created_at, p.event_type, p.page_path, p.page_title, p.element_text,
          p.element_selector, p.duration_ms, p.referrer,
          left(p.session_id, 8) as session_ref,
          left(p.visitor_id::text, 8) as visitor_ref,
          v.is_bot, v.browser, v.device_type, v.os
        from pulses p
        left join visitors v on v.id = p.visitor_id
        order by p.created_at desc
        limit 250
      ) t
    )
  ) into result;

  drop table if exists _sess;
  return result;
end;
$function$;
