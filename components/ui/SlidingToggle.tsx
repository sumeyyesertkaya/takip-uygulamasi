"use client";

type SlidingToggleProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Seçili pill'in sekmeler arasında kaydığı segmentli düğme. */
export function SlidingToggle<T extends string>({ options, value, onChange, className }: SlidingToggleProps<T>) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div
      role="tablist"
      className={`relative inline-grid rounded-full bg-card p-1 ${className ?? ""}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(3.5rem, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute bottom-1 left-1 top-1 rounded-full bg-primary transition-transform duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={`relative z-10 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-300 ${
            option.value === value ? "text-on-primary" : "text-muted hover:text-primary"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
