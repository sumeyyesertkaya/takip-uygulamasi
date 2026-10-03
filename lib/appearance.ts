"use client";

import { useSyncExternalStore } from "react";
import { buildCss, DEFAULT_APPEARANCE, type Appearance } from "./theme";

const KEY = "appearance";
const CSS_KEY = "appearanceCss";
const STYLE_ID = "appearance-css";

let state: Appearance = DEFAULT_APPEARANCE;
let loaded = false;
const listeners = new Set<() => void>();

function mergeSaved(saved: Partial<Appearance>): Appearance {
  // Eski varsayılanda panel ve kart ikisi de beyazdı; kutular ayrışsın diye kartı yeni varsayılana al
  const oldAllWhite = saved.light?.card === "#ffffff" && saved.light?.surface === "#ffffff";
  return {
    ...DEFAULT_APPEARANCE,
    ...saved,
    light: {
      ...DEFAULT_APPEARANCE.light,
      ...saved.light,
      ...(oldAllWhite ? { card: DEFAULT_APPEARANCE.light.card } : {}),
    },
    dark: { ...DEFAULT_APPEARANCE.dark, ...saved.dark },
  };
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = mergeSaved(JSON.parse(raw) as Partial<Appearance>);
  } catch {
    // bozuk kayıt: varsayılanlara dön
  }
}

export function getAppearance(): Appearance {
  load();
  return state;
}

/** Yedekten gelen (eksik olabilecek) ayarları uygular. */
export function restoreAppearance(saved: Partial<Appearance>) {
  setAppearance(() => mergeSaved(saved));
}

function applyStyle(css: string) {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

export function setAppearance(update: (current: Appearance) => Appearance) {
  load();
  state = update(state);
  const css = buildCss(state);
  applyStyle(css);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.setItem(CSS_KEY, css);
  } catch {
    // depolama kapalıysa ayar yalnızca bu oturumda geçerli olur
  }
  listeners.forEach((l) => l());
}

/**
 * Kayıtlı ayarlardan CSS'i yeniden üretir. Açılışta çağrılır: renk kuralları güncellendiğinde
 * (ör. okunabilirlik düzeltmesi) eski kayıtlı CSS'in ekranda kalmasını önler.
 */
export function refreshAppearanceCss() {
  load();
  const css = buildCss(state);
  applyStyle(css);
  try {
    localStorage.setItem(CSS_KEY, css);
  } catch {
    // depolama kapalıysa yalnızca bu oturumda uygulanır
  }
}

export function resetAppearance() {
  setAppearance(() => DEFAULT_APPEARANCE);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Appearance {
  load();
  return state;
}

export function useAppearance(): Appearance {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_APPEARANCE);
}

/** Sayfa çizilmeden önce kayıtlı CSS'i uygulayan satır içi betik (layout'ta kullanılır). */
export const appearanceBootScript = `try{var c=localStorage.getItem("${CSS_KEY}");if(c){var s=document.createElement("style");s.id="${STYLE_ID}";s.textContent=c;document.head.appendChild(s)}}catch(e){}`;
