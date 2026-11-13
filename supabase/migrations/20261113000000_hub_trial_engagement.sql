-- Client Hub: trial periods as a fourth way of working with a client.
--   trial  a time-boxed trial on their ads; end_date is when the trial ends and
--          monthly_fee is what they would pay after converting. Trials are not
--          counted as monthly income until converted to a retainer or contract.

alter table public.clients drop constraint if exists clients_engagement_type_check;
alter table public.clients add constraint clients_engagement_type_check
  check (engagement_type in ('retainer', 'contract', 'project', 'trial'));
