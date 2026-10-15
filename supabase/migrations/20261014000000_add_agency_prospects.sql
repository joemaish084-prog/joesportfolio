create table if not exists public.agency_prospects (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  website text not null,
  description text not null default '',
  source_url text not null unique,
  search_query text not null,
  contact_name text,
  contact_email text,
  status text not null default 'new'
    check (status in ('new', 'qualified', 'not_a_fit', 'contacted')),
  fit_score integer check (fit_score between 0 and 100),
  fit_reason text,
  email_subject text,
  email_body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agency_prospects_updated_at_idx
  on public.agency_prospects (updated_at desc);

alter table public.agency_prospects enable row level security;
