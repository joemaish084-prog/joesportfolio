-- Client Hub: task board (To do / In progress / In review / Done).
-- Same rules as the other hub tables: admin-only through RLS, nothing for anon.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (btrim(title) <> ''),
  notes text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  -- optional link to a client; the task stays if the client goes
  client_id uuid references public.clients(id) on delete set null,
  due_date date,
  labels text[] not null default '{}',
  -- [{ "id": "...", "text": "...", "done": false }]
  checklist jsonb not null default '[]'::jsonb check (jsonb_typeof(checklist) = 'array'),
  -- order within its column, smallest first
  position double precision not null default 0,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_board_idx on public.tasks (status, position) where archived_at is null;
create index if not exists tasks_client_idx on public.tasks (client_id) where client_id is not null;

-- Stamp completed_at when a task lands in Done, clear it when it leaves.
create or replace function public.hub_task_completed_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status is distinct from 'done') then
    new.completed_at := now();
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists set_completed_at on public.tasks;
create trigger set_completed_at before insert or update on public.tasks
  for each row execute function public.hub_task_completed_at();

drop trigger if exists set_updated_at on public.tasks;
create trigger set_updated_at before update on public.tasks
  for each row execute function public.hub_set_updated_at();

alter table public.tasks enable row level security;
revoke all on table public.tasks from anon;
grant select, insert, update, delete on table public.tasks to authenticated;
drop policy if exists "Admin full access" on public.tasks;
create policy "Admin full access" on public.tasks for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

revoke all on function public.hub_task_completed_at() from public, anon;
