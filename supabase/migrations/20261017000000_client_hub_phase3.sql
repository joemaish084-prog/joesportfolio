-- Client Hub, phase 3: settings and merging duplicate clients.
-- Requires phase 1 and phase 2. Same rules: admin-only RLS, no anon access.

-- ---------------------------------------------------------------- settings

-- One row (id is always true). business: letterhead and payment details printed
-- on invoices; invoice_defaults: payment terms and default notes.
create table if not exists public.hub_settings (
  id boolean primary key default true check (id),
  business jsonb not null default '{}'::jsonb check (jsonb_typeof(business) = 'object'),
  invoice_defaults jsonb not null default '{}'::jsonb check (jsonb_typeof(invoice_defaults) = 'object'),
  revenue_goal numeric(12, 2) check (revenue_goal is null or revenue_goal > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.hub_settings (id, business, invoice_defaults)
values (
  true,
  '{"name": "Joseph Maina", "tagline": "Digital Marketing", "location": "Nairobi, Kenya", "website": "josephmaina.co.ke"}'::jsonb,
  '{"due_days": 14}'::jsonb
)
on conflict (id) do nothing;

drop trigger if exists set_updated_at on public.hub_settings;
create trigger set_updated_at before update on public.hub_settings
  for each row execute function public.hub_set_updated_at();

alter table public.hub_settings enable row level security;
revoke all on table public.hub_settings from anon;
grant select, insert, update, delete on table public.hub_settings to authenticated;
drop policy if exists "Admin full access" on public.hub_settings;
create policy "Admin full access" on public.hub_settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------- merge clients

-- Moves everything that belongs to p_drop onto p_keep, then deletes p_drop.
-- KPIs with the same name are combined (their report values move across;
-- where both clients have a value for the same report, p_keep's wins).
-- Onboarding steps from the same template are not duplicated.
-- Security invoker: RLS applies, so only the hub admin can run it usefully.
create or replace function public.hub_merge_clients(p_keep uuid, p_drop uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  k record;
  target uuid;
begin
  if p_keep = p_drop then
    raise exception 'Choose two different clients';
  end if;
  if not exists (select 1 from clients where id = p_keep) or not exists (select 1 from clients where id = p_drop) then
    raise exception 'Client not found';
  end if;

  -- KPIs: fold same-named ones into the kept client's KPI.
  for k in select id, name from client_kpis where client_id = p_drop loop
    select id into target from client_kpis where client_id = p_keep and lower(name) = lower(k.name);
    if target is null then
      update client_kpis set client_id = p_keep where id = k.id;
    else
      delete from report_metrics m
        where m.client_kpi_id = k.id
          and exists (select 1 from report_metrics x where x.report_id = m.report_id and x.client_kpi_id = target);
      update report_metrics set client_kpi_id = target where client_kpi_id = k.id;
      delete from client_kpis where id = k.id;
    end if;
  end loop;

  -- Same template step on both: keep one, ticked if either was ticked.
  update onboarding_items k3 set
    is_done = true,
    done_at = coalesce(k3.done_at, d.done_at),
    due_date = coalesce(k3.due_date, d.due_date),
    note = coalesce(k3.note, d.note)
  from onboarding_items d
  where k3.client_id = p_keep and d.client_id = p_drop and d.template_id = k3.template_id
    and d.is_done and not k3.is_done;
  delete from onboarding_items d
    where d.client_id = p_drop and d.template_id is not null
      and exists (select 1 from onboarding_items x where x.client_id = p_keep and x.template_id = d.template_id);
  update onboarding_items set client_id = p_keep where client_id = p_drop;

  update invoices set client_id = p_keep where client_id = p_drop;
  update payments set client_id = p_keep where client_id = p_drop;
  update expenses set client_id = p_keep where client_id = p_drop;
  update documents set client_id = p_keep where client_id = p_drop;
  update work_log set client_id = p_keep where client_id = p_drop;
  update reports set client_id = p_keep where client_id = p_drop;
  update leads set converted_client_id = p_keep where converted_client_id = p_drop;

  -- Keep any profile details the kept record is missing.
  update clients k2 set
    business_name = coalesce(k2.business_name, d.business_name),
    contact_person = coalesce(k2.contact_person, d.contact_person),
    email = coalesce(k2.email, d.email),
    phone = coalesce(k2.phone, d.phone),
    website = coalesce(k2.website, d.website),
    industry = coalesce(k2.industry, d.industry),
    client_type_id = coalesce(k2.client_type_id, d.client_type_id),
    start_date = least(k2.start_date, d.start_date),
    monthly_fee = coalesce(k2.monthly_fee, d.monthly_fee),
    services = (select coalesce(array_agg(distinct s), '{}') from unnest(k2.services || d.services) s),
    custom_fields = d.custom_fields || k2.custom_fields,
    notes = nullif(concat_ws(E'\n\n', k2.notes, d.notes), '')
  from clients d
  where k2.id = p_keep and d.id = p_drop;

  delete from clients where id = p_drop;
end
$$;

revoke all on function public.hub_merge_clients(uuid, uuid) from public, anon;
grant execute on function public.hub_merge_clients(uuid, uuid) to authenticated;
