-- Rollback for 20261017000000_client_hub_phase3.sql. Removes settings (and the
-- details saved in them) and the merge function. Merges already done stay done.
drop function if exists public.hub_merge_clients(uuid, uuid);
drop table if exists public.hub_settings;
