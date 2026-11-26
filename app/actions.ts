"use server";

// Server actions. Contract: docs/PLAN.md, "Server actions". RLS limits every query to the signed-in user.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STATUSES, type TaskStatus } from "@/lib/types";
import { hasEnvVars } from "@/lib/utils";

type Result = { error: string } | undefined;

const NO_USER = hasEnvVars ? "Please sign in." : "Demo mode: add the Supabase env vars to save changes.";

async function signedIn() {
  if (!hasEnvVars) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ? supabase : null;
}

const isStatus = (s: unknown): s is TaskStatus => STATUSES.some((x) => x.value === s);
const done = () => revalidatePath("/protected", "layout"); // layout too, so the XP badge updates

export async function addHabit(formData: FormData): Promise<Result> {
  const supabase = await signedIn();
  if (!supabase) return { error: NO_USER };
  const name = String(formData.get("name") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || null;
  if (name.length < 1 || name.length > 60) return { error: "Name must be 1–60 characters." };
  if (emoji && emoji.length > 16) return { error: "Emoji is too long." };
  const { error } = await supabase.from("habits").insert({ name, emoji });
  if (error) return { error: error.message };
  done();
}

export async function archiveHabit(id: string): Promise<Result> {
  const supabase = await signedIn();
  if (!supabase) return { error: NO_USER };
  const { error } = await supabase
    .from("habits")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", String(id));
  if (error) return { error: error.message };
  done();
}

export async function toggleCheckin(habitId: string, day: string): Promise<Result> {
  const supabase = await signedIn();
  if (!supabase) return { error: NO_USER };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || isNaN(Date.parse(day))) return { error: "Bad day." };
  // shortcut: "today" is UTC, so users far from UTC may see the day flip early or late; upgrade by passing the user's time zone.
  if (day > new Date().toISOString().slice(0, 10)) return { error: "You can't check in a future day." };

  const { data, error } = await supabase
    .from("checkins")
    .delete()
    .eq("habit_id", String(habitId))
    .eq("day", day)
    .select("day");
  if (error) return { error: error.message };
  if (!data.length) {
    const { error } = await supabase.from("checkins").insert({ habit_id: String(habitId), day });
    if (error) return { error: error.message };
  }
  done();
}

export async function addTask(formData: FormData): Promise<Result> {
  const supabase = await signedIn();
  if (!supabase) return { error: NO_USER };
  const title = String(formData.get("title") ?? "").trim();
  const status = formData.get("status") ?? "todo";
  if (title.length < 1 || title.length > 200) return { error: "Title must be 1–200 characters." };
  if (!isStatus(status)) return { error: "Bad status." };

  const { data: last } = await supabase
    .from("tasks")
    .select("position")
    .eq("status", status)
    .order("position", { ascending: false })
    .limit(1);
  const position = (last?.[0]?.position ?? -1) + 1;
  const { error } = await supabase.from("tasks").insert({
    title,
    status,
    position,
    done_at: status === "done" ? new Date().toISOString() : null,
  });
  if (error) return { error: error.message };
  done();
}

export async function updateTask(
  id: string,
  patch: { title?: string; status?: TaskStatus; position?: number },
): Promise<Result> {
  const supabase = await signedIn();
  if (!supabase) return { error: NO_USER };
  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    const title = String(patch.title).trim();
    if (title.length < 1 || title.length > 200) return { error: "Title must be 1–200 characters." };
    update.title = title;
  }
  if (patch.position !== undefined) {
    if (!Number.isInteger(patch.position) || patch.position < 0) return { error: "Bad position." };
    update.position = patch.position;
  }
  if (patch.status !== undefined) {
    if (!isStatus(patch.status)) return { error: "Bad status." };
    const { data: current, error } = await supabase
      .from("tasks")
      .select("status")
      .eq("id", String(id))
      .single();
    if (error) return { error: error.message };
    if (current.status !== patch.status) {
      update.status = patch.status;
      update.done_at = patch.status === "done" ? new Date().toISOString() : null;
    }
  }
  if (!Object.keys(update).length) return;
  const { error } = await supabase.from("tasks").update(update).eq("id", String(id));
  if (error) return { error: error.message };
  done();
}

export async function deleteTask(id: string): Promise<Result> {
  const supabase = await signedIn();
  if (!supabase) return { error: NO_USER };
  const { error } = await supabase.from("tasks").delete().eq("id", String(id));
  if (error) return { error: error.message };
  done();
}
