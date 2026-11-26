import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { shiftMonth } from "@/lib/stats";
import { HabitGrid } from "@/components/habit-grid";
import { AddHabitForm } from "@/components/add-forms";
import { Button } from "@/components/ui/button";
import { demoCheckins, demoHabits } from "@/lib/demo";
import { hasEnvVars } from "@/lib/utils";

async function load() {
  const supabase = await createClient();
  return Promise.all([
    supabase.from("habits").select("id, name, emoji").is("archived_at", null).order("created_at"),
    // shortcut: all-time check-ins, for streaks and XP; PostgREST caps rows at 1000, so move to an SQL view when users get there.
    supabase.from("checkins").select("habit_id, day"),
  ]);
}

export default async function HabitsPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const today = new Date().toISOString().slice(0, 10); // UTC, same as toggleCheckin
  const thisMonth = today.slice(0, 7);
  const month = m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) && m <= thisMonth ? m : thisMonth;

  const [habits, checkins] = hasEnvVars
    ? await load()
    : [{ data: demoHabits, error: null }, { data: demoCheckins(today), error: null }];

  const title = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${month}-01`),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Habits</h1>
        <nav aria-label="Month" className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href={`?m=${shiftMonth(month, -1)}`} aria-label="Previous month"><ChevronLeft /></Link>
          </Button>
          <span className="w-36 text-center font-medium" aria-live="polite">{title}</span>
          {month < thisMonth ? (
            <Button asChild variant="ghost" size="icon">
              <Link href={`?m=${shiftMonth(month, 1)}`} aria-label="Next month"><ChevronRight /></Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" disabled aria-label="Next month"><ChevronRight /></Button>
          )}
        </nav>
      </div>
      <AddHabitForm />
      {habits.error || checkins.error ? (
        <p role="alert" className="text-destructive">Could not load habits: {(habits.error ?? checkins.error)!.message}</p>
      ) : (
        <HabitGrid habits={habits.data} checkins={checkins.data} month={month} today={today} />
      )}
    </div>
  );
}
