"use client";

import { useSyncExternalStore } from "react";

export type UndoEntry = {
  id: number;
  message: string;
  undo: () => Promise<void> | void;
};

const VISIBLE_MS = 6000;

let current: UndoEntry | null = null;
let counter = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function dismissUndo() {
  if (timer) clearTimeout(timer);
  timer = null;
  current = null;
  emit();
}

/** Son silme işlemini geri alınabilir yapar; toast kısa süre sonra kaybolur. */
export function pushUndo(message: string, undo: UndoEntry["undo"]) {
  counter += 1;
  current = { id: counter, message, undo };
  if (timer) clearTimeout(timer);
  timer = setTimeout(dismissUndo, VISIBLE_MS);
  emit();
}

export async function runUndo() {
  const entry = current;
  if (!entry) return;
  dismissUndo();
  await entry.undo();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useUndoEntry(): UndoEntry | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
