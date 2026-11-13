-- Undoes 20261113000000_hub_trial_engagement.sql. Trials become one-off projects
-- (the closest unpaid, time-boxed type), keeping their end date and notes; their
-- fee-after-trial moves out of monthly_fee so it is not counted as income.
update public.clients
  set engagement_type = 'project', monthly_fee = null
  where engagement_type = 'trial';

alter table public.clients drop constraint if exists clients_engagement_type_check;
alter table public.clients add constraint clients_engagement_type_check
  check (engagement_type in ('retainer', 'contract', 'project'));
