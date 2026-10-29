-- Client Hub: Google Calendar connection.
-- One row per hub user who has connected Google. The refresh token is a
-- long-lived credential for their whole calendar, so no browser role can read
-- or write this table: only the Edge Functions (service role) touch it. The hub
-- asks the google-calendar function whether it's connected instead.

create table if not exists public.google_calendar_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  google_email text,
  refresh_token text not null check (btrim(refresh_token) <> ''),
  scope text,
  calendar_id text not null default 'primary',
  -- short-lived token cached between calls so not every request refreshes
  access_token text,
  access_token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.google_calendar_connections;
create trigger set_updated_at before update on public.google_calendar_connections
  for each row execute function public.hub_set_updated_at();

-- RLS on with no policies: anon and authenticated see nothing even if a grant
-- slips in later. The service role bypasses RLS.
alter table public.google_calendar_connections enable row level security;
revoke all on table public.google_calendar_connections from public, anon, authenticated;
grant select, insert, update, delete on table public.google_calendar_connections to service_role;
