-- Undoes 20261029000000_hub_google_calendar.sql. Forgets the Google connection;
-- revoke the hub's access at myaccount.google.com/permissions as well.
drop table if exists public.google_calendar_connections;
