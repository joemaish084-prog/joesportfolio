-- Client portal: a private, read-mostly view of one client's own work.
-- Requires the hub phases (clients, KPIs, reports, work log, invoices,
-- documents) and 20261021000000_hub_engagements.sql.
--
-- Safety model, in short:
--   * Clients never touch a table. Every client read goes through
--     portal_snapshot(), a security definer function that returns ONE client's
--     data, only the columns meant for them (never work minutes, notes,
--     expenses or internal fields), and only what you chose to share.
--   * Nothing is shared by default. Reports, documents and work entries carry a
--     client_visible flag that starts false.
--   * Every new table is admin-only through RLS; anon has no privileges at all.
--   * Files in the private bucket open for a client only when the document is
--     shared with them (portal_can_read_file).

-- ---------------------------------------------------------------- sharing flags

alter table public.reports add column if not exists client_visible boolean not null default false;
alter table public.documents add column if not exists client_visible boolean not null default false;
alter table public.work_log add column if not exists client_visible boolean not null default false;

create index if not exists reports_visible_idx on public.reports (client_id) where client_visible;
create index if not exists work_log_visible_idx on public.work_log (client_id) where client_visible;
create index if not exists documents_visible_idx on public.documents (client_id) where client_visible;

-- ---------------------------------------------------------------- tables

-- One row per client; a missing row means "portal on, every module shown".
create table if not exists public.client_portal_settings (
  client_id uuid primary key references public.clients(id) on delete cascade,
  enabled boolean not null default true,
  modules text[] not null default array[
    'overview', 'results', 'reports', 'work', 'roadmap', 'billing', 'documents', 'book', 'help'
  ],
  welcome_message text,
  -- Cal.com handle ("name/strategy-call") or a full booking URL.
  call_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (modules <@ array[
    'overview', 'results', 'reports', 'work', 'roadmap', 'billing', 'documents', 'book', 'help'
  ])
);

-- The people who can sign in to a client's portal. user_id is set once the
-- person has an account (see portal_link_user and the portal-invite function).
create table if not exists public.client_users (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null check (btrim(email) <> ''),
  full_name text,
  invited_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists client_users_email_idx on public.client_users (client_id, lower(email));
create unique index if not exists client_users_user_idx on public.client_users (client_id, user_id) where user_id is not null;
create index if not exists client_users_lookup_idx on public.client_users (user_id);

-- The roadmap the client sees: what's planned, under way and done.
create table if not exists public.client_milestones (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null check (btrim(title) <> ''),
  description text,
  due_date date,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done')),
  sort_order integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_milestones_client_idx on public.client_milestones (client_id, sort_order);

-- Notes from you to the client. kind 'action' shows under "needs your attention"
-- until the client marks it done.
create table if not exists public.client_updates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  kind text not null default 'update' check (kind in ('update', 'action')),
  title text not null check (btrim(title) <> ''),
  body text,
  link_url text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_updates_client_idx on public.client_updates (client_id, created_at desc);

-- Questions and requests from the client to you.
create table if not exists public.client_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  kind text not null default 'question' check (kind in ('question', 'request', 'feedback')),
  subject text not null check (btrim(subject) <> ''),
  body text not null check (btrim(body) <> ''),
  status text not null default 'new' check (status in ('new', 'read', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_messages_client_idx on public.client_messages (client_id, created_at desc);
create index if not exists client_messages_new_idx on public.client_messages (status) where status = 'new';

-- Completed milestones remember when they were finished.
create or replace function public.portal_milestone_completed_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status <> 'done') then
    new.completed_at := coalesce(new.completed_at, now());
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end
$$;

drop trigger if exists set_completed_at on public.client_milestones;
create trigger set_completed_at before insert or update on public.client_milestones
  for each row execute function public.portal_milestone_completed_at();

do $$
declare
  t text;
begin
  foreach t in array array[
    'client_portal_settings', 'client_users', 'client_milestones', 'client_updates', 'client_messages'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I '
      'for each row execute function public.hub_set_updated_at()',
      t
    );
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('drop policy if exists "Admin full access" on public.%I', t);
    execute format(
      'create policy "Admin full access" on public.%I for all to authenticated '
      'using (public.has_role(auth.uid(), ''admin'')) '
      'with check (public.has_role(auth.uid(), ''admin''))',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------- helpers

create or replace function public.portal_client_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id from public.client_users where user_id = auth.uid()
$$;

-- The modules switched on for a client (all of them when there's no settings row).
create or replace function public.portal_modules(p_client_id uuid)
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select modules from public.client_portal_settings where client_id = p_client_id),
    array['overview', 'results', 'reports', 'work', 'roadmap', 'billing', 'documents', 'book', 'help']
  )
$$;

-- True when the signed-in user may open this file: it belongs to one of their
-- clients, isn't a template, and you shared it (directly, as a published report's
-- PDF, or as a sent invoice's PDF).
create or replace function public.portal_can_read_file(p_path text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.documents d
    where d.storage_path = p_path
      and not d.is_template
      and d.client_id in (select public.portal_client_ids())
      and (
        d.client_visible
        or exists (select 1 from public.reports r where r.document_id = d.id and r.client_visible)
        or (
          'billing' = any (public.portal_modules(d.client_id))
          and exists (select 1 from public.invoices i where i.document_id = d.id and i.status = 'sent')
        )
      )
  )
$$;

revoke all on function public.portal_client_ids() from public, anon;
revoke all on function public.portal_modules(uuid) from public, anon;
revoke all on function public.portal_can_read_file(text) from public, anon;
grant execute on function public.portal_client_ids() to authenticated;
grant execute on function public.portal_modules(uuid) to authenticated;
grant execute on function public.portal_can_read_file(text) to authenticated;

-- ---------------------------------------------------------------- the snapshot

-- Everything the portal shows, for one client, in one round trip. A signed-in
-- client gets their own client; the hub admin may pass any client id to preview
-- exactly what that client sees. Anyone else gets null.
create or replace function public.portal_snapshot(p_client_id uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  is_admin boolean := public.has_role(auth.uid(), 'admin');
  cid uuid;
  member public.client_users%rowtype;
  cfg public.client_portal_settings%rowtype;
  mods text[];
  is_preview boolean := false;
  result jsonb;
begin
  if uid is null then
    return null;
  end if;

  if p_client_id is null then
    select * into member from public.client_users where user_id = uid order by created_at limit 1;
    cid := member.client_id;
  else
    select * into member from public.client_users where user_id = uid and client_id = p_client_id;
    if found then
      cid := p_client_id;
    elsif is_admin then
      cid := p_client_id;
      is_preview := true;
    end if;
  end if;

  if cid is null or not exists (select 1 from public.clients where id = cid) then
    return null;
  end if;

  select * into cfg from public.client_portal_settings where client_id = cid;
  if found and not cfg.enabled and not is_admin then
    return null;
  end if;
  mods := public.portal_modules(cid);

  select jsonb_build_object(
    'client', (
      select jsonb_build_object(
        'id', c.id, 'name', c.name, 'business_name', c.business_name, 'contact_person', c.contact_person,
        'website', c.website, 'industry', c.industry, 'status', c.status, 'start_date', c.start_date,
        'services', c.services, 'main_goal', c.main_goal, 'currency', c.currency,
        'engagement_type', c.engagement_type, 'end_date', c.end_date,
        'monthly_fee', c.monthly_fee, 'project_fee', c.project_fee
      ) from public.clients c where c.id = cid
    ),
    'settings', jsonb_build_object(
      'modules', to_jsonb(mods),
      'welcome_message', cfg.welcome_message,
      'call_link', cfg.call_link
    ),
    'me', jsonb_build_object(
      'email', coalesce(member.email, auth.jwt() ->> 'email'),
      'full_name', member.full_name,
      'preview', is_preview
    ),
    'kpis', case when mods && array['overview', 'results', 'reports'] then coalesce((
      select jsonb_agg(
        jsonb_build_object('id', k.id, 'client_id', k.client_id, 'name', k.name, 'unit', k.unit,
                           'target', k.target, 'sort_order', k.sort_order)
        order by k.sort_order, k.name)
      from public.client_kpis k where k.client_id = cid
    ), '[]'::jsonb) else '[]'::jsonb end,
    'reports', case when mods && array['overview', 'results', 'reports'] then coalesce((
      select jsonb_agg(
        jsonb_build_object('id', r.id, 'client_id', r.client_id, 'title', r.title, 'period_start', r.period_start,
                           'period_end', r.period_end, 'summary', r.summary, 'document_id', r.document_id,
                           'created_at', r.created_at)
        order by r.period_end desc)
      from public.reports r where r.client_id = cid and r.client_visible
    ), '[]'::jsonb) else '[]'::jsonb end,
    'report_metrics', case when mods && array['overview', 'results', 'reports'] then coalesce((
      select jsonb_agg(
        jsonb_build_object('id', m.id, 'report_id', m.report_id, 'client_kpi_id', m.client_kpi_id, 'value', m.value))
      from public.report_metrics m
      join public.reports r on r.id = m.report_id
      where r.client_id = cid and r.client_visible
    ), '[]'::jsonb) else '[]'::jsonb end,
    'work', case when 'work' = any (mods) then coalesce((
      select jsonb_agg(
        jsonb_build_object('id', w.id, 'worked_on', w.worked_on, 'title', w.title, 'details', w.details,
                           'category', w.category)
        order by w.worked_on desc, w.created_at desc)
      from public.work_log w where w.client_id = cid and w.client_visible
    ), '[]'::jsonb) else '[]'::jsonb end,
    'milestones', case when 'roadmap' = any (mods) then coalesce((
      select jsonb_agg(
        jsonb_build_object('id', ms.id, 'title', ms.title, 'description', ms.description, 'due_date', ms.due_date,
                           'status', ms.status, 'completed_at', ms.completed_at, 'sort_order', ms.sort_order)
        order by ms.sort_order, ms.due_date nulls last, ms.created_at)
      from public.client_milestones ms where ms.client_id = cid
    ), '[]'::jsonb) else '[]'::jsonb end,
    'updates', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', u.id, 'kind', u.kind, 'title', u.title, 'body', u.body, 'link_url', u.link_url,
                           'resolved_at', u.resolved_at, 'created_at', u.created_at)
        order by u.created_at desc)
      from (select * from public.client_updates where client_id = cid order by created_at desc limit 40) u
    ), '[]'::jsonb),
    'invoices', case when 'billing' = any (mods) then coalesce((
      select jsonb_agg(
        jsonb_build_object('id', i.id, 'client_id', i.client_id, 'number', i.number, 'title', i.title,
                           'issue_date', i.issue_date, 'due_date', i.due_date, 'line_items', i.line_items,
                           'amount', i.amount, 'currency', i.currency, 'status', i.status,
                           'document_id', i.document_id)
        order by i.issue_date desc)
      from public.invoices i
      where i.client_id = cid
        and i.status <> 'void'
        and (i.status = 'sent' or exists (select 1 from public.payments p where p.invoice_id = i.id))
    ), '[]'::jsonb) else '[]'::jsonb end,
    'payments', case when 'billing' = any (mods) then coalesce((
      select jsonb_agg(
        jsonb_build_object('id', p.id, 'client_id', p.client_id, 'invoice_id', p.invoice_id, 'amount', p.amount,
                           'paid_on', p.paid_on, 'method', p.method, 'reference', p.reference)
        order by p.paid_on desc)
      from public.payments p where p.client_id = cid
    ), '[]'::jsonb) else '[]'::jsonb end,
    'documents', case when mods && array['documents', 'reports', 'billing'] then coalesce((
      select jsonb_agg(
        jsonb_build_object('id', d.id, 'client_id', d.client_id, 'kind', d.kind, 'title', d.title,
                           'status', d.status, 'storage_path', d.storage_path, 'file_name', d.file_name,
                           'mime_type', d.mime_type, 'size_bytes', d.size_bytes, 'created_at', d.created_at)
        order by d.created_at desc)
      from public.documents d
      where d.client_id = cid
        and not d.is_template
        and (
          d.client_visible
          or exists (select 1 from public.reports r where r.document_id = d.id and r.client_visible)
          or ('billing' = any (mods)
              and exists (select 1 from public.invoices i where i.document_id = d.id and i.status = 'sent'))
        )
    ), '[]'::jsonb) else '[]'::jsonb end,
    'messages', case when 'help' = any (mods) then coalesce((
      select jsonb_agg(
        jsonb_build_object('id', g.id, 'kind', g.kind, 'subject', g.subject, 'body', g.body, 'status', g.status,
                           'created_at', g.created_at)
        order by g.created_at desc)
      from (select * from public.client_messages where client_id = cid order by created_at desc limit 20) g
    ), '[]'::jsonb) else '[]'::jsonb end
  ) into result;

  return result;
end
$$;

revoke all on function public.portal_snapshot(uuid) from public, anon;
grant execute on function public.portal_snapshot(uuid) to authenticated;

-- ---------------------------------------------------------------- client actions

-- Stamps the member's last visit. Never errors for anyone else.
create or replace function public.portal_touch()
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update public.client_users set last_seen_at = now() where user_id = auth.uid()
$$;

-- A client marks one of their action items as done.
create or replace function public.portal_resolve_update(p_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  update public.client_updates
  set resolved_at = coalesce(resolved_at, now())
  where id = p_id and kind = 'action' and client_id in (select public.portal_client_ids());
  if not found then
    raise exception 'Not found';
  end if;
end
$$;

-- A client sends you a question or request. Capped so a stuck script can't flood the inbox.
create or replace function public.portal_send_message(p_kind text, p_subject text, p_body text, p_client_id uuid default null)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  cid uuid;
  new_id uuid;
begin
  if p_client_id is null then
    select client_id into cid from public.client_users where user_id = auth.uid() order by created_at limit 1;
  else
    select client_id into cid from public.client_users where user_id = auth.uid() and client_id = p_client_id;
  end if;
  if cid is null or not ('help' = any (public.portal_modules(cid))) then
    raise exception 'Not allowed';
  end if;
  if p_kind not in ('question', 'request', 'feedback') then
    raise exception 'Invalid message type';
  end if;
  if btrim(coalesce(p_subject, '')) = '' or btrim(coalesce(p_body, '')) = ''
     or length(p_subject) > 140 or length(p_body) > 4000 then
    raise exception 'Invalid message';
  end if;
  if (select count(*) from public.client_messages
      where client_id = cid and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many messages';
  end if;
  insert into public.client_messages (client_id, sender_user_id, kind, subject, body)
  values (cid, auth.uid(), p_kind, btrim(p_subject), btrim(p_body))
  returning id into new_id;
  return new_id;
end
$$;

revoke all on function public.portal_touch() from public, anon;
revoke all on function public.portal_resolve_update(uuid) from public, anon;
revoke all on function public.portal_send_message(text, text, text, uuid) from public, anon;
grant execute on function public.portal_touch() to authenticated;
grant execute on function public.portal_resolve_update(uuid) to authenticated;
grant execute on function public.portal_send_message(text, text, text, uuid) to authenticated;

-- ---------------------------------------------------------------- admin action

-- Gives a person portal access. If they already have an account (made in
-- Authentication > Users, or by the portal-invite function) they're linked
-- straight away; otherwise the row waits until they do. Hub admin only.
create or replace function public.portal_link_user(p_client_id uuid, p_email text, p_full_name text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  found_user uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Not allowed';
  end if;
  if btrim(coalesce(p_email, '')) = '' then
    raise exception 'Email is required';
  end if;
  select id into found_user from auth.users where lower(email) = lower(btrim(p_email)) limit 1;

  insert into public.client_users (client_id, user_id, email, full_name)
  values (p_client_id, found_user, btrim(p_email), nullif(btrim(coalesce(p_full_name, '')), ''))
  on conflict (client_id, lower(email)) do update
    set user_id = coalesce(excluded.user_id, public.client_users.user_id),
        full_name = coalesce(excluded.full_name, public.client_users.full_name);

  return jsonb_build_object('linked', found_user is not null);
end
$$;

revoke all on function public.portal_link_user(uuid, text, text) from public, anon;
grant execute on function public.portal_link_user(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------- storage

drop policy if exists "Portal clients read shared documents" on storage.objects;
create policy "Portal clients read shared documents" on storage.objects
  for select to authenticated
  using (bucket_id = 'hub-documents' and public.portal_can_read_file(name));
