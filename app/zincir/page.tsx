"use client";

import { useState } from "react";
import { todayKey } from "@/lib/dates";
import { useHabitDays, useHabits } from "@/lib/db/hooks";
import { EMPTY_DAYS, getRangeStartKey, type ChainRange } from "@/lib/streaks";
import { AppShell } from "@/components/layout/AppShell";
import { ArchivedHabits } from "@/components/chain/ArchivedHabits";
import { HabitCard } from "@/components/chain/HabitCard";
import { HabitInput } from "@/components/chain/HabitInput";
import { OverviewCard } from "@/components/chain/OverviewCard";
import { RangeSelector } from "@/components/chain/RangeSelector";

export default function ChainPage() {
  const [range, setRange] = useState<ChainRange>("3m");
  const habits = useHabits();
  const days = useHabitDays();

  // Veri yüklenene kadar (sunucuda ve ilk istemci çiziminde) içerik gösterilmez;
  // böylece bugünün tarihi hydration uyumsuzluğu yaratmaz.
  const ready = habits !== undefined && days !== undefined;
  const active = habits?.filter((h) => !h.archived) ?? [];
  const archived = habits?.filter((h) => h.archived) ?? [];
  const today = ready ? todayKey() : "";
  const startKey = ready ? getRangeStartKey(range, today) : "";

  return (
    <AppShell>
      <main className="flex flex-col gap-8 p-6 sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Zinciri Kırma</h1>
            <p className="mt-1 text-xs text-muted">
              Her gün yap, işaretle, zinciri uzat. Geçmiş günlere tıklayarak da işaretleyebilirsin.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <RangeSelector value={range} onChange={setRange} />
            {ready && <ArchivedHabits habits={archived} />}
          </div>
        </header>

        <HabitInput />

        {ready && active.length === 0 && archived.length === 0 && (
          <p className="rounded-3xl bg-card p-8 text-center text-sm text-muted">
            Henüz zincir yok. Yukarıdan ilk alışkanlığını ekle.
          </p>
        )}

        {ready && active.length > 0 && (
          <div className="flex flex-col gap-5">
            <OverviewCard habits={active} days={days} startKey={startKey} today={today} />
            {active.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                days={days[habit.id] ?? EMPTY_DAYS}
                startKey={startKey}
                today={today}
              />
            ))}
          </div>
        )}

      </main>
    </AppShell>
  );
}
