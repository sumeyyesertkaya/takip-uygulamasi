"use client";

import { useEffect, useState } from "react";
import { RollingNumber } from "@/components/ui/RollingNumber";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Planlanan görevlerin tamamlanma oranı: dolum animasyonlu halka. */
export function CompletionRing({ percent }: { percent: number | null }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const value = percent ?? 0;
  const offset = CIRCUMFERENCE * (1 - (ready ? value : 0) / 100);

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`Tamamlanma %${value}`}>
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center gap-0.5">
        {percent === null ? (
          <span className="text-xs text-muted">Veri yok</span>
        ) : (
          <>
            <RollingNumber value={String(value)} className="text-3xl font-semibold" />
            <span className="text-sm font-medium text-muted">%</span>
          </>
        )}
      </div>
    </div>
  );
}
