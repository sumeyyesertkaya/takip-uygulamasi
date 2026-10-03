"use client";

import { useSyncExternalStore } from "react";
import { getLastBackupAt } from "./backup";

const STALE_DAYS = 7;

function subscribe(callback: () => void) {
  window.addEventListener("backup-changed", callback);
  return () => window.removeEventListener("backup-changed", callback);
}

/** Son yedeğin ISO zamanı; yedek yoksa null, sunucuda undefined. */
export function useLastBackupAt(): string | null | undefined {
  return useSyncExternalStore(subscribe, getLastBackupAt, () => undefined);
}

/** Yedek hiç alınmamış ya da 7 günden eskiyse true. */
export function isBackupStale(lastBackupAt: string | null | undefined, now: number): boolean {
  if (lastBackupAt === undefined) return false;
  if (!lastBackupAt) return true;
  return now - new Date(lastBackupAt).getTime() > STALE_DAYS * 24 * 60 * 60 * 1000;
}
