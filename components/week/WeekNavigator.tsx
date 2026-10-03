import { formatWeekRange } from "@/lib/dates";

type WeekNavigatorProps = {
  weekStartKey: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

const pill =
  "rounded-full bg-surface px-3 py-2 text-xs font-semibold transition-colors hover:bg-card-hover";

export function WeekNavigator({ weekStartKey, onPrev, onNext, onToday }: WeekNavigatorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={onPrev} aria-label="Önceki hafta" className={pill}>
        ‹
      </button>
      <span className="min-w-44 rounded-full bg-primary px-4 py-2 text-center text-xs font-semibold text-on-primary">
        {formatWeekRange(weekStartKey)}
      </span>
      <button type="button" onClick={onNext} aria-label="Sonraki hafta" className={pill}>
        ›
      </button>
      <button type="button" onClick={onToday} className={pill}>
        Bugün
      </button>
    </div>
  );
}
