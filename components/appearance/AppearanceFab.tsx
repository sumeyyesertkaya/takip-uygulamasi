"use client";

import { useState } from "react";
import { resetAppearance } from "@/lib/appearance";
import { useBackgroundImage, useHasData } from "@/lib/db/hooks";
import { clearBackgroundImage } from "@/lib/db/settings";
import { isBackupStale, useLastBackupAt } from "@/lib/backupStatus";
import { useNowSecond } from "@/lib/session";
import { BackgroundPanel } from "./BackgroundPanel";
import { BackupPanel } from "./BackupPanel";
import { ColorsPanel } from "./ColorsPanel";

type Panel = "background" | "colors" | "backup" | null;

const itemClass =
  "w-full whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-card-hover";

export function AppearanceFab() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const image = useBackgroundImage();
  const hasData = useHasData();
  const lastBackupAt = useLastBackupAt();
  const now = useNowSecond();
  const needsBackup = hasData && now > 0 && isBackupStale(lastBackupAt, now);

  function openPanel(next: Panel) {
    setPanel(next);
    setMenuOpen(false);
  }

  function resetAll() {
    if (window.confirm("Renkler, saydamlık ve arka plan görseli varsayılana dönsün mü?")) {
      resetAppearance();
      clearBackgroundImage();
      setPanel(null);
      setMenuOpen(false);
    }
  }

  return (
    <>
      {panel === "background" && <BackgroundPanel image={image} onClose={() => setPanel(null)} />}
      {panel === "colors" && <ColorsPanel onClose={() => setPanel(null)} />}
      {panel === "backup" && <BackupPanel onClose={() => setPanel(null)} />}

      <div
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        {menuOpen && (
          <div className="absolute bottom-full right-0 pb-3">
            <div className="w-52 rounded-2xl border border-line bg-surface p-1.5 text-foreground shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]">
              <button type="button" className={itemClass} onClick={() => openPanel("background")}>
                Arka planı değiştir
              </button>
              <button type="button" className={itemClass} onClick={() => openPanel("colors")}>
                Renkleri değiştir
              </button>
              <button
                type="button"
                className={`${itemClass} flex items-center justify-between`}
                onClick={() => openPanel("backup")}
              >
                Yedeği al / yükle
                {needsBackup && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Yedek önerilir" />}
              </button>
              <button type="button" className={itemClass} onClick={resetAll}>
                Varsayılana dön
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Görünümü özelleştir"
          aria-expanded={menuOpen}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition-transform hover:scale-105"
        >
          <svg
            viewBox="0 0 16 16"
            className={`h-5 w-5 transition-transform ${menuOpen ? "rotate-45" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
          {needsBackup && (
            <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-surface bg-[#e5484d]" />
          )}
        </button>
      </div>
    </>
  );
}
