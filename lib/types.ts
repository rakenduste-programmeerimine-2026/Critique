// Shared contract: docs/PLAN.md, "TypeScript types".
export type Habit = { id: string; name: string; emoji: string | null; created_at: string; archived_at: string | null };
export type Checkin = { habit_id: string; day: string }; // day = "YYYY-MM-DD"
export type TaskStatus = "todo" | "in_progress" | "done";
export type Task = { id: string; title: string; notes: string | null; status: TaskStatus; position: number; created_at: string; done_at: string | null };

export const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];
