"use client";

import { useState } from "react";
import { todayKey } from "@/lib/dates";
import { useAllSessions, useAllTasks, useHabitDays, useHabits } from "@/lib/db/hooks";
import { computeOverview, formatHoursMinutes, STATS_RANGES, type StatsRange } from "@/lib/stats";
import { AppShell } from "@/components/layout/AppShell";
import { ActivityBars, type BarMetric } from "@/components/stats/ActivityBars";
import { CompletionRing } from "@/components/stats/CompletionRing";
import { HabitRows } from "@/components/stats/HabitRows";
import { StatCard } from "@/components/stats/StatCard";
import { SlidingToggle } from "@/components/ui/SlidingToggle";

const RANGE_OPTIONS = STATS_RANGES.map((r) => ({ value: r.key, label: r.label }));
const METRIC_OPTIONS: { value: BarMetric; label: string }[] = [
  { value: "seconds", label: "Süre" },
  { value: "tasks", label: "Görev" },
];

const RANGE_HINT: Record<StatsRange, string> = {
  week: "son 7 gün",
  month: "son 30 gün",
  year: "son 12 ay",
};

export default function StatsPage() {
  const [range, setRange] = useState<StatsRange>("week");
  const [metric, setMetric] = useState<BarMetric>("seconds");
  const sessions = useAllSessions();
  const tasks = useAllTasks();
  const habits = useHabits();
  const habitDays = useHabitDays();

  // Veri yüklenene kadar (sunucuda ve ilk istemci çiziminde) içerik çizilmez
  const ready = sessions !== undefined && tasks !== undefined && habits !== undefined && habitDays !== undefined;
  const today = ready ? todayKey() : "";
  const overview = ready ? computeOverview({ range, today, sessions, tasks, habits, habitDays }) : null;

  return (
    <AppShell>
      <main className="flex flex-col gap-8 p-6 sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">İstatistik</h1>
            <p className="mt-1 text-xs text-muted">Çalışma süren, görevlerin ve zincirlerin tek bakışta.</p>
          </div>
          <SlidingToggle options={RANGE_OPTIONS} value={range} onChange={setRange} />
        </header>

        {overview && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Çalışma süresi"
                value={formatHoursMinutes(overview.totalSeconds)}
                suffix="saat"
                hint={RANGE_HINT[range]}
              />
              <StatCard label="Tamamlanan görev" value={String(overview.tasksCompleted)} suffix="görev" hint={RANGE_HINT[range]} />
              <StatCard label="Aktif gün" value={String(overview.activeDays)} suffix="gün" hint="bir şey yaptığın günler" />
              <StatCard label="En uzun zincir serisi" value={String(overview.bestStreak)} suffix="gün" hint="her gün zincirlerinde" />
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="rounded-3xl bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.15)]">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">Günlük hareket</h2>
                  <SlidingToggle options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
                </div>
                <ActivityBars buckets={overview.buckets} metric={metric} bestKey={overview.bestBucketKey} />
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-3xl bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.15)]">
                <div>
                  <h2 className="text-sm font-semibold">Görev tamamlama</h2>
                  <p className="mt-1 text-[11px] text-muted">Bu dönemde planlanan görevlerden biten</p>
                </div>
                <CompletionRing percent={overview.completionRate} />
                <p className="text-center text-xs text-muted">
                  {overview.bestWeekday ? (
                    <>
                      En verimli günün <span className="font-semibold capitalize text-foreground">{overview.bestWeekday}</span>.
                    </>
                  ) : (
                    "Henüz yeterli veri yok. Tırmanış kartından Çalış'a basıp süre kaydetmeye başla."
                  )}
                </p>
              </div>
            </section>

            <section className="rounded-3xl bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.15)]">
              <h2 className="text-sm font-semibold">Zincirler</h2>
              <p className="mb-2 mt-1 text-[11px] text-muted">Tamamlanma oranı {RANGE_HINT[range]} için; harita son 12 hafta.</p>
              <HabitRows rows={overview.habitRows} habitDays={habitDays ?? {}} today={today} />
            </section>
          </>
        )}
      </main>
    </AppShell>
  );
}
