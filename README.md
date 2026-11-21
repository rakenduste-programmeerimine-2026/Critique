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
5. Run the SQL files in `supabase/migrations/` in name order. Use the Supabase SQL editor or `supabase db push`.
6. Start the dev server:

   ```bash
   pnpm dev
   ```

7. Open <http://localhost:3000>.

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
