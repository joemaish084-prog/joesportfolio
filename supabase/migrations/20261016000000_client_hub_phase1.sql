-- Client Hub, phase 1: roles, client types, clients, KPIs, onboarding.
--
-- Everything here is private back-office data. Every table has RLS enabled with
-- a single admin-only policy, and anon has its table privileges revoked so an
-- anonymous request is rejected outright instead of returning an empty list.
--
-- Later phases (documents, reports, report_metrics, work_log, invoices,
-- payments, expenses, leads) hang off clients.id with
--   client_id uuid references public.clients(id) on delete cascade
-- and copy the same RLS block used below.
--
-- The first admin is assigned by hand after creating the auth user; see the
-- bottom of this file.

-- ---------------------------------------------------------------- roles

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin');
  end if;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Security definer so policies can consult user_roles without recursing into
-- user_roles' own RLS.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- What the frontend calls to decide whether the signed-in user may enter.
create or replace function public.is_hub_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin')
$$;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.is_hub_admin() from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_hub_admin() to authenticated;

create or replace function public.hub_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

-- ---------------------------------------------------------------- client types

-- field_definitions: [{ key, label, type, options?, placeholder? }]
--   type: text | textarea | number | currency | percent | url | select | multiselect
-- default_kpis: [{ name, unit }] with unit: number | kes | percent
create table if not exists public.client_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  field_definitions jsonb not null default '[]'::jsonb
    check (jsonb_typeof(field_definitions) = 'array'),
  default_kpis jsonb not null default '[]'::jsonb
    check (jsonb_typeof(default_kpis) = 'array'),
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- clients

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  client_type_id uuid references public.client_types(id) on delete set null,
  name text not null check (btrim(name) <> ''),
  business_name text,
  contact_person text,
  email text,
  phone text,
  website text,
  industry text,
  status text not null default 'prospect'
    check (status in ('prospect', 'onboarding', 'active', 'paused', 'ended')),
  start_date date,
  monthly_fee numeric(12, 2) check (monthly_fee is null or monthly_fee >= 0),
  currency text not null default 'KES',
  services text[] not null default '{}',
  main_goal text check (main_goal in ('sales', 'leads', 'messages', 'brand')),
  notes text,
  custom_fields jsonb not null default '{}'::jsonb
    check (jsonb_typeof(custom_fields) = 'object'),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_status_idx on public.clients (status) where archived_at is null;
create index if not exists clients_type_idx on public.clients (client_type_id);

-- ---------------------------------------------------------------- KPIs

-- The metrics tracked for a client. Phase 3's report_metrics will reference
-- client_kpis.id so progress charts line up with these names and units.
create table if not exists public.client_kpis (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  unit text not null default 'number' check (unit in ('number', 'kes', 'percent')),
  target numeric,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, name)
);

create index if not exists client_kpis_client_idx on public.client_kpis (client_id);

-- ---------------------------------------------------------------- onboarding

-- client_type_id null = default step for every client.
create table if not exists public.onboarding_templates (
  id uuid primary key default gen_random_uuid(),
  client_type_id uuid references public.client_types(id) on delete cascade,
  title text not null check (btrim(title) <> ''),
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_templates_type_idx on public.onboarding_templates (client_type_id);

create table if not exists public.onboarding_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  template_id uuid references public.onboarding_templates(id) on delete set null,
  title text not null check (btrim(title) <> ''),
  sort_order integer not null default 0,
  is_done boolean not null default false,
  done_at timestamptz,
  due_date date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_items_client_idx on public.onboarding_items (client_id, sort_order);
create index if not exists onboarding_items_open_due_idx on public.onboarding_items (due_date) where not is_done;

create or replace function public.hub_onboarding_done_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_done and (tg_op = 'INSERT' or not old.is_done) then
    new.done_at := coalesce(new.done_at, now());
  elsif not new.is_done then
    new.done_at := null;
  end if;
  return new;
end
$$;

-- Copies the default steps plus the client type's extra steps onto a client,
-- skipping any template already applied. Safe to call again after the client
-- type changes. Security invoker, so RLS still applies to the caller.
create or replace function public.hub_apply_onboarding_template(p_client_id uuid)
returns integer
language plpgsql
set search_path = public
as $$
declare
  inserted integer;
  base_order integer;
begin
  select coalesce(max(sort_order), 0) into base_order
  from public.onboarding_items where client_id = p_client_id;

  insert into public.onboarding_items (client_id, template_id, title, sort_order)
  select c.id, t.id, t.title,
         base_order + row_number() over (order by (t.client_type_id is not null), t.sort_order, t.created_at)::integer
  from public.clients c
  join public.onboarding_templates t
    on t.is_active and (t.client_type_id is null or t.client_type_id = c.client_type_id)
  where c.id = p_client_id
    and not exists (
      select 1 from public.onboarding_items i
      where i.client_id = c.id and i.template_id = t.id
    );

  get diagnostics inserted = row_count;
  return inserted;
end
$$;

revoke all on function public.hub_apply_onboarding_template(uuid) from public, anon;
grant execute on function public.hub_apply_onboarding_template(uuid) to authenticated;

create or replace function public.hub_client_created()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform public.hub_apply_onboarding_template(new.id);
  return new;
end
$$;

-- ---------------------------------------------------------------- triggers

drop trigger if exists set_updated_at on public.user_roles;
create trigger set_updated_at before update on public.user_roles
  for each row execute function public.hub_set_updated_at();
drop trigger if exists set_updated_at on public.client_types;
create trigger set_updated_at before update on public.client_types
  for each row execute function public.hub_set_updated_at();
drop trigger if exists set_updated_at on public.clients;
create trigger set_updated_at before update on public.clients
  for each row execute function public.hub_set_updated_at();
drop trigger if exists set_updated_at on public.client_kpis;
create trigger set_updated_at before update on public.client_kpis
  for each row execute function public.hub_set_updated_at();
drop trigger if exists set_updated_at on public.onboarding_templates;
create trigger set_updated_at before update on public.onboarding_templates
  for each row execute function public.hub_set_updated_at();
drop trigger if exists set_updated_at on public.onboarding_items;
create trigger set_updated_at before update on public.onboarding_items
  for each row execute function public.hub_set_updated_at();

drop trigger if exists set_done_at on public.onboarding_items;
create trigger set_done_at before insert or update on public.onboarding_items
  for each row execute function public.hub_onboarding_done_at();

drop trigger if exists apply_onboarding on public.clients;
create trigger apply_onboarding after insert on public.clients
  for each row execute function public.hub_client_created();

-- ---------------------------------------------------------------- RLS

do $$
declare
  t text;
begin
  foreach t in array array[
    'user_roles', 'client_types', 'clients', 'client_kpis',
    'onboarding_templates', 'onboarding_items'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('drop policy if exists "Admin full access" on public.%I', t);
    execute format(
      'create policy "Admin full access" on public.%I for all to authenticated '
      'using (public.has_role(auth.uid(), ''admin'')) '
      'with check (public.has_role(auth.uid(), ''admin''))',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------- storage

-- Private bucket for phase 2 documents (contracts, proposals, quotations).
-- Files are opened with short-lived signed URLs, never public links.
insert into storage.buckets (id, name, public)
values ('hub-documents', 'hub-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Hub admin read documents" on storage.objects;
create policy "Hub admin read documents" on storage.objects
  for select to authenticated
  using (bucket_id = 'hub-documents' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Hub admin upload documents" on storage.objects;
create policy "Hub admin upload documents" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'hub-documents' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Hub admin update documents" on storage.objects;
create policy "Hub admin update documents" on storage.objects
  for update to authenticated
  using (bucket_id = 'hub-documents' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'hub-documents' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Hub admin delete documents" on storage.objects;
create policy "Hub admin delete documents" on storage.objects
  for delete to authenticated
  using (bucket_id = 'hub-documents' and public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------- seed: client types

insert into public.client_types (slug, name, description, sort_order, field_definitions, default_kpis) values
(
  'ecommerce', 'E-commerce / Retail',
  'Online stores and retailers selling products.',
  10,
  '[
    {"key": "store_platform", "label": "Store platform", "type": "select", "options": ["Shopify", "WooCommerce", "Instagram shop", "Other"]},
    {"key": "product_categories", "label": "Product categories", "type": "textarea", "placeholder": "Phones, PlayStations, accessories"},
    {"key": "average_order_value", "label": "Average order value", "type": "currency"},
    {"key": "monthly_revenue_target", "label": "Monthly revenue target", "type": "currency"},
    {"key": "catalog_size", "label": "Catalog size (products)", "type": "number"}
  ]'::jsonb,
  '[
    {"name": "ROAS", "unit": "number"},
    {"name": "Orders", "unit": "number"},
    {"name": "Revenue", "unit": "kes"},
    {"name": "Cost per purchase", "unit": "kes"}
  ]'::jsonb
),
(
  'lead-gen', 'Lead generation / Services',
  'Service businesses that sell through enquiries and calls.',
  20,
  '[
    {"key": "what_they_sell", "label": "What they sell", "type": "textarea"},
    {"key": "lead_value", "label": "Value of a lead", "type": "currency"},
    {"key": "lead_to_sale_rate", "label": "Lead-to-sale rate", "type": "percent"}
  ]'::jsonb,
  '[
    {"name": "Leads", "unit": "number"},
    {"name": "Cost per lead", "unit": "kes"},
    {"name": "Booked calls", "unit": "number"}
  ]'::jsonb
),
(
  'beauty-health', 'Beauty & Health / Clinic',
  'Salons, spas, clinics and wellness brands.',
  30,
  '[
    {"key": "booking_method", "label": "How clients book", "type": "select", "options": ["WhatsApp", "Phone call", "Website form", "Booking app", "Walk-in"]},
    {"key": "monthly_bookings", "label": "Bookings per month (current)", "type": "number"},
    {"key": "treatments_offered", "label": "Treatments offered", "type": "textarea"}
  ]'::jsonb,
  '[
    {"name": "Bookings", "unit": "number"},
    {"name": "Cost per booking", "unit": "kes"},
    {"name": "WhatsApp messages", "unit": "number"}
  ]'::jsonb
),
(
  'real-estate', 'Real estate',
  'Developers, agents and property managers.',
  40,
  '[
    {"key": "property_type", "label": "Property type", "type": "multiselect", "options": ["Apartments", "Houses", "Land", "Commercial", "Rentals"]},
    {"key": "listing_count", "label": "Active listings", "type": "number"},
    {"key": "price_range", "label": "Price range", "type": "text", "placeholder": "KES 4M – 12M"}
  ]'::jsonb,
  '[
    {"name": "Enquiries", "unit": "number"},
    {"name": "Site visits", "unit": "number"}
  ]'::jsonb
),
(
  'other', 'Other / Custom',
  'Anything else. Add fields as you need them.',
  90,
  '[]'::jsonb,
  '[]'::jsonb
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- seed: onboarding templates

insert into public.onboarding_templates (client_type_id, title, sort_order)
select null, v.title, v.sort_order
from (values
  ('Discovery call done', 10),
  ('Proposal sent', 20),
  ('Proposal approved', 30),
  ('Contract signed', 40),
  ('First invoice sent', 50),
  ('Access to ad accounts', 60),
  ('Pixel / tracking verified', 70),
  ('Brand assets received', 80),
  ('Kickoff call', 90),
  ('First report scheduled', 100)
) as v(title, sort_order)
where not exists (select 1 from public.onboarding_templates where client_type_id is null);

insert into public.onboarding_templates (client_type_id, title, sort_order)
select ct.id, v.title, v.sort_order
from public.client_types ct
join (values
  ('ecommerce', 'Product catalog connected', 10),
  ('ecommerce', 'Shopify / Meta pixel purchase event verified', 20),
  ('lead-gen', 'Lead form and CRM hand-off tested', 10),
  ('beauty-health', 'WhatsApp Business connected to ads', 10),
  ('real-estate', 'Property listings and photos received', 10)
) as v(slug, title, sort_order) on v.slug = ct.slug
where not exists (select 1 from public.onboarding_templates t where t.client_type_id = ct.id);

-- ---------------------------------------------------------------- seed: sample client

do $$
declare
  new_id uuid;
begin
  if not exists (select 1 from public.clients where name = 'Select Gadgets') then
    insert into public.clients (
      client_type_id, name, business_name, industry, status, services, main_goal, custom_fields, notes
    )
    select id, 'Select Gadgets', 'Select Gadgets', 'Consumer electronics', 'onboarding',
           array['Meta Ads', 'Google Ads', 'Content'], 'sales',
           '{"store_platform": "Shopify", "product_categories": "Phones, PlayStations, tech accessories"}'::jsonb,
           'Sample client for testing the hub. Edit or archive freely.'
    from public.client_types where slug = 'ecommerce'
    returning id into new_id;

    insert into public.client_kpis (client_id, name, unit, sort_order)
    select new_id, k->>'name', k->>'unit', (ord * 10)::integer
    from public.client_types ct,
         jsonb_array_elements(ct.default_kpis) with ordinality as e(k, ord)
    where ct.slug = 'ecommerce';
  end if;
end $$;

-- ---------------------------------------------------------------- first admin
--
-- Run once, after creating your user in Authentication > Users:
--
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'you@example.com'
--   on conflict do nothing;
