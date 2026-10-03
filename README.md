# Little by Little

Kişisel haftalık planlayıcı, alışkanlık takibi (Zinciri Kırma), istatistik ve odak sayacı. Tamamen yerel çalışır: sunucu, giriş sistemi ya da bulut senkronizasyonu yoktur; tüm veri tarayıcıda (IndexedDB) saklanır. Ayrıntılı kurallar ve fazlar için [planner.md](planner.md).

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # statik çıktı: out/
```

## Yayınlama (Vercel, ücretsiz) ve masaüstüne ekleme

Uygulama statik dosyalara dönüştüğü için (`output: "export"`) herhangi bir statik barındırmada çalışır.

1. [vercel.com](https://vercel.com) üzerinde ücretsiz (Hobby) hesap aç; GitHub ile giriş en kolayıdır.
2. Projeyi yayınla, iki yoldan biri:
   - **GitHub ile:** projeyi bir GitHub deposuna yükle, Vercel'de **Add New → Project** deyip depoyu seç, **Deploy**'a bas. Sonraki her `git push` otomatik yayınlanır.
   - **Komut satırı ile:** proje klasöründe `npx vercel` çalıştır, giriş yap, sorulara varsayılan cevapları ver. Güncellemek için `npx vercel --prod`.
3. Vercel sana `https://...vercel.app` adresi verir.
4. Chrome ya da Edge'de adresi aç; adres çubuğundaki **Uygulamayı yükle** simgesine tıkla. Masaüstü ve başlat menüsü kısayolu oluşur, uygulama kendi penceresinde açılır ve internetsiz de çalışır.

### Verini taşımak

Tarayıcı verisi adrese bağlıdır: `localhost`'taki görevler yayınlanan adreste görünmez. Taşımak için eski adreste **+ → Yedeği al / yükle → Yedeği indir**, yeni adreste aynı menüden **Yedekten geri yükle** yap.

### Güncelleme sonrası

Service worker (`public/sw.js`) çevrimdışı önbellek tutar. Sayfalar ağ-öncelikli olduğu için yeni sürüm internet varken otomatik gelir; önbelleği tamamen sıfırlamak istersen `sw.js` içindeki `CACHE` adındaki sürümü artır.
