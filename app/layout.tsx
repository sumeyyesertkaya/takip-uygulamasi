import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import { MobileNav } from "@/components/layout/MobileNav";
import { AppearanceFab } from "@/components/appearance/AppearanceFab";
import { CommandPalette } from "@/components/command/CommandPalette";
import { UndoToast } from "@/components/ui/UndoToast";
import { ClimbWidget } from "@/components/climb/ClimbWidget";
import { BackgroundLayer } from "@/components/appearance/BackgroundLayer";
import { appearanceBootScript } from "@/lib/appearance";
import "./globals.css";

const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

export const viewport: Viewport = {
  // iPhone çentik/ana ekran çizgisi için güvenli alan değişkenleri
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ececec" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: "Little by Little",
  manifest: "/manifest.webmanifest",
  description: "Little by Little: kişisel haftalık planlayıcı ve alışkanlık takibi",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${manrope.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + appearanceBootScript }} />
      </head>
      <body className="min-h-full">
        <BackgroundLayer />
        {children}
        <ClimbWidget />
        <AppearanceFab />
        <MobileNav />
        <UndoToast />
        <CommandPalette />
        <RegisterSW />
      </body>
    </html>
  );
}
