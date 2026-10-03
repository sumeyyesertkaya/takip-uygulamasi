import type { Task } from "@/lib/db";
import { formatDayName, formatDayNumber, isSunday } from "@/lib/dates";
import { TaskInput } from "@/components/task/TaskInput";
import { TaskList } from "@/components/task/TaskList";

type DayColumnProps = {
  dateKey: string;
  isToday: boolean;
  tasks: Task[];
};

export function DayColumn({ dateKey, isToday, tasks }: DayColumnProps) {
  const dim = isSunday(dateKey) && !isToday;

  return (
    <section
      className={`flex min-w-0 flex-col gap-3 rounded-3xl bg-card p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.15)] ${
        isToday ? "ring-1 ring-primary/50" : ""
      }`}
    >
      <header className={`flex flex-col items-center gap-1 pb-1 pt-1.5 text-center ${dim ? "opacity-60" : ""}`}>
        <h3 className={`text-sm font-semibold capitalize ${isToday ? "text-primary" : ""}`}>
          {formatDayName(dateKey)}
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            isToday ? "bg-primary text-on-primary" : "text-muted"
          }`}
        >
          {formatDayNumber(dateKey)}
        </span>
      </header>

      <TaskList containerId={dateKey} tasks={tasks} surface>
        <TaskInput date={dateKey} />
      </TaskList>
    </section>
  );
}
