drop policy if exists "Team read documents" on storage.objects;
drop policy if exists "Team upload documents" on storage.objects;
drop policy if exists "Team update documents" on storage.objects;
drop function public.hub_merge_clients(uuid,uuid);
alter function public.hub_merge_clients_team_impl(uuid,uuid) rename to hub_merge_clients;
grant execute on function public.hub_merge_clients(uuid,uuid) to authenticated;
do $$ declare t text; begin
  foreach t in array array['clients','client_kpis','onboarding_items','tasks','documents','work_log',
    'reports','report_metrics','invoices','payments','expenses','leads'] loop
    execute format('drop policy if exists "Team read" on public.%I', t);
    execute format('drop policy if exists "Team insert" on public.%I', t);
    execute format('drop policy if exists "Team update" on public.%I', t);
    execute format('drop policy if exists "Team edit fields" on public.%I', t);
    execute format('drop trigger if exists stamp_actor on public.%I', t);
    execute format('alter table public.%I drop column if exists created_by, drop column if exists updated_by', t);
  end loop;
  foreach t in array array['client_types','onboarding_templates','hub_settings'] loop
    execute format('drop policy if exists "Team read" on public.%I', t);
  end loop;
end $$;
drop function public.hub_stamp_actor();
drop function public.hub_save_profile(text,text,text);
drop function public.hub_save_member(text,text,text,text,text,boolean);
drop function public.hub_team_list();
drop function public.hub_my_access();
drop function public.hub_can_work();
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
drop table public.hub_team_members;
