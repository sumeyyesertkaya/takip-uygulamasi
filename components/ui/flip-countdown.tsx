"use client";

import React, { useEffect, useMemo, useState } from "react";

// Koşullu sınıf adları için küçük yardımcı
const cn = (...inputs: (string | undefined | null | boolean)[]) => inputs.filter(Boolean).join(" ");

// Tek bir hane. Üst yarı hemen yeni haneyi gösterir, eski hane üstteki kapak olarak aşağı döner,
// alt yarı kapak inene kadar eski haneyi tutar.
function FlipUnit({ digit, cardStyle }: { digit: string; cardStyle: React.CSSProperties }) {
  const [shown, setShown] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  // Prop değişince durumu render sırasında ayarla (effect içinde setState gerekmez)
  if (digit !== shown) {
    setPrevious(shown);
    setShown(digit);
    setIsFlipping(true);
  }

  const handleAnimationEnd = () => {
    setIsFlipping(false);
    setPrevious(shown);
  };

  return (
    <div className="flip-unit" style={cardStyle}>
      <div className="flip-card flip-card__top">{shown}</div>
      <div className="flip-card flip-card__bottom">{previous}</div>
      <div className={cn("flipper", isFlipping && "is-flipping")} onAnimationEnd={handleAnimationEnd}>
        <div className="flip-card flipper__top">{previous}</div>
        <div className="flip-card flipper__bottom">{shown}</div>
      </div>
    </div>
  );
}

type FlipStyleProps = {
  className?: string;
  cardBgColor?: string;
  textColor?: string;
};

/** Verilen metnin her karakterini bir flip karta çevirir. Değer dışarıdan yönetilir. */
export function FlipDigits({ value, className, cardBgColor, textColor }: FlipStyleProps & { value: string }) {
  const cardStyle = {
    "--flip-card-bg": cardBgColor,
    "--flip-card-text": textColor,
  } as React.CSSProperties;

  return (
    <div className={cn("flip-countdown-container", className)}>
      {value.split("").map((digit, index) => (
        <FlipUnit key={index} digit={digit} cardStyle={cardStyle} />
      ))}
    </div>
  );
}

/** Kendi kendine saniyede bir sayan bağımsız geri/ileri sayım (çok büyük sayıları da destekler). */
export function FlipCountdown({
  countFrom = 99,
  countTo = 0,
  ...style
}: FlipStyleProps & {
  countFrom?: number | string | bigint;
  countTo?: number | string | bigint;
}) {
  const from = useMemo(() => BigInt(countFrom), [countFrom]);
  const to = useMemo(() => BigInt(countTo), [countTo]);

  const isCountingDown = from > to;
  const [count, setCount] = useState(from);

  useEffect(() => {
    // Hedefe ulaşınca sayacı durdur
    if ((isCountingDown && count <= to) || (!isCountingDown && count >= to)) return;

    const timer = setInterval(() => {
      setCount((prev) => (isCountingDown ? prev - BigInt(1) : prev + BigInt(1)));
    }, 1000);
    return () => clearInterval(timer);
  }, [count, to, isCountingDown]);

  // En büyük sayının hane sayısına göre sıfırla doldur
  const padded = useMemo(() => {
    const maxVal = from > to ? from : to;
    const displayCount = count < BigInt(0) ? BigInt(0) : count;
    return String(displayCount).padStart(String(maxVal).length, "0");
  }, [count, from, to]);

  return <FlipDigits value={padded} {...style} />;
}
