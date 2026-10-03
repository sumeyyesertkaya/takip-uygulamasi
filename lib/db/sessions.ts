import { db, type WorkSession } from "./index";

export async function saveWorkSession(date: string, seconds: number): Promise<void> {
  await db.sessions.put({ id: date, date, seconds });
}

export async function getAllSessions(): Promise<WorkSession[]> {
  return db.sessions.toArray();
}

export async function deleteWorkSession(date: string): Promise<void> {
  await db.sessions.delete(date);
}
