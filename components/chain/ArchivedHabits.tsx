"use client";

import { useState } from "react";
import type { Habit } from "@/lib/db";
import { setHabitArchived } from "@/lib/db/habits";
import { deleteHabitWithUndo } from "@/lib/undoActions";

/** Aralık seçicinin altında her zaman duran "Arşiv (n)" düğmesi ve açılır liste. */
export function ArchivedHabits({ habits }: { habits: Habit[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold transition-colors hover:bg-card-hover"
      >
        Arşiv <span className="text-muted">({habits.length})</span>
      </button>

      {open && (
        <>
          {/* dışarı tıklayınca kapanır */}
          <button
            type="button"
            aria-label="Arşivi kapat"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-3rem)] rounded-2xl border border-line bg-surface p-3 text-foreground shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]">
            <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Arşivlenenler</div>
            {habits.length === 0 && (
              <p className="px-1 py-3 text-xs text-muted">
                Arşivde zincir yok. Bir zinciri kartındaki arşiv ikonuyla buraya alabilirsin.
              </p>
            )}
            <ul className="flex max-h-72 flex-col divide-y divide-line overflow-y-auto">
              {habits.map((habit) => (
                <li key={habit.id} className="flex items-center justify-between gap-3 px-1 py-2.5">
                  <span className="min-w-0 truncate text-xs font-medium">{habit.title}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHabitArchived(habit.id, false)}
                      className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold transition-colors hover:bg-card-hover"
                    >
                      Geri getir
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteHabitWithUndo(habit.id)}
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:text-primary"
                    >
                      Sil
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
