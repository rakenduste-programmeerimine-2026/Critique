import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { TaskView } from "@/components/task-view";
import { AddTaskForm } from "@/components/add-forms";
import type { Task } from "@/lib/types";
import { cn, hasEnvVars } from "@/lib/utils";
import { demoTasks } from "@/lib/demo";

// With cacheComponents, searchParams and queries must be inside a <Suspense> of this page,
// or Next.js blocks client navigation. The page is a shell, TasksView reads the URL,
// and Tasks loads the data, so the header shows before the list when the view changes.
export default function TasksPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading tasks…</p>}>
      <TasksView searchParams={searchParams} />
    </Suspense>
  );
}

async function TasksView({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const view = (await searchParams).view === "board" ? "board" : "list";
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <nav aria-label="View" className="flex rounded-lg border p-0.5 text-sm">
          {(["list", "board"] as const).map((v) => (
            <Link
              key={v}
              href={`?view=${v}`}
              aria-current={view === v ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1 capitalize text-muted-foreground",
                view === v && "bg-primary text-primary-foreground",
              )}
            >
              {v}
            </Link>
          ))}
        </nav>
      </div>
      <AddTaskForm />
      <Suspense fallback={<p className="text-muted-foreground">Loading tasks…</p>}>
        <Tasks view={view} />
      </Suspense>
    </div>
  );
}

async function Tasks({ view }: { view: "list" | "board" }) {
  const { data, error } = hasEnvVars
    ? await (await createClient()).from("tasks").select("*").order("position")
    : { data: demoTasks, error: null };

  return error ? (
    <p role="alert" className="text-destructive">Could not load tasks: {error.message}</p>
  ) : (
    <TaskView tasks={data as Task[]} view={view} />
  );
}
