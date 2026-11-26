// Sample data shown when Supabase env vars are missing, so the pages can be previewed offline.
import { addDays } from "@/lib/stats";
import type { Checkin, Habit, Task } from "@/lib/types";

const habit = (id: string, name: string, emoji: string): Habit => ({
  id, name, emoji, created_at: "2026-01-01T00:00:00Z", archived_at: null,
});

export const demoHabits = [
  habit("h1", "Drink water", "💧"),
  habit("h2", "Read 20 pages", "📚"),
  habit("h3", "Workout", "🏋️"),
];

// The last 60 days, each habit with its own rhythm, so streaks and % look real.
export function demoCheckins(today: string): Checkin[] {
  return Array.from({ length: 60 }, (_, i) => addDays(today, -i)).flatMap((day, i) => [
    ...(i % 7 !== 5 ? [{ habit_id: "h1", day }] : []),
    ...(i < 4 || i % 3 === 0 ? [{ habit_id: "h2", day }] : []),
    ...(i % 2 === 1 ? [{ habit_id: "h3", day }] : []),
  ]);
}

const task = (id: string, title: string, status: Task["status"], position: number): Task => ({
  id, title, notes: null, status, position, created_at: "2026-01-01T00:00:00Z",
  done_at: status === "done" ? "2026-01-02T00:00:00Z" : null,
});

export const demoTasks = [
  task("t1", "Plan next week", "todo", 0),
  task("t2", "Reply to emails", "todo", 1),
  task("t3", "Write the report", "in_progress", 0),
  task("t4", "Buy groceries", "done", 0),
  task("t5", "Book dentist", "done", 1),
];

export const demoDoneCount = demoTasks.filter((t) => t.status === "done").length;
