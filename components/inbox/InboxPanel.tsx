"use client";

import type { Task } from "@/lib/db";
import { INBOX_ID } from "@/components/task/DndBoard";
import { TaskInput } from "@/components/task/TaskInput";
import { TaskList } from "@/components/task/TaskList";

export function InboxPanel({ tasks }: { tasks: Task[] }) {
  return (
    <section id="inbox" className="rounded-3xl bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.15)]">
      <h2 className="mb-1 text-sm font-semibold">Görevler</h2>
      <p className="mb-4 text-xs text-muted">Tarihsiz görevler burada bekler.</p>
      <TaskList containerId={INBOX_ID} tasks={tasks} surface>
        <TaskInput date={null} placeholder="+ Görev ekle" />
      </TaskList>
    </section>
  );
}
