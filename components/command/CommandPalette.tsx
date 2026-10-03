"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { downloadBackup } from "@/lib/backup";
import { todayKey } from "@/lib/dates";
import { useTaskSearch } from "@/lib/db/hooks";
import { addTask } from "@/lib/db/tasks";
import { toggleThemeMode } from "@/lib/themeMode";
import { requestDate } from "@/lib/weekNav";

type Command = {
  id: string;
  label: string;
  hint?: string;
  run: () => void | Promise<void>;
};

export const OPEN_PALETTE_EVENT = "open-command-palette";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const matches = useTaskSearch(open ? query : "");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuery("");
        setActive(0);
        setOpen((value) => !value);
      }
    }
    function onOpen() {
      setQuery("");
      setActive(0);
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const q = query.trim();
    const list: Command[] = [];

    if (q) {
      list.push(
        { id: "add-today", label: `Görev ekle: “${q}”`, hint: "Bugüne", run: () => addTask(q, todayKey()) },
        { id: "add-inbox", label: `Görev ekle: “${q}”`, hint: "Görevler", run: () => addTask(q, null) },
      );
      for (const task of matches) {
        list.push({
          id: `task-${task.id}`,
          label: task.title,
          hint: task.date ? task.date.split("-").reverse().join(".") : "Görevler",
          run: () => {
            if (task.date) {
              requestDate(task.date);
              if (pathname !== "/") router.push("/");
            } else {
              router.push("/gelen-kutusu");
            }
          },
        });
      }
    }

    const pages: Command[] = [
      { id: "go-week", label: "Hafta", hint: "Sayfa", run: () => router.push("/") },
      { id: "go-inbox", label: "Görevler", hint: "Sayfa", run: () => router.push("/gelen-kutusu") },
      { id: "go-chain", label: "Zinciri Kırma", hint: "Sayfa", run: () => router.push("/zincir") },
      { id: "go-stats", label: "İstatistik", hint: "Sayfa", run: () => router.push("/istatistik") },
      { id: "backup", label: "Yedeği indir", hint: "Veri", run: () => downloadBackup() },
      { id: "theme", label: "Gece / gündüz modunu değiştir", hint: "Görünüm", run: () => void toggleThemeMode() },
    ];
    const needle = q.toLocaleLowerCase("tr");
    return [...list, ...pages.filter((c) => !needle || c.label.toLocaleLowerCase("tr").includes(needle))];
  }, [query, matches, pathname, router]);

  if (!open) return null;

  function close() {
    setOpen(false);
  }

  async function runCommand(command: Command | undefined) {
    if (!command) return;
    close();
    await command.run();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 px-4 pt-[15vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-label="Komut paleti"
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-surface text-foreground shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, commands.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            }
            if (e.key === "Enter") runCommand(commands[active]);
          }}
          placeholder="Görev ara, görev ekle ya da sayfaya git…"
          className="w-full border-b border-line bg-transparent px-5 py-4 text-base outline-none md:text-sm placeholder:text-muted"
        />
        <ul className="max-h-80 overflow-y-auto p-2">
          {commands.map((command, i) => (
            <li key={command.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => runCommand(command)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                  i === active ? "bg-card-hover" : ""
                }`}
              >
                <span className="min-w-0 truncate">{command.label}</span>
                {command.hint && <span className="shrink-0 text-[11px] text-muted">{command.hint}</span>}
              </button>
            </li>
          ))}
          {commands.length === 0 && <li className="px-3 py-4 text-xs text-muted">Sonuç yok.</li>}
        </ul>
      </div>
    </div>
  );
}
