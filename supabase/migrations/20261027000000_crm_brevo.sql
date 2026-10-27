-- Agency Command Centre: Brevo as an email provider.
--
-- Adds 'brevo' to the allowed providers and a From address. Sending stays
-- off: an owner still has to pick Brevo and switch sending on in Settings,
-- and crm_message_guard keeps refusing provider sends until both are set.
-- The Brevo API key lives in Supabase secrets (BREVO_API_KEY), never here.

alter table public.crm_organisations
  drop constraint if exists crm_organisations_email_provider_check;
alter table public.crm_organisations
  add constraint crm_organisations_email_provider_check
  check (email_provider in ('none', 'gmail', 'brevo'));

-- The address emails come from (a sender verified in Brevo). Replies go to sender_email.
alter table public.crm_organisations
  add column if not exists from_email text
  check (from_email is null or from_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Sending needs a From address as well as a provider.
alter table public.crm_organisations
  drop constraint if exists crm_organisations_sending_ready_check;
alter table public.crm_organisations
  add constraint crm_organisations_sending_ready_check
  check (not sending_enabled or (email_provider <> 'none' and from_email is not null));

update public.crm_organisations set from_email = 'hello@josephmaina.co.ke' where from_email is null;

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
  if new.from_email is distinct from old.from_email then
    changes := changes || jsonb_build_object('from_email', new.from_email);
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

-- crm-send-email checks suppression with the service role before calling Brevo.
grant execute on function public.crm_is_suppressed(uuid, text, text) to service_role;

notify pgrst, 'reload schema';
