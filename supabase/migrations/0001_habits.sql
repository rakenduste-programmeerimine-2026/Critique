-- Habits and daily check-ins. Contract: docs/PLAN.md, "Shared contracts".

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  emoji text,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.checkins (
  habit_id uuid not null references public.habits on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null,
  primary key (habit_id, day)
);

create index habits_user_id_idx on public.habits (user_id);
create index checkins_user_day_idx on public.checkins (user_id, day);

alter table public.habits enable row level security;
alter table public.checkins enable row level security;

-- (select auth.uid()) runs once per query, not once per row.
create policy "habits: owner can select" on public.habits
  for select to authenticated using (user_id = (select auth.uid()));
create policy "habits: owner can insert" on public.habits
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "habits: owner can update" on public.habits
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "habits: owner can delete" on public.habits
  for delete to authenticated using (user_id = (select auth.uid()));

-- A check-in must belong to the user and to a habit of the same user.
create policy "checkins: owner can select" on public.checkins
  for select to authenticated using (user_id = (select auth.uid()));
create policy "checkins: owner can insert" on public.checkins
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid()))
  );
create policy "checkins: owner can update" on public.checkins
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid()))
  );
create policy "checkins: owner can delete" on public.checkins
  for delete to authenticated using (user_id = (select auth.uid()));
