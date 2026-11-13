-- Client Hub: trial periods.
--
-- Clients: a fourth way of working with a client.
--   trial  a time-boxed trial on their ads; end_date is when the trial ends and
--          monthly_fee is what they would pay after converting. Trials are not
--          counted as monthly income until converted to a retainer or contract.
--
-- Pipeline: a "trial" lead stage between proposal and won. A lead on trial is
-- linked (converted_client_id) to the trial client created for it.

alter table public.clients drop constraint if exists clients_engagement_type_check;
alter table public.clients add constraint clients_engagement_type_check
  check (engagement_type in ('retainer', 'contract', 'project', 'trial'));

alter table public.leads drop constraint if exists leads_stage_check;
alter table public.leads add constraint leads_stage_check
  check (stage in ('new', 'contacted', 'meeting', 'proposal', 'trial', 'won', 'lost'));
