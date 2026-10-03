import type { Task } from "./db";
import { deleteHabit, restoreHabit } from "./db/habits";
import { deleteTask, restoreTask } from "./db/tasks";
import { pushUndo } from "./undo";

export async function deleteTaskWithUndo(task: Task): Promise<void> {
  await deleteTask(task.id);
  pushUndo("Görev silindi", () => restoreTask(task));
}

export async function deleteHabitWithUndo(habitId: string): Promise<void> {
  const snapshot = await deleteHabit(habitId);
  if (!snapshot) return;
  pushUndo("Zincir silindi", () => restoreHabit(snapshot.habit, snapshot.logs));
}
