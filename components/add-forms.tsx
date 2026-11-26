"use client";

import { useActionState } from "react";
import { addHabit, addTask } from "@/app/actions";
import { STATUSES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function AddHabitForm() {
  const [state, action, pending] = useActionState(
    (_: unknown, fd: FormData) => addHabit(fd),
    undefined,
  );
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <div className="grid gap-1">
        <Label htmlFor="habit-emoji">Emoji</Label>
        <Input id="habit-emoji" name="emoji" placeholder="💧" className="w-16 text-center" maxLength={16} />
      </div>
      <div className="grid gap-1 flex-1 min-w-48">
        <Label htmlFor="habit-name">New habit</Label>
        <Input id="habit-name" name="name" placeholder="Drink water" required maxLength={60} />
      </div>
      <Button type="submit" disabled={pending}>Add habit</Button>
      {state?.error && <p role="alert" className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

export function AddTaskForm() {
  const [state, action, pending] = useActionState(
    (_: unknown, fd: FormData) => addTask(fd),
    undefined,
  );
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <div className="grid gap-1 flex-1 min-w-48">
        <Label htmlFor="task-title">New task</Label>
        <Input id="task-title" name="title" placeholder="Write the report" required maxLength={200} />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="task-status">Status</Label>
        <select id="task-status" name="status" className={selectClass}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={pending}>Add task</Button>
      {state?.error && <p role="alert" className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

