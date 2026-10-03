import { restoreAppearance, getAppearance } from "./appearance";
import { db } from "./db";
import type { Appearance } from "./theme";
import { toDateKey } from "./dates";

const APP_ID = "little-by-little";
const BACKUP_VERSION = 1;
const LAST_BACKUP_KEY = "lastBackupAt";

type BackupFile = {
  app: typeof APP_ID;
  version: number;
  exportedAt: string;
  data: {
    tasks: unknown[];
    habits: unknown[];
    habitLogs: unknown[];
    sessions: unknown[];
    settings: unknown[];
  };
  appearance?: Partial<Appearance>;
  theme?: string | null;
};

export type BackupSummary = {
  tasks: number;
  habits: number;
  sessions: number;
};

export class BackupError extends Error {}

export function getLastBackupAt(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

function readTheme(): string | null {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

/** Tüm veriyi tek bir JSON dosyası olarak indirir. */
export async function downloadBackup(): Promise<void> {
  const [tasks, habits, habitLogs, sessions, settings] = await Promise.all([
    db.tasks.toArray(),
    db.habits.toArray(),
    db.habitLogs.toArray(),
    db.sessions.toArray(),
    db.settings.toArray(),
  ]);

  const backup: BackupFile = {
    app: APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: { tasks, habits, habitLogs, sessions, settings },
    appearance: getAppearance(),
    theme: readTheme(),
  };

  const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `little-by-little-yedek-${toDateKey(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  try {
    localStorage.setItem(LAST_BACKUP_KEY, backup.exportedAt);
    window.dispatchEvent(new Event("backup-changed"));
  } catch {
    // depolama kapalıysa son yedek tarihi tutulamaz
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ensureRows(value: unknown, name: string, requiredKeys: string[]): unknown[] {
  if (!Array.isArray(value)) throw new BackupError(`Yedek dosyasında "${name}" bölümü eksik.`);
  for (const row of value) {
    if (!isRecord(row) || requiredKeys.some((key) => !(key in row))) {
      throw new BackupError(`Yedek dosyasındaki "${name}" kayıtları bozuk.`);
    }
  }
  return value;
}

async function parseBackup(file: File): Promise<BackupFile> {
  let raw: unknown;
  try {
    raw = JSON.parse(await file.text());
  } catch {
    throw new BackupError("Bu dosya geçerli bir yedek dosyası değil.");
  }
  if (!isRecord(raw) || raw.app !== APP_ID || !isRecord(raw.data)) {
    throw new BackupError("Bu dosya Little by Little yedeği değil.");
  }
  if (typeof raw.version !== "number" || raw.version > BACKUP_VERSION) {
    throw new BackupError("Bu yedek daha yeni bir sürümden; uygulamayı güncelleyip tekrar dene.");
  }

  const data = raw.data;
  return {
    app: APP_ID,
    version: raw.version,
    exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : "",
    data: {
      tasks: ensureRows(data.tasks, "görevler", ["id", "title", "date", "completed", "order"]),
      habits: ensureRows(data.habits ?? [], "zincirler", ["id", "title"]),
      habitLogs: ensureRows(data.habitLogs ?? [], "zincir kayıtları", ["id", "habitId", "date"]),
      sessions: ensureRows(data.sessions ?? [], "çalışma süreleri", ["id", "date", "seconds"]),
      settings: ensureRows(data.settings ?? [], "ayarlar", ["key", "value"]),
    },
    appearance: isRecord(raw.appearance) ? (raw.appearance as Partial<Appearance>) : undefined,
    theme: typeof raw.theme === "string" ? raw.theme : null,
  };
}

/** Yedeği doğrular, sonra mevcut verinin yerine yazar. Hatalı dosyada hiçbir şey değişmez. */
export async function restoreBackup(file: File): Promise<BackupSummary> {
  const backup = await parseBackup(file);

  await db.transaction("rw", [db.tasks, db.habits, db.habitLogs, db.sessions, db.settings], async () => {
    await Promise.all([
      db.tasks.clear(),
      db.habits.clear(),
      db.habitLogs.clear(),
      db.sessions.clear(),
      db.settings.clear(),
    ]);
    await db.tasks.bulkPut(backup.data.tasks as never[]);
    // Eski yedeklerde olmayan alanlar için varsayılanlar
    await db.habits.bulkPut(
      (backup.data.habits as Record<string, unknown>[]).map((h) => ({
        ...h,
        weeklyTarget: typeof h.weeklyTarget === "number" ? h.weeklyTarget : 7,
        archived: h.archived === true,
      })) as never[],
    );
    await db.habitLogs.bulkPut(
      (backup.data.habitLogs as Record<string, unknown>[]).map((l) => ({
        ...l,
        kind: l.kind === "skip" ? "skip" : "done",
      })) as never[],
    );
    await db.sessions.bulkPut(backup.data.sessions as never[]);
    await db.settings.bulkPut(backup.data.settings as never[]);
  });

  if (backup.appearance) restoreAppearance(backup.appearance);
  if (backup.theme === "dark" || backup.theme === "light") {
    document.documentElement.classList.toggle("dark", backup.theme === "dark");
    try {
      localStorage.setItem("theme", backup.theme);
    } catch {
      // tercih yalnızca bu oturumda geçerli olur
    }
  }

  return {
    tasks: backup.data.tasks.length,
    habits: backup.data.habits.length,
    sessions: backup.data.sessions.length,
  };
}
