"use client";

import { runUndo, useUndoEntry } from "@/lib/undo";

export function UndoToast() {
  const entry = useUndoEntry();
  if (!entry) return null;

  return (
    <div
      key={entry.id}
      role="status"
      className="toast-in fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-4 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)]"
    >
      <span>{entry.message}</span>
      <button
        type="button"
        onClick={runUndo}
        className="underline underline-offset-2 transition-opacity hover:opacity-80"
      >
        Geri al
      </button>
    </div>
  );
}
