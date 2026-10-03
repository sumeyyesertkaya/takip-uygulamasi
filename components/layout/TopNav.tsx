"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Hafta", match: (path: string) => path === "/" },
  { href: "/gelen-kutusu", label: "Görevler", match: (path: string) => path.startsWith("/gelen-kutusu") },
  { href: "/zincir", label: "Zinciri Kırma", match: (path: string) => path.startsWith("/zincir") },
  { href: "/istatistik", label: "İstatistik", match: (path: string) => path.startsWith("/istatistik") },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-8 border-b border-line px-6 py-3 sm:px-8">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="Little by Little" width={34} height={33} priority />
        <span className="hidden text-xs font-extrabold tracking-wider text-primary sm:inline">
          LITTLE BY LITTLE
        </span>
      </div>
      <div className="flex gap-5 sm:gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-xs font-semibold transition-colors hover:text-primary ${
              link.match(pathname) ? "text-primary" : "text-muted"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <ThemeToggle />
    </nav>
  );
}
