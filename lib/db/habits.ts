import { db, type Habit, type HabitLog } from "./index";

export async function addHabit(title: string): Promise<void> {
  const trimmed = title.trim();
  if (!trimmed) return;

  const habits = await db.habits.toArray();
  const order = habits.reduce((max, h) => Math.max(max, h.order), -1) + 1;
  await db.habits.add({
    id: crypto.randomUUID(),
    title: trimmed,
    order,
    createdAt: Date.now(),
    weeklyTarget: 7,
    archived: false,
  });
}

export async function updateHabitTitle(id: string, title: string): Promise<void> {
  const trimmed = title.trim();
  if (!trimmed) return;
  await db.habits.update(id, { title: trimmed });
}

export type HabitSnapshot = { habit: Habit; logs: HabitLog[] };

/** Zinciri ve kayıtlarını siler; geri alma için silinenleri döndürür. */
export async function deleteHabit(id: string): Promise<HabitSnapshot | undefined> {
  return db.transaction("rw", db.habits, db.habitLogs, async () => {
    const habit = await db.habits.get(id);
    if (!habit) return undefined;
    const logs = await db.habitLogs.where("habitId").equals(id).toArray();
    await db.habitLogs.where("habitId").equals(id).delete();
    await db.habits.delete(id);
    return { habit, logs };
  });
}

export async function restoreHabit(habit: Habit, logs: HabitLog[]): Promise<void> {
  await db.transaction("rw", db.habits, db.habitLogs, async () => {
    await db.habits.put(habit);
    await db.habitLogs.bulkPut(logs);
  });
}

/** Bugün düğmesi: yapıldıysa kaldırır, değilse (boş ya da izin) yapıldı olarak işaretler. */
export async function toggleHabitLog(habitId: string, date: string): Promise<void> {
  const id = `${habitId}_${date}`;
  const existing = await db.habitLogs.get(id);
  if (existing?.kind === "done") {
    await db.habitLogs.delete(id);
  } else {
    await db.habitLogs.put({ id, habitId, date, kind: "done" });
  }
}

/** Isı haritası hücresi: boş → yapıldı → izin günü → boş. */
export async function cycleHabitLog(habitId: string, date: string): Promise<void> {
  const id = `${habitId}_${date}`;
  const existing = await db.habitLogs.get(id);
  if (!existing) {
    await db.habitLogs.put({ id, habitId, date, kind: "done" });
  } else if (existing.kind === "done") {
    await db.habitLogs.put({ id, habitId, date, kind: "skip" });
  } else {
    await db.habitLogs.delete(id);
  }
}

export async function setHabitWeeklyTarget(id: string, weeklyTarget: number): Promise<void> {
  await db.habits.update(id, { weeklyTarget: Math.min(7, Math.max(1, weeklyTarget)) });
}

export async function setHabitArchived(id: string, archived: boolean): Promise<void> {
  await db.habits.update(id, { archived });
}

export async function getHabits(): Promise<Habit[]> {
  const habits = await db.habits.toArray();
  return habits.sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
}

export async function getHabitLogs(): Promise<HabitLog[]> {
  return db.habitLogs.toArray();
}
