"use client";

import { useEffect, useRef, useState } from "react";
import { FlipDigits } from "@/components/ui/flip-countdown";
import { toDateKey } from "@/lib/dates";
import { useDayTasks } from "@/lib/db/hooks";
import {
  elapsedMs,
  finishSession,
  resetTimer,
  restartScene,
  rolloverSession,
  setCollapsed,
  setPosition,
  startWork,
  takeBreak,
  useNowSecond,
  useSession,
  type SessionStatus,
} from "@/lib/session";
import { ClimbScene } from "./ClimbScene";

function getMessage(
  status: SessionStatus,
  ratio: number,
  total: number,
  night: boolean,
  slow: boolean,
): string {
  if (status === "finished") return "Küçük küçük, zirveye";
  if (status === "break") return "Mola da ilerlemedir";
  if (slow) return "Yavaş ilerlemek de olur";
  if (night) return "Küçük bir ilerleme de ilerlemedir";
  if (total > 0 && ratio >= 1) return "Hepsi tamam! Zirve için Bitti'ye bas";
  if (ratio === 0) return "Bugün yeni bir başlangıç";
  if (ratio < 0.4) return "Küçük bir adım";
  if (ratio < 0.6) return "Yoldasın";
  if (ratio < 0.8) return "Devam et";
  return "Neredeyse oradasın";
}

const primaryBtn =
  "rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-on-primary transition-opacity hover:opacity-85";
const ghostBtn =
  "rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold transition-colors hover:bg-card-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

const FLIP_SIZE = {
  "--flip-w": "1.35rem",
  "--flip-h": "1.9rem",
  "--flip-font": "0.95rem",
  "--flip-gap": "0.15rem",
} as React.CSSProperties;

// Bir saati geçince 6 hane sığsın diye kartlar biraz küçülür
const FLIP_SIZE_LONG = {
  "--flip-w": "1.1rem",
  "--flip-h": "1.65rem",
  "--flip-font": "0.8rem",
  "--flip-gap": "0.12rem",
} as React.CSSProperties;

/** Geçen çalışma süresini flip kartlarla gösterir; her saniye bir kart döner. */
function FlipClock({ elapsedMs }: { elapsedMs: number }) {
  const total = Math.floor(elapsedMs / 1000);
  const h = Math.floor(total / 3600);
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  const label = h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;

  return (
    <div
      className="flex items-center gap-1"
      style={h > 0 ? FLIP_SIZE_LONG : FLIP_SIZE}
      role="timer"
      aria-label={`Çalışma süresi ${label}`}
    >
      {h > 0 && (
        <>
          <FlipDigits value={String(h)} />
          <span className="text-xs font-bold text-muted">:</span>
        </>
      )}
      <FlipDigits value={mm} />
      <span className="text-xs font-bold text-muted">:</span>
      <FlipDigits value={ss} />
    </div>
  );
}

type Point = { x: number; y: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

/** İçeriğini sayfada sürüklenebilir yapan sabit konumlu çerçeve. Konum kaydedilir. */
function DraggableFrame({ position, children }: { position: Point | null; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number; active: boolean } | null>(null);
  const liveRef = useRef<Point | null>(null);
  const suppressClick = useRef(false);
  const [live, setLive] = useState<Point | null>(null);
  const pos = live ?? position;

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0 || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      active: false,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el) return;
    if (!d.active) {
      // Küçük hareketler tıklama sayılır; düğmeler normal çalışır.
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 5) return;
      d.active = true;
      el.setPointerCapture(e.pointerId);
    }
    const rect = el.getBoundingClientRect();
    const next = {
      x: clamp(e.clientX - d.offsetX, 0, window.innerWidth - rect.width),
      y: clamp(e.clientY - d.offsetY, 0, window.innerHeight - rect.height),
    };
    liveRef.current = next;
    setLive(next);
  }

  function endDrag() {
    const d = drag.current;
    drag.current = null;
    if (!d?.active) return;
    suppressClick.current = true;
    setTimeout(() => {
      suppressClick.current = false;
    }, 0);
    if (liveRef.current) setPosition(liveRef.current);
    liveRef.current = null;
    setLive(null);
  }

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      title="Sürükleyerek taşıyabilirsin"
      style={
        pos
          ? { left: `min(${pos.x}px, calc(100vw - 3rem))`, top: `min(${pos.y}px, calc(100vh - 3rem))` }
          : { left: 16, bottom: 16 }
      }
      className="fixed z-40 hidden cursor-grab touch-none select-none active:cursor-grabbing md:block"
    >
      {children}
    </div>
  );
}

export function ClimbWidget() {
  const now = useNowSecond();
  const session = useSession();
  const today = now ? toDateKey(new Date(now)) : "";
  const tasks = useDayTasks(today);

  useEffect(() => {
    if (today) rolloverSession();
  }, [today]);

  const elapsed = elapsedMs(session, now);

  // Sunucuda ve hydration sırasında çizilmez; zaman ve kayıtlı oturum yalnızca istemcide bilinir.
  if (!now) return null;

  // Küçültülünce düğme her zaman sol altta sabit durur (kartın sürüklendiği yerde kalmaz)
  if (session.collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        aria-label="Tırmanış sahnesini aç"
        className="fixed bottom-4 left-4 z-40 hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-foreground shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 md:flex"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M3 19 10 8l4 6 2-3 5 8Z" />
        </svg>
      </button>
    );
  }

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const ratio = total ? done / total : 0;
  const allDone = total === 0 || done === total;

  const hour = new Date(now).getHours();
  const night = hour >= 21 || hour < 5;
  const slow = session.status !== "finished" && total > 0 && hour >= 15 && ratio < 0.3;

  const { status } = session;

  return (
    <DraggableFrame position={session.position}>
    <div className="relative w-44 overflow-hidden rounded-2xl border border-line bg-surface text-foreground shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]">
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        aria-label="Küçült"
        className="absolute right-1.5 top-1.5 z-10 text-muted transition-colors hover:text-primary"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
        </svg>
      </button>

      <ClimbScene
        progress={ratio}
        walking={status === "working"}
        resting={status === "break"}
        summit={status === "finished"}
        night={night && status !== "finished"}
        rain={slow && status !== "break"}
      />

      <div className="flex flex-col gap-2 border-t border-line p-2.5">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-medium leading-tight">{getMessage(status, ratio, total, night, slow)}</p>
          <FlipClock elapsedMs={elapsed} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {status === "idle" && (
            <button type="button" onClick={startWork} className={primaryBtn}>
              {elapsed > 0 ? "Devam et" : "Çalış"}
            </button>
          )}
          {status === "working" && (
            <button type="button" onClick={takeBreak} className={ghostBtn}>
              Mola
            </button>
          )}
          {status === "break" && (
            <button type="button" onClick={startWork} className={primaryBtn}>
              Çalış
            </button>
          )}
          {(status === "working" || status === "break") && (
            <button
              type="button"
              onClick={finishSession}
              disabled={!allDone}
              title={allDone ? "Günü bitir" : "Önce bugünün tüm görevlerini tamamla"}
              className={status === "working" ? `${primaryBtn} disabled:opacity-40` : ghostBtn}
            >
              Bitti
            </button>
          )}
          {status === "finished" && (
            <button type="button" onClick={restartScene} className={ghostBtn}>
              Yeniden başla
            </button>
          )}
          <span className="ml-auto flex items-center gap-1.5">
            {(elapsed > 0 || status !== "idle") && (
              <button
                type="button"
                onClick={resetTimer}
                aria-label="Süreyi sıfırla"
                title="Süreyi sıfırla (geri alınabilir)"
                className="text-muted transition-colors hover:text-primary"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8" />
                </svg>
              </button>
            )}
            <span className="text-[10px] text-muted">
              {done}/{total}
            </span>
          </span>
        </div>
      </div>
    </div>
    </DraggableFrame>
  );
}
