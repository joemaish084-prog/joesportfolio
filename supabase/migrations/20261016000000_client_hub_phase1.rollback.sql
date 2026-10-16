-- Rollback for 20261016000000_client_hub_phase1.sql.
-- Drops every Client Hub object. All hub data is lost; the public site's tables
-- are untouched. The hub-documents bucket is only removed if it is empty.

drop policy if exists "Hub admin read documents" on storage.objects;
drop policy if exists "Hub admin upload documents" on storage.objects;
drop policy if exists "Hub admin update documents" on storage.objects;
drop policy if exists "Hub admin delete documents" on storage.objects;
delete from storage.buckets
where id = 'hub-documents'
  and not exists (select 1 from storage.objects where bucket_id = 'hub-documents');

drop table if exists public.onboarding_items;
drop table if exists public.onboarding_templates;
drop table if exists public.client_kpis;
drop table if exists public.clients;
drop table if exists public.client_types;

drop function if exists public.hub_client_created();
drop function if exists public.hub_apply_onboarding_template(uuid);
drop function if exists public.hub_onboarding_done_at();
drop table if exists public.user_roles;
drop function if exists public.is_hub_admin();
drop function if exists public.has_role(uuid, public.app_role);
drop function if exists public.hub_set_updated_at();
drop type if exists public.app_role;
