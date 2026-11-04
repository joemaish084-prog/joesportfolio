-- Export personal time records before rollback; shared clients are preserved.
create or replace function public.hub_merge_clients(p_keep uuid, p_drop uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_hub_admin() then raise exception 'Only admins can merge clients'; end if;
  perform public.hub_merge_clients_team_impl(p_keep, p_drop);
end
$$;
drop function if exists public.hub_time_save_entry(uuid, uuid, integer, text, date);
drop table if exists public.hub_time_clients;
drop table if exists public.hub_time_entries;
drop policy if exists "Personal time settings" on public.hub_time_settings;
drop function if exists public.is_hub_time_owner();
drop table if exists public.hub_time_settings;
