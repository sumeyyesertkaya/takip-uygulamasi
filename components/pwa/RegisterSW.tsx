"use client";

import { useEffect } from "react";

/** Üretimde service worker'ı kaydeder (geliştirmede önbellek karışıklığı yaratmasın diye kapalı). */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // kayıt başarısız olursa uygulama normal (çevrimiçi) çalışmaya devam eder
    });
  }, []);

  return null;
}
