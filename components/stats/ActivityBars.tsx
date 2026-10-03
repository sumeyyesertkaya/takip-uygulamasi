"use client";

import { useEffect, useState } from "react";
import { formatShortDuration, type Bucket } from "@/lib/stats";

export type BarMetric = "seconds" | "tasks";

function Bar({ bucket, value, max, best }: { bucket: Bucket; value: number; max: number; best: boolean }) {
  const [ready, setReady] = useState(false);

  // Çubuk ilk çizimde sıfırdan büyüyerek gelir
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
      <div
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-primary px-2.5 py-1.5 text-[10px] font-semibold leading-snug text-on-primary opacity-0 transition-opacity group-hover:opacity-100"
        style={{ bottom: `${Math.max(pct, 3)}%` }}
      >
        <div className="capitalize">{bucket.fullLabel}</div>
        <div className="font-normal opacity-80">
          {formatShortDuration(bucket.seconds)} · {bucket.tasks} görev
        </div>
      </div>
      <div
        className={`w-full rounded-t-md transition-[height,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-primary ${
          best ? "bg-primary" : "bg-primary/30"
        }`}
        style={{ height: ready ? `max(${pct}%, 3px)` : "3px" }}
      />
    </div>
  );
}

export function ActivityBars({
  buckets,
  metric,
  bestKey,
}: {
  buckets: Bucket[];
  metric: BarMetric;
  bestKey: string | null;
}) {
  const valueOf = (b: Bucket) => b[metric];
  const max = Math.max(0, ...buckets.map(valueOf));
  const labelStep = buckets.length > 20 ? 5 : 1;

  return (
    <div>
      <div className={`flex h-44 items-end ${buckets.length > 12 ? "gap-[3px]" : "gap-2"}`}>
        {buckets.map((bucket) => (
          <Bar key={bucket.key} bucket={bucket} value={valueOf(bucket)} max={max} best={bucket.key === bestKey} />
        ))}
      </div>
      <div className={`mt-2 flex ${buckets.length > 12 ? "gap-[3px]" : "gap-2"}`}>
        {buckets.map((bucket, i) => (
          <div key={bucket.key} className="min-w-0 flex-1 text-center text-[10px] capitalize text-muted">
            {i % labelStep === 0 ? bucket.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
