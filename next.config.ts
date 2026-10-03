import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sunucu kodu yok: uygulama statik dosyalar olarak dışa aktarılır (out/) ve herhangi bir statik barındırmada çalışır.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
