alter table public.chat_leads
  add column if not exists industry text,
  add column if not exists website_or_social text,
  add column if not exists booked boolean not null default false,
  add column if not exists page_path text;

alter table public.chat_leads
  drop column if exists qualified;

alter table public.chat_leads
  alter column source set default 'chat_widget';

comment on column public.chat_leads.source is 'Lead channel, e.g. chat_widget, audit_tool (phase 4)';
comment on column public.chat_leads.page_path is 'Site path the visitor was on when the lead was captured';
comment on column public.chat_leads.booked is 'True once Calendly reports event_scheduled for this lead';
