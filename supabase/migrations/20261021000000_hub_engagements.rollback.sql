-- Undoes 20261021000000_hub_engagements.sql. Loses engagement types, end dates and project fees.
drop index if exists public.clients_end_date_idx;
alter table public.clients
  drop constraint if exists clients_end_after_start_check,
  drop constraint if exists clients_project_fee_check,
  drop constraint if exists clients_engagement_type_check,
  drop column if exists project_fee,
  drop column if exists end_date,
  drop column if exists engagement_type;
