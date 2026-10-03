"use client";

import { useRef, useState } from "react";
import { setAppearance, useAppearance } from "@/lib/appearance";
import { clearBackgroundImage, saveBackgroundImage } from "@/lib/db/settings";
import { fileToBackgroundDataUrl } from "@/lib/image";
import type { BgFit, BgPosition } from "@/lib/theme";
import { ColorField, PanelShell, SectionLabel, Segmented, Slider } from "./controls";

const FIT_OPTIONS: { value: BgFit; label: string }[] = [
  { value: "cover", label: "Kapla" },
  { value: "contain", label: "Sığdır" },
  { value: "center", label: "Ortala" },
  { value: "tile", label: "Döşe" },
];

const POSITION_OPTIONS: { value: BgPosition; label: string }[] = [
  { value: "center", label: "Orta" },
  { value: "top", label: "Üst" },
  { value: "bottom", label: "Alt" },
  { value: "left", label: "Sol" },
  { value: "right", label: "Sağ" },
];

type BackgroundPanelProps = {
  image: string | null | undefined;
  onClose: () => void;
};

export function BackgroundPanel({ image, onClose }: BackgroundPanelProps) {
  const appearance = useAppearance();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const hasImage = Boolean(image);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      await saveBackgroundImage(await fileToBackgroundDataUrl(file));
    } catch {
      setError("Bu dosya görsel olarak açılamadı.");
    }
  }

  return (
    <PanelShell title="Arka planı değiştir" onClose={onClose}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="Arka plan önizleme" className="mb-3 h-24 w-full rounded-2xl object-cover" />
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary transition-opacity hover:opacity-85"
        >
          {hasImage ? "Başka görsel seç" : "Bilgisayardan görsel seç"}
        </button>
        {hasImage && (
          <button
            type="button"
            onClick={() => clearBackgroundImage()}
            className="rounded-full border border-line px-4 py-2 text-xs font-semibold transition-colors hover:bg-card-hover"
          >
            Kaldır
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-primary">{error}</p>}

      <SectionLabel>Yerleşim</SectionLabel>
      <Segmented
        options={FIT_OPTIONS}
        value={appearance.bgFit}
        disabled={!hasImage}
        onChange={(bgFit) => setAppearance((a) => ({ ...a, bgFit }))}
      />

      <SectionLabel>Konum</SectionLabel>
      <Segmented
        options={POSITION_OPTIONS}
        value={appearance.bgPosition}
        disabled={!hasImage || appearance.bgFit === "tile"}
        onChange={(bgPosition) => setAppearance((a) => ({ ...a, bgPosition }))}
      />

      <SectionLabel>Renk katmanı</SectionLabel>
      <div className="flex flex-col gap-3">
        <ColorField
          label="Katman rengi"
          value={appearance.overlayColor}
          disabled={!hasImage}
          onChange={(overlayColor) => setAppearance((a) => ({ ...a, overlayColor }))}
        />
        <Slider
          label="Katman opaklığı"
          value={appearance.overlayOpacity}
          disabled={!hasImage}
          onChange={(overlayOpacity) => setAppearance((a) => ({ ...a, overlayOpacity }))}
        />
      </div>

      {!hasImage && (
        <p className="mt-4 text-[11px] text-muted">Yerleşim ve renk katmanı, görsel seçince etkinleşir.</p>
      )}
    </PanelShell>
  );
}
