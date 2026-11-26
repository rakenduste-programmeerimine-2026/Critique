-- Critique database: all tables, indexes, RLS policies and grants in one file.
-- Paste it into the Supabase SQL Editor and click Run. You can run it again: it does not fail on objects that exist.
-- ponytail: same schema as supabase/migrations/. When you change a migration, change this file too.

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  emoji text,
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (id, user_id)
);

-- The composite foreign key makes the check-in user the same as the habit owner.
create table if not exists public.checkins (
  habit_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null,
  primary key (habit_id, day),
  foreign key (habit_id, user_id) references public.habits (id, user_id) on delete cascade
);

-- The app sets done_at in updateTask (app/actions.ts), not a trigger.
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  notes text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  done_at timestamptz
);

create index if not exists habits_user_id_idx on public.habits (user_id);
create index if not exists checkins_user_day_idx on public.checkins (user_id, day);
create index if not exists tasks_user_status_position_idx on public.tasks (user_id, status, position);

alter table public.habits enable row level security;
alter table public.checkins enable row level security;
alter table public.tasks enable row level security;

-- One set of owner-only policies for each table. (select auth.uid()) runs once per query, not once per row.
do $$
declare t text;
begin
  foreach t in array array['habits', 'checkins', 'tasks'] loop
    execute format('drop policy if exists "%1$s: owner can select" on public.%1$I', t);
    execute format('drop policy if exists "%1$s: owner can insert" on public.%1$I', t);
    execute format('drop policy if exists "%1$s: owner can update" on public.%1$I', t);
    execute format('drop policy if exists "%1$s: owner can delete" on public.%1$I', t);
    execute format('create policy "%1$s: owner can select" on public.%1$I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format('create policy "%1$s: owner can insert" on public.%1$I for insert to authenticated with check (user_id = (select auth.uid()))', t);
    execute format('create policy "%1$s: owner can update" on public.%1$I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create policy "%1$s: owner can delete" on public.%1$I for delete to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- Hosted projects can turn off the default grants for new tables.
grant select, insert, update, delete on public.habits, public.checkins, public.tasks to authenticated;
