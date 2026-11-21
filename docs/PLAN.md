# Critique work plan

This file divides the work into four roles. Each role has a scope, the files it owns, and its issues. The **shared contracts** section sets the data shapes. All roles use the same shapes, so the roles can work at the same time.

## Order of work

```text
DB: Supabase project ──► habits/checkins tables ──► tasks table
                                │                      │
Backend: stats module           ▼                      ▼
   │                     habit actions            task actions
   ▼                            │                      │
Test: stats unit tests          ▼                      ▼
Frontend: app shell ──► habit grid             task list ──► task board
                                    \              /
Test:                        RLS check · QA checklist
```

The frontend developer can start with mock data that follows the contracts. They connect the real actions when the backend developer finishes the action issues.

## Shared contracts

### Tables

```sql
habits   (id uuid pk default gen_random_uuid(),
          user_id uuid not null references auth.users on delete cascade default auth.uid(),
          name text not null check (char_length(name) between 1 and 60),
          emoji text,
          created_at timestamptz not null default now(),
          archived_at timestamptz)

checkins (habit_id uuid not null references habits on delete cascade,
          user_id uuid not null references auth.users on delete cascade default auth.uid(),
          day date not null,
          primary key (habit_id, day))

tasks    (id uuid pk default gen_random_uuid(),
          user_id uuid not null references auth.users on delete cascade default auth.uid(),
          title text not null check (char_length(title) between 1 and 200),
          notes text,
          status text not null default 'todo' check (status in ('todo','in_progress','done')),
          position integer not null default 0,
          created_at timestamptz not null default now(),
          done_at timestamptz)
```

Every table has Row Level Security. Each policy uses `user_id = auth.uid()`.

### TypeScript types (`lib/types.ts`)

```ts
export type Habit = { id: string; name: string; emoji: string | null; created_at: string; archived_at: string | null };
export type Checkin = { habit_id: string; day: string }; // day = "YYYY-MM-DD"
export type TaskStatus = "todo" | "in_progress" | "done";
export type Task = { id: string; title: string; notes: string | null; status: TaskStatus; position: number; created_at: string; done_at: string | null };
```

### Server actions (`app/actions.ts`)

| Action | Input | Result |
|---|---|---|
| `addHabit` | `FormData` with `name`, `emoji` | Inserts a habit. |
| `archiveHabit` | `id: string` | Sets `archived_at = now()`. |
| `toggleCheckin` | `habitId: string, day: string` | Inserts the check-in, or deletes it if it exists. Rejects a day in the future. |
| `addTask` | `FormData` with `title`, `status` | Inserts a task at the end of its status. |
| `updateTask` | `id: string, patch: { title?: string; status?: TaskStatus; position?: number }` | Updates the task. Sets `done_at` when the status changes to `done`. Clears `done_at` when the status changes from `done`. |
| `deleteTask` | `id: string` | Deletes the task. |

Each action checks its input, returns `{ error: string }` on failure, and calls `revalidatePath`.

### Stats (`lib/stats.ts`)

Pure functions with no database calls. Days are `"YYYY-MM-DD"` strings.

| Function | Rule |
|---|---|
| `completion(days, month, today)` | Done days in the month ÷ days in the month up to `today`, as a whole %. |
| `currentStreak(days, today)` | Count of done days in a row, back from `today`. If `today` is not done, count back from yesterday. |
| `habitXp(days)` | 10 XP for each check-in. Plus 5 XP for each day that is day 3 or later of a streak. |
| `taskXp(doneCount)` | 5 XP for each done task. |
| `level(totalXp)` | `{ level: floor(sqrt(totalXp / 100)) + 1, progress: 0..1 to the next level }` |

## Supabase / DB

**Owns:** `supabase/migrations/`, the Supabase project settings, `.env.example`.

**Scope:**
- Create the Supabase project. Share the URL and the publishable key with the team. Do not put keys in Git.
- Write the migrations for the three tables with the constraints, the indexes (`checkins (user_id, day)`, `tasks (user_id, status, position)`) and the RLS policies.
- Turn on email confirmation and set the site URL for the auth emails.

**Issues:**
1. Create the Supabase project and the env vars
2. Add the `habits` and `checkins` tables with RLS
3. Add the `tasks` table with RLS

## Backend

**Owns:** `app/actions.ts`, `lib/stats.ts`, `lib/types.ts`.

**Scope:**
- Write the stats module as pure functions, so the test developer can test it without a database.
- Write the server actions from the contract. Use `createClient` from `lib/supabase/server.ts`. Get the user with `supabase.auth.getClaims()`. Return an error if there is no user.
- Check every input on the server. Do not trust IDs or statuses from the client.

**Issues:**
4. Add the stats module for completion, streak, XP and level
5. Add the habit server actions
6. Add the task server actions

## Frontend

**Owns:** `app/protected/**`, `components/` (but not `components/ui/`, which the shadcn/ui CLI generates), `app/globals.css`.

**Scope:**
- Dark theme as default. Use a teal accent color with a glow (`box-shadow`) on done dots.
- App shell: a nav with **Habits** and **Tasks** links, the level badge and an XP bar.
- Habit grid: rows of dots for each day of the month, today's column marked, future days disabled, and month arrows with `?m=YYYY-MM`. Use `useOptimistic`, so a dot changes at once on click.
- Tasks: a **List / Board** switch with `?view=list|board`. Use native HTML5 drag-and-drop for the board, with no extra library. Each card also has a status `<select>` for keyboard and touch users.
- Every control has a label, and you can use every control with a keyboard.

**Issues:**
7. Build the dark app shell with nav and level badge
8. Build the habit grid dashboard with month navigation
9. Build the task list view grouped by status
10. Build the task board view with drag-and-drop

## Test

**Owns:** `lib/*.test.ts`, `docs/QA.md`.

**Scope:**
- Write unit tests for `lib/stats.ts` with `node --test`. Do not add a test framework.
- Use two test accounts to show that one user cannot read or change the data of a different user.
- Write a QA checklist for the main flows and run it before each merge to `main`.

**Issues:**
11. Write unit tests for the stats module
12. Check RLS isolation between two accounts
13. Write the QA checklist for the habit and task flows
