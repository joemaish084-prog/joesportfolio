-- Client Hub: how a client works with you.
--   retainer  monthly, ongoing (every existing client, unchanged)
--   contract  monthly for a fixed term; end_date is when it ends
--   project   one-off; project_fee is the total and end_date the deadline
-- monthly_fee keeps meaning the monthly amount for retainers and contracts.

alter table public.clients
  add column if not exists engagement_type text not null default 'retainer',
  add column if not exists end_date date,
  add column if not exists project_fee numeric(12, 2);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'clients_engagement_type_check') then
    alter table public.clients add constraint clients_engagement_type_check
      check (engagement_type in ('retainer', 'contract', 'project'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'clients_project_fee_check') then
    alter table public.clients add constraint clients_project_fee_check
      check (project_fee is null or project_fee >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'clients_end_after_start_check') then
    alter table public.clients add constraint clients_end_after_start_check
      check (end_date is null or start_date is null or end_date >= start_date);
  end if;
end $$;

create index if not exists clients_end_date_idx on public.clients (end_date)
  where end_date is not null and archived_at is null;
