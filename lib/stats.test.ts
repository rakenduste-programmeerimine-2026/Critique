import { test } from "node:test";
import assert from "node:assert/strict";
import { completion, currentStreak, habitXp, isDay, level, shiftMonth, daysInMonth } from "./stats.ts";

test("completion counts days up to today", () => {
  assert.equal(completion(["2026-11-01", "2026-11-02", "2026-12-01"], "2026-11", "2026-11-04"), 50);
  assert.equal(completion(["2026-10-01"], "2026-10", "2026-11-04"), 3); // 1/31
  assert.equal(completion([], "2026-12", "2026-11-04"), 0);
});

test("streak counts back from today, or yesterday if today is open", () => {
  const days = ["2026-11-02", "2026-11-03", "2026-11-04"];
  assert.equal(currentStreak(days, "2026-11-04"), 3);
  assert.equal(currentStreak(days, "2026-11-05"), 3);
  assert.equal(currentStreak(days, "2026-11-06"), 0);
});

test("habit XP adds a bonus from day 3 of a streak", () => {
  assert.equal(habitXp(["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-05"]), 45);
});

test("level and progress", () => {
  assert.deepEqual(level(0), { level: 1, progress: 0 });
  assert.deepEqual(level(100), { level: 2, progress: 0 });
  assert.deepEqual(level(250), { level: 2, progress: 0.5 });
});

test("month helpers cross year boundaries", () => {
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(daysInMonth("2028-02"), 29);
});

test("isDay accepts only real calendar days", () => {
  assert.equal(isDay("2028-02-29"), true);
  assert.equal(isDay("2026-02-29"), false);
  assert.equal(isDay("2026-02-30"), false);
  assert.equal(isDay("2026-13-40"), false);
  assert.equal(isDay("2026-1-05"), false);
  assert.equal(isDay(""), false);
});
