import { createClient } from "@/lib/supabase/server";
import { habitXp, level, taskXp } from "@/lib/stats";
import { demoCheckins, demoDoneCount } from "@/lib/demo";
import { hasEnvVars } from "@/lib/utils";
import { connection } from "next/server";

async function load() {
  if (!hasEnvVars) {
    await connection(); // demo data depends on today's date, so render per request
    const today = new Date().toISOString().slice(0, 10);
    return { checkins: demoCheckins(today), count: demoDoneCount };
  }
  const supabase = await createClient();
  const [{ data: checkins }, { count }] = await Promise.all([
    supabase.from("checkins").select("habit_id, day"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "done"),
  ]);
  return { checkins, count };
}

export async function LevelBadge() {
  const { checkins, count } = await load();

  const byHabit = new Map<string, string[]>();
  for (const c of checkins ?? []) byHabit.set(c.habit_id, [...(byHabit.get(c.habit_id) ?? []), c.day]);
  const xp = [...byHabit.values()].reduce((sum, days) => sum + habitXp(days), taskXp(count ?? 0));
  const { level: lvl, progress } = level(xp);
  const pct = Math.round(progress * 100);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="rounded-md bg-primary px-2 py-0.5 font-bold text-primary-foreground shadow-glow">
        Lv {lvl}
      </span>
      <div
        role="progressbar"
        aria-label={`Level ${lvl} progress`}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="hidden h-2 w-24 overflow-hidden rounded-full bg-muted sm:block"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums text-muted-foreground">{xp} XP</span>
    </div>
  );
}
