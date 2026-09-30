-- Rollback for 20260930000000_expand_admin_analytics.sql.
-- Restores get_admin_analytics to the definition that was live in the database
-- before that migration was applied. Run this if the expanded payload needs to
-- be reverted; the frontend's original sections all read from these keys.
--
-- The helper functions pulse_channel / pulse_bot_name are left in place because
-- nothing else depends on them; drop them separately if you want a clean revert:
--   drop function if exists public.pulse_channel(text);
--   drop function if exists public.pulse_bot_name(text);

CREATE OR REPLACE FUNCTION public.get_admin_analytics(p_days integer DEFAULT 14)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  result jsonb;
  period_start timestamptz := now() - (p_days || ' days')::interval;
  prev_period_start timestamptz := now() - (p_days * 2 || ' days')::interval;
begin
  select jsonb_build_object(
    'range_days', p_days,
    'totals', jsonb_build_object(
      'visitors', (select count(*) from visitors),
      'human_visitors', (select count(*) from visitors where not is_bot),
      'bot_visitors', (select count(*) from visitors where is_bot),
      'pulses', (select count(*) from pulses),
      'page_views', (select count(*) from pulses where event_type = 'page_view'),
      'clicks', (select count(*) from pulses where event_type = 'click')
    ),
    'period', jsonb_build_object(
      'page_views', (select count(*) from pulses where event_type = 'page_view' and created_at >= period_start),
      'prev_page_views', (select count(*) from pulses where event_type = 'page_view' and created_at >= prev_period_start and created_at < period_start),
      'visitors', (select count(distinct visitor_id) from pulses where created_at >= period_start),
      'prev_visitors', (select count(distinct visitor_id) from pulses where created_at >= prev_period_start and created_at < period_start),
      'clicks', (select count(*) from pulses where event_type = 'click' and created_at >= period_start),
      'prev_clicks', (select count(*) from pulses where event_type = 'click' and created_at >= prev_period_start and created_at < period_start)
    ),
    'visits_by_day', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select date_trunc('day', created_at)::date as day,
               count(*) filter (where event_type = 'page_view') as page_views,
               count(distinct visitor_id) as unique_visitors
        from pulses
        where created_at >= period_start
        group by 1
        order by 1
      ) t
    ),
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
    'recent_activity', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select p.created_at, p.event_type, p.page_path, p.element_text, v.is_bot, v.browser, v.device_type
        from pulses p
        left join visitors v on v.id = p.visitor_id
        order by p.created_at desc
        limit 100
      ) t
    )
  ) into result;
  return result;
end;
$function$;
