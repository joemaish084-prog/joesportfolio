-- Undoes 20261018000000_hub_site_analytics.sql (restores the old, open grants).
drop function if exists public.hub_site_analytics(integer);
grant execute on function public.get_admin_analytics(integer) to public, anon, authenticated;
