"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTask, updateTask } from "@/app/actions";
import { STATUSES, type Task, type TaskStatus } from "@/lib/types";
import { selectClass } from "@/components/add-forms";
import { cn } from "@/lib/utils";

type Move = { id: string; status?: TaskStatus; position?: number; deleted?: boolean };

export function TaskView({ tasks, view }: { tasks: Task[]; view: "list" | "board" }) {
  const [optimistic, apply] = useOptimistic(tasks, (state, m: Move) =>
    m.deleted ? state.filter((t) => t.id !== m.id) : state.map((t) => (t.id === m.id ? { ...t, ...m } : t)),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);

  function setStatus(id: string, status: TaskStatus) {
    if (optimistic.find((t) => t.id === id)?.status === status) return;
    const position = Math.max(-1, ...optimistic.filter((t) => t.status === status).map((t) => t.position)) + 1;
    startTransition(async () => {
      apply({ id, status, position });
      setError((await updateTask(id, { status, position }))?.error ?? "");
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      apply({ id, deleted: true });
      setError((await deleteTask(id))?.error ?? "");
    });
  }

  const board = view === "board";

  return (
    <div className="space-y-2">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className={cn(board ? "grid gap-4 md:grid-cols-3" : "space-y-6")}>
        {STATUSES.map(({ value, label }) => {
          const column = optimistic.filter((t) => t.status === value).sort((a, b) => a.position - b.position);
          return (
            <section
              key={value}
              aria-labelledby={`col-${value}`}
              onDragOver={board ? (e) => { e.preventDefault(); setDropTarget(value); } : undefined}
              onDragLeave={board ? () => setDropTarget(null) : undefined}
              onDrop={board ? (e) => { setDropTarget(null); setStatus(e.dataTransfer.getData("text/plain"), value); } : undefined}
              className={cn(
                board && "min-h-40 rounded-xl border bg-card p-3 transition-colors",
                dropTarget === value && "border-primary bg-primary/5",
              )}
            >
              <h2 id={`col-${value}`} className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                {label} <span className="rounded-full bg-muted px-2 text-xs tabular-nums">{column.length}</span>
              </h2>
              {!column.length && <p className="text-sm text-muted-foreground/60">{board ? "Drop a card here." : "Nothing here."}</p>}
              <ul className="space-y-2">
                {column.map((t) => (
                  <li
                    key={t.id}
                    draggable={board}
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border bg-background p-2 pl-3",
                      board && "cursor-grab active:cursor-grabbing",
                    )}
                  >
                    <span className={cn("flex-1 break-words", t.status === "done" && "text-muted-foreground line-through")}>
                      {t.title}
                    </span>
                    <label className="sr-only" htmlFor={`status-${t.id}`}>Status of {t.title}</label>
                    <select
                      id={`status-${t.id}`}
                      value={t.status}
                      onChange={(e) => setStatus(t.id, e.target.value as TaskStatus)}
                      className={cn(selectClass, "h-8 text-xs")}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      aria-label={`Delete ${t.title}`}
                      className="rounded p-1 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
