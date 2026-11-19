begin;

alter table public.agency_leads
  drop constraint if exists agency_leads_email_required,
  add constraint agency_leads_require_contact check (
    email is not null or (
      service_interest is not distinct from 'Free Marketing Audit'
      and coalesce(phone, '') ~ '^[+]?[0-9][0-9]{7,14}$'
      and length(btrim(name)) between 1 and 100
      and length(btrim(coalesce(business_name, ''))) between 1 and 120
      and coalesce(budget_range, '') in (
        'Under KES 50,000', 'KES 50,000 to 99,999', 'KES 100,000 to 249,999',
        'KES 250,000 or more', 'Still deciding'
      )
    )
  ),
  alter column email drop not null;

commit;
