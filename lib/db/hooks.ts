"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Habit, type Task, type WorkSession } from "./index";
import { getHabitLogs, getHabits } from "./habits";
import { getBackgroundImage } from "./settings";
import { getAllSessions } from "./sessions";
import type { HabitDays } from "../streaks";
import { getAllTasks, getInboxTasks, getTasksForDates, searchTasks, sortTasks } from "./tasks";

export function useWeekTasks(dates: string[]): Record<string, Task[]> {
  const key = dates.join(",");
  const tasks = useLiveQuery(() => getTasksForDates(key.split(",")), [key]);

  const byDate: Record<string, Task[]> = {};
  for (const date of dates) byDate[date] = [];
  for (const task of tasks ?? []) {
    if (task.date && byDate[task.date]) byDate[task.date].push(task);
  }
  for (const date of dates) byDate[date] = sortTasks(byDate[date]);
  return byDate;
}

export function useInboxTasks(): Task[] {
  const tasks = useLiveQuery(() => getInboxTasks(), []);
  return sortTasks(tasks ?? []);
}

export function useHabits(): Habit[] | undefined {
  return useLiveQuery(() => getHabits(), []);
}

// habitId -> yapılan ve izin verilen günler. Yüklenene kadar undefined.
export function useHabitDays(): Record<string, HabitDays> | undefined {
  const logs = useLiveQuery(() => getHabitLogs(), []);
  return useMemo(() => {
    if (!logs) return undefined;
    const byHabit: Record<string, HabitDays> = {};
    for (const log of logs) {
      const days = (byHabit[log.habitId] ??= { done: new Set(), skip: new Set() });
      (log.kind === "skip" ? days.skip : days.done).add(log.date);
    }
    return byHabit;
  }, [logs]);
}

/** Arka plan görseli (data URL). Yüklenirken undefined, görsel yoksa null. */
export function useBackgroundImage(): string | null | undefined {
  return useLiveQuery(async () => (await getBackgroundImage()) ?? null, []);
}

export function useDayTasks(date: string): Task[] {
  const tasks = useLiveQuery(() => getTasksForDates([date]), [date]);
  return tasks ?? [];
}

export function useTaskSearch(query: string): Task[] {
  const tasks = useLiveQuery(() => searchTasks(query), [query]);
  return tasks ?? [];
}

/** Hiç veri yoksa yedeğe gerek yoktur; en az bir görev ya da zincir varsa true. */
export function useHasData(): boolean {
  return (
    useLiveQuery(async () => (await db.tasks.count()) + (await db.habits.count()) > 0, []) ?? false
  );
}

export function useAllTasks(): Task[] | undefined {
  return useLiveQuery(() => getAllTasks(), []);
}

export function useAllSessions(): WorkSession[] | undefined {
  return useLiveQuery(() => getAllSessions(), []);
}
