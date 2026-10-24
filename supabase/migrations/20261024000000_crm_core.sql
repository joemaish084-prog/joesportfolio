-- Agency Command Centre: the outreach CRM inside the Client Hub (/hub/crm).
--
-- Access model (all enforced here, not in the UI):
--   * crm_memberships gives a user one role per organisation: owner, manager
--     or viewer. Nothing is readable without a membership; anon has no table
--     privileges at all.
--   * owner: everything in the organisation.
--   * manager: reads and edits the leads assigned to them (owner_id), reads
--     leads explicitly shared with them, and creates leads they then own.
--   * viewer: reads only the leads explicitly shared with them.
--   * When an organisation sets require_mfa, every role check also needs an
--     aal2 (TOTP-verified) session.
--
-- Safety rules that hold whatever the caller sends:
--   * Outbound email stays off (sending_enabled = false, provider 'none').
--     Provider statuses (queued/sent) can only be written by the service role
--     and only while sending is enabled, the draft is approved and nothing is
--     suppressed. People can log only what they sent by hand.
--   * Editing an approved draft drops it back to draft; approval records who
--     approved it, from the session, not from the request.
--   * Suppressed or do-not-contact leads can't receive outbound messages.
--   * Replies, opt-outs, bounces and closing stages cancel pending follow-ups.
--   * Audit log rows are written only by triggers and RPCs; nobody can edit them.
--
-- The hub's existing admins become owners of the first organisation; see the
-- seed block at the bottom.

-- ---------------------------------------------------------------- organisations

create table if not exists public.crm_organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  timezone text not null default 'Africa/Nairobi',
  require_mfa boolean not null default false,
  -- Outbound email. Off until the owner connects a provider and turns it on.
  sending_enabled boolean not null default false,
  email_provider text not null default 'none' check (email_provider in ('none', 'gmail')),
  sending_mode text not null default 'manual_approval'
    check (sending_mode in ('manual_approval', 'batch_approval')),
  -- Only draft_only exists for now: the CRM writes drafts and reminders, never sends by itself.
  automation_mode text not null default 'draft_only' check (automation_mode in ('draft_only')),
  daily_send_limit integer not null default 20 check (daily_send_limit between 0 and 200),
  send_window_start time not null default '08:00',
  send_window_end time not null default '17:00',
  -- ISO weekdays (1 = Monday)
  send_days smallint[] not null default '{1,2,3,4,5}',
  sender_name text,
  sender_business text,
  sender_email text,
  sender_phone text,
  sender_signature text,
  -- [{ "kind": "follow_up_1", "business_days": 4 }, ...]; each step counts from the previous one
  follow_up_sequence jsonb not null
    default '[{"kind": "follow_up_1", "business_days": 4}, {"kind": "follow_up_2", "business_days": 6}]'::jsonb
    check (jsonb_typeof(follow_up_sequence) = 'array'),
  -- { factor: weight }; missing factors use the app defaults
  fit_weights jsonb not null default '{}'::jsonb check (jsonb_typeof(fit_weights) = 'object'),
  retention_months integer not null default 24 check (retention_months between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (send_window_start < send_window_end)
);

create table if not exists public.crm_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index if not exists crm_memberships_user_idx on public.crm_memberships (user_id);

-- ---------------------------------------------------------------- role helpers

-- The caller's role in an organisation, or null. Security definer so policies
-- can read memberships without recursing into their RLS.
create or replace function public.crm_role(_org uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.crm_memberships m
  join public.crm_organisations o on o.id = m.org_id
  where m.org_id = _org
    and m.user_id = auth.uid()
    and (not o.require_mfa or coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2')
$$;

create or replace function public.crm_is_member(_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.crm_role(_org) is not null
$$;

create or replace function public.crm_is_editor(_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.crm_role(_org) in ('owner', 'manager'), false)
$$;

create or replace function public.crm_is_owner(_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.crm_role(_org) = 'owner', false)
$$;

create or replace function public.crm_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

-- ---------------------------------------------------------------- audit log

create table if not exists public.crm_audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists crm_audit_logs_org_idx on public.crm_audit_logs (org_id, created_at desc);

-- Internal: only triggers and other security definer functions call this.
-- Never pass secrets, tokens or message bodies in details.
create or replace function public.crm_audit(_org uuid, _action text, _entity text, _entity_id uuid, _details jsonb default '{}'::jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.crm_audit_logs (org_id, actor_id, action, entity, entity_id, details)
  values (_org, auth.uid(), _action, _entity, _entity_id, coalesce(_details, '{}'::jsonb))
$$;

-- ---------------------------------------------------------------- reference data

create table if not exists public.crm_industries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9_]+$'),
  name text not null check (btrim(name) <> ''),
  created_at timestamptz not null default now(),
  unique (org_id, slug)
);

create table if not exists public.crm_lead_sources (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  kind text not null default 'manual' check (kind in ('spreadsheet', 'manual', 'referral', 'website', 'other')),
  name text not null check (btrim(name) <> ''),
  filename text,
  -- Scoring notes that came with the source, e.g. the spreadsheet's "How to read this" sheet.
  methodology jsonb not null default '[]'::jsonb,
  imported_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.crm_campaigns (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  industry_id uuid references public.crm_industries(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  starts_on date,
  ends_on date,
  description text,
  paused_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

-- ---------------------------------------------------------------- normalisation

-- Keys used for duplicate detection. src/hub/crm/lib/normalize.ts mirrors these
-- exactly (tests compare the two), so the import preview and the database agree.

/** "Select Motors Ltd." and "select motors" are the same business. */
create or replace function public.crm_name_key(_s text)
returns text
language sql
immutable
as $$
  select nullif(
    btrim(regexp_replace(
      regexp_replace(
        regexp_replace(lower(coalesce(_s, '')), '[^a-z0-9 ]', ' ', 'g'),
        '\m(ltd|limited|co|company|inc|llc|plc|enterprises?|kenya|ke)\M', ' ', 'g'),
      '\s+', ' ', 'g')),
    '')
$$;

/** Bare host of a business website. Social and link-in-bio hosts aren't the business's own domain. */
create or replace function public.crm_domain_key(_s text)
returns text
language sql
immutable
as $$
  with h as (
    select regexp_replace(
      split_part(split_part(split_part(split_part(
        regexp_replace(lower(btrim(coalesce(_s, ''))), '^[a-z][a-z0-9+.-]*://', ''),
        '/', 1), '?', 1), '#', 1), ':', 1),
      '^www\.', '') as host
  )
  select case
    when host !~ '^[a-z0-9-]+(\.[a-z0-9-]+)+$' then null
    when host ~ '(^|\.)(facebook\.com|fb\.com|fb\.me|instagram\.com|tiktok\.com|twitter\.com|x\.com|linkedin\.com|youtube\.com|youtu\.be|wa\.me|whatsapp\.com|linktr\.ee|google\.com|goo\.gl|g\.page|business\.site|wixsite\.com|blogspot\.com|jiji\.co\.ke|cheki\.co\.ke)$' then null
    else host
  end
  from h
$$;

create or replace function public.crm_email_key(_s text)
returns text
language sql
immutable
as $$
  select case when e ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then e else null end
  from (select lower(btrim(split_part(split_part(coalesce(_s, ''), ',', 1), ';', 1))) as e) x
$$;

/** Last 9 digits of the first number in the cell, so 0712…, +254712… and 254712… match. */
create or replace function public.crm_phone_key(_s text)
returns text
language sql
immutable
as $$
  select case when length(d) >= 9 then right(d, 9) else null end
  from (select regexp_replace(split_part(split_part(split_part(coalesce(_s, ''), '/', 1), ',', 1), ';', 1), '\D', '', 'g') as d) x
$$;

create or replace function public.crm_add_business_days(_from date, _days integer)
returns date
language plpgsql
immutable
as $$
declare
  d date := _from;
  n integer := 0;
begin
  if _days is null or _days <= 0 then
    return _from;
  end if;
  while n < _days loop
    d := d + 1;
    if extract(isodow from d) < 6 then
      n := n + 1;
    end if;
  end loop;
  return d;
end
$$;

-- ---------------------------------------------------------------- leads

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  industry_id uuid references public.crm_industries(id) on delete set null,
  source_id uuid references public.crm_lead_sources(id) on delete set null,
  name text not null check (btrim(name) <> '' and length(name) <= 300),
  area text,
  business_type text,
  -- Company-level channels. People live in crm_lead_contacts.
  email text,
  email_status text not null default 'unverified' check (email_status in ('unverified', 'verified', 'bounced', 'invalid')),
  phone text,
  phone_status text not null default 'unverified' check (phone_status in ('unverified', 'verified', 'invalid')),
  website text,
  instagram text,
  facebook text,
  tiktok text,
  -- Blank means "not found yet", never "doesn't have one". Verified per channel here.
  socials_verified boolean not null default false,
  google_rating numeric(2, 1) check (google_rating is null or google_rating between 0 and 5),
  google_reviews integer check (google_reviews is null or google_reviews >= 0),
  -- Original spreadsheet scoring, kept as it came.
  original_priority text,
  weakness_score numeric(6, 2),
  -- The untouched source row(s) this lead was built from.
  source_data jsonb not null default '{}'::jsonb check (jsonb_typeof(source_data) = 'object'),
  qualification_status text not null default 'unqualified'
    check (qualification_status in ('unqualified', 'researching', 'qualified', 'disqualified')),
  stage text not null default 'new' check (stage in (
    'new', 'researching', 'qualified', 'ready_for_outreach', 'contacted', 'replied', 'interested',
    'meeting_booked', 'proposal_sent', 'negotiation', 'won', 'lost', 'not_interested', 'do_not_contact')),
  stage_changed_at timestamptz not null default now(),
  owner_id uuid references auth.users(id) on delete set null,
  tags text[] not null default '{}',
  notes text,
  research_notes text,
  -- { factor: { "rating": 0-4 | null, "verified": bool, "checked_on": "YYYY-MM-DD", "note": "" } }
  fit_inputs jsonb not null default '{}'::jsonb check (jsonb_typeof(fit_inputs) = 'object'),
  fit_score numeric(5, 2) check (fit_score is null or fit_score between 0 and 100),
  fit_factors_known smallint not null default 0,
  do_not_contact boolean not null default false,
  -- Duplicate-detection keys, set by trigger.
  name_key text,
  domain_key text,
  email_key text,
  phone_key text,
  -- Kept current by the message and follow-up triggers.
  last_contacted_at timestamptz,
  next_follow_up_on date,
  created_by uuid default auth.uid(),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_leads_org_stage_idx on public.crm_leads (org_id, stage) where archived_at is null;
create index if not exists crm_leads_owner_idx on public.crm_leads (owner_id);
create index if not exists crm_leads_name_key_idx on public.crm_leads (org_id, name_key);
create index if not exists crm_leads_domain_key_idx on public.crm_leads (org_id, domain_key) where domain_key is not null;
create index if not exists crm_leads_email_key_idx on public.crm_leads (org_id, email_key) where email_key is not null;
create index if not exists crm_leads_phone_key_idx on public.crm_leads (org_id, phone_key) where phone_key is not null;
create index if not exists crm_leads_tags_idx on public.crm_leads using gin (tags);

create table if not exists public.crm_lead_shares (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  unique (lead_id, user_id)
);

create index if not exists crm_lead_shares_user_idx on public.crm_lead_shares (user_id);

-- 'write', 'read' or null for the caller on a lead, from the lead's own
-- columns. The crm_leads policies call this form directly: a lookup by id
-- can't see a row that the same statement is inserting (insert … returning).
create or replace function public.crm_lead_row_access(_org uuid, _owner uuid, _lead uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when r.role = 'owner' then 'write'
    when r.role = 'manager' and _owner = auth.uid() then 'write'
    when r.role in ('manager', 'viewer')
      and exists (select 1 from public.crm_lead_shares s where s.lead_id = _lead and s.user_id = auth.uid())
      then 'read'
    else null
  end
  from (select public.crm_role(_org) as role) r
$$;

create or replace function public.crm_lead_access(_lead uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.crm_lead_row_access(l.org_id, l.owner_id, l.id)
  from public.crm_leads l
  where l.id = _lead
$$;

create or replace function public.crm_can_read_lead(_lead uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.crm_lead_access(_lead) is not null
$$;

create or replace function public.crm_can_write_lead(_lead uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.crm_lead_access(_lead) = 'write', false)
$$;

-- ---------------------------------------------------------------- lead children

create table if not exists public.crm_lead_contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  name text,
  role_title text,
  email text,
  phone text,
  is_decision_maker boolean not null default false,
  verification text not null default 'unverified' check (verification in ('unverified', 'verified')),
  verified_at timestamptz,
  source text,
  notes text,
  opted_out boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (coalesce(btrim(name), '') <> '' or coalesce(btrim(email), '') <> '' or coalesce(btrim(phone), '') <> '')
);

create index if not exists crm_lead_contacts_lead_idx on public.crm_lead_contacts (lead_id);

create table if not exists public.crm_lead_campaigns (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  campaign_id uuid not null references public.crm_campaigns(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'removed')),
  added_at timestamptz not null default now(),
  unique (lead_id, campaign_id)
);

create index if not exists crm_lead_campaigns_campaign_idx on public.crm_lead_campaigns (campaign_id);

create table if not exists public.crm_outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  contact_id uuid references public.crm_lead_contacts(id) on delete set null,
  campaign_id uuid references public.crm_campaigns(id) on delete set null,
  kind text not null check (kind in (
    'initial_email', 'whatsapp_intro', 'instagram_dm', 'follow_up_1', 'follow_up_2', 'discovery_prep')),
  channel text not null check (channel in ('email', 'whatsapp', 'instagram', 'notes')),
  subject text,
  body text not null check (length(body) <= 20000),
  -- What the draft leans on that isn't verified, shown beside it.
  assumptions text[] not null default '{}',
  facts_used text[] not null default '{}',
  warnings text[] not null default '{}',
  model text,
  prompt_version text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'used', 'superseded')),
  approved_by uuid,
  approved_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_outreach_drafts_lead_idx on public.crm_outreach_drafts (lead_id, created_at desc);
create index if not exists crm_outreach_drafts_status_idx on public.crm_outreach_drafts (org_id, status);

create table if not exists public.crm_outreach_messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  contact_id uuid references public.crm_lead_contacts(id) on delete set null,
  draft_id uuid references public.crm_outreach_drafts(id) on delete set null,
  campaign_id uuid references public.crm_campaigns(id) on delete set null,
  channel text not null check (channel in ('email', 'whatsapp', 'instagram', 'phone', 'other')),
  direction text not null check (direction in ('outbound', 'inbound')),
  -- sent_manually: you sent it yourself (Gmail, WhatsApp). It records that you
  -- say you sent it, not that anyone received or read it.
  status text not null check (status in ('sent_manually', 'queued', 'sent', 'delivered', 'failed', 'bounced', 'received')),
  to_address text,
  from_address text,
  subject text,
  body text check (body is null or length(body) <= 20000),
  provider text,
  provider_message_id text,
  thread_id text,
  idempotency_key text unique,
  error text,
  sent_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, provider, provider_message_id),
  check ((direction = 'inbound') = (status = 'received'))
);

create index if not exists crm_outreach_messages_lead_idx on public.crm_outreach_messages (lead_id, created_at desc);
create index if not exists crm_outreach_messages_org_sent_idx on public.crm_outreach_messages (org_id, sent_at);

create table if not exists public.crm_outreach_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  message_id uuid references public.crm_outreach_messages(id) on delete set null,
  -- *_opened = you opened the compose screen. It is not a delivery.
  type text not null check (type in (
    'whatsapp_opened', 'email_compose_opened', 'instagram_opened',
    'delivered', 'bounced', 'complained', 'unsubscribed', 'replied')),
  provider text,
  provider_event_id text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (org_id, provider, provider_event_id)
);

create index if not exists crm_outreach_events_lead_idx on public.crm_outreach_events (lead_id, occurred_at desc);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  actor_id uuid default auth.uid(),
  type text not null check (type in (
    'note', 'call', 'meeting', 'email', 'whatsapp', 'instagram', 'stage_change',
    'assignment', 'import', 'draft', 'deal', 'follow_up', 'system')),
  summary text not null check (length(summary) <= 2000),
  data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists crm_activities_lead_idx on public.crm_activities (lead_id, occurred_at desc);

create table if not exists public.crm_stage_changes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  changed_by uuid default auth.uid(),
  changed_at timestamptz not null default now()
);

create index if not exists crm_stage_changes_org_idx on public.crm_stage_changes (org_id, to_stage, changed_at);
create index if not exists crm_stage_changes_lead_idx on public.crm_stage_changes (lead_id, changed_at);

create table if not exists public.crm_follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  campaign_id uuid references public.crm_campaigns(id) on delete set null,
  step smallint not null default 1,
  kind text not null default 'custom' check (kind in ('follow_up_1', 'follow_up_2', 'custom')),
  channel text not null default 'email' check (channel in ('email', 'whatsapp', 'instagram', 'phone', 'other')),
  title text not null check (btrim(title) <> ''),
  due_on date not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'cancelled', 'paused')),
  status_reason text,
  draft_id uuid references public.crm_outreach_drafts(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_follow_up_tasks_due_idx on public.crm_follow_up_tasks (org_id, status, due_on);
create index if not exists crm_follow_up_tasks_lead_idx on public.crm_follow_up_tasks (lead_id);

create table if not exists public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  proposed_service text not null check (btrim(proposed_service) <> ''),
  -- Agency revenue. Ad budget is the client's media spend and is never revenue.
  quoted_management_fee numeric(12, 2) check (quoted_management_fee is null or quoted_management_fee >= 0),
  expected_monthly_retainer numeric(12, 2) check (expected_monthly_retainer is null or expected_monthly_retainer >= 0),
  expected_ad_budget numeric(12, 2) check (expected_ad_budget is null or expected_ad_budget >= 0),
  proposal_date date,
  probability smallint check (probability is null or probability between 0 and 100),
  expected_close_date date,
  status text not null default 'open' check (status in ('open', 'won', 'lost')),
  won_on date,
  lost_reason text,
  notes text,
  converted_client_id uuid references public.clients(id) on delete set null,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_deals_lead_idx on public.crm_deals (lead_id);
create index if not exists crm_deals_org_status_idx on public.crm_deals (org_id, status, won_on);

create table if not exists public.crm_suppression_list (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  kind text not null check (kind in ('email', 'phone', 'domain')),
  value text not null check (btrim(value) <> ''),
  value_key text not null,
  reason text not null check (reason in ('opted_out', 'bounced', 'complaint', 'manual', 'do_not_contact')),
  lead_id uuid references public.crm_leads(id) on delete set null,
  note text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  unique (org_id, kind, value_key)
);

create table if not exists public.crm_import_jobs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  source_id uuid references public.crm_lead_sources(id) on delete set null,
  industry_id uuid references public.crm_industries(id) on delete set null,
  campaign_id uuid references public.crm_campaigns(id) on delete set null,
  filename text not null,
  file_sha256 text not null check (file_sha256 ~ '^[0-9a-f]{64}$'),
  file_size integer not null check (file_size > 0),
  sheet_name text,
  status text not null default 'committed' check (status in ('committed', 'failed')),
  total_rows integer not null default 0,
  created_count integer not null default 0,
  merged_count integer not null default 0,
  skipped_count integer not null default 0,
  error_count integer not null default 0,
  column_mapping jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.crm_import_rows (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.crm_organisations(id) on delete cascade,
  job_id uuid not null references public.crm_import_jobs(id) on delete cascade,
  row_number integer not null,
  raw jsonb not null default '{}'::jsonb,
  -- Hash of the normalised source row; the same row is never applied twice.
  fingerprint text not null,
  decision text not null check (decision in ('create', 'merge', 'skip', 'error')),
  lead_id uuid references public.crm_leads(id) on delete set null,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists crm_import_rows_job_idx on public.crm_import_rows (job_id, row_number);
create unique index if not exists crm_import_rows_applied_idx
  on public.crm_import_rows (org_id, fingerprint) where decision in ('create', 'merge');

-- Per-user counters for the edge functions (AI drafts, sheet parsing).
create table if not exists public.crm_rate_limits (
  user_id uuid not null,
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (user_id, bucket, window_start)
);

-- ---------------------------------------------------------------- triggers: integrity

-- Child rows take their organisation from the lead, and can't be moved to
-- another lead or organisation afterwards.
create or replace function public.crm_inherit_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.lead_id is distinct from old.lead_id or new.org_id is distinct from old.org_id then
      raise exception 'A % row cannot be moved to another lead', tg_table_name;
    end if;
    return new;
  end if;
  select org_id into new.org_id from public.crm_leads where id = new.lead_id;
  if new.org_id is null then
    raise exception 'Unknown lead';
  end if;
  return new;
end
$$;

-- Campaign links must stay inside the lead's organisation.
create or replace function public.crm_check_campaign_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.campaign_id is not null
    and not exists (select 1 from public.crm_campaigns c where c.id = new.campaign_id and c.org_id = new.org_id) then
    raise exception 'Campaign belongs to another organisation';
  end if;
  return new;
end
$$;

create or replace function public.crm_lead_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.org_id is distinct from old.org_id then
    raise exception 'A lead cannot be moved to another organisation';
  end if;

  -- Only an owner may lift do-not-contact.
  if tg_op = 'UPDATE' and old.do_not_contact and not new.do_not_contact
    and auth.uid() is not null and not public.crm_is_owner(new.org_id) then
    raise exception 'Only an owner can remove do-not-contact';
  end if;

  if new.stage = 'do_not_contact' then
    new.do_not_contact := true;
  elsif new.do_not_contact then
    new.stage := 'do_not_contact';
  end if;

  if tg_op = 'INSERT' or new.stage is distinct from old.stage then
    new.stage_changed_at := now();
  end if;

  new.name_key := public.crm_name_key(new.name);
  new.domain_key := public.crm_domain_key(new.website);
  new.email_key := public.crm_email_key(new.email);
  new.phone_key := public.crm_phone_key(new.phone);
  return new;
end
$$;

-- Stage history, timeline entries, follow-up cancellation and suppression,
-- all from the one place a stage can change.
create or replace function public.crm_lead_after_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  closing constant text[] := array[
    'replied', 'interested', 'meeting_booked', 'proposal_sent', 'negotiation',
    'won', 'lost', 'not_interested', 'do_not_contact'];
begin
  if tg_op = 'INSERT' then
    insert into public.crm_stage_changes (org_id, lead_id, from_stage, to_stage)
    values (new.org_id, new.id, null, new.stage);
    return null;
  end if;

  if new.stage is distinct from old.stage then
    insert into public.crm_stage_changes (org_id, lead_id, from_stage, to_stage)
    values (new.org_id, new.id, old.stage, new.stage);
    insert into public.crm_activities (org_id, lead_id, type, summary, data)
    values (new.org_id, new.id, 'stage_change', 'Stage changed', jsonb_build_object('from', old.stage, 'to', new.stage));

    if new.stage = any (closing) then
      update public.crm_follow_up_tasks
      set status = 'cancelled', status_reason = 'Stage changed to ' || new.stage
      where lead_id = new.id and status in ('pending', 'paused');
    end if;
  end if;

  if new.owner_id is distinct from old.owner_id then
    insert into public.crm_activities (org_id, lead_id, type, summary, data)
    values (new.org_id, new.id, 'assignment', 'Lead reassigned', jsonb_build_object('from', old.owner_id, 'to', new.owner_id));
  end if;

  if new.do_not_contact and not old.do_not_contact then
    if new.email_key is not null then
      insert into public.crm_suppression_list (org_id, kind, value, value_key, reason, lead_id)
      values (new.org_id, 'email', new.email, new.email_key, 'do_not_contact', new.id)
      on conflict (org_id, kind, value_key) do nothing;
    end if;
    if new.phone_key is not null then
      insert into public.crm_suppression_list (org_id, kind, value, value_key, reason, lead_id)
      values (new.org_id, 'phone', new.phone, new.phone_key, 'do_not_contact', new.id)
      on conflict (org_id, kind, value_key) do nothing;
    end if;
    perform public.crm_audit(new.org_id, 'lead.do_not_contact', 'crm_leads', new.id, '{}'::jsonb);
  end if;
  return null;
end
$$;

create or replace function public.crm_lead_after_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.crm_audit(old.org_id, 'lead.delete', 'crm_leads', old.id, jsonb_build_object('name', old.name));
  return null;
end
$$;

-- Drafts: approval comes from the session, and changing the text undoes it.
create or replace function public.crm_draft_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'draft';
    new.approved_by := null;
    new.approved_at := null;
    return new;
  end if;

  if (new.subject, new.body) is distinct from (old.subject, old.body)
    and old.status in ('approved', 'used') then
    if old.status = 'used' then
      raise exception 'This draft has already been used; start a new one';
    end if;
    new.status := 'draft';
  end if;

  if new.status = 'approved' and old.status <> 'approved' then
    if exists (select 1 from public.crm_leads l where l.id = new.lead_id and l.do_not_contact) then
      raise exception 'This lead is marked do not contact';
    end if;
    new.approved_by := auth.uid();
    new.approved_at := now();
  elsif new.status <> 'approved' and new.status <> 'used' then
    new.approved_by := null;
    new.approved_at := null;
  else
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
  end if;
  return new;
end
$$;

create or replace function public.crm_is_suppressed(_org uuid, _kind text, _key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select _key is not null and exists (
    select 1 from public.crm_suppression_list s
    where s.org_id = _org and s.kind = _kind and s.value_key = _key
  )
$$;

-- The send guard. Runs for every caller, the service role included.
create or replace function public.crm_message_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  lead public.crm_leads;
  org public.crm_organisations;
  draft public.crm_outreach_drafts;
begin
  if tg_op = 'UPDATE' then
    if new.lead_id is distinct from old.lead_id or new.direction is distinct from old.direction then
      raise exception 'A message cannot be moved';
    end if;
    return new;
  end if;

  select * into lead from public.crm_leads where id = new.lead_id;
  select * into org from public.crm_organisations where id = lead.org_id;

  if new.direction = 'inbound' then
    return new;
  end if;

  if lead.do_not_contact then
    raise exception 'This lead is marked do not contact';
  end if;

  if new.channel = 'email' then
    if public.crm_is_suppressed(org.id, 'email', public.crm_email_key(new.to_address))
      or public.crm_is_suppressed(org.id, 'domain', split_part(public.crm_email_key(new.to_address), '@', 2)) then
      raise exception 'That address is on the suppression list';
    end if;
  elsif new.channel in ('whatsapp', 'phone') then
    if public.crm_is_suppressed(org.id, 'phone', public.crm_phone_key(new.to_address)) then
      raise exception 'That number is on the suppression list';
    end if;
  end if;

  if new.draft_id is not null then
    select * into draft from public.crm_outreach_drafts where id = new.draft_id;
    if draft.id is null or draft.lead_id <> new.lead_id then
      raise exception 'Draft belongs to another lead';
    end if;
    if draft.status <> 'approved' then
      raise exception 'Approve the draft before sending it';
    end if;
  end if;

  if new.status in ('queued', 'sent', 'delivered', 'failed', 'bounced') then
    if not org.sending_enabled or org.email_provider = 'none' then
      raise exception 'Sending is disabled for this organisation';
    end if;
    if new.draft_id is null then
      raise exception 'Provider sends need an approved draft';
    end if;
    if new.campaign_id is not null and exists (
      select 1 from public.crm_campaigns c where c.id = new.campaign_id and c.status = 'paused') then
      raise exception 'This campaign is paused';
    end if;
  end if;

  if new.sent_at is null and new.status in ('sent_manually', 'sent') then
    new.sent_at := now();
  end if;
  return new;
end
$$;

-- Schedules the follow-up sequence from the org settings, counting business days.
create or replace function public.crm_schedule_follow_ups(_lead uuid, _campaign uuid, _channel text, _from date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  lead public.crm_leads;
  step jsonb;
  n integer := 0;
  due date := _from;
begin
  select * into lead from public.crm_leads where id = _lead;
  for step in
    select value from jsonb_array_elements(
      (select follow_up_sequence from public.crm_organisations where id = lead.org_id))
  loop
    n := n + 1;
    due := public.crm_add_business_days(due, greatest(1, coalesce((step ->> 'business_days')::integer, 4)));
    insert into public.crm_follow_up_tasks (org_id, lead_id, campaign_id, step, kind, channel, title, due_on, assigned_to)
    values (
      lead.org_id, lead.id, _campaign, n + 1,
      case when step ->> 'kind' in ('follow_up_1', 'follow_up_2') then step ->> 'kind' else 'custom' end,
      coalesce(_channel, 'email'),
      'Follow-up ' || n || ' to ' || lead.name,
      due, lead.owner_id);
  end loop;
end
$$;

create or replace function public.crm_message_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  lead public.crm_leads;
  draft_kind text;
  early constant text[] := array['new', 'researching', 'qualified', 'ready_for_outreach'];
  task_channel text;
begin
  select * into lead from public.crm_leads where id = new.lead_id;
  if new.draft_id is not null then
    select kind into draft_kind from public.crm_outreach_drafts where id = new.draft_id;
  end if;

  if new.direction = 'inbound' then
    insert into public.crm_activities (org_id, lead_id, type, summary, data)
    values (lead.org_id, lead.id, case when new.channel in ('email', 'whatsapp', 'instagram') then new.channel else 'note' end,
            'Reply received', jsonb_build_object('message_id', new.id, 'channel', new.channel));
    update public.crm_follow_up_tasks set status = 'cancelled', status_reason = 'Prospect replied'
    where lead_id = lead.id and status in ('pending', 'paused');
    if lead.stage = any (early) or lead.stage = 'contacted' then
      update public.crm_leads set stage = 'replied' where id = lead.id;
    end if;
    return null;
  end if;

  if new.status not in ('sent_manually', 'sent') then
    return null;
  end if;

  if new.draft_id is not null then
    update public.crm_outreach_drafts set status = 'used' where id = new.draft_id;
  end if;

  update public.crm_leads
  set last_contacted_at = greatest(coalesce(last_contacted_at, new.sent_at), new.sent_at),
      stage = case when stage = any (early) then 'contacted' else stage end
  where id = lead.id;

  insert into public.crm_activities (org_id, lead_id, type, summary, data)
  values (lead.org_id, lead.id, case when new.channel in ('email', 'whatsapp', 'instagram') then new.channel else 'note' end,
          case when new.status = 'sent_manually' then 'Logged as sent by hand' else 'Sent' end,
          jsonb_build_object('message_id', new.id, 'channel', new.channel, 'status', new.status, 'draft_kind', draft_kind));

  perform public.crm_audit(lead.org_id, 'message.' || new.status, 'crm_outreach_messages', new.id,
    jsonb_build_object('lead_id', lead.id, 'channel', new.channel));

  if draft_kind in ('follow_up_1', 'follow_up_2') then
    update public.crm_follow_up_tasks
    set status = 'done', status_reason = 'Sent', completed_at = now()
    where id = (
      select id from public.crm_follow_up_tasks
      where lead_id = lead.id and kind = draft_kind and status = 'pending'
      order by due_on limit 1);
  elsif (draft_kind is null or draft_kind in ('initial_email', 'whatsapp_intro', 'instagram_dm'))
    and lead.stage = any (early || array['contacted'])
    and not exists (
      select 1 from public.crm_follow_up_tasks t
      where t.lead_id = lead.id and t.campaign_id is not distinct from new.campaign_id) then
    task_channel := case when new.channel in ('email', 'whatsapp', 'instagram', 'phone') then new.channel else 'email' end;
    perform public.crm_schedule_follow_ups(
      lead.id, new.campaign_id, task_channel,
      (new.sent_at at time zone (select timezone from public.crm_organisations where id = lead.org_id))::date);
  end if;
  return null;
end
$$;

create or replace function public.crm_suppression_before_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.value_key := case new.kind
    when 'email' then public.crm_email_key(new.value)
    when 'phone' then public.crm_phone_key(new.value)
    else public.crm_domain_key(new.value)
  end;
  if new.value_key is null then
    raise exception 'That doesn''t look like a valid %', new.kind;
  end if;
  return new;
end
$$;

-- A new suppression entry stops follow-ups for matching leads; opt-outs and
-- complaints also mark them do not contact, bounces mark the email bounced.
create or replace function public.crm_suppression_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  matched uuid[];
begin
  select array_agg(id) into matched
  from public.crm_leads l
  where l.org_id = new.org_id
    and ((new.kind = 'email' and l.email_key = new.value_key)
      or (new.kind = 'phone' and l.phone_key = new.value_key)
      or (new.kind = 'domain' and (l.domain_key = new.value_key or split_part(l.email_key, '@', 2) = new.value_key))
      or l.id = new.lead_id);

  if matched is not null then
    update public.crm_follow_up_tasks
    set status = 'cancelled', status_reason = 'Suppressed: ' || new.reason
    where lead_id = any (matched) and status in ('pending', 'paused');

    if new.reason in ('opted_out', 'complaint', 'do_not_contact') then
      update public.crm_leads set do_not_contact = true where id = any (matched) and not do_not_contact;
    elsif new.reason = 'bounced' and new.kind = 'email' then
      update public.crm_leads set email_status = 'bounced' where id = any (matched);
    end if;
  end if;

  perform public.crm_audit(new.org_id, 'suppression.add', 'crm_suppression_list', new.id,
    jsonb_build_object('kind', new.kind, 'reason', new.reason, 'leads', coalesce(cardinality(matched), 0)));
  return null;
end
$$;

create or replace function public.crm_suppression_after_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.crm_audit(old.org_id, 'suppression.remove', 'crm_suppression_list', old.id,
    jsonb_build_object('kind', old.kind, 'reason', old.reason));
  return null;
end
$$;

create or replace function public.crm_follow_up_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status is distinct from 'done') then
    new.completed_at := coalesce(new.completed_at, now());
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end
$$;

-- Keeps crm_leads.next_follow_up_on equal to the earliest pending task.
create or replace function public.crm_follow_up_after_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.lead_id, old.lead_id);
begin
  update public.crm_leads
  set next_follow_up_on = (
    select min(due_on) from public.crm_follow_up_tasks where lead_id = target and status = 'pending')
  where id = target;
  return null;
end
$$;

-- Pausing a campaign pauses its pending follow-ups; resuming brings them back.
create or replace function public.crm_campaign_after_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'paused' and old.status <> 'paused' then
    update public.crm_follow_up_tasks set status = 'paused', status_reason = 'Campaign paused'
    where campaign_id = new.id and status = 'pending';
    perform public.crm_audit(new.org_id, 'campaign.pause', 'crm_campaigns', new.id, '{}'::jsonb);
  elsif old.status = 'paused' and new.status <> 'paused' then
    update public.crm_follow_up_tasks set status = 'pending', status_reason = null
    where campaign_id = new.id and status = 'paused' and status_reason = 'Campaign paused';
    perform public.crm_audit(new.org_id, 'campaign.resume', 'crm_campaigns', new.id, '{}'::jsonb);
  end if;
  return null;
end
$$;

create or replace function public.crm_campaign_before_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'paused' and old.status <> 'paused' then
    new.paused_at := now();
  elsif new.status <> 'paused' then
    new.paused_at := null;
  end if;
  return new;
end
$$;

-- Winning or losing a deal moves the lead to match.
create or replace function public.crm_deal_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'won' then
    new.won_on := coalesce(new.won_on, current_date);
  else
    new.won_on := null;
  end if;
  return new;
end
$$;

create or replace function public.crm_deal_after_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    if new.status = 'won' then
      update public.crm_leads set stage = 'won' where id = new.lead_id and stage <> 'won';
    elsif new.status = 'lost' then
      update public.crm_leads set stage = 'lost'
      where id = new.lead_id and stage not in ('lost', 'not_interested', 'do_not_contact')
        and not exists (select 1 from public.crm_deals d where d.lead_id = new.lead_id and d.status in ('open', 'won') and d.id <> new.id);
    end if;
    insert into public.crm_activities (org_id, lead_id, type, summary, data)
    values (new.org_id, new.lead_id, 'deal',
      case new.status when 'won' then 'Deal won' when 'lost' then 'Deal lost' else 'Deal opened' end,
      jsonb_build_object('deal_id', new.id, 'service', new.proposed_service));
  end if;
  return null;
end
$$;

create or replace function public.crm_membership_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := coalesce(new.org_id, old.org_id);
begin
  if tg_op in ('UPDATE', 'DELETE') and old.role = 'owner'
    and (tg_op = 'DELETE' or new.role <> 'owner')
    and not exists (
      select 1 from public.crm_memberships
      where org_id = old.org_id and role = 'owner' and id <> old.id) then
    raise exception 'An organisation needs at least one owner';
  end if;
  perform public.crm_audit(target_org, 'membership.' || lower(tg_op), 'crm_memberships', coalesce(new.id, old.id),
    jsonb_build_object('user_id', coalesce(new.user_id, old.user_id), 'role', coalesce(new.role, old.role)));
  return coalesce(new, old);
end
$$;

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

create or replace function public.crm_share_after_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.crm_audit(coalesce(new.org_id, old.org_id), 'share.' || lower(tg_op), 'crm_lead_shares',
    coalesce(new.lead_id, old.lead_id), jsonb_build_object('user_id', coalesce(new.user_id, old.user_id)));
  return null;
end
$$;

-- ---------------------------------------------------------------- trigger wiring

do $$
declare
  t text;
begin
  foreach t in array array[
    'crm_organisations', 'crm_memberships', 'crm_campaigns', 'crm_leads', 'crm_lead_contacts',
    'crm_outreach_drafts', 'crm_outreach_messages', 'crm_follow_up_tasks', 'crm_deals'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.crm_set_updated_at()', t);
  end loop;

  foreach t in array array[
    'crm_lead_shares', 'crm_lead_contacts', 'crm_lead_campaigns', 'crm_outreach_drafts',
    'crm_outreach_messages', 'crm_outreach_events', 'crm_activities', 'crm_stage_changes',
    'crm_follow_up_tasks', 'crm_deals'
  ] loop
    execute format('drop trigger if exists a_inherit_org on public.%I', t);
    execute format(
      'create trigger a_inherit_org before insert or update on public.%I for each row execute function public.crm_inherit_org()', t);
  end loop;

  foreach t in array array['crm_lead_campaigns', 'crm_outreach_drafts', 'crm_outreach_messages', 'crm_follow_up_tasks'] loop
    execute format('drop trigger if exists b_campaign_org on public.%I', t);
    execute format(
      'create trigger b_campaign_org before insert or update on public.%I for each row execute function public.crm_check_campaign_org()', t);
  end loop;
end $$;

drop trigger if exists lead_before_write on public.crm_leads;
create trigger lead_before_write before insert or update on public.crm_leads
  for each row execute function public.crm_lead_before_write();
drop trigger if exists lead_after_write on public.crm_leads;
create trigger lead_after_write after insert or update on public.crm_leads
  for each row execute function public.crm_lead_after_write();
drop trigger if exists lead_after_delete on public.crm_leads;
create trigger lead_after_delete after delete on public.crm_leads
  for each row execute function public.crm_lead_after_delete();

drop trigger if exists draft_guard on public.crm_outreach_drafts;
create trigger draft_guard before insert or update on public.crm_outreach_drafts
  for each row execute function public.crm_draft_guard();

drop trigger if exists message_guard on public.crm_outreach_messages;
create trigger message_guard before insert or update on public.crm_outreach_messages
  for each row execute function public.crm_message_guard();
drop trigger if exists message_after_insert on public.crm_outreach_messages;
create trigger message_after_insert after insert on public.crm_outreach_messages
  for each row execute function public.crm_message_after_insert();

drop trigger if exists suppression_before_insert on public.crm_suppression_list;
create trigger suppression_before_insert before insert on public.crm_suppression_list
  for each row execute function public.crm_suppression_before_insert();
drop trigger if exists suppression_after_insert on public.crm_suppression_list;
create trigger suppression_after_insert after insert on public.crm_suppression_list
  for each row execute function public.crm_suppression_after_insert();
drop trigger if exists suppression_after_delete on public.crm_suppression_list;
create trigger suppression_after_delete after delete on public.crm_suppression_list
  for each row execute function public.crm_suppression_after_delete();

drop trigger if exists follow_up_before_write on public.crm_follow_up_tasks;
create trigger follow_up_before_write before insert or update on public.crm_follow_up_tasks
  for each row execute function public.crm_follow_up_before_write();
drop trigger if exists follow_up_after_write on public.crm_follow_up_tasks;
create trigger follow_up_after_write after insert or update or delete on public.crm_follow_up_tasks
  for each row execute function public.crm_follow_up_after_write();

drop trigger if exists campaign_before_update on public.crm_campaigns;
create trigger campaign_before_update before update on public.crm_campaigns
  for each row execute function public.crm_campaign_before_update();
drop trigger if exists campaign_after_update on public.crm_campaigns;
create trigger campaign_after_update after update on public.crm_campaigns
  for each row execute function public.crm_campaign_after_update();

drop trigger if exists deal_before_write on public.crm_deals;
create trigger deal_before_write before insert or update on public.crm_deals
  for each row execute function public.crm_deal_before_write();
drop trigger if exists deal_after_write on public.crm_deals;
create trigger deal_after_write after insert or update on public.crm_deals
  for each row execute function public.crm_deal_after_write();

drop trigger if exists membership_guard on public.crm_memberships;
create trigger membership_guard before insert or update or delete on public.crm_memberships
  for each row execute function public.crm_membership_guard();

drop trigger if exists org_after_update on public.crm_organisations;
create trigger org_after_update after update on public.crm_organisations
  for each row execute function public.crm_org_after_update();

drop trigger if exists share_after_write on public.crm_lead_shares;
create trigger share_after_write after insert or delete on public.crm_lead_shares
  for each row execute function public.crm_share_after_write();

-- ---------------------------------------------------------------- RLS

do $$
declare
  t text;
begin
  foreach t in array array[
    'crm_organisations', 'crm_memberships', 'crm_audit_logs', 'crm_industries', 'crm_lead_sources',
    'crm_campaigns', 'crm_leads', 'crm_lead_shares', 'crm_lead_contacts', 'crm_lead_campaigns',
    'crm_outreach_drafts', 'crm_outreach_messages', 'crm_outreach_events', 'crm_activities',
    'crm_stage_changes', 'crm_follow_up_tasks', 'crm_deals', 'crm_suppression_list',
    'crm_import_jobs', 'crm_import_rows', 'crm_rate_limits'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, public', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
  end loop;
end $$;

-- History tables: nobody signed in can rewrite them.
revoke insert, update, delete on table public.crm_audit_logs from authenticated;
revoke insert, update, delete on table public.crm_stage_changes from authenticated;
revoke update on table public.crm_outreach_events, public.crm_import_rows, public.crm_import_jobs from authenticated;
revoke all on table public.crm_rate_limits from authenticated;

-- organisations: members read, owners change settings. Creating organisations is a manual step.
drop policy if exists "Members read" on public.crm_organisations;
create policy "Members read" on public.crm_organisations for select to authenticated
  using (public.crm_is_member(id));
drop policy if exists "Owners update" on public.crm_organisations;
create policy "Owners update" on public.crm_organisations for update to authenticated
  using (public.crm_is_owner(id)) with check (public.crm_is_owner(id));

-- memberships: you see your own; owners see and manage everyone's.
drop policy if exists "Read own or as owner" on public.crm_memberships;
create policy "Read own or as owner" on public.crm_memberships for select to authenticated
  using (user_id = auth.uid() or public.crm_is_owner(org_id));
drop policy if exists "Owners insert" on public.crm_memberships;
create policy "Owners insert" on public.crm_memberships for insert to authenticated
  with check (public.crm_is_owner(org_id));
drop policy if exists "Owners update" on public.crm_memberships;
create policy "Owners update" on public.crm_memberships for update to authenticated
  using (public.crm_is_owner(org_id)) with check (public.crm_is_owner(org_id));
drop policy if exists "Owners delete" on public.crm_memberships;
create policy "Owners delete" on public.crm_memberships for delete to authenticated
  using (public.crm_is_owner(org_id));

drop policy if exists "Owners read" on public.crm_audit_logs;
create policy "Owners read" on public.crm_audit_logs for select to authenticated
  using (public.crm_is_owner(org_id));

-- reference data: members read, owners manage (campaigns: editors manage)
drop policy if exists "Members read" on public.crm_industries;
create policy "Members read" on public.crm_industries for select to authenticated
  using (public.crm_is_member(org_id));
drop policy if exists "Owners write" on public.crm_industries;
create policy "Owners write" on public.crm_industries for all to authenticated
  using (public.crm_is_owner(org_id)) with check (public.crm_is_owner(org_id));

drop policy if exists "Members read" on public.crm_lead_sources;
create policy "Members read" on public.crm_lead_sources for select to authenticated
  using (public.crm_is_member(org_id));
drop policy if exists "Owners write" on public.crm_lead_sources;
create policy "Owners write" on public.crm_lead_sources for all to authenticated
  using (public.crm_is_owner(org_id)) with check (public.crm_is_owner(org_id));

drop policy if exists "Members read" on public.crm_campaigns;
create policy "Members read" on public.crm_campaigns for select to authenticated
  using (public.crm_is_member(org_id));
drop policy if exists "Editors insert" on public.crm_campaigns;
create policy "Editors insert" on public.crm_campaigns for insert to authenticated
  with check (public.crm_is_editor(org_id));
drop policy if exists "Editors update" on public.crm_campaigns;
create policy "Editors update" on public.crm_campaigns for update to authenticated
  using (public.crm_is_editor(org_id)) with check (public.crm_is_editor(org_id));
drop policy if exists "Owners delete" on public.crm_campaigns;
create policy "Owners delete" on public.crm_campaigns for delete to authenticated
  using (public.crm_is_owner(org_id));

-- leads
drop policy if exists "Read permitted leads" on public.crm_leads;
create policy "Read permitted leads" on public.crm_leads for select to authenticated
  using (public.crm_lead_row_access(org_id, owner_id, id) is not null);
drop policy if exists "Owners and managers insert" on public.crm_leads;
create policy "Owners and managers insert" on public.crm_leads for insert to authenticated
  with check (
    public.crm_is_owner(org_id)
    or (public.crm_role(org_id) = 'manager' and owner_id = auth.uid()));
drop policy if exists "Edit writable leads" on public.crm_leads;
create policy "Edit writable leads" on public.crm_leads for update to authenticated
  using (public.crm_lead_row_access(org_id, owner_id, id) = 'write')
  with check (
    public.crm_is_owner(org_id)
    or (public.crm_role(org_id) = 'manager' and owner_id = auth.uid()));
drop policy if exists "Owners delete" on public.crm_leads;
create policy "Owners delete" on public.crm_leads for delete to authenticated
  using (public.crm_is_owner(org_id));

drop policy if exists "Read own or as owner" on public.crm_lead_shares;
create policy "Read own or as owner" on public.crm_lead_shares for select to authenticated
  using (user_id = auth.uid() or public.crm_is_owner(org_id));
drop policy if exists "Owners manage" on public.crm_lead_shares;
create policy "Owners manage" on public.crm_lead_shares for all to authenticated
  using (public.crm_is_owner(org_id)) with check (public.crm_is_owner(org_id));

-- Per-lead tables: read with the lead, write with the lead.
do $$
declare
  t text;
begin
  foreach t in array array['crm_lead_contacts', 'crm_lead_campaigns', 'crm_outreach_drafts', 'crm_follow_up_tasks', 'crm_deals'] loop
    execute format('drop policy if exists "Read with lead" on public.%I', t);
    execute format(
      'create policy "Read with lead" on public.%I for select to authenticated using (public.crm_can_read_lead(lead_id))', t);
    execute format('drop policy if exists "Write with lead" on public.%I', t);
    execute format(
      'create policy "Write with lead" on public.%I for insert to authenticated with check (public.crm_can_write_lead(lead_id))', t);
    execute format('drop policy if exists "Update with lead" on public.%I', t);
    execute format(
      'create policy "Update with lead" on public.%I for update to authenticated '
      'using (public.crm_can_write_lead(lead_id)) with check (public.crm_can_write_lead(lead_id))', t);
    execute format('drop policy if exists "Delete with lead" on public.%I', t);
    execute format(
      'create policy "Delete with lead" on public.%I for delete to authenticated using (public.crm_can_write_lead(lead_id))', t);
  end loop;

  -- History: read with the lead, add with the lead, only owners delete.
  foreach t in array array['crm_outreach_messages', 'crm_outreach_events', 'crm_activities', 'crm_stage_changes'] loop
    execute format('drop policy if exists "Read with lead" on public.%I', t);
    execute format(
      'create policy "Read with lead" on public.%I for select to authenticated using (public.crm_can_read_lead(lead_id))', t);
    execute format('drop policy if exists "Owners delete" on public.%I', t);
    execute format(
      'create policy "Owners delete" on public.%I for delete to authenticated using (public.crm_is_owner(org_id))', t);
  end loop;
end $$;

-- People can log only what they did by hand. Provider statuses come from the service role.
drop policy if exists "Log manual messages" on public.crm_outreach_messages;
create policy "Log manual messages" on public.crm_outreach_messages for insert to authenticated
  with check (public.crm_can_write_lead(lead_id) and status in ('sent_manually', 'received') and provider is null);
revoke update on table public.crm_outreach_messages from authenticated;

drop policy if exists "Log compose opens" on public.crm_outreach_events;
create policy "Log compose opens" on public.crm_outreach_events for insert to authenticated
  with check (
    public.crm_can_write_lead(lead_id)
    and type in ('whatsapp_opened', 'email_compose_opened', 'instagram_opened')
    and provider is null);

drop policy if exists "Add notes" on public.crm_activities;
create policy "Add notes" on public.crm_activities for insert to authenticated
  with check (public.crm_can_write_lead(lead_id) and type in ('note', 'call', 'meeting') and actor_id = auth.uid());

drop policy if exists "Editors read" on public.crm_suppression_list;
create policy "Editors read" on public.crm_suppression_list for select to authenticated
  using (public.crm_is_editor(org_id));
drop policy if exists "Editors add" on public.crm_suppression_list;
create policy "Editors add" on public.crm_suppression_list for insert to authenticated
  with check (public.crm_is_editor(org_id));
drop policy if exists "Owners remove" on public.crm_suppression_list;
create policy "Owners remove" on public.crm_suppression_list for delete to authenticated
  using (public.crm_is_owner(org_id));
revoke update on table public.crm_suppression_list from authenticated;

drop policy if exists "Owners read" on public.crm_import_jobs;
create policy "Owners read" on public.crm_import_jobs for select to authenticated
  using (public.crm_is_owner(org_id));
drop policy if exists "Owners delete" on public.crm_import_jobs;
create policy "Owners delete" on public.crm_import_jobs for delete to authenticated
  using (public.crm_is_owner(org_id));
drop policy if exists "Owners read" on public.crm_import_rows;
create policy "Owners read" on public.crm_import_rows for select to authenticated
  using (public.crm_is_owner(org_id));
-- Jobs and rows are written only by crm_commit_import.
revoke insert on table public.crm_import_jobs, public.crm_import_rows from authenticated;

-- ---------------------------------------------------------------- RPCs

-- What the hub asks after sign-in: which organisation, which role, and whether
-- the session still needs its second factor. Returns null for non-members.
create or replace function public.crm_my_access()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'org_id', o.id,
    'org_name', o.name,
    'role', m.role,
    'require_mfa', o.require_mfa,
    'mfa_ok', not o.require_mfa or coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2')
  from public.crm_memberships m
  join public.crm_organisations o on o.id = m.org_id
  where m.user_id = auth.uid()
  order by case m.role when 'owner' then 0 when 'manager' then 1 else 2 end, m.created_at
  limit 1
$$;

-- Member directory for owner pickers and "assigned to" labels.
create or replace function public.crm_members(_org uuid)
returns table (user_id uuid, email text, role text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select m.user_id, u.email::text, m.role, m.created_at
  from public.crm_memberships m
  join auth.users u on u.id = m.user_id
  where m.org_id = _org and public.crm_is_member(_org)
  order by m.created_at
$$;

-- Adds an existing auth user by email. There's no public signup: the owner
-- creates the user in Supabase Auth first.
create or replace function public.crm_add_member(_org uuid, _email text, _role text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
  result uuid;
begin
  if not public.crm_is_owner(_org) then
    raise exception 'Only an owner can add members';
  end if;
  if _role not in ('owner', 'manager', 'viewer') then
    raise exception 'Unknown role';
  end if;
  select id into target from auth.users where lower(email) = lower(btrim(_email));
  if target is null then
    raise exception 'No account with that email. Create the user in Supabase Auth first.';
  end if;
  insert into public.crm_memberships (org_id, user_id, role)
  values (_org, target, _role)
  on conflict (org_id, user_id) do update set role = excluded.role
  returning id into result;
  return result;
end
$$;

-- Exports are built in the browser from rows the caller can already read;
-- this records that one happened. Owners only.
create or replace function public.crm_log_export(_org uuid, _rows integer, _filters jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.crm_is_owner(_org) then
    raise exception 'Only an owner can export';
  end if;
  perform public.crm_audit(_org, 'export.leads', 'crm_leads', null,
    jsonb_build_object('rows', _rows, 'filters', coalesce(_filters, '{}'::jsonb)));
end
$$;

-- Fixed-window counter. True while the caller is under the limit.
create or replace function public.crm_take_rate_token(_bucket text, _max integer, _window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  win timestamptz := to_timestamp(floor(extract(epoch from now()) / _window_seconds) * _window_seconds);
  used integer;
begin
  if auth.uid() is null then
    return false;
  end if;
  insert into public.crm_rate_limits (user_id, bucket, window_start, hits)
  values (auth.uid(), _bucket, win, 1)
  on conflict (user_id, bucket, window_start) do update set hits = crm_rate_limits.hits + 1
  returning hits into used;
  delete from public.crm_rate_limits where window_start < now() - interval '1 day';
  return used <= _max;
end
$$;

-- Provider webhooks (service role only). Idempotent on provider_event_id.
create or replace function public.crm_record_provider_event(
  _provider text, _provider_event_id text, _provider_message_id text, _type text, _payload jsonb, _occurred_at timestamptz)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  msg public.crm_outreach_messages;
  inserted uuid;
begin
  select * into msg from public.crm_outreach_messages
  where provider = _provider and provider_message_id = _provider_message_id;
  if msg.id is null then
    return false;
  end if;

  insert into public.crm_outreach_events (org_id, lead_id, message_id, type, provider, provider_event_id, payload, occurred_at)
  values (msg.org_id, msg.lead_id, msg.id, _type, _provider, _provider_event_id, coalesce(_payload, '{}'::jsonb), coalesce(_occurred_at, now()))
  on conflict (org_id, provider, provider_event_id) do nothing
  returning id into inserted;
  if inserted is null then
    return false; -- already processed
  end if;

  if _type = 'delivered' and msg.status = 'sent' then
    update public.crm_outreach_messages set status = 'delivered' where id = msg.id;
  elsif _type = 'bounced' then
    update public.crm_outreach_messages set status = 'bounced' where id = msg.id;
    if msg.to_address is not null and public.crm_email_key(msg.to_address) is not null then
      insert into public.crm_suppression_list (org_id, kind, value, value_key, reason, lead_id, note)
      values (msg.org_id, 'email', msg.to_address, '', 'bounced', msg.lead_id, 'Provider bounce')
      on conflict (org_id, kind, value_key) do nothing;
    end if;
  elsif _type in ('unsubscribed', 'complained') and msg.to_address is not null then
    insert into public.crm_suppression_list (org_id, kind, value, value_key, reason, lead_id, note)
    values (msg.org_id, 'email', msg.to_address, '',
      case when _type = 'complained' then 'complaint' else 'opted_out' end, msg.lead_id, 'Provider ' || _type)
    on conflict (org_id, kind, value_key) do nothing;
  end if;
  return true;
end
$$;

-- Import commit. Owners only, all or nothing per row, never applies the same
-- source row twice. Merges only fill blanks; existing values are never overwritten.
-- _payload: { filename, file_sha256, file_size, sheet_name, column_mapping, methodology,
--             industry_id, campaign_id, source_name,
--             rows: [{ row_number, raw, fingerprint, decision, merge_lead_id, lead: {...} }] }
create or replace function public.crm_commit_import(_org uuid, _payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job uuid;
  src_id uuid;
  r jsonb;
  l jsonb;
  v_decision text;
  v_lead uuid;
  msg text;
  created integer := 0;
  merged integer := 0;
  skipped integer := 0;
  errors integer := 0;
  filled text[];
  f text;
  changed integer;
  industry uuid := nullif(_payload ->> 'industry_id', '')::uuid;
  campaign uuid := nullif(_payload ->> 'campaign_id', '')::uuid;
  fields constant text[] := array[
    'area', 'business_type', 'email', 'phone', 'website', 'instagram', 'facebook', 'tiktok',
    'google_rating', 'google_reviews', 'original_priority', 'weakness_score', 'notes', 'research_notes'];
begin
  if not public.crm_is_owner(_org) then
    raise exception 'Only an owner can import leads';
  end if;
  if jsonb_typeof(_payload -> 'rows') <> 'array' or jsonb_array_length(_payload -> 'rows') > 5000 then
    raise exception 'An import takes up to 5,000 rows';
  end if;
  if industry is not null and not exists (select 1 from public.crm_industries where id = industry and org_id = _org) then
    raise exception 'Unknown industry';
  end if;
  if campaign is not null and not exists (select 1 from public.crm_campaigns where id = campaign and org_id = _org) then
    raise exception 'Unknown campaign';
  end if;

  insert into public.crm_lead_sources (org_id, kind, name, filename, methodology, imported_at)
  values (_org, 'spreadsheet', coalesce(nullif(btrim(_payload ->> 'source_name'), ''), _payload ->> 'filename'),
          _payload ->> 'filename', coalesce(_payload -> 'methodology', '[]'::jsonb), now())
  returning id into src_id;

  insert into public.crm_import_jobs (org_id, source_id, industry_id, campaign_id, filename, file_sha256, file_size,
                                      sheet_name, column_mapping, total_rows)
  values (_org, src_id, industry, campaign, left(_payload ->> 'filename', 255), _payload ->> 'file_sha256',
          (_payload ->> 'file_size')::integer, left(_payload ->> 'sheet_name', 120),
          coalesce(_payload -> 'column_mapping', '{}'::jsonb), jsonb_array_length(_payload -> 'rows'))
  returning id into v_job;

  for r in select value from jsonb_array_elements(_payload -> 'rows') loop
    v_decision := coalesce(r ->> 'decision', 'skip');
    l := coalesce(r -> 'lead', '{}'::jsonb);
    v_lead := null;
    msg := null;

    if v_decision in ('create', 'merge') and exists (
      select 1 from public.crm_import_rows ir
      where ir.org_id = _org and ir.fingerprint = r ->> 'fingerprint' and ir.decision in ('create', 'merge')) then
      v_decision := 'skip';
      msg := 'Already imported';
    end if;

    begin
      if v_decision = 'create' then
        insert into public.crm_leads (
          org_id, industry_id, source_id, owner_id, name, area, business_type, email, phone, website,
          instagram, facebook, tiktok, google_rating, google_reviews, original_priority, weakness_score,
          notes, research_notes, source_data)
        values (
          _org, industry, src_id, auth.uid(), btrim(l ->> 'name'), l ->> 'area', l ->> 'business_type',
          l ->> 'email', l ->> 'phone', l ->> 'website', l ->> 'instagram', l ->> 'facebook', l ->> 'tiktok',
          (l ->> 'google_rating')::numeric, (l ->> 'google_reviews')::integer, l ->> 'original_priority',
          (l ->> 'weakness_score')::numeric, l ->> 'notes', l ->> 'research_notes',
          jsonb_build_object('imports', jsonb_build_array(jsonb_build_object(
            'job_id', v_job, 'filename', _payload ->> 'filename', 'row', r -> 'row_number', 'raw', r -> 'raw'))))
        returning id into v_lead;

      elsif v_decision = 'merge' then
        v_lead := nullif(r ->> 'merge_lead_id', '')::uuid;
        if v_lead is null or not exists (select 1 from public.crm_leads where id = v_lead and org_id = _org) then
          raise exception 'Merge target not found';
        end if;
        filled := '{}';
        foreach f in array fields loop
          if nullif(btrim(l ->> f), '') is not null then
            execute format(
              'update public.crm_leads set %1$I = %2$s where id = $1 and %1$I is null', f,
              case when f in ('google_rating', 'weakness_score') then '($2)::numeric'
                   when f = 'google_reviews' then '($2)::integer' else '$2' end)
              using v_lead, l ->> f;
            get diagnostics changed = row_count;
            if changed > 0 then
              filled := filled || f;
            end if;
          end if;
        end loop;
        update public.crm_leads
        set source_data = jsonb_set(source_data, '{imports}',
              coalesce(source_data -> 'imports', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
                'job_id', v_job, 'filename', _payload ->> 'filename', 'row', r -> 'row_number', 'raw', r -> 'raw'))),
            source_id = coalesce(source_id, src_id),
            industry_id = coalesce(industry_id, industry)
        where id = v_lead;
        msg := case when cardinality(filled) = 0 then 'Linked; nothing new to fill'
                    else 'Filled ' || array_to_string(filled, ', ') end;

      elsif v_decision = 'error' then
        msg := coalesce(r ->> 'message', 'Invalid row');
      else
        v_decision := 'skip';
        msg := coalesce(msg, r ->> 'message', 'Skipped');
      end if;

      -- A decision-maker name or direct line becomes an unverified contact.
      if v_lead is not null
        and coalesce(nullif(btrim(l ->> 'owner_name'), ''), nullif(btrim(l ->> 'direct_line'), '')) is not null
        and not exists (
          select 1 from public.crm_lead_contacts c
          where c.lead_id = v_lead and c.is_decision_maker
            and (c.name is not distinct from nullif(btrim(l ->> 'owner_name'), '')
              or c.phone is not distinct from nullif(btrim(l ->> 'direct_line'), ''))) then
        insert into public.crm_lead_contacts (lead_id, org_id, name, phone, is_decision_maker, source)
        values (v_lead, _org, nullif(btrim(l ->> 'owner_name'), ''), nullif(btrim(l ->> 'direct_line'), ''), true, 'import');
      end if;

      if v_lead is not null and campaign is not null then
        insert into public.crm_lead_campaigns (lead_id, campaign_id, org_id)
        values (v_lead, campaign, _org)
        on conflict do nothing;
      end if;
      if v_lead is not null then
        insert into public.crm_activities (org_id, lead_id, type, summary, data)
        values (_org, v_lead, 'import',
          case when v_decision = 'create' then 'Imported from ' else 'Merged from ' end || (_payload ->> 'filename'),
          jsonb_build_object('job_id', v_job, 'row', r -> 'row_number'));
      end if;
    exception when others then
      v_decision := 'error';
      v_lead := null;
      msg := sqlerrm;
    end;

    case v_decision
      when 'create' then created := created + 1;
      when 'merge' then merged := merged + 1;
      when 'error' then errors := errors + 1;
      else skipped := skipped + 1;
    end case;

    insert into public.crm_import_rows (org_id, job_id, row_number, raw, fingerprint, decision, lead_id, message)
    values (_org, v_job, coalesce((r ->> 'row_number')::integer, 0), coalesce(r -> 'raw', '{}'::jsonb),
            coalesce(r ->> 'fingerprint', gen_random_uuid()::text), v_decision, v_lead, msg);
  end loop;

  update public.crm_import_jobs
  set created_count = created, merged_count = merged, skipped_count = skipped, error_count = errors
  where id = v_job;

  perform public.crm_audit(_org, 'import.commit', 'crm_import_jobs', v_job, jsonb_build_object(
    'filename', _payload ->> 'filename', 'created', created, 'merged', merged, 'skipped', skipped, 'errors', errors));

  return jsonb_build_object('job_id', v_job, 'created', created, 'merged', merged, 'skipped', skipped, 'errors', errors);
end
$$;

-- Dashboard numbers for what the caller can see (security invoker, so RLS applies).
-- Counts are null-free; rates are null when there's nothing to divide by, and
-- won_missing_value says how many wins have no retainer recorded.
create or replace function public.crm_dashboard_metrics(
  _org uuid, _from timestamptz, _to timestamptz,
  _industry uuid default null, _campaign uuid default null, _owner uuid default null)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with l as (
    select * from public.crm_leads
    where org_id = _org and archived_at is null
      and (_industry is null or industry_id = _industry)
      and (_owner is null or owner_id = _owner)
      and (_campaign is null or exists (
        select 1 from public.crm_lead_campaigns lc where lc.lead_id = crm_leads.id and lc.campaign_id = _campaign))
  ),
  sc as (
    select s.* from public.crm_stage_changes s join l on l.id = s.lead_id
    where s.changed_at >= _from and s.changed_at < _to
  ),
  contacted as (
    select distinct m.lead_id from public.crm_outreach_messages m join l on l.id = m.lead_id
    where m.direction = 'outbound' and m.status in ('sent_manually', 'sent', 'delivered', 'bounced')
      and m.sent_at >= _from and m.sent_at < _to
  ),
  replied as (
    select m.lead_id from public.crm_outreach_messages m join l on l.id = m.lead_id
    where m.direction = 'inbound' and m.created_at >= _from and m.created_at < _to
    union
    select lead_id from sc where to_stage = 'replied'
  ),
  won_deals as (
    select d.* from public.crm_deals d join l on l.id = d.lead_id
    where d.status = 'won' and d.won_on >= (_from at time zone 'Africa/Nairobi')::date
      and d.won_on < (_to at time zone 'Africa/Nairobi')::date + 1
  ),
  counts as (
    select
      (select count(*) from l) as total_leads,
      (select count(*) from l where created_at >= _from and created_at < _to) as leads_added,
      (select count(*) from contacted) as contacted,
      (select count(*) from replied) as replies,
      (select count(distinct lead_id) from sc
        where to_stage in ('interested', 'meeting_booked', 'proposal_sent', 'negotiation', 'won')) as positive_replies,
      (select count(distinct lead_id) from sc where to_stage = 'meeting_booked') as meetings_booked,
      (select count(distinct lead_id) from (
        select lead_id from sc where to_stage = 'proposal_sent'
        union
        select d.lead_id from public.crm_deals d join l on l.id = d.lead_id
        where d.proposal_date >= (_from at time zone 'Africa/Nairobi')::date
          and d.proposal_date < (_to at time zone 'Africa/Nairobi')::date + 1) p) as proposals_sent,
      (select count(distinct lead_id) from (
        select lead_id from sc where to_stage = 'won' union select lead_id from won_deals) w) as clients_won,
      (select coalesce(sum(expected_monthly_retainer), 0) from won_deals) as revenue_won,
      (select count(*) from won_deals where expected_monthly_retainer is null) as won_missing_value,
      (select min(changed_at) from public.crm_stage_changes where org_id = _org) as tracking_since
  )
  select jsonb_build_object(
    'total_leads', total_leads,
    'leads_added', leads_added,
    'contacted', contacted,
    'replies', replies,
    'positive_replies', positive_replies,
    'meetings_booked', meetings_booked,
    'proposals_sent', proposals_sent,
    'clients_won', clients_won,
    'revenue_won', revenue_won,
    'won_missing_value', won_missing_value,
    'response_rate', case when contacted > 0 then round(replies::numeric / contacted, 4) end,
    'meeting_rate', case when contacted > 0 then round(meetings_booked::numeric / contacted, 4) end,
    'tracking_since', tracking_since,
    'stages', (select coalesce(jsonb_object_agg(stage, n), '{}'::jsonb) from (select stage, count(*) n from l group by stage) s)
  )
  from counts
$$;

-- Deletes closed leads untouched for the organisation's retention period.
-- Suppression entries survive (lead_id is cleared), so opt-outs stay honoured.
create or replace function public.crm_purge_stale_leads(_org uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  months integer;
  removed integer;
begin
  if not public.crm_is_owner(_org) then
    raise exception 'Only an owner can purge leads';
  end if;
  select retention_months into months from public.crm_organisations where id = _org;
  with gone as (
    delete from public.crm_leads
    where org_id = _org
      and stage in ('lost', 'not_interested', 'do_not_contact')
      and updated_at < now() - make_interval(months => months)
    returning id
  )
  select count(*) into removed from gone;
  perform public.crm_audit(_org, 'retention.purge', 'crm_leads', null, jsonb_build_object('removed', removed, 'months', months));
  return removed;
end
$$;

-- Clears the raw spreadsheet rows kept for an import once they're no longer needed.
create or replace function public.crm_clear_import_raw(_job uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  job_org uuid;
begin
  select org_id into job_org from public.crm_import_jobs where id = _job;
  if job_org is null or not public.crm_is_owner(job_org) then
    raise exception 'Only an owner can clear import data';
  end if;
  update public.crm_import_rows set raw = '{}'::jsonb where job_id = _job;
  perform public.crm_audit(job_org, 'import.clear_raw', 'crm_import_jobs', _job, '{}'::jsonb);
end
$$;

-- ---------------------------------------------------------------- function privileges

do $$
declare
  fn text;
begin
  -- Callable by signed-in users (each checks the caller itself).
  foreach fn in array array[
    'crm_role(uuid)', 'crm_is_member(uuid)', 'crm_is_editor(uuid)', 'crm_is_owner(uuid)',
    'crm_lead_row_access(uuid, uuid, uuid)', 'crm_lead_access(uuid)', 'crm_can_read_lead(uuid)', 'crm_can_write_lead(uuid)',
    'crm_my_access()', 'crm_members(uuid)', 'crm_add_member(uuid, text, text)',
    'crm_log_export(uuid, integer, jsonb)', 'crm_take_rate_token(text, integer, integer)',
    'crm_commit_import(uuid, jsonb)', 'crm_dashboard_metrics(uuid, timestamptz, timestamptz, uuid, uuid, uuid)',
    'crm_purge_stale_leads(uuid)', 'crm_clear_import_raw(uuid)', 'crm_is_suppressed(uuid, text, text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', fn);
    execute format('grant execute on function public.%s to authenticated', fn);
  end loop;

  -- Internal: triggers and the service role only.
  foreach fn in array array[
    'crm_audit(uuid, text, text, uuid, jsonb)',
    'crm_schedule_follow_ups(uuid, uuid, text, date)',
    'crm_record_provider_event(text, text, text, text, jsonb, timestamptz)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', fn);
    execute format('grant execute on function public.%s to service_role', fn);
  end loop;
end $$;

-- ---------------------------------------------------------------- seed

-- One organisation for the agency, owned by the existing hub admins, with the
-- industries the agency works in and the first campaign as a draft.
do $$
declare
  org uuid;
  dealers uuid;
begin
  select id into org from public.crm_organisations order by created_at limit 1;
  if org is null then
    insert into public.crm_organisations (name, sender_name, sender_business)
    values ('Joseph Maina Digital', 'Joseph Maina', 'Joseph Maina Digital Marketing')
    returning id into org;
  end if;

  insert into public.crm_memberships (org_id, user_id, role)
  select org, ur.user_id, 'owner' from public.user_roles ur where ur.role = 'admin'
  on conflict (org_id, user_id) do nothing;

  insert into public.crm_industries (org_id, slug, name) values
    (org, 'car_dealership', 'Car dealership'),
    (org, 'real_estate', 'Real estate'),
    (org, 'clinic', 'Clinic'),
    (org, 'school', 'School'),
    (org, 'ecommerce', 'E-commerce'),
    (org, 'other', 'Other')
  on conflict (org_id, slug) do nothing;

  select id into dealers from public.crm_industries where org_id = org and slug = 'car_dealership';
  if not exists (select 1 from public.crm_campaigns where org_id = org) then
    insert into public.crm_campaigns (org_id, name, industry_id, status, starts_on, ends_on, description, created_by)
    values (org, 'Nairobi car dealers: Nov–Dec 2026', dealers, 'draft', '2026-11-01', '2026-12-31',
            'First outreach campaign: Nairobi car dealerships, focused on vehicle enquiries and sales pipeline quality.', null);
  end if;
end $$;
