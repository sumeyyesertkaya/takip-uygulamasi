import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { addDaysKey, eachDayKey, formatLongDate, toDateKey } from "./dates";
import type { Habit, Task, WorkSession } from "./db";
import { computeStats, EMPTY_DAYS, type HabitDays } from "./streaks";

export type StatsRange = "week" | "month" | "year";

export const STATS_RANGES: { key: StatsRange; label: string; days: number }[] = [
  { key: "week", label: "Hafta", days: 7 },
  { key: "month", label: "Ay", days: 30 },
  { key: "year", label: "Yıl", days: 365 },
];

export type Bucket = {
  key: string;
  label: string;
  fullLabel: string;
  seconds: number;
  tasks: number;
};

export type HabitRow = {
  habit: Habit;
  rate: number;
  currentStreak: number;
  streakUnit: "gün" | "hafta";
};

export type Overview = {
  startKey: string;
  totalSeconds: number;
  tasksCompleted: number;
  activeDays: number;
  bestStreak: number;
  completionRate: number | null; // planlanan görevlerden tamamlanma yüzdesi
  buckets: Bucket[];
  bestBucketKey: string | null;
  bestWeekday: string | null;
  habitRows: HabitRow[];
};

type Input = {
  range: StatsRange;
  today: string;
  sessions: WorkSession[];
  tasks: Task[];
  habits: Habit[];
  habitDays: Record<string, HabitDays>;
};

function increment(map: Map<string, number>, key: string, by: number) {
  map.set(key, (map.get(key) ?? 0) + by);
}

export function getStatsStartKey(range: StatsRange, today: string): string {
  const days = STATS_RANGES.find((r) => r.key === range)?.days ?? 7;
  return addDaysKey(today, -(days - 1));
}

export function computeOverview({ range, today, sessions, tasks, habits, habitDays }: Input): Overview {
  const startKey = getStatsStartKey(range, today);
  const days = eachDayKey(startKey, today);

  const secondsByDay = new Map<string, number>();
  for (const s of sessions) increment(secondsByDay, s.date, s.seconds);

  const tasksByDay = new Map<string, number>();
  for (const t of tasks) {
    if (t.completed && t.completedAt) increment(tasksByDay, toDateKey(new Date(t.completedAt)), 1);
  }

  const habitsByDay = new Map<string, number>();
  for (const id of Object.keys(habitDays)) {
    for (const d of habitDays[id].done) increment(habitsByDay, d, 1);
  }

  // Çubuklar: hafta/ay için günlük, yıl için aylık
  const bucketMap = new Map<string, Bucket>();
  for (const day of days) {
    const date = parseISO(day);
    const key = range === "year" ? day.slice(0, 7) : day;
    let bucket = bucketMap.get(key);
    if (!bucket) {
      bucket = {
        key,
        label: range === "year" ? format(date, "MMM", { locale: tr }) : range === "week" ? format(date, "EEE", { locale: tr }) : format(date, "d"),
        fullLabel: range === "year" ? format(date, "MMMM yyyy", { locale: tr }) : formatLongDate(day),
        seconds: 0,
        tasks: 0,
      };
      bucketMap.set(key, bucket);
    }
    bucket.seconds += secondsByDay.get(day) ?? 0;
    bucket.tasks += tasksByDay.get(day) ?? 0;
  }
  const buckets = [...bucketMap.values()];

  let totalSeconds = 0;
  let tasksCompleted = 0;
  let activeDays = 0;
  const secondsByWeekday = new Array<number>(7).fill(0);
  const tasksByWeekday = new Array<number>(7).fill(0);
  for (const day of days) {
    const seconds = secondsByDay.get(day) ?? 0;
    const done = tasksByDay.get(day) ?? 0;
    totalSeconds += seconds;
    tasksCompleted += done;
    if (seconds > 0 || done > 0 || (habitsByDay.get(day) ?? 0) > 0) activeDays++;
    const weekday = parseISO(day).getDay();
    secondsByWeekday[weekday] += seconds;
    tasksByWeekday[weekday] += done;
  }

  const scheduled = tasks.filter((t) => t.date !== null && t.date >= startKey && t.date <= today);
  const completionRate = scheduled.length
    ? Math.round((scheduled.filter((t) => t.completed).length / scheduled.length) * 100)
    : null;

  const activeHabits = habits.filter((h) => !h.archived);
  const habitRows: HabitRow[] = activeHabits.map((habit) => {
    const stats = computeStats(
      habitDays[habit.id] ?? EMPTY_DAYS,
      startKey,
      today,
      toDateKey(new Date(habit.createdAt)),
      habit.weeklyTarget,
    );
    return { habit, rate: stats.rate, currentStreak: stats.currentStreak, streakUnit: stats.streakUnit };
  });

  let bestStreak = 0;
  for (const habit of activeHabits.filter((h) => h.weeklyTarget >= 7)) {
    const stats = computeStats(habitDays[habit.id] ?? EMPTY_DAYS, startKey, today, startKey, 7);
    bestStreak = Math.max(bestStreak, stats.longestStreak);
  }

  // En verimli gün: önce çalışma süresine, süre yoksa tamamlanan göreve bakılır
  const weekdayScores = totalSeconds > 0 ? secondsByWeekday : tasksByWeekday;
  const bestIndex = weekdayScores.indexOf(Math.max(...weekdayScores));
  const bestWeekday =
    weekdayScores[bestIndex] > 0
      ? format(parseISO(days.find((d) => parseISO(d).getDay() === bestIndex) ?? today), "EEEE", { locale: tr })
      : null;

  const bestBucket = buckets.reduce<Bucket | null>(
    (best, b) => (b.seconds + b.tasks > 0 && (!best || b.seconds + b.tasks * 60 > best.seconds + best.tasks * 60) ? b : best),
    null,
  );

  return {
    startKey,
    totalSeconds,
    tasksCompleted,
    activeDays,
    bestStreak,
    completionRate,
    buckets,
    bestBucketKey: bestBucket?.key ?? null,
    bestWeekday,
    habitRows,
  };
}

/** 9000 sn → "2:30" (saat:dakika) */
export function formatHoursMinutes(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

/** 4800 sn → "1s 20dk" */
export function formatShortDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes <= 0) return seconds > 0 ? "<1dk" : "0dk";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? (m > 0 ? `${h}s ${m}dk` : `${h}s`) : `${m}dk`;
}
