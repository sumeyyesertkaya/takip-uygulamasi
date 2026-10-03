export type Palette = {
  primary: string;
  foreground: string;
  surface: string;
  card: string;
  background: string;
  glow1: string;
  glow2: string;
  glow3: string;
};

export type BgFit = "cover" | "contain" | "center" | "tile";
export type BgPosition = "center" | "top" | "bottom" | "left" | "right";

export type Appearance = {
  light: Palette;
  dark: Palette;
  panelOpacity: number; // 0-100
  cardOpacity: number; // 0-100
  panelBlur: number; // px
  bgFit: BgFit;
  bgPosition: BgPosition;
  overlayColor: string;
  overlayOpacity: number; // 0-100
};

export const PALETTE_FIELDS: { key: keyof Palette; label: string }[] = [
  { key: "primary", label: "Vurgu" },
  { key: "foreground", label: "Yazı" },
  { key: "surface", label: "Panel" },
  { key: "card", label: "Kart" },
  { key: "background", label: "Zemin" },
  { key: "glow1", label: "Gradyan 1" },
  { key: "glow2", label: "Gradyan 2" },
  { key: "glow3", label: "Gradyan 3" },
];

const BW_LIGHT: Palette = {
  primary: "#0a0a0a",
  foreground: "#0a0a0a",
  surface: "#ffffff",
  card: "#f1f1f1",
  background: "#ececec",
  glow1: "#ffffff",
  glow2: "#d2d2d2",
  glow3: "#f7f7f7",
};

const BW_DARK: Palette = {
  primary: "#f5f5f5",
  foreground: "#f5f5f5",
  surface: "#141414",
  card: "#1d1d1d",
  background: "#0a0a0a",
  glow1: "#2c2c2c",
  glow2: "#161616",
  glow3: "#3a3a3a",
};

export const DEFAULT_APPEARANCE: Appearance = {
  light: BW_LIGHT,
  dark: BW_DARK,
  panelOpacity: 100,
  cardOpacity: 100,
  panelBlur: 0,
  bgFit: "cover",
  bgPosition: "center",
  overlayColor: "#000000",
  overlayOpacity: 30,
};

export const PRESETS: { name: string; light: Palette; dark: Palette }[] = [
  { name: "Siyah-Beyaz", light: BW_LIGHT, dark: BW_DARK },
  {
    name: "Gece Mavisi",
    light: {
      primary: "#3b5bdb",
      foreground: "#14213d",
      surface: "#ffffff",
      card: "#f4f7ff",
      background: "#e3eafc",
      glow1: "#ffffff",
      glow2: "#bac8ff",
      glow3: "#edf2ff",
    },
    dark: {
      primary: "#8da2fb",
      foreground: "#e8edff",
      surface: "#0f172a",
      card: "#17213b",
      background: "#070b16",
      glow1: "#1e2a52",
      glow2: "#0b1226",
      glow3: "#243a7a",
    },
  },
  {
    name: "Orman",
    light: {
      primary: "#2f7a4f",
      foreground: "#12281b",
      surface: "#ffffff",
      card: "#f3faf5",
      background: "#e2efe6",
      glow1: "#ffffff",
      glow2: "#b7d9c2",
      glow3: "#eef7f1",
    },
    dark: {
      primary: "#6fd39a",
      foreground: "#e7f6ec",
      surface: "#0f1a14",
      card: "#162419",
      background: "#08100b",
      glow1: "#1f3a2a",
      glow2: "#0d1a12",
      glow3: "#2b5239",
    },
  },
  {
    name: "Gün Batımı",
    light: {
      primary: "#e0592a",
      foreground: "#3a1d12",
      surface: "#fffaf5",
      card: "#fff1e6",
      background: "#fde5d4",
      glow1: "#fff3e8",
      glow2: "#ffb38a",
      glow3: "#ffd9c2",
    },
    dark: {
      primary: "#ff8a5c",
      foreground: "#ffe9dc",
      surface: "#1c0f0b",
      card: "#2a1812",
      background: "#120805",
      glow1: "#4a2214",
      glow2: "#1f0e08",
      glow3: "#6b3320",
    },
  },
];

type Rgb = [number, number, number];

function parseHex(hex: string): Rgb {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: Rgb): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

/** a renginin `weight` kadarı + b renginin kalanı (weight: 0-1) */
function mix(a: string, b: string, weight: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  return toHex(ca.map((v, i) => v * weight + cb[i] * (1 - weight)) as Rgb);
}

function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const DARK_TEXT = "#0a0a0a";
const LIGHT_TEXT = "#f5f5f5";

/** WCAG kontrast oranı (1–21). */
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Tercih edilen renk tüm zeminlerde yeterince okunuyorsa onu, değilse daha iyi okunan açık/koyu rengi döndürür. */
function pickReadable(preferred: string, backgrounds: string[], min: number): string {
  const score = (color: string) => Math.min(...backgrounds.map((bg) => contrast(color, bg)));
  if (score(preferred) >= min) return preferred;
  return score(DARK_TEXT) >= score(LIGHT_TEXT) ? DARK_TEXT : LIGHT_TEXT;
}

/**
 * Seçilen panel/kart rengiyle okunmayan yazı ve vurgu renklerini otomatik açık/koyu yapar.
 * Örn. gündüz modunda koyu bir panel seçilince yazılar ve sahnedeki karakter açık renge döner.
 */
export function withReadableColors(p: Palette): Palette {
  // Yazı ve vurgu panel zeminine göre seçilir; kartların içindeki yazı ayrıca --card-foreground ile ayarlanır
  return {
    ...p,
    foreground: pickReadable(p.foreground, [p.surface], 4.5),
    primary: pickReadable(p.primary, [p.surface], 2),
  };
}

function paletteVars(palette: Palette, a: Appearance): string {
  const p = withReadableColors(palette);
  const onPrimary = luminance(p.primary) > 0.45 ? "#0a0a0a" : "#ffffff";
  const line = mix(p.foreground, p.surface, 0.1);
  const cardHover = mix(p.foreground, p.card, 0.05);
  // Kutunun (kart) içindeki görev kartları kutudan bir ton ayrışır: açık temada beyaza, koyu temada biraz açığa
  const taskBg = luminance(p.surface) > 0.5 ? mix("#ffffff", p.card, 0.85) : mix("#ffffff", p.card, 0.07);
  // Gecikmiş görev: paletin kartına kırmızı karıştırılarak türetilir
  const overdueBg = mix("#e5484d", p.card, p.surface === p.card ? 0.14 : 0.16);
  const overdueLine = mix("#e5484d", p.surface, 0.4);
  // Kart rengi panelden çok farklıysa (ör. koyu panel + açık kart) kart içi yazı kendi okunur rengini alır
  const cardForeground = pickReadable(p.foreground, [p.card, taskBg], 4.5);
  const alpha = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, transparent)`;

  return [
    `--background:${p.background}`,
    `--foreground:${p.foreground}`,
    `--surface:${p.surface}`,
    `--card-foreground:${cardForeground}`,
    `--on-primary:${onPrimary}`,
    `--card:${alpha(p.card, a.cardOpacity)}`,
    `--card-hover:${alpha(cardHover, a.cardOpacity)}`,
    `--task-bg:${alpha(taskBg, a.cardOpacity)}`,
    `--overdue-bg:${alpha(overdueBg, a.cardOpacity)}`,
    `--overdue-line:${overdueLine}`,
    `--muted:${mix(p.foreground, p.surface, 0.5)}`,
    `--line:${line}`,
    `--primary:${p.primary}`,
    `--accent:${p.primary}`,
    `--bar-pink:${p.primary}`,
    `--bar-green:${p.primary}`,
    `--bar-blue:${p.primary}`,
    `--tag-pink:${line}`,
    `--tag-blue:${line}`,
    `--tag-green:${line}`,
    `--glow-1:${p.glow1}`,
    `--glow-2:${p.glow2}`,
    `--glow-3:${p.glow3}`,
    `--panel-bg:${alpha(p.surface, a.panelOpacity)}`,
    // Bulanıklık 0 iken filtre hiç uygulanmaz: aksi halde panel içindeki fixed öğeleri panele hapseder
    `--panel-filter:${a.panelBlur > 0 ? `blur(${a.panelBlur}px)` : "none"}`,
  ].join(";");
}

/** `html:root` seçicisi stil sırasından bağımsız olarak globals.css'i geçer. */
export function buildCss(a: Appearance): string {
  return `html:root{${paletteVars(a.light, a)}}html.dark:root{${paletteVars(a.dark, a)};color-scheme:dark}`;
}
