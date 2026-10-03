import type { Task } from "@/lib/db";
import { formatDayName } from "@/lib/dates";

const BAR_COLORS = ["bg-bar-pink", "bg-bar-green", "bg-bar-blue"];

type ProgressPanelProps = {
  dayKeys: string[];
  tasksByDate: Record<string, Task[]>;
};

export function ProgressPanel({ dayKeys, tasksByDate }: ProgressPanelProps) {
  const rows = dayKeys.map((key, i) => {
    const tasks = tasksByDate[key] ?? [];
    return {
      key,
      total: tasks.length,
      done: tasks.filter((t) => t.completed).length,
      color: BAR_COLORS[i % BAR_COLORS.length],
    };
  });
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  const done = rows.reduce((sum, r) => sum + r.done, 0);

  return (
    <section className="rounded-3xl bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.15)]">
      <h2 className="mb-1 text-sm font-semibold">Haftalık İlerleme</h2>
      <p className="mb-5 text-xs text-muted">
        {done}/{total} görev tamamlandı
      </p>
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.key}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-medium capitalize">{formatDayName(row.key)}</span>
              <span className="text-muted">
                {row.done}/{row.total}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-line">
              <div
                className={`h-full rounded-full transition-all ${row.color}`}
                style={{ width: `${row.total ? (row.done / row.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
