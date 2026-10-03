"use client";

import { useEffect, useRef } from "react";
import type { Task } from "@/lib/db";
import { todayKey } from "@/lib/dates";
import { DayColumn } from "./DayColumn";

type WeekViewProps = {
  dayKeys: string[];
  tasksByDate: Record<string, Task[]>;
};

export function WeekView({ dayKeys, tasksByDate }: WeekViewProps) {
  const today = todayKey();
  const scrollRef = useRef<HTMLDivElement>(null);
  const weekKey = dayKeys[0];

  // Dar ekranda bugünün sütunu görünür alana gelsin (yalnızca yatayda kaydırır)
  useEffect(() => {
    const todayEl = scrollRef.current?.querySelector<HTMLElement>("[data-today='true']");
    todayEl?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [weekKey]);

  return (
    <div ref={scrollRef} className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-1 px-1 pb-3 pt-1 md:snap-none">
      {dayKeys.map((key) => (
        <div key={key} className="flex min-w-[85%] flex-1 basis-[85%] snap-center flex-col md:min-w-56 md:basis-56" data-today={key === today}>
          <DayColumn dateKey={key} isToday={key === today} tasks={tasksByDate[key] ?? []} />
        </div>
      ))}
    </div>
  );
}
