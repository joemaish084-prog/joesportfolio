-- Client Hub, phase 2: documents, work log, reports, finance, leads pipeline.
-- Requires 20261016000000_client_hub_phase1.sql. Same rules as phase 1: every
-- table is admin-only through RLS and anon has no table privileges at all.
--
-- Money tables (invoices, payments) use ON DELETE RESTRICT on client_id so a
-- client with financial history can't be hard-deleted by accident. Clients are
-- archived, never deleted, so this never gets in the way.

-- ---------------------------------------------------------------- documents

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  -- null for templates and general business files
  client_id uuid references public.clients(id) on delete cascade,
  kind text not null default 'other'
    check (kind in ('contract', 'proposal', 'quotation', 'invoice', 'report', 'brief', 'receipt', 'other')),
  title text not null check (btrim(title) <> ''),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'signed', 'approved', 'declined', 'final')),
  is_template boolean not null default false,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_client_idx on public.documents (client_id, created_at desc);

-- 25 MB per file in the private bucket.
update storage.buckets set file_size_limit = 26214400 where id = 'hub-documents';

-- ---------------------------------------------------------------- work log

create table if not exists public.work_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  worked_on date not null default current_date,
  title text not null check (btrim(title) <> ''),
  details text,
  category text not null default 'other'
    check (category in ('ads', 'content', 'seo', 'design', 'web', 'meeting', 'reporting', 'admin', 'other')),
  minutes integer check (minutes is null or minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_log_client_idx on public.work_log (client_id, worked_on desc);

-- ---------------------------------------------------------------- reports

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null check (btrim(title) <> ''),
  period_start date not null,
  period_end date not null,
  summary text,
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create index if not exists reports_client_idx on public.reports (client_id, period_end desc);

-- One value per KPI per report; these feed the progress charts.
create table if not exists public.report_metrics (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  client_kpi_id uuid not null references public.client_kpis(id) on delete cascade,
  value numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, client_kpi_id)
);

create index if not exists report_metrics_kpi_idx on public.report_metrics (client_kpi_id);

-- ---------------------------------------------------------------- finance

-- line_items: [{ description, quantity, unit_price }]; amount is the total.
-- Paid / part-paid / overdue are worked out from payments and due_date, so
-- status only records what you did with the invoice.
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  number text not null unique check (btrim(number) <> ''),
  title text,
  issue_date date not null default current_date,
  due_date date,
  line_items jsonb not null default '[]'::jsonb check (jsonb_typeof(line_items) = 'array'),
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'KES',
  status text not null default 'draft' check (status in ('draft', 'sent', 'void')),
  notes text,
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_client_idx on public.invoices (client_id, issue_date desc);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  invoice_id uuid references public.invoices(id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  paid_on date not null default current_date,
  method text not null default 'mpesa'
    check (method in ('mpesa', 'bank', 'cash', 'card', 'cheque', 'other')),
  reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_client_idx on public.payments (client_id, paid_on desc);
create index if not exists payments_invoice_idx on public.payments (invoice_id);

-- client_id null = general business cost (software, internet, ...).
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  spent_on date not null default current_date,
  category text not null default 'other'
    check (category in ('ad_spend', 'software', 'contractor', 'equipment', 'internet', 'transport', 'marketing', 'office', 'other')),
  description text not null check (btrim(description) <> ''),
  vendor text,
  amount numeric(12, 2) not null check (amount > 0),
  receipt_document_id uuid references public.documents(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_spent_idx on public.expenses (spent_on desc);
create index if not exists expenses_client_idx on public.expenses (client_id);

-- ---------------------------------------------------------------- leads pipeline

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  contact_person text,
  email text,
  phone text,
  website text,
  industry text,
  client_type_id uuid references public.client_types(id) on delete set null,
  source text not null default 'other'
    check (source in ('referral', 'website', 'instagram', 'facebook', 'tiktok', 'linkedin', 'whatsapp', 'google', 'event', 'other')),
  stage text not null default 'new'
    check (stage in ('new', 'contacted', 'meeting', 'proposal', 'won', 'lost')),
  estimated_value numeric(12, 2) check (estimated_value is null or estimated_value >= 0),
  services text[] not null default '{}',
  next_follow_up date,
  lost_reason text,
  notes text,
  converted_client_id uuid references public.clients(id) on delete set null,
  position integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_stage_idx on public.leads (stage, position) where archived_at is null;

-- ---------------------------------------------------------------- triggers + RLS

do $$
declare
  t text;
begin
  foreach t in array array[
    'documents', 'work_log', 'reports', 'report_metrics',
    'invoices', 'payments', 'expenses', 'leads'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I '
      'for each row execute function public.hub_set_updated_at()',
      t
    );
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
