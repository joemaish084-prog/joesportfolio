-- Shared hub access. CRM memberships and client portal access stay separate.
create table public.hub_team_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (length(full_name) <= 120),
  job_title text not null default '' check (length(job_title) <= 120),
  phone text not null default '' check (length(phone) <= 40),
  role text not null default 'editor' check (role in ('admin', 'editor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.hub_team_members enable row level security;
revoke all on public.hub_team_members from public, anon, authenticated;
grant select on public.hub_team_members to authenticated;
grant all on public.hub_team_members to service_role;

-- Preserve existing administrator accounts, including accounts without a profile.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
    or (_role = 'admin' and exists (
      select 1 from public.hub_team_members where user_id = _user_id and role = 'admin' and active
    ))
$$;

create function public.hub_can_work()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_hub_admin() or exists (
    select 1 from public.hub_team_members where user_id = auth.uid() and active
  )
$$;
revoke all on function public.hub_can_work() from public, anon;
grant execute on function public.hub_can_work() to authenticated;

create policy "Own profile or admin" on public.hub_team_members for select to authenticated
  using (user_id = auth.uid() or public.is_hub_admin());

create function public.hub_my_access()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'role', case when public.is_hub_admin() then 'admin' else m.role end,
    'full_name', coalesce(m.full_name, ''), 'job_title', coalesce(m.job_title, ''),
    'phone', coalesce(m.phone, '')
  ) from auth.users u left join public.hub_team_members m on m.user_id = u.id
  where u.id = auth.uid() and public.hub_can_work()
$$;

create function public.hub_team_list()
returns table(user_id uuid, email text, full_name text, job_title text, phone text, role text, active boolean, legacy_admin boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_hub_admin() then raise exception 'Only admins can manage the team'; end if;
  return query select u.id, u.email::text, coalesce(m.full_name, ''), coalesce(m.job_title, ''), coalesce(m.phone, ''),
    case when r.user_id is not null then 'admin' else m.role end,
    case when r.user_id is not null then true else m.active end, r.user_id is not null
  from auth.users u
  left join public.hub_team_members m on m.user_id = u.id
  left join public.user_roles r on r.user_id = u.id and r.role = 'admin'
  where m.user_id is not null or r.user_id is not null
  order by coalesce(nullif(m.full_name, ''), u.email);
end $$;

-- Only these RPCs can write profiles. Callers cannot promote themselves through
-- profile fields, auth metadata, direct table writes, or forged invitation roles.
create function public.hub_save_member(_email text, _full_name text, _job_title text, _phone text, _role text, _active boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  perform pg_advisory_xact_lock(741104);
  if not public.is_hub_admin() then raise exception 'Only admins can manage the team'; end if;
  if _role is null or _role not in ('admin', 'editor') or _active is null then raise exception 'Invalid role or status'; end if;
  if coalesce(length(btrim(_full_name)), 0) = 0 then raise exception 'Enter a full name'; end if;
  select id into target from auth.users where lower(email) = lower(btrim(_email));
  if target is null then raise exception 'Create or invite this login first'; end if;
  if exists (select 1 from public.user_roles where user_id = target and role = 'admin') then
    if _role <> 'admin' or not _active then raise exception 'Original admins must retain access'; end if;
  end if;
  if target = auth.uid() and (not _active or _role <> 'admin') then raise exception 'You cannot remove your own admin access'; end if;
  insert into public.hub_team_members(user_id, full_name, job_title, phone, role, active)
    values(target, btrim(_full_name), btrim(coalesce(_job_title, '')), btrim(coalesce(_phone, '')), _role, _active)
  on conflict (user_id) do update set full_name = excluded.full_name, job_title = excluded.job_title,
    phone = excluded.phone, role = excluded.role, active = excluded.active, updated_at = now();
  return target;
end $$;

create function public.hub_save_profile(_full_name text, _job_title text, _phone text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.hub_can_work() then raise exception 'No hub access'; end if;
  if coalesce(length(btrim(_full_name)), 0) = 0 then raise exception 'Enter a full name'; end if;
  insert into public.hub_team_members(user_id, full_name, job_title, phone, role)
    values(auth.uid(), btrim(_full_name), btrim(coalesce(_job_title, '')), btrim(coalesce(_phone, '')),
      case when public.is_hub_admin() then 'admin' else 'editor' end)
  on conflict (user_id) do update set full_name = excluded.full_name, job_title = excluded.job_title,
    phone = excluded.phone, updated_at = now();
end $$;

revoke all on function public.hub_my_access(), public.hub_team_list(),
  public.hub_save_member(text,text,text,text,text,boolean), public.hub_save_profile(text,text,text) from public, anon;
grant execute on function public.hub_my_access(), public.hub_team_list(),
  public.hub_save_member(text,text,text,text,text,boolean), public.hub_save_profile(text,text,text) to authenticated;

-- One shared business workspace: editors see and edit all operational records.
-- Business funds, settings writes, team administration and portal access stay admin-only.
do $$ declare t text; begin
  foreach t in array array['clients','client_kpis','onboarding_items','tasks','documents','work_log',
    'reports','report_metrics','invoices','payments','expenses','leads'] loop
    execute format('create policy "Team read" on public.%I for select to authenticated using (public.hub_can_work())', t);
    execute format('create policy "Team insert" on public.%I for insert to authenticated with check (public.hub_can_work())', t);
    execute format('create policy "Team update" on public.%I for update to authenticated using (public.hub_can_work()) with check (public.hub_can_work())', t);
  end loop;
  foreach t in array array['client_types','onboarding_templates','hub_settings'] loop
    execute format('create policy "Team read" on public.%I for select to authenticated using (public.hub_can_work())', t);
  end loop;
  -- Removing individual KPI/metric fields is part of editing a client/report.
  foreach t in array array['client_kpis','report_metrics'] loop
    execute format('create policy "Team edit fields" on public.%I for delete to authenticated using (public.hub_can_work())', t);
  end loop;
end $$;

create policy "Team read documents" on storage.objects for select to authenticated
  using (bucket_id = 'hub-documents' and public.hub_can_work());
create policy "Team upload documents" on storage.objects for insert to authenticated
  with check (bucket_id = 'hub-documents' and public.hub_can_work());
create policy "Team update documents" on storage.objects for update to authenticated
  using (bucket_id = 'hub-documents' and public.hub_can_work())
  with check (bucket_id = 'hub-documents' and public.hub_can_work());

-- The original invoker function relied on all client reads being admin-only.
-- Keep its implementation private now that staff can read and edit clients.
alter function public.hub_merge_clients(uuid,uuid) rename to hub_merge_clients_team_impl;
revoke all on function public.hub_merge_clients_team_impl(uuid,uuid) from public, anon, authenticated;
create function public.hub_merge_clients(p_keep uuid, p_drop uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_hub_admin() then raise exception 'Only admins can merge clients'; end if;
  perform public.hub_merge_clients_team_impl(p_keep, p_drop);
end $$;
revoke all on function public.hub_merge_clients(uuid,uuid) from public, anon;
grant execute on function public.hub_merge_clients(uuid,uuid) to authenticated;

-- Lightweight attribution. No client contents are duplicated into logs.
create function public.hub_stamp_actor()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then new.created_by := auth.uid();
  else new.created_by := old.created_by; end if;
  new.updated_by := auth.uid();
  return new;
end $$;
revoke all on function public.hub_stamp_actor() from public, anon;
do $$ declare t text; begin
  foreach t in array array['clients','client_kpis','onboarding_items','tasks','documents','work_log',
    'reports','report_metrics','invoices','payments','expenses','leads'] loop
    -- Keep actor IDs after account deletion; immutable attribution must not
    -- block Auth cleanup or cascade-delete business records.
    execute format('alter table public.%I add column created_by uuid, add column updated_by uuid', t);
    execute format('create trigger stamp_actor before insert or update on public.%I for each row execute function public.hub_stamp_actor()', t);
  end loop;
end $$;
