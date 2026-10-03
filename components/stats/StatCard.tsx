import { RollingNumber } from "@/components/ui/RollingNumber";

type StatCardProps = {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
};

export function StatCard({ label, value, suffix, hint }: StatCardProps) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.15)]">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <RollingNumber value={value} className="text-4xl font-semibold" />
        {suffix && <span className="text-xs font-medium text-muted">{suffix}</span>}
      </div>
      {hint && <div className="mt-2 text-[11px] text-muted">{hint}</div>}
    </div>
  );
}
