"use client";

import { useEffect, useRef } from "react";
import { formatLongDate, formatMonthShort, monthOf } from "@/lib/dates";

const CELL = 13;
const GAP = 3;
const DAY_LABELS = ["Pzt", "", "Çar", "", "Cum", "", ""];

type HeatmapProps = {
  weeks: string[][];
  startKey: string;
  today: string;
  /** 0 (yapılmadı) ile 1 (tamamı yapıldı) arası değer */
  level: (dateKey: string) => number;
  /** İzin günü olan hücreler çizgili gösterilir */
  isSkip?: (dateKey: string) => boolean;
  onToggle?: (dateKey: string) => void;
};

export function Heatmap({ weeks, startKey, today, level, isSkip, onToggle }: HeatmapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [weeks.length]);

  const monthLabels = weeks.map((week, i) => {
    const first = week[0] < startKey ? startKey : week[0];
    if (i === 0) {
      const next = weeks[1]?.[0];
      return next && monthOf(next) !== monthOf(first) ? "" : formatMonthShort(first);
    }
    return monthOf(weeks[i - 1][0]) !== monthOf(first) ? formatMonthShort(first) : "";
  });

  return (
    <div ref={scrollRef} className="overflow-x-auto pb-2">
      <div className="inline-flex gap-2">
        <div
          className="grid pt-4 text-[10px] text-muted"
          style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, rowGap: GAP }}
        >
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="leading-[13px]">
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-col" style={{ gap: GAP }}>
          <div
            className="grid h-3 text-[10px] text-muted"
            style={{ gridAutoFlow: "column", gridAutoColumns: CELL, columnGap: GAP }}
          >
            {monthLabels.map((label, i) => (
              <span key={i} className="overflow-visible whitespace-nowrap leading-3">
                {label}
              </span>
            ))}
          </div>

          <div
            className="grid"
            style={{
              gridAutoFlow: "column",
              gridTemplateRows: `repeat(7, ${CELL}px)`,
              gridAutoColumns: CELL,
              gap: GAP,
            }}
          >
            {weeks.flat().map((day) => {
              if (day < startKey) return <span key={day} />;
              const future = day > today;
              const value = future ? 0 : level(day);
              const ring = day === today ? "outline outline-1 outline-offset-1 outline-primary/50" : "";
              const color = value > 0 ? "" : future ? "bg-line/40" : "bg-line";
              const skipped = !future && value === 0 && isSkip?.(day) === true;
              const style = skipped
                ? {
                    backgroundImage:
                      "repeating-linear-gradient(135deg, var(--muted) 0 1.5px, transparent 1.5px 4px)",
                  }
                : value > 0
                  ? { backgroundColor: "var(--primary)", opacity: 0.25 + 0.75 * value }
                  : undefined;
              const className = `rounded-[3px] ${color} ${ring}`;

              if (!onToggle || future) {
                return <span key={day} title={formatLongDate(day)} className={className} style={style} />;
              }
              return (
                <button
                  key={day}
                  type="button"
                  title={formatLongDate(day)}
                  aria-label={formatLongDate(day)}
                  onClick={() => onToggle(day)}
                  className={`${className} transition-transform hover:scale-125`}
                  style={style}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
