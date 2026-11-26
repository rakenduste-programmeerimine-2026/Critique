-- Demo data for Critique. Run it after supabase/schema.sql (SQL Editor), or let `supabase db reset` run it locally.
-- It makes one confirmed demo user with habits, check-ins and tasks. You can run it again: rows that exist stay.
--
-- Demo login:  demo@critique.test / critique-demo
-- Delete this user before real people use the app: Authentication → Users → demo@critique.test → Delete.

-- Demo user. The token columns must be '' (not null), or Supabase Auth cannot read the user.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000000', 'de300000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'demo@critique.test',
  extensions.crypt('critique-demo', extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}', '{}', now(), now(),
  '', '', '', ''
) on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  'de300000-0000-4000-8000-000000000001', 'de300000-0000-4000-8000-000000000001',
  'de300000-0000-4000-8000-000000000001', 'email',
  '{"sub": "de300000-0000-4000-8000-000000000001", "email": "demo@critique.test", "email_verified": true}',
  now(), now(), now()
) on conflict do nothing;

insert into public.habits (id, user_id, name, emoji, created_at) values
  ('de300000-0000-4000-8000-0000000000a1', 'de300000-0000-4000-8000-000000000001', 'Read 20 pages', '📚', now() - interval '60 days'),
  ('de300000-0000-4000-8000-0000000000a2', 'de300000-0000-4000-8000-000000000001', 'Workout',       '💪', now() - interval '60 days'),
  ('de300000-0000-4000-8000-0000000000a3', 'de300000-0000-4000-8000-000000000001', 'Drink 2 L water', '💧', now() - interval '60 days'),
  ('de300000-0000-4000-8000-0000000000a4', 'de300000-0000-4000-8000-000000000001', 'Meditate',      '🧘', now() - interval '60 days'),
  ('de300000-0000-4000-8000-0000000000a5', 'de300000-0000-4000-8000-000000000001', 'No sugar',      '🥗', now() - interval '60 days')
on conflict (id) do nothing;

-- Check-ins for the last 60 days, up to yesterday, so today is still open in the grid.
-- Each habit has its own pattern, so the grid and the stats look different for each row.
insert into public.checkins (habit_id, user_id, day)
select h.id, 'de300000-0000-4000-8000-000000000001', d::date
from public.habits h
cross join generate_series(current_date - 60, current_date - 1, interval '1 day') as d
where h.user_id = 'de300000-0000-4000-8000-000000000001'
  and case h.id
    -- Read: misses about one day in 7.
    when 'de300000-0000-4000-8000-0000000000a1' then (extract(doy from d)::int * 7) % 10 <> 0
    -- Workout: Mon, Wed, Fri, Sat.
    when 'de300000-0000-4000-8000-0000000000a2' then extract(isodow from d) in (1, 3, 5, 6)
    -- Water: an unbroken streak for the last 14 days, gaps before that.
    when 'de300000-0000-4000-8000-0000000000a3' then d >= current_date - 14 or (extract(doy from d)::int % 3) <> 0
    -- Meditate: weekdays only.
    when 'de300000-0000-4000-8000-0000000000a4' then extract(isodow from d) <= 5
    -- No sugar: started 10 days ago.
    when 'de300000-0000-4000-8000-0000000000a5' then d >= current_date - 10
  end
on conflict (habit_id, day) do nothing;

insert into public.tasks (id, user_id, title, notes, status, position, created_at, done_at) values
  ('de300000-0000-4000-8000-0000000000b1', 'de300000-0000-4000-8000-000000000001', 'Plan the week',               null,                        'todo',        0, now() - interval '2 days', null),
  ('de300000-0000-4000-8000-0000000000b2', 'de300000-0000-4000-8000-000000000001', 'Book a dentist appointment',  null,                        'todo',        1, now() - interval '5 days', null),
  ('de300000-0000-4000-8000-0000000000b3', 'de300000-0000-4000-8000-000000000001', 'Buy running shoes',           'Size 43. Check the sale.',  'todo',        2, now() - interval '1 day',  null),
  ('de300000-0000-4000-8000-0000000000b4', 'de300000-0000-4000-8000-000000000001', 'Finish the course project',   'Habit grid and task board.', 'in_progress', 0, now() - interval '7 days', null),
  ('de300000-0000-4000-8000-0000000000b5', 'de300000-0000-4000-8000-000000000001', 'Read "Atomic Habits" ch. 3', null,                        'in_progress', 1, now() - interval '3 days', null),
  ('de300000-0000-4000-8000-0000000000b6', 'de300000-0000-4000-8000-000000000001', 'Clean the desk',              null,                        'done',        0, now() - interval '6 days', now() - interval '4 days'),
  ('de300000-0000-4000-8000-0000000000b7', 'de300000-0000-4000-8000-000000000001', 'Set up Supabase',             null,                        'done',        1, now() - interval '3 days', now() - interval '1 day'),
  ('de300000-0000-4000-8000-0000000000b8', 'de300000-0000-4000-8000-000000000001', 'Pay the phone bill',          null,                        'done',        2, now() - interval '8 days', now() - interval '7 days')
on conflict (id) do nothing;
