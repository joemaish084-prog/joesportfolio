-- Undoes 20261102000000_whatsapp_leads.sql: puts the original analytics
-- function back under its own name and drops the WhatsApp leads table.
drop function if exists public.get_admin_analytics(integer);
alter function public.get_admin_analytics_base(integer) rename to get_admin_analytics;
revoke execute on function public.get_admin_analytics(integer) from public, anon, authenticated;
grant execute on function public.get_admin_analytics(integer) to service_role;

drop index if exists public.pulses_whatsapp_clicks_idx;
drop table if exists public.whatsapp_leads;
