import {
  addDays,
  addWeeks,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import { tr } from "date-fns/locale";

const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function getWeekStartKey(dateKey: string): string {
  return toDateKey(startOfWeek(parseISO(dateKey), WEEK_OPTIONS));
}

export function shiftWeek(weekStartKey: string, amount: number): string {
  return toDateKey(addWeeks(parseISO(weekStartKey), amount));
}

export function getWeekDayKeys(weekStartKey: string): string[] {
  const start = parseISO(weekStartKey);
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(start, i)));
}

export function formatDayName(dateKey: string): string {
  return format(parseISO(dateKey), "EEEE", { locale: tr });
}

export function formatDayNumber(dateKey: string): string {
  return format(parseISO(dateKey), "d MMM", { locale: tr });
}

export function formatWeekRange(weekStartKey: string): string {
  const start = parseISO(weekStartKey);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startText = format(start, sameMonth ? "d" : "d MMM", { locale: tr });
  const endText = format(end, "d MMM yyyy", { locale: tr });
  return `${startText} – ${endText}`;
}

export function isSunday(dateKey: string): boolean {
  return parseISO(dateKey).getDay() === 0;
}

export function eachDayKey(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  const end = parseISO(endKey);
  for (let d = parseISO(startKey); d <= end; d = addDays(d, 1)) keys.push(toDateKey(d));
  return keys;
}

export function addDaysKey(dateKey: string, amount: number): string {
  return toDateKey(addDays(parseISO(dateKey), amount));
}

export function formatMonthShort(dateKey: string): string {
  return format(parseISO(dateKey), "MMM", { locale: tr });
}

export function formatLongDate(dateKey: string): string {
  return format(parseISO(dateKey), "d MMMM yyyy, EEEE", { locale: tr });
}

export function monthOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}
