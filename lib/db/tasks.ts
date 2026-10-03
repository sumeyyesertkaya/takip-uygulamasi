import { todayKey } from "../dates";
import { db, type Task } from "./index";

export async function addTask(title: string, date: string | null): Promise<void> {
  const trimmed = title.trim();
  if (!trimmed) return;

  const siblings = await db.tasks.filter((t) => t.date === date).toArray();
  const order = siblings.reduce((max, t) => Math.max(max, t.order), -1) + 1;

  await db.tasks.add({
    id: crypto.randomUUID(),
    title: trimmed,
    date,
    completed: false,
    order,
    createdAt: Date.now(),
    completedAt: null,
  });
}

export async function toggleTask(id: string): Promise<void> {
  const task = await db.tasks.get(id);
  if (!task) return;
  const completed = !task.completed;
  await db.tasks.update(id, {
    completed,
    completedAt: completed ? Date.now() : null,
  });
}

export async function updateTaskTitle(id: string, title: string): Promise<void> {
  const trimmed = title.trim();
  if (!trimmed) return;
  await db.tasks.update(id, { title: trimmed });
}

export async function moveTask(id: string, date: string | null, index: number): Promise<void> {
  await db.transaction("rw", db.tasks, async () => {
    const task = await db.tasks.get(id);
    if (!task) return;

    const all = await db.tasks.filter((t) => t.date === date && t.id !== id).toArray();
    const siblings = sortTasks(all);
    const at = Math.min(Math.max(index, 0), siblings.length);
    siblings.splice(at, 0, { ...task, date });
    await db.tasks.bulkPut(siblings.map((t, i) => ({ ...t, order: i })));
  });
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}

export async function getTasksForDates(dates: string[]): Promise<Task[]> {
  return db.tasks.where("date").anyOf(dates).toArray();
}

export async function getInboxTasks(): Promise<Task[]> {
  return db.tasks.filter((t) => t.date === null).toArray();
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
}

/** Tarihi bugünden önce olan ve tamamlanmamış görev. */
export function isOverdue(task: Task): boolean {
  return !task.completed && task.date !== null && task.date < todayKey();
}

/** Görevi bugünün listesinin sonuna taşır. */
export async function moveTaskToToday(id: string): Promise<void> {
  await moveTask(id, todayKey(), Number.MAX_SAFE_INTEGER);
}

export async function restoreTask(task: Task): Promise<void> {
  await db.tasks.put(task);
}

export async function searchTasks(query: string): Promise<Task[]> {
  const q = query.trim().toLocaleLowerCase("tr");
  if (!q) return [];
  const all = await db.tasks.toArray();
  return all
    .filter((t) => t.title.toLocaleLowerCase("tr").includes(q))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 8);
}

export async function getAllTasks(): Promise<Task[]> {
  return db.tasks.toArray();
}
