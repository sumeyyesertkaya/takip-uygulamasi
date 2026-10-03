import { startOfWeek, parseISO } from "date-fns";
import { addDaysKey, eachDayKey, getWeekStartKey, toDateKey } from "./dates";

export type ChainRange = "1m" | "3m" | "6m" | "1y";

export const RANGE_OPTIONS: { key: ChainRange; label: string; days: number }[] = [
  { key: "1m", label: "1 Ay", days: 30 },
  { key: "3m", label: "3 Ay", days: 90 },
  { key: "6m", label: "6 Ay", days: 180 },
  { key: "1y", label: "1 Yıl", days: 365 },
];

/** Bir zincirin işaretli günleri: yapıldı ve izin günü. */
export type HabitDays = { done: Set<string>; skip: Set<string> };

export const EMPTY_DAYS: HabitDays = { done: new Set(), skip: new Set() };

export function getRangeStartKey(range: ChainRange, today: string): string {
  const days = RANGE_OPTIONS.find((o) => o.key === range)?.days ?? 30;
  return addDaysKey(today, -(days - 1));
}

// Pazartesi başlangıçlı hafta sütunları; ilk hafta aralık başlangıcını, son hafta bugünü içerir.
export function buildWeeks(startKey: string, today: string): string[][] {
  const first = toDateKey(startOfWeek(parseISO(startKey), { weekStartsOn: 1 }));
  const last = addDaysKey(toDateKey(startOfWeek(parseISO(today), { weekStartsOn: 1 })), 6);
  const days = eachDayKey(first, last);
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export type HabitStats = {
  currentStreak: number;
  longestStreak: number;
  streakUnit: "gün" | "hafta";
  doneInRange: number;
  rate: number; // 0-100
};

/** Bir haftanın (pazartesi başlangıç anahtarı) done/skip sayıları. */
function weekCounts(days: HabitDays, weekStart: string): { done: number; skip: number } {
  let done = 0;
  let skip = 0;
  for (const day of eachDayKey(weekStart, addDaysKey(weekStart, 6))) {
    if (days.done.has(day)) done++;
    else if (days.skip.has(day)) skip++;
  }
  return { done, skip };
}

function dailyStats(days: HabitDays, startKey: string, today: string, createdKey: string): HabitStats {
  // Güncel seri tüm geçmişe bakar. Bugün henüz işaretlenmediyse seri bozulmuş sayılmaz;
  // izin günleri seriyi bozmaz ama gün sayısına da eklenmez.
  let cursor = days.done.has(today) || days.skip.has(today) ? today : addDaysKey(today, -1);
  let currentStreak = 0;
  while (days.done.has(cursor) || days.skip.has(cursor)) {
    if (days.done.has(cursor)) currentStreak++;
    cursor = addDaysKey(cursor, -1);
  }

  let longestStreak = 0;
  let run = 0;
  let doneInRange = 0;
  for (const day of eachDayKey(startKey, today)) {
    if (days.done.has(day)) {
      run++;
      doneInRange++;
      longestStreak = Math.max(longestStreak, run);
    } else if (!days.skip.has(day)) {
      run = 0;
    }
  }

  // Oran, zincirin oluşturulduğu günden itibaren hesaplanır; izin günleri paydaya girmez.
  const windowStart = createdKey > startKey ? createdKey : startKey;
  let windowDays = 0;
  let windowDone = 0;
  if (windowStart <= today) {
    for (const day of eachDayKey(windowStart, today)) {
      if (days.skip.has(day)) continue;
      windowDays++;
      if (days.done.has(day)) windowDone++;
    }
  }
  const rate = windowDays ? Math.round((windowDone / windowDays) * 100) : 0;

  return { currentStreak, longestStreak, streakUnit: "gün", doneInRange, rate };
}

function weeklyStats(
  days: HabitDays,
  startKey: string,
  today: string,
  createdKey: string,
  target: number,
): HabitStats {
  const met = (weekStart: string) => {
    const c = weekCounts(days, weekStart);
    return c.done + c.skip >= target;
  };
  const currentWeek = getWeekStartKey(today);

  // Güncel seri: tamamlanmış haftalar + (hedef tutmuşsa) içinde bulunulan hafta
  let currentStreak = met(currentWeek) ? 1 : 0;
  for (let w = addDaysKey(currentWeek, -7); met(w); w = addDaysKey(w, -7)) currentStreak++;

  // Dönem içindeki en uzun seri; devam eden (henüz tutmamış) hafta seriyi bozmaz
  let longestStreak = 0;
  let run = 0;
  const weekStarts: string[] = [];
  for (let w = getWeekStartKey(startKey); w <= currentWeek; w = addDaysKey(w, 7)) weekStarts.push(w);
  for (const w of weekStarts) {
    if (met(w)) {
      run++;
      longestStreak = Math.max(longestStreak, run);
    } else if (w !== currentWeek) {
      run = 0;
    }
  }

  let doneInRange = 0;
  for (const day of eachDayKey(startKey, today)) if (days.done.has(day)) doneInRange++;

  // Oran: oluşturulduktan sonraki tamamlanmış haftalarda hedefi tutturma yüzdesi
  const firstWeek = getWeekStartKey(createdKey > startKey ? createdKey : startKey);
  const considered = weekStarts.filter((w) => w >= firstWeek && (w !== currentWeek || met(w)));
  const metCount = considered.filter(met).length;
  const rate = considered.length ? Math.round((metCount / considered.length) * 100) : 0;

  return { currentStreak, longestStreak, streakUnit: "hafta", doneInRange, rate };
}

export function computeStats(
  days: HabitDays,
  startKey: string,
  today: string,
  createdKey: string,
  weeklyTarget = 7,
): HabitStats {
  return weeklyTarget >= 7
    ? dailyStats(days, startKey, today, createdKey)
    : weeklyStats(days, startKey, today, createdKey, weeklyTarget);
}
