"use client";

import { useEffect, useState } from "react";
import { addDaysKey } from "@/lib/dates";
import { RollingNumber } from "@/components/ui/RollingNumber";
import type { HabitRow } from "@/lib/stats";
import { buildWeeks, EMPTY_DAYS, type HabitDays } from "@/lib/streaks";
import { Heatmap } from "@/components/chain/Heatmap";

function Row({ row, days, today }: { row: HabitRow; days: HabitDays; today: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Küçük harita her zaman son 12 hafta
  const miniStart = addDaysKey(today, -83);

  return (
    <li className="grid items-center gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{row.habit.title}</div>
        <div className="text-[11px] text-muted">
          Seri: {row.currentStreak} {row.streakUnit}
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: ready ? `${row.rate}%` : "0%" }}
        />
      </div>
      <div className="flex items-baseline justify-end gap-0.5 sm:w-14">
        <RollingNumber value={String(row.rate)} className="text-lg font-semibold" />
        <span className="text-xs text-muted">%</span>
      </div>
      <div className="sm:col-span-3">
        <Heatmap weeks={buildWeeks(miniStart, today)} startKey={miniStart} today={today} level={(d) => (days.done.has(d) ? 1 : 0)} isSkip={(d) => days.skip.has(d)} />
      </div>
    </li>
  );
}

export function HabitRows({
  rows,
  habitDays,
  today,
}: {
  rows: HabitRow[];
  habitDays: Record<string, HabitDays>;
  today: string;
}) {
  if (rows.length === 0) {
    return <p className="py-4 text-center text-xs text-muted">Henüz zincir yok. Zinciri Kırma sayfasından ekleyebilirsin.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <Row key={row.habit.id} row={row} days={habitDays[row.habit.id] ?? EMPTY_DAYS} today={today} />
      ))}
    </ul>
  );
}
