-- WhatsApp leads: chats that start on WhatsApp never touch a website form, so
-- the Leads dashboard couldn't see them.
--
-- 1. whatsapp_leads: chats logged by hand from the hub. Admin-only, like the
--    rest of the hub.
-- 2. get_admin_analytics() is wrapped rather than rewritten: the existing
--    function is renamed to get_admin_analytics_base() and a new
--    get_admin_analytics() merges WhatsApp leads into every lead figure
--    (totals, period, conversion, by kind/status/source/day, recent) and adds
--    the WhatsApp button taps the site tracker records as clicks whose
--    element_selector starts with 'whatsapp:'. hub_site_analytics() and the
--    admin-analytics edge function call get_admin_analytics() by name, so both
--    pick this up with no other change.

create table if not exists public.whatsapp_leads (
  id uuid primary key default gen_random_uuid(),
  -- When the chat started, which may be earlier than when it was logged.
  created_at timestamptz not null default now(),
  logged_at timestamptz not null default now(),
  name text,
  phone text,
  business_name text,
  detail text,
  -- Where they found you: 'website' when the chat opened with the site's
  -- prefilled "I was on josephmaina.co.ke…" message.
  source text not null default 'website',
  status text not null default 'new' check (status in ('new', 'talking', 'won', 'lost')),
  booked boolean not null default false,
  logged_by uuid default auth.uid(),
  constraint whatsapp_leads_has_contact check (coalesce(btrim(name), '') <> '' or coalesce(btrim(phone), '') <> ''),
  constraint whatsapp_leads_lengths check (
    length(coalesce(name, '')) <= 200 and length(coalesce(phone, '')) <= 40
    and length(coalesce(business_name, '')) <= 200 and length(coalesce(detail, '')) <= 2000
    and length(source) <= 40
  )
);

create index if not exists whatsapp_leads_created_at_idx on public.whatsapp_leads (created_at);

alter table public.whatsapp_leads enable row level security;
revoke all on table public.whatsapp_leads from anon;
grant select, insert, update, delete on table public.whatsapp_leads to authenticated;
drop policy if exists "Admin full access" on public.whatsapp_leads;
create policy "Admin full access" on public.whatsapp_leads for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- WhatsApp taps are read from pulses by element_selector prefix.
create index if not exists pulses_whatsapp_clicks_idx on public.pulses (created_at)
  where event_type = 'click' and element_selector like 'whatsapp:%';

alter function public.get_admin_analytics(integer) rename to get_admin_analytics_base;
revoke execute on function public.get_admin_analytics_base(integer) from public, anon, authenticated;

create or replace function public.get_admin_analytics(p_days integer default 14)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  result jsonb := public.get_admin_analytics_base(p_days);
  period_start timestamptz := now() - (p_days || ' days')::interval;
  prev_period_start timestamptz := now() - (p_days * 2 || ' days')::interval;
  wa_total bigint;
  wa_period bigint;
  wa_prev bigint;
  wa_booked bigint;
  leads_period bigint;
  sessions bigint;
begin
  select count(*),
         count(*) filter (where created_at >= period_start),
         count(*) filter (where created_at >= prev_period_start and created_at < period_start),
         count(*) filter (where booked and created_at >= period_start)
    into wa_total, wa_period, wa_prev, wa_booked
  from whatsapp_leads;

  leads_period := coalesce((result #>> '{leads,period_total}')::bigint, 0) + wa_period;
  sessions := coalesce((result #>> '{period,sessions}')::bigint, 0);

  result := jsonb_set(result, '{totals,leads}', to_jsonb(coalesce((result #>> '{totals,leads}')::bigint, 0) + wa_total));
  result := jsonb_set(result, '{period,leads}', to_jsonb(coalesce((result #>> '{period,leads}')::bigint, 0) + wa_period));
  result := jsonb_set(result, '{period,prev_leads}', to_jsonb(coalesce((result #>> '{period,prev_leads}')::bigint, 0) + wa_prev));

  result := jsonb_set(result, '{leads}', (result -> 'leads') || jsonb_build_object(
    'period_total', leads_period,
    'conversion_rate', case when sessions = 0 then 0 else round(100.0 * leads_period / sessions, 2) end,
    'booked', coalesce((result #>> '{leads,booked}')::bigint, 0) + wa_booked,

    'by_kind', coalesce(result #> '{leads,by_kind}', '[]'::jsonb)
               || jsonb_build_array(jsonb_build_object('kind', 'WhatsApp', 'count', wa_period)),

    'by_status', (
      select coalesce(jsonb_agg(jsonb_build_object('status', status, 'count', count) order by count desc), '[]'::jsonb)
      from (
        select status, sum(count)::bigint as count from (
          select e ->> 'status' as status, (e ->> 'count')::bigint as count
          from jsonb_array_elements(coalesce(result #> '{leads,by_status}', '[]'::jsonb)) e
          union all
          select status, count(*) from whatsapp_leads where created_at >= period_start group by 1
        ) s
        group by 1
      ) t
    ),

    'by_source', (
      select coalesce(jsonb_agg(jsonb_build_object('source', source, 'count', count) order by count desc), '[]'::jsonb)
      from (
        select source, sum(count)::bigint as count from (
          select e ->> 'source' as source, (e ->> 'count')::bigint as count
          from jsonb_array_elements(coalesce(result #> '{leads,by_source}', '[]'::jsonb)) e
          union all
          select coalesce(nullif(source, ''), 'unknown'), count(*) from whatsapp_leads where created_at >= period_start group by 1
        ) s
        group by 1
        order by count desc
        limit 10
      ) t
    ),

    'by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('day', e ->> 'day', 'count', (e ->> 'count')::bigint + coalesce(w.count, 0))
                                order by e ->> 'day'), '[]'::jsonb)
      from jsonb_array_elements(coalesce(result #> '{leads,by_day}', '[]'::jsonb)) e
      left join (
        select date_trunc('day', created_at)::date::text as day, count(*) as count
        from whatsapp_leads where created_at >= period_start group by 1
      ) w on w.day = e ->> 'day'
    ),

    'recent', (
      select coalesce(jsonb_agg(r order by (r ->> 'created_at')::timestamptz desc), '[]'::jsonb)
      from (
        select r from (
          select e as r from jsonb_array_elements(coalesce(result #> '{leads,recent}', '[]'::jsonb)) e
          union all
          select to_jsonb(t) from (
            select created_at, 'WhatsApp' as kind, name, null::text as email, business_name,
                   detail, null::text as budget_range, status, null::text as page_path, source,
                   booked, null::text as step, phone, null::text as industry, null::text as start_timeframe
            from whatsapp_leads
            order by created_at desc
            limit 50
          ) t
        ) u
        order by (r ->> 'created_at')::timestamptz desc
        limit 50
      ) x
    ),

    -- Taps on any wa.me link on the site. A tap is intent, not a lead: some
    -- people open WhatsApp and never send the message.
    'whatsapp_clicks', (
      select count(*) from pulses
      where event_type = 'click' and element_selector like 'whatsapp:%' and created_at >= period_start
    ),
    'prev_whatsapp_clicks', (
      select count(*) from pulses
      where event_type = 'click' and element_selector like 'whatsapp:%'
        and created_at >= prev_period_start and created_at < period_start
    ),
    'whatsapp_click_sessions', (
      select count(distinct session_id) from pulses
      where event_type = 'click' and element_selector like 'whatsapp:%' and created_at >= period_start
    ),
    'whatsapp_by_location', (
      select coalesce(jsonb_agg(jsonb_build_object('location', location, 'count', count) order by count desc), '[]'::jsonb)
      from (
        select substr(element_selector, 10) as location, count(*) as count
        from pulses
        where event_type = 'click' and element_selector like 'whatsapp:%' and created_at >= period_start
        group by 1
        order by count desc
        limit 10
      ) t
    ),
    'whatsapp_from_site', (
      select count(*) from whatsapp_leads where source = 'website' and created_at >= period_start
    )
  ));

  return result;
end;
$function$;

revoke execute on function public.get_admin_analytics(integer) from public, anon, authenticated;
grant execute on function public.get_admin_analytics(integer) to service_role;
