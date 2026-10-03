"use client";

import { useInboxTasks } from "@/lib/db/hooks";
import { AppShell } from "@/components/layout/AppShell";
import { DndBoard, INBOX_ID } from "@/components/task/DndBoard";
import { TaskInput } from "@/components/task/TaskInput";
import { TaskList } from "@/components/task/TaskList";

export default function InboxPage() {
  const tasks = useInboxTasks();

  return (
    <DndBoard containers={{ [INBOX_ID]: tasks }}>
      <AppShell>
        <main className="flex flex-col gap-6 p-6 sm:p-8">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight">Görevler</h1>
            <p className="mt-1 text-xs text-muted">
              Tarihsiz görevler burada bekler. Haftalık görünümden bir güne sürükleyerek planlayabilirsin.
            </p>
          </header>
          <div className="max-w-xl">
            <TaskList containerId={INBOX_ID} tasks={tasks}>
              <TaskInput date={null} placeholder="+ Görev ekle" />
            </TaskList>
          </div>
        </main>
      </AppShell>
    </DndBoard>
  );
}
