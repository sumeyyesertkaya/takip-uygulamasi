"use client";

import { useEffect } from "react";
import { refreshAppearanceCss, useAppearance } from "@/lib/appearance";
import { useBackgroundImage } from "@/lib/db/hooks";
import type { BgFit, BgPosition } from "@/lib/theme";

const POSITION: Record<BgPosition, string> = {
  center: "center",
  top: "center top",
  bottom: "center bottom",
  left: "left center",
  right: "right center",
};

const SIZE: Record<BgFit, string> = {
  cover: "cover",
  contain: "contain",
  center: "auto",
  tile: "auto",
};

/** Seçilen arka plan görseli ve üzerindeki renk katmanı. Görsel yoksa hiçbir şey çizmez. */
export function BackgroundLayer() {
  const image = useBackgroundImage();
  const a = useAppearance();

  // Açılışta renkleri güncel kurallarla yeniden üret (eski kayıtlı CSS kalmasın)
  useEffect(() => {
    refreshAppearanceCss();
  }, []);

  if (!image) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--background)",
          backgroundImage: `url(${image})`,
          backgroundSize: SIZE[a.bgFit],
          backgroundRepeat: a.bgFit === "tile" ? "repeat" : "no-repeat",
          backgroundPosition: POSITION[a.bgPosition],
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: a.overlayColor, opacity: a.overlayOpacity / 100 }}
      />
    </div>
  );
}
