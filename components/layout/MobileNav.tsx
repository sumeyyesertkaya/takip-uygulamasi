"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const OPEN_APPEARANCE_MENU_EVENT = "open-appearance-menu";

const icon = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONS = {
  home: (
    <svg {...icon}>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  ),
  tasks: (
    <svg {...icon}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" />
    </svg>
  ),
  chain: (
    <svg {...icon}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  ),
  stats: (
    <svg {...icon}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  settings: (
    <svg {...icon}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  ),
};

type NavItem =
  | { kind: "link"; href: string; label: string; icon: keyof typeof ICONS; match: (path: string) => boolean }
  | { kind: "action"; label: string; icon: keyof typeof ICONS; event: string };

const ITEMS: NavItem[] = [
  { kind: "link", href: "/", label: "Hafta", icon: "home", match: (p) => p === "/" },
  { kind: "link", href: "/gelen-kutusu", label: "Görevler", icon: "tasks", match: (p) => p.startsWith("/gelen-kutusu") },
  { kind: "link", href: "/zincir", label: "Zinciri Kırma", icon: "chain", match: (p) => p.startsWith("/zincir") },
  { kind: "link", href: "/istatistik", label: "İstatistik", icon: "stats", match: (p) => p.startsWith("/istatistik") },
  { kind: "action", label: "Görünüm ve yedek", icon: "settings", event: OPEN_APPEARANCE_MENU_EVENT },
];

const itemClass =
  "flex h-11 w-11 items-center justify-center rounded-full transition-colors active:scale-95";

/** Telefonda ekranın altında yüzen, hap şeklinde ikon çubuğu. Masaüstünde gizli. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Ana menü"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-surface px-2 py-1.5 text-foreground shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] md:hidden"
    >
      {ITEMS.map((item) =>
        item.kind === "link" ? (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={item.match(pathname) ? "page" : undefined}
            className={`${itemClass} ${item.match(pathname) ? "bg-primary text-on-primary" : "text-muted hover:text-primary"}`}
          >
            {ICONS[item.icon]}
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            onClick={() => window.dispatchEvent(new Event(item.event))}
            className={`${itemClass} text-muted hover:text-primary`}
          >
            {ICONS[item.icon]}
          </button>
        ),
      )}
    </nav>
  );
}
