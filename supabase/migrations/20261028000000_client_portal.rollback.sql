-- Removes the client portal. The sharing flags go with it, so nothing stays
-- exposed; reports, documents and work entries themselves are untouched.
drop policy if exists "Portal clients read shared documents" on storage.objects;

drop function if exists public.portal_link_user(uuid, text, text);
drop function if exists public.portal_send_message(text, text, text, uuid);
drop function if exists public.portal_resolve_update(uuid);
drop function if exists public.portal_touch();
drop function if exists public.portal_snapshot(uuid);
drop function if exists public.portal_business(boolean);
drop function if exists public.portal_can_read_file(text);
drop function if exists public.portal_modules(uuid);
drop function if exists public.portal_client_ids();
drop function if exists public.portal_milestone_completed_at();

drop table if exists public.client_messages;
drop table if exists public.client_updates;
drop table if exists public.client_milestones;
drop table if exists public.client_users;
drop table if exists public.client_portal_settings;

drop index if exists public.reports_visible_idx;
drop index if exists public.work_log_visible_idx;
drop index if exists public.documents_visible_idx;
alter table public.reports drop column if exists client_visible;
alter table public.documents drop column if exists client_visible;
alter table public.work_log drop column if exists client_visible;
