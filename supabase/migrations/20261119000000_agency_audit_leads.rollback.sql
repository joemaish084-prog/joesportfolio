begin;

-- Restore the requirement for future writes while retaining any phone-only leads.
alter table public.agency_leads
  add constraint agency_leads_email_required check (email is not null) not valid,
  drop constraint agency_leads_require_contact;

commit;
