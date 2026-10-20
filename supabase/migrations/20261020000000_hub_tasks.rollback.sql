-- Undoes 20261020000000_hub_tasks.sql. Deletes every task.
drop table if exists public.tasks;
drop function if exists public.hub_task_completed_at();
