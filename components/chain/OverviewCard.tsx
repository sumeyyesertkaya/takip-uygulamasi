import type { Habit } from "@/lib/db";
import { buildWeeks, type HabitDays } from "@/lib/streaks";
import { Heatmap } from "./Heatmap";

type OverviewCardProps = {
  habits: Habit[];
  days: Record<string, HabitDays>;
  startKey: string;
  today: string;
};

export function OverviewCard({ habits, days, startKey, today }: OverviewCardProps) {
  const weeks = buildWeeks(startKey, today);
  const doneToday = habits.filter((h) => days[h.id]?.done.has(today)).length;

  return (
    <section className="rounded-3xl bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.15)]">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Genel görünüm</h2>
        <span className="text-xs text-muted">
          Bugün {doneToday}/{habits.length} zincir tamamlandı
        </span>
      </div>
      <Heatmap
        weeks={weeks}
        startKey={startKey}
        today={today}
        level={(day) =>
          habits.length ? habits.filter((h) => days[h.id]?.done.has(day)).length / habits.length : 0
        }
      />
    </section>
  );
}
