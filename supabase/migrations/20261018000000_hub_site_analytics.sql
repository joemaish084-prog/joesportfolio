-- Client Hub: website analytics inside the hub, and closing a hole.
--
-- 1. get_admin_analytics() is SECURITY DEFINER and was executable by anon, so
--    anyone holding the public site key could call it straight through
--    /rest/v1/rpc and read the whole payload, website leads' names, emails and
--    phone numbers included, without the admin passcode. Only the
--    admin-analytics edge function (service role) needs it.
-- 2. hub_site_analytics() gives the signed-in hub admin the same payload,
--    checked with has_role(), so the hub doesn't need the passcode.

revoke execute on function public.get_admin_analytics(integer) from public, anon, authenticated;
grant execute on function public.get_admin_analytics(integer) to service_role;

create or replace function public.hub_site_analytics(p_days integer default 14)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_days is null or p_days not in (1, 7, 14, 30, 90) then
    p_days := 14;
  end if;
  return public.get_admin_analytics(p_days);
end;
$$;

revoke all on function public.hub_site_analytics(integer) from public, anon;
grant execute on function public.hub_site_analytics(integer) to authenticated;
