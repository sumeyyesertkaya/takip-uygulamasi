"use client";

import { useSyncExternalStore } from "react";
import { addDays, parseISO } from "date-fns";
import { deleteWorkSession, saveWorkSession } from "./db/sessions";
import { todayKey } from "./dates";
import { pushUndo } from "./undo";

export type SessionStatus = "idle" | "working" | "break" | "finished";

export type SessionState = {
  day: string; // oturumun ait olduğu gün
  status: SessionStatus;
  accumulatedMs: number; // tamamlanan çalışma aralıklarının toplamı
  startedAt: number | null; // çalışıyorsa, geçerli aralığın başlangıcı
  collapsed: boolean;
  position: { x: number; y: number } | null; // null = varsayılan (sol alt)
};

const KEY = "workSession";

function fresh(day: string, keep?: Pick<SessionState, "collapsed" | "position">): SessionState {
  return {
    day,
    status: "idle",
    accumulatedMs: 0,
    startedAt: null,
    collapsed: keep?.collapsed ?? false,
    position: keep?.position ?? null,
  };
}

const EMPTY: SessionState = fresh("");

let state: SessionState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

/** Günün çalışma süresini kaydeder (gün başına tek kayıt, üzerine yazar). */
function persistSeconds(day: string, ms: number) {
  if (day && ms > 0) saveWorkSession(day, Math.round(ms / 1000));
}

/** Biten günün toplamı: çalışırken kapanmış bir oturum gün sonunda kesilir. */
function closedDayMs(prev: SessionState): number {
  if (prev.status === "working" && prev.startedAt) {
    const dayEnd = addDays(parseISO(prev.day), 1).getTime();
    return prev.accumulatedMs + Math.max(0, Math.min(Date.now(), dayEnd) - prev.startedAt);
  }
  return prev.accumulatedMs;
}

function startNewDay() {
  persistSeconds(state.day, closedDayMs(state));
  state = fresh(todayKey(), state);
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...(JSON.parse(raw) as Partial<SessionState>) };
  } catch {
    // bozuk kayıt: boş oturumla devam
  }
  if (state.day !== todayKey()) startNewDay();
}

function commit(next: SessionState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // depolama kapalıysa oturum yalnızca bu sayfada yaşar
  }
  listeners.forEach((l) => l());
}

export function elapsedMs(s: SessionState, now: number): number {
  // `now` saniyeye yuvarlanır, startedAt ise tam anı tutar; ilk karede fark eksi çıkmasın
  const running = s.status === "working" && s.startedAt ? Math.max(0, now - s.startedAt) : 0;
  return s.accumulatedMs + running;
}

function settled(s: SessionState): number {
  return elapsedMs(s, Date.now());
}

/** Gün değiştiyse oturumu başa sarar. */
export function rolloverSession() {
  load();
  if (state.day !== todayKey()) {
    startNewDay();
    commit(state);
  }
}

export function startWork() {
  rolloverSession();
  if (state.status === "working") return;
  commit({ ...state, status: "working", startedAt: Date.now() });
}

export function takeBreak() {
  if (state.status !== "working") return;
  const total = settled(state);
  commit({ ...state, status: "break", accumulatedMs: total, startedAt: null });
  persistSeconds(state.day, total);
}

export function finishSession() {
  if (state.status !== "working" && state.status !== "break") return;
  const total = settled(state);
  commit({ ...state, status: "finished", accumulatedMs: total, startedAt: null });
  persistSeconds(state.day, total);
}

/** Sahneyi başa alır; o günkü çalışma süresi korunur. */
export function restartScene() {
  commit({ ...state, status: "idle", startedAt: null });
}

/** Bugünkü süreyi sıfırlar (sahne de başa döner). "Geri al" süreyi ve durumu geri getirir. */
export function resetTimer() {
  const { day, status } = state;
  const total = settled(state);
  if (total === 0 && status === "idle") return;

  commit({ ...state, status: "idle", accumulatedMs: 0, startedAt: null });
  deleteWorkSession(day);

  pushUndo("Süre sıfırlandı", () => {
    if (state.day !== day) return; // gün değiştiyse eski süre bugüne geri yazılmaz
    // Çalışırken sıfırlandıysa süre geri alındığı andan itibaren devam eder
    commit({
      ...state,
      status,
      accumulatedMs: total,
      startedAt: status === "working" ? Date.now() : null,
    });
    if (status !== "working") persistSeconds(day, total);
  });
}

export function setPosition(position: { x: number; y: number }) {
  commit({ ...state, position });
}

export function setCollapsed(collapsed: boolean) {
  commit({ ...state, collapsed });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SessionState {
  load();
  return state;
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

function subscribeSecond(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

/** Saniyede bir değişen zaman damgası. Sunucuda 0 döner. */
export function useNowSecond(): number {
  return useSyncExternalStore(
    subscribeSecond,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => 0,
  );
}
