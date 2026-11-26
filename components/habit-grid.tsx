"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Archive } from "lucide-react";
import { archiveHabit, toggleCheckin } from "@/app/actions";
import { completion, currentStreak, daysInMonth, habitXp } from "@/lib/stats";
import type { Checkin, Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  habits: Pick<Habit, "id" | "name" | "emoji">[];
  checkins: Checkin[];
  month: string;
  today: string;
};

const same = (a: Checkin, b: Checkin) => a.habit_id === b.habit_id && a.day === b.day;
const fmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });

export function HabitGrid({ habits, checkins, month, today }: Props) {
  const [optimistic, toggle] = useOptimistic(checkins, (state, c: Checkin) =>
    state.some((x) => same(x, c)) ? state.filter((x) => !same(x, c)) : [...state, c],
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");

  const days = Array.from(
    { length: daysInMonth(month) },
    (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`,
  );

  function onToggle(c: Checkin) {
    startTransition(async () => {
      toggle(c);
      setError((await toggleCheckin(c.habit_id, c.day))?.error ?? "");
    });
  }

  function onArchive(id: string, name: string) {
    if (!confirm(`Archive "${name}"? It leaves the grid, but its XP stays.`)) return;
    startTransition(async () => setError((await archiveHabit(id))?.error ?? ""));
  }

  if (!habits.length)
    return <p className="text-muted-foreground">No habits yet. Add your first one above.</p>;

  return (
    <div className="space-y-2">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th scope="col" className="sticky left-0 bg-card p-3 text-left font-medium">Habit</th>
              {days.map((d) => (
                <th
                  key={d}
                  scope="col"
                  aria-current={d === today ? "date" : undefined}
                  className={cn("w-6 px-0.5 py-3 text-center font-normal tabular-nums", d === today && "text-primary font-bold")}
                >
                  {Number(d.slice(8))}
                </th>
              ))}
              <th scope="col" className="px-2 font-medium" title="Completion this month">%</th>
              <th scope="col" className="px-2 font-medium" title="Current streak"><span aria-label="Streak">🔥</span></th>
              <th scope="col" className="px-2 font-medium" title="XP"><span aria-label="XP">⭐</span></th>
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {habits.map((h) => {
              const done = optimistic.filter((c) => c.habit_id === h.id).map((c) => c.day);
              const doneSet = new Set(done);
              const label = `${h.emoji ? h.emoji + " " : ""}${h.name}`;
              return (
                <tr key={h.id} className="border-t">
                  <th scope="row" className="sticky left-0 bg-card p-3 text-left font-medium whitespace-nowrap max-w-48 truncate">
                    {label}
                  </th>
                  {days.map((d) => {
                    const on = doneSet.has(d);
                    return (
                      <td key={d} className={cn("px-0.5 text-center", d === today && "bg-primary/5")}>
                        <button
                          type="button"
                          disabled={d > today}
                          aria-pressed={on}
                          aria-label={`${h.name}, ${fmt.format(new Date(d))}`}
                          onClick={() => onToggle({ habit_id: h.id, day: d })}
                          className={cn(
                            "size-4 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30",
                            on ? "bg-primary shadow-glow" : "bg-muted hover:bg-muted-foreground/40",
                          )}
                        />
                      </td>
                    );
                  })}
                  <td className="px-2 text-center tabular-nums">{completion(done, month, today)}%</td>
                  <td className="px-2 text-center tabular-nums">{currentStreak(done, today)}</td>
                  <td className="px-2 text-center tabular-nums">{habitXp(done)}</td>
                  <td className="px-2">
                    <button
                      type="button"
                      onClick={() => onArchive(h.id, h.name)}
                      aria-label={`Archive ${h.name}`}
                      className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Archive className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
