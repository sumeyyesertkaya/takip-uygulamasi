"use client";

export function PanelShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed bottom-24 right-6 z-50 max-h-[75vh] w-80 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-3xl border border-line bg-surface p-5 text-foreground shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="text-muted transition-colors hover:text-primary"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide text-muted">{children}</div>;
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  suffix = "%",
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  suffix?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className={`block ${disabled ? "opacity-40" : ""}`}>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer accent-[var(--primary)]"
      />
    </label>
  );
}

export function ColorField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`flex items-center justify-between gap-3 text-xs ${disabled ? "opacity-40" : ""}`}>
      <span className="font-medium">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase text-muted">{value}</span>
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded-full border border-line bg-transparent p-0"
        />
      </span>
    </label>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  disabled,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === option.value
              ? "bg-primary text-on-primary"
              : "bg-card text-muted hover:bg-card-hover hover:text-primary"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
