-- Undoes 20261027000000_crm_brevo.sql. Turns sending off first.
revoke execute on function public.crm_is_suppressed(uuid, text, text) from service_role;

update public.crm_organisations
set sending_enabled = false,
    email_provider = case when email_provider = 'brevo' then 'none' else email_provider end;

alter table public.crm_organisations drop constraint if exists crm_organisations_sending_ready_check;
alter table public.crm_organisations drop constraint if exists crm_organisations_email_provider_check;
alter table public.crm_organisations
  add constraint crm_organisations_email_provider_check check (email_provider in ('none', 'gmail'));
-- Put back the audit trigger from crm_core before dropping the column it reads.
create or replace function public.crm_org_after_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changes jsonb := '{}'::jsonb;
begin
  if new.sending_enabled is distinct from old.sending_enabled then
    changes := changes || jsonb_build_object('sending_enabled', new.sending_enabled);
  end if;
  if new.email_provider is distinct from old.email_provider then
    changes := changes || jsonb_build_object('email_provider', new.email_provider);
  end if;
  if new.require_mfa is distinct from old.require_mfa then
    changes := changes || jsonb_build_object('require_mfa', new.require_mfa);
  end if;
  if new.sending_mode is distinct from old.sending_mode then
    changes := changes || jsonb_build_object('sending_mode', new.sending_mode);
  end if;
  if changes <> '{}'::jsonb then
    perform public.crm_audit(new.id, 'settings.update', 'crm_organisations', new.id, changes);
  end if;
  return null;
end
$$;

alter table public.crm_organisations drop column if exists from_email;

notify pgrst, 'reload schema';
