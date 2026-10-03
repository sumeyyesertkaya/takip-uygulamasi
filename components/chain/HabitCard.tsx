"use client";

import { useState } from "react";
import type { Habit } from "@/lib/db";
import { toDateKey } from "@/lib/dates";
import {
  cycleHabitLog,
  setHabitArchived,
  setHabitWeeklyTarget,
  toggleHabitLog,
  updateHabitTitle,
} from "@/lib/db/habits";
import { buildWeeks, computeStats, type HabitDays } from "@/lib/streaks";
import { pushUndo } from "@/lib/undo";
import { deleteHabitWithUndo } from "@/lib/undoActions";
import { Heatmap } from "./Heatmap";

type HabitCardProps = {
  habit: Habit;
  days: HabitDays;
  startKey: string;
  today: string;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-bold leading-tight">{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}

const iconButton =
  "text-muted opacity-0 transition-opacity hover:text-primary focus:opacity-100 group-hover:opacity-100";

export function HabitCard({ habit, days, startKey, today }: HabitCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(habit.title);

  const stats = computeStats(days, startKey, today, toDateKey(new Date(habit.createdAt)), habit.weeklyTarget);
  const weeks = buildWeeks(startKey, today);
  const doneToday = days.done.has(today);

  async function commit() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== habit.title) {
      await updateHabitTitle(habit.id, draft);
    } else {
      setDraft(habit.title);
    }
  }

  async function archive() {
    await setHabitArchived(habit.id, true);
    pushUndo("Zincir arşive alındı", () => setHabitArchived(habit.id, false));
  }

  return (
    <section className="group rounded-3xl bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.15)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(habit.title);
                setEditing(false);
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none"
          />
        ) : (
          <h3
            onDoubleClick={() => setEditing(true)}
            className="min-w-0 flex-1 cursor-text break-words text-base font-semibold"
          >
            {habit.title}
          </h3>
        )}

        <div className="flex items-center gap-3">
          <select
            value={habit.weeklyTarget}
            onChange={(e) => setHabitWeeklyTarget(habit.id, Number(e.target.value))}
            aria-label="Hedef"
            className="rounded-full border border-line bg-transparent px-2.5 py-1.5 text-[11px] font-semibold outline-none"
          >
            <option value={7}>Her gün</option>
            {[6, 5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                Haftada {n} gün
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => toggleHabitLog(habit.id, today)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              doneToday ? "bg-primary text-on-primary" : "border border-line text-primary hover:bg-card-hover"
            }`}
          >
            {doneToday ? "✓ Bugün yapıldı" : "Bugünü işaretle"}
          </button>
          <button type="button" onClick={archive} aria-label="Arşivle" title="Arşivle" className={iconButton}>
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M2 4h12v3H2zM3 7v6h10V7M6.5 10h3" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => deleteHabitWithUndo(habit.id)}
            aria-label="Zinciri sil"
            title="Sil"
            className={iconButton}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-x-8 gap-y-3">
        <Stat label="Güncel seri" value={`${stats.currentStreak} ${stats.streakUnit}`} />
        <Stat label="En uzun seri" value={`${stats.longestStreak} ${stats.streakUnit}`} />
        <Stat label="Tamamlanma" value={`%${stats.rate}`} />
        <Stat label="Yapılan gün" value={String(stats.doneInRange)} />
      </div>

      <Heatmap
        weeks={weeks}
        startKey={startKey}
        today={today}
        level={(day) => (days.done.has(day) ? 1 : 0)}
        isSkip={(day) => days.skip.has(day)}
        onToggle={(day) => cycleHabitLog(habit.id, day)}
      />
      <p className="mt-1 text-[10px] text-muted">
        Hücreye tıkla: yapıldı → izin günü (çizgili, seriyi bozmaz) → boş.
      </p>
    </section>
  );
}
