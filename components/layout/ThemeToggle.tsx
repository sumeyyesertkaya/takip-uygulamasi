"use client";

import { useSyncExternalStore } from "react";
import { toggleThemeMode } from "@/lib/themeMode";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={toggleThemeMode}
      aria-label={dark ? "Gündüz moduna geç" : "Gece moduna geç"}
      title={dark ? "Gündüz modu" : "Gece modu"}
      className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-line text-sm transition-colors hover:bg-card-hover"
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
