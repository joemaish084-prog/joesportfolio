-- Restore contact_messages (referenced by src/components/Contact.tsx but missing from the DB)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  source text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- Restore agency_leads (referenced by src/pages/Agency.tsx but missing from the DB)
create table if not exists public.agency_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  business_name text,
  service_interest text,
  budget_range text,
  goals text,
  source text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.agency_leads enable row level security;

create policy "Anyone can submit an agency lead"
  on public.agency_leads for insert
  to anon, authenticated
  with check (true);

-- New: chat_leads for the lead-qualifying chat widget
create table if not exists public.chat_leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  business_name text,
  what_they_sell text,
  need text,
  budget_range text,
  start_timeframe text,
  email text,
  whatsapp text,
  qualified boolean,
  status text not null default 'cold' check (status in ('hot', 'warm', 'cold')),
  step text not null default 'name',
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_leads enable row level security;

create policy "Anyone can submit a chat lead"
  on public.chat_leads for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can update their in-progress chat lead"
  on public.chat_leads for update
  to anon, authenticated
  using (true)
  with check (true);
