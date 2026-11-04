-- Personal time/value dashboard. Requires hub_team and hub_engagements.
-- Bind an existing login once; never grant access to every hub administrator.
create table public.hub_time_settings (
  id boolean primary key default true check (id),
  owner_user_id uuid not null unique references auth.users(id) on delete restrict,
  weekly_agency_hours numeric(6, 2) not null default 15
    check (weekly_agency_hours > 0 and weekly_agency_hours <= 168)
);

insert into public.hub_time_settings(owner_user_id)
select id from auth.users where lower(email) = 'joemukunya67@gmail.com';

create function public.is_hub_time_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_hub_admin() and exists (
    select 1 from public.hub_time_settings where owner_user_id = auth.uid()
  )
$$;
revoke all on function public.is_hub_time_owner() from public, anon;
grant execute on function public.is_hub_time_owner() to authenticated;

create table public.hub_time_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  minutes integer not null check (minutes > 0 and minutes <= 525600),
  note text not null default '' check (length(note) <= 2000),
  entry_date date not null check (entry_date <= (now() at time zone 'Africa/Nairobi')::date),
  created_at timestamptz not null default now()
);
create index hub_time_entries_date_idx on public.hub_time_entries(entry_date desc, created_at desc);
create index hub_time_entries_client_idx on public.hub_time_entries(client_id);

-- Archiving here affects personal tracking only, never the shared client record.
create table public.hub_time_clients (
  client_id uuid primary key references public.clients(id) on delete cascade,
  archived boolean not null default false
);

alter table public.hub_time_settings enable row level security;
alter table public.hub_time_entries enable row level security;
alter table public.hub_time_clients enable row level security;
revoke all on public.hub_time_settings, public.hub_time_entries, public.hub_time_clients
  from public, anon, authenticated;
grant select on public.hub_time_settings to authenticated;
grant update(weekly_agency_hours) on public.hub_time_settings to authenticated;
grant select, delete on public.hub_time_entries to authenticated;
grant insert(id, client_id, minutes, note, entry_date) on public.hub_time_entries to authenticated;
grant select, insert on public.hub_time_clients to authenticated;
grant update(archived) on public.hub_time_clients to authenticated;

create policy "Personal time settings" on public.hub_time_settings for all to authenticated
  using (public.is_hub_time_owner()) with check (public.is_hub_time_owner());
create policy "Personal time entries" on public.hub_time_entries for all to authenticated
  using (public.is_hub_time_owner()) with check (public.is_hub_time_owner());
create policy "Personal tracking clients" on public.hub_time_clients for all to authenticated
  using (public.is_hub_time_owner()) with check (public.is_hub_time_owner());

-- The browser retains the same UUID when retrying a stopped timer or manual save.
-- ON CONFLICT handles simultaneous saves from two tabs; conflicting payloads fail.
create function public.hub_time_save_entry(
  p_id uuid, p_client_id uuid, p_minutes integer, p_note text, p_entry_date date
) returns uuid language plpgsql security invoker set search_path = '' as $$
begin
  if not public.is_hub_time_owner() then raise exception 'Personal time access required'; end if;
  insert into public.hub_time_entries(id, client_id, minutes, note, entry_date)
    values (p_id, p_client_id, p_minutes, coalesce(p_note, ''), p_entry_date)
    on conflict (id) do nothing;
  if not exists (
    select 1 from public.hub_time_entries where id = p_id and client_id = p_client_id
      and minutes = p_minutes and note = coalesce(p_note, '') and entry_date = p_entry_date
  ) then raise exception 'This entry was already saved with different details'; end if;
  return p_id;
end
$$;
revoke all on function public.hub_time_save_entry(uuid, uuid, integer, text, date) from public, anon;
grant execute on function public.hub_time_save_entry(uuid, uuid, integer, text, date) to authenticated;

-- Keep the existing client merge working without losing private time history.
-- Only the time owner can move private records between shared client profiles.
create or replace function public.hub_merge_clients(p_keep uuid, p_drop uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_hub_admin() then raise exception 'Only admins can merge clients'; end if;
  if p_keep = p_drop then raise exception 'Choose two different clients'; end if;
  if exists (select 1 from public.hub_time_entries where client_id = p_drop)
    or exists (select 1 from public.hub_time_clients where client_id = p_drop) then
    if not public.is_hub_time_owner() then
      raise exception 'Only the personal time owner can merge a client with time history';
    end if;
    update public.hub_time_entries set client_id = p_keep where client_id = p_drop;
    insert into public.hub_time_clients(client_id, archived)
      select p_keep, archived from public.hub_time_clients where client_id = p_drop
      on conflict (client_id) do nothing;
    delete from public.hub_time_clients where client_id = p_drop;
  end if;
  perform public.hub_merge_clients_team_impl(p_keep, p_drop);
end
$$;
