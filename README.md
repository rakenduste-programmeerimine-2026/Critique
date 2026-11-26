# Critique

Critique is a web app that helps you keep your habits and finish your tasks. It turns your daily progress into a game. Each habit check-in and each done task gives you XP. Your XP sets your level.

## Features

- **Habit grid.** Each row is one habit. Each column is one day of the month. A glowing dot shows a day when you did the habit. Click a dot to mark the day as done or not done.
- **Habit stats.** Each habit shows its completion % for the month, its current streak (🔥) and its XP (⭐).
- **Tasks.** A general to-do list. Each task has one status: **To do**, **In progress** or **Done**.
  - **List view:** one section for each status.
  - **Board view:** one column for each status. Drag a card to a different column to change its status.
- **XP and levels.** One level for each user. Habit check-ins and done tasks give XP.
- **Accounts.** Sign up and log in with email and password. Each user sees only their own data.

## Stack

| Part | Tool |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| UI | Tailwind CSS, shadcn/ui |
| Auth and database | Supabase (Auth, Postgres with Row Level Security) |
| Package manager | pnpm |
| Tests | `node --test` (built into Node.js) |

## Setup

You need Node.js 24 or later, pnpm, and a Supabase account.

1. Clone the repo and install the packages:

   ```bash
   pnpm install
   ```

2. Create a project at [supabase.com](https://supabase.com).
3. Copy the env file:

   ```bash
   cp .env.example .env.local
   ```

4. In the Supabase dashboard, open **Project Settings → API**. Copy the project URL and the publishable key into `.env.local`.
5. Make the tables. In the Supabase dashboard, open **SQL Editor**. Paste `supabase/schema.sql` and click **Run**.
   - Optional demo data: paste `supabase/seed.sql` and click **Run**. Then log in as `demo@critique.test` with the password `critique-demo`. Delete this user before real people use the app.
   - With the CLI, `pnpm dlx supabase db push --remote` runs the files in `supabase/migrations/` instead. It does not add the demo data.
6. In the Supabase dashboard, set the auth settings. The hosted project does not read `supabase/config.toml`.
   - **Authentication → Sign In / Providers → Email:** turn on **Confirm email**.
   - **Authentication → URL Configuration:** set **Site URL** to the app URL. Add `http://localhost:3000/**` and `https://<app domain>/**` to **Redirect URLs**.
   - **Authentication → Email Templates → Confirm signup:** copy the link from `supabase/templates/confirmation.html`. The page `/auth/confirm` needs `token_hash` and `type` in the link.
7. Start the dev server:

   ```bash
   pnpm dev
   ```

8. Open <http://localhost:3000>.

### Local database (optional)

You can run Supabase on your computer instead of a hosted project. You need Docker. The settings are in `supabase/config.toml`.

1. Start Supabase. This command also runs all migrations and `supabase/seed.sql` (the demo user and demo data):

   ```bash
   pnpm dlx supabase start
   ```

2. Copy `API URL` and `Publishable key` from the output into `.env.local`.
3. Open <http://127.0.0.1:54324> to read the confirmation emails (Mailpit).
4. After you add or change a migration, reset the local database:

   ```bash
   pnpm dlx supabase db reset
   ```

5. Stop Supabase:

   ```bash
   pnpm dlx supabase stop
   ```

### Database tables

| Table | What it holds |
|---|---|
| `habits` | The habits of a user. `archived_at` hides a habit and keeps its check-ins. |
| `checkins` | One row for each habit and each done day. The key is `(habit_id, day)`. |
| `tasks` | The to-do items. `status` is `todo`, `in_progress` or `done`. |

Row Level Security is on for all tables. A user can read and change only their own rows.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Starts the dev server. |
| `pnpm build` | Makes a production build. |
| `pnpm start` | Starts the production build. |
| `pnpm lint` | Runs ESLint. |
| `pnpm test` | Runs the unit tests (`lib/**/*.test.ts`). |

## Folder structure

```text
app/
  auth/              Login, sign-up and password pages (from the Supabase template)
  protected/         Pages for logged-in users
    page.tsx         Habit dashboard
    tasks/page.tsx   Task list and board
  actions.ts         Server actions (planned)
components/          React components. components/ui/ holds the shadcn/ui parts.
lib/
  supabase/          Supabase clients for the server, the browser and the proxy
  stats.ts           Streak, completion, XP and level logic (planned)
supabase/migrations/ SQL migrations
docs/PLAN.md         Work plan for each role
proxy.ts             Refreshes the Supabase session on each request
```

## Team and work plan

We divide the work into four roles: frontend, backend, Supabase/DB and test. Read [`docs/PLAN.md`](docs/PLAN.md) for the scope of each role and the shared data contracts. Each task is a GitHub issue with a role label: `frontend`, `backend`, `database` or `testing`.
