// Pure stats functions. Rules: docs/PLAN.md, "Stats". Days are "YYYY-MM-DD", months "YYYY-MM".

const DAY_MS = 86_400_000;
const toDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const addDays = (day: string, n: number) =>
  toDay(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS);

export function daysInMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function shiftMonth(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
}

export function completion(days: string[], month: string, today: string) {
  const thisMonth = today.slice(0, 7);
  const elapsed =
    month < thisMonth ? daysInMonth(month) : month === thisMonth ? Number(today.slice(8)) : 0;
  if (!elapsed) return 0;
  const done = new Set(days.filter((d) => d.startsWith(month) && d <= today)).size;
  return Math.round((done / elapsed) * 100);
}

export function currentStreak(days: string[], today: string) {
  const done = new Set(days);
  let day = done.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (done.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export function habitXp(days: string[]) {
  let xp = 0;
  let run = 0;
  let prev = "";
  for (const day of [...new Set(days)].sort()) {
    run = prev && addDays(prev, 1) === day ? run + 1 : 1;
    xp += run >= 3 ? 15 : 10;
    prev = day;
  }
  return xp;
}

export const taskXp = (doneCount: number) => doneCount * 5;

export function level(totalXp: number) {
  const lvl = Math.floor(Math.sqrt(totalXp / 100)) + 1;
  const start = 100 * (lvl - 1) ** 2;
  const next = 100 * lvl ** 2;
  return { level: lvl, progress: (totalXp - start) / (next - start) };
}
