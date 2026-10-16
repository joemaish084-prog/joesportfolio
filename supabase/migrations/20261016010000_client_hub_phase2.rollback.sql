-- Rollback for 20261016010000_client_hub_phase2.sql. Drops the phase 2 tables
-- and their data. Files already uploaded to the hub-documents bucket are left
-- in storage; delete them from the Storage page if you want them gone.

drop table if exists public.leads;
drop table if exists public.expenses;
drop table if exists public.payments;
drop table if exists public.invoices;
drop table if exists public.report_metrics;
drop table if exists public.reports;
drop table if exists public.work_log;
drop table if exists public.documents;

update storage.buckets set file_size_limit = null where id = 'hub-documents';
