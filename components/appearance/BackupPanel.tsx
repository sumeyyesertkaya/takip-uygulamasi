"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { BackupError, downloadBackup, restoreBackup } from "@/lib/backup";
import { useLastBackupAt } from "@/lib/backupStatus";
import { PanelShell, SectionLabel } from "./controls";

type Message = { kind: "ok" | "error"; text: string };

export function BackupPanel({ onClose }: { onClose: () => void }) {
  const lastBackupAt = useLastBackupAt();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setBusy(true);
    try {
      await downloadBackup();
      setMessage({ kind: "ok", text: "Yedek indirildi." });
    } catch {
      setMessage({ kind: "error", text: "Yedek alınamadı." });
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!window.confirm("Mevcut tüm veriler, yedekteki verilerle değiştirilecek. Devam edilsin mi?")) return;
    setBusy(true);
    try {
      const summary = await restoreBackup(file);
      setMessage({
        kind: "ok",
        text: `Geri yüklendi: ${summary.tasks} görev, ${summary.habits} zincir, ${summary.sessions} çalışma günü.`,
      });
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof BackupError ? error.message : "Yedek geri yüklenemedi, mevcut veriler değişmedi.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelShell title="Yedeği al / yükle" onClose={onClose}>
      <p className="text-xs leading-relaxed text-muted">
        Görevlerin, zincirlerin, çalışma sürelerin ve görünüm ayarların yalnızca bu tarayıcıda saklanır. Tarayıcı
        verilerini temizlersen ya da başka bir adresten açarsan gider. Düzenli yedek al.
      </p>

      <SectionLabel>Son yedek</SectionLabel>
      <p className="text-xs font-medium">
        {lastBackupAt
          ? format(new Date(lastBackupAt), "d MMMM yyyy, HH:mm", { locale: tr })
          : "Henüz yedek alınmadı"}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={handleDownload}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          Yedeği indir
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-line px-4 py-2 text-xs font-semibold transition-colors hover:bg-card-hover disabled:opacity-50"
        >
          Yedekten geri yükle
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {message && (
        <p className={`mt-3 text-xs ${message.kind === "error" ? "text-primary" : "text-muted"}`}>
          {message.kind === "error" ? "⚠ " : "✓ "}
          {message.text}
        </p>
      )}
    </PanelShell>
  );
}
