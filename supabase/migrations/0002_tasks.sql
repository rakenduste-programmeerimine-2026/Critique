-- General to-do list and task board. Contract: docs/PLAN.md, "Shared contracts".
-- The app sets done_at in updateTask (app/actions.ts), not a trigger.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  notes text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  done_at timestamptz
);

create index tasks_user_status_position_idx on public.tasks (user_id, status, position);

alter table public.tasks enable row level security;

create policy "tasks: owner can select" on public.tasks
  for select to authenticated using (user_id = (select auth.uid()));
create policy "tasks: owner can insert" on public.tasks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "tasks: owner can update" on public.tasks
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "tasks: owner can delete" on public.tasks
  for delete to authenticated using (user_id = (select auth.uid()));
