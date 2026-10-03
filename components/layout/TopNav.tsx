"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Hafta", match: (path: string) => path === "/" },
  { href: "/zincir", label: "Zinciri Kırma", match: (path: string) => path.startsWith("/zincir") },
  { href: "/istatistik", label: "İstatistik", match: (path: string) => path.startsWith("/istatistik") },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-8 border-b border-line px-4 py-3 sm:px-8">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="Little by Little" width={34} height={33} priority />
        <span className="text-xs font-extrabold tracking-wider text-primary">
          LITTLE BY LITTLE
        </span>
      </div>
      <div className="hidden gap-6 md:flex">
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
