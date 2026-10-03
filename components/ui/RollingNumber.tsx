"use client";

import { useEffect, useState } from "react";

/** Haneleri dikey şeritte kayarak değişen (kilometre sayacı gibi) sayı. Rakam dışı karakterler sabit kalır. */
export function RollingNumber({ value, className }: { value: string; className?: string }) {
  const [ready, setReady] = useState(false);

  // İlk çizimde 0'dan hedef değere kaysın diye bir kare bekler
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const chars = [...value];

  return (
    <span className={`inline-flex tabular-nums leading-none ${className ?? ""}`} aria-label={value}>
      {chars.map((ch, i) => {
        // Anahtar sağdan sayılır: hane sayısı değişse de mevcut haneler aynı şeritte kalır
        const key = chars.length - i;
        if (!/\d/.test(ch)) {
          return (
            <span key={key} aria-hidden>
              {ch}
            </span>
          );
        }
        const digit = ready ? Number(ch) : 0;
        return (
          <span key={key} aria-hidden className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
            <span
              className="absolute left-0 top-0 flex w-full flex-col transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateY(${-digit}em)` }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className="block h-[1em] text-center leading-[1em]">
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
