"use client";

import { useState } from "react";
import { setAppearance, useAppearance } from "@/lib/appearance";
import { DEFAULT_APPEARANCE, PALETTE_FIELDS, PRESETS, withReadableColors, type Palette } from "@/lib/theme";
import { ColorField, PanelShell, SectionLabel, Segmented, Slider } from "./controls";

type Mode = "light" | "dark";

export function ColorsPanel({ onClose }: { onClose: () => void }) {
  const appearance = useAppearance();
  const [mode, setMode] = useState<Mode>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const palette = appearance[mode];
  const effective = withReadableColors(palette);
  const autoAdjusted = effective.foreground !== palette.foreground || effective.primary !== palette.primary;

  function setColor(key: keyof Palette, value: string) {
    setAppearance((a) => ({ ...a, [mode]: { ...a[mode], [key]: value } }));
  }

  return (
    <PanelShell title="Renkleri değiştir" onClose={onClose}>
      <SectionLabel>Hazır paletler</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => setAppearance((a) => ({ ...a, light: preset.light, dark: preset.dark }))}
            className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-card-hover"
          >
            <span
              className="h-3 w-3 rounded-full border border-line"
              style={{ backgroundColor: preset[mode].primary }}
            />
            {preset.name}
          </button>
        ))}
      </div>

      <SectionLabel>Düzenlenen mod</SectionLabel>
      <Segmented<Mode>
        options={[
          { value: "light", label: "Gündüz" },
          { value: "dark", label: "Gece" },
        ]}
        value={mode}
        onChange={setMode}
      />

      <SectionLabel>Renkler</SectionLabel>
      <p className="mb-3 text-[11px] leading-relaxed text-muted">
        {autoAdjusted
          ? "Seçtiğin zeminde okunmadığı için yazı ve/veya vurgu rengi otomatik olarak açık ya da koyu yapıldı."
          : "Yazı ve vurgu rengi zeminde okunmazsa otomatik olarak açık ya da koyu yapılır."}
      </p>
      <div className="flex flex-col gap-3">
        {PALETTE_FIELDS.map((field) => (
          <ColorField
            key={field.key}
            label={field.label}
            value={palette[field.key]}
            onChange={(value) => setColor(field.key, value)}
          />
        ))}
      </div>

      <SectionLabel>Saydamlık</SectionLabel>
      <div className="flex flex-col gap-3">
        <Slider
          label="Panel opaklığı"
          value={appearance.panelOpacity}
          onChange={(panelOpacity) => setAppearance((a) => ({ ...a, panelOpacity }))}
        />
        <Slider
          label="Kart opaklığı"
          value={appearance.cardOpacity}
          onChange={(cardOpacity) => setAppearance((a) => ({ ...a, cardOpacity }))}
        />
        <Slider
          label="Panel bulanıklığı"
          value={appearance.panelBlur}
          max={32}
          suffix=" px"
          onChange={(panelBlur) => setAppearance((a) => ({ ...a, panelBlur }))}
        />
      </div>

      <button
        type="button"
        onClick={() =>
          setAppearance((a) => ({
            ...a,
            light: DEFAULT_APPEARANCE.light,
            dark: DEFAULT_APPEARANCE.dark,
            panelOpacity: DEFAULT_APPEARANCE.panelOpacity,
            cardOpacity: DEFAULT_APPEARANCE.cardOpacity,
            panelBlur: DEFAULT_APPEARANCE.panelBlur,
          }))
        }
        className="mt-5 w-full rounded-full border border-line px-4 py-2 text-xs font-semibold transition-colors hover:bg-card-hover"
      >
        Renkleri sıfırla
      </button>
    </PanelShell>
  );
}
