"use client";

import { useEffect, useState } from "react";
import { getWeekDayKeys, getWeekStartKey, shiftWeek, todayKey } from "@/lib/dates";
import { consumePendingDate, onDateRequest } from "@/lib/weekNav";
import { useInboxTasks, useWeekTasks } from "@/lib/db/hooks";
import { DndBoard, INBOX_ID } from "@/components/task/DndBoard";
import { InboxPanel } from "@/components/inbox/InboxPanel";
import { AppShell } from "@/components/layout/AppShell";
import { ProgressPanel } from "@/components/layout/ProgressPanel";
import { WeekNavigator } from "@/components/week/WeekNavigator";
import { WeekView } from "@/components/week/WeekView";

export default function Home() {
  const [weekStartKey, setWeekStartKey] = useState(() =>
    getWeekStartKey(consumePendingDate() ?? todayKey()),
  );
  const dayKeys = getWeekDayKeys(weekStartKey);
  const tasksByDate = useWeekTasks(dayKeys);
  const inboxTasks = useInboxTasks();
  const containers = { ...tasksByDate, [INBOX_ID]: inboxTasks };

  // Komut paletinden bir tarihe atlama ve klavye kısayolları (←/→ hafta, T bugün)
  useEffect(() => {
    const stopRequests = onDateRequest((dateKey) => setWeekStartKey(getWeekStartKey(dateKey)));

    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.key === "ArrowLeft") setWeekStartKey((w) => shiftWeek(w, -1));
      else if (e.key === "ArrowRight") setWeekStartKey((w) => shiftWeek(w, 1));
      else if (e.key.toLowerCase() === "t") setWeekStartKey(getWeekStartKey(todayKey()));
    }
    window.addEventListener("keydown", onKey);
    return () => {
      stopRequests();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <DndBoard containers={containers}>
      <AppShell>
        <div className="flex flex-col">
          <main className="flex min-w-0 flex-1 flex-col gap-8 p-4 sm:p-8">
            <header id="week" className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold tracking-tight">Haftanı planla</h1>
              <WeekNavigator
                weekStartKey={weekStartKey}
                onPrev={() => setWeekStartKey((w) => shiftWeek(w, -1))}
                onNext={() => setWeekStartKey((w) => shiftWeek(w, 1))}
                onToday={() => setWeekStartKey(getWeekStartKey(todayKey()))}
              />
            </header>
            <WeekView dayKeys={dayKeys} tasksByDate={tasksByDate} />
          </main>
          <aside className="grid gap-4 px-4 pb-4 sm:px-8 sm:pb-8 md:grid-cols-2">
            <ProgressPanel dayKeys={dayKeys} tasksByDate={tasksByDate} />
            <InboxPanel tasks={inboxTasks} />
          </aside>
        </div>
      </AppShell>
    </DndBoard>
  );
}
