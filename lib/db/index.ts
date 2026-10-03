import Dexie, { type EntityTable } from "dexie";

export type Task = {
  id: string;
  title: string;
  date: string | null; // "YYYY-MM-DD"; null = Gelen Kutusu
  completed: boolean;
  order: number;
  createdAt: number;
  completedAt: number | null;
};

export type Habit = {
  id: string;
  title: string;
  order: number;
  createdAt: number;
  weeklyTarget: number; // 1-7; 7 = her gün
  archived: boolean;
};

// Kayıt varsa o gün işaretlenmiştir; id = `${habitId}_${date}`
// done = yapıldı, skip = izin günü (seriyi bozmaz, yüzdeye girmez)
export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD"
  kind: "done" | "skip";
};

// Bir günün toplam çalışma süresi; id = date
export type WorkSession = {
  id: string;
  date: string; // "YYYY-MM-DD"
  seconds: number;
};

export type Setting = {
  key: string;
  value: string;
};

class PlannerDatabase extends Dexie {
  tasks!: EntityTable<Task, "id">;
  habits!: EntityTable<Habit, "id">;
  habitLogs!: EntityTable<HabitLog, "id">;
  settings!: EntityTable<Setting, "key">;
  sessions!: EntityTable<WorkSession, "id">;

  constructor() {
    super("planner");
    this.version(1).stores({
      tasks: "id, date, completed, createdAt",
    });
    this.version(2).stores({
      tasks: "id, date, completed, createdAt",
      habits: "id, order, createdAt",
      habitLogs: "id, habitId, date",
    });
    this.version(3).stores({
      tasks: "id, date, completed, createdAt",
      habits: "id, order, createdAt",
      habitLogs: "id, habitId, date",
      settings: "key",
    });
    this.version(4).stores({
      tasks: "id, date, completed, createdAt",
      habits: "id, order, createdAt",
      habitLogs: "id, habitId, date",
      settings: "key",
      sessions: "id, date",
    });
    this.version(5)
      .stores({
        tasks: "id, date, completed, createdAt",
        habits: "id, order, createdAt",
        habitLogs: "id, habitId, date",
        settings: "key",
        sessions: "id, date",
      })
      .upgrade(async (tx) => {
        await tx.table("habits").toCollection().modify((habit) => {
          habit.weeklyTarget ??= 7;
          habit.archived ??= false;
        });
        await tx.table("habitLogs").toCollection().modify((log) => {
          log.kind ??= "done";
        });
      });
  }
}

export const db = new PlannerDatabase();
