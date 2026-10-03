# Little by Little (Haftalık Planlayıcı)

Uygulama adı: **Little by Little**. Logo `public/logo.png`, favicon `app/icon.png`.

Kişisel kullanım için, Notion tarzı sade bir haftalık planlayıcı. Tek kullanıcı, tamamen yerel çalışır. Giriş sistemi, sunucu veya bulut senkronizasyonu yoktur.

## Teknoloji

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS
- Dexie (IndexedDB): tüm veriler tarayıcıda saklanır
- dnd-kit: sürükle-bırak
- date-fns (`tr` locale): tarih ve hafta hesapları
- Tiptap: yalnızca Faz 3'te, not editörü için

Bu listenin dışında paket eklemeden önce sor.

## Temel kurallar

- Backend, API route, veritabanı sunucusu veya kimlik doğrulama EKLEME.
- Arayüz dili Türkçe. Kod, değişken, fonksiyon ve dosya adları İngilizce.
- Hafta **pazartesi** başlar (`weekStartsOn: 1`).
- Tarihler veritabanında `YYYY-MM-DD` string olarak tutulur (saat dilimi sorunlarını önlemek için `Date` objesi saklama).
- Sadece içinde bulunduğumuz fazın özelliklerini yap. Sonraki fazlardan bir şeyi önermek istersen öner, ama kodlama.
- Büyük değişikliklerden önce kısa bir plan göster ve onay bekle.
- Bileşenleri küçük ve tek amaçlı tut. Veri erişimi `lib/db` altında toplanır, bileşenler doğrudan Dexie çağırmaz.

## Veri modeli

```ts
type Task = {
  id: string;            // crypto.randomUUID()
  title: string;
  date: string | null;   // "YYYY-MM-DD"; null = Görevler (gelen kutusu)
  completed: boolean;
  order: number;         // aynı gün içindeki sıralama
  createdAt: number;     // timestamp
  completedAt: number | null;
};
```

Şema değişirse Dexie `version()` ile migration yaz, mevcut verileri silme.

## Klasör yapısı

```
app/
  page.tsx              # haftalık görünüm
components/
  week/                 # WeekView, DayColumn, WeekNavigator
  task/                 # TaskItem, TaskInput
  inbox/                # InboxPanel
lib/
  db/                   # Dexie kurulumu ve task fonksiyonları
  dates.ts              # hafta/tarih yardımcıları
```

## Fazlar

### Faz 1: Temel (MVP)
- Dexie kurulumu ve task CRUD fonksiyonları
- 7 sütunlu haftalık görünüm (gün adı + tarih, bugün vurgulu)
- Her güne görev ekleme (Enter ile), tamamlama, silme, başlığı düzenleme
- Önceki / sonraki hafta ve "Bugün" butonu
- Görevler (gelen kutusu) paneli (tarihsiz görevler)

### Faz 2: Etkileşim
- Sürükle-bırak: günler arası, gün içinde sıralama, Görevler (gelen kutusu) ↔ gün
- Tamamlanmayan geçmiş görevleri bugüne devretme (ayarlanabilir)
- Karanlık mod
- JSON dışa / içe aktarma (yedekleme)

### Faz 3: Notion hissi
- Her güne serbest not alanı (Tiptap, `/` komutları)
- Cmd+K: hızlı arama ve görev ekleme
- Tekrarlayan görevler
- Etiketler / renkler

## Tasarım

- Referans düzen: gri tonlu gradyan zemin (gece modunda koyu gradyan) üzerinde yüzen beyaz yuvarlak panel, üstte gezinme çubuğu, beyaz yumuşak gölgeli görev kartları, sağda İlerleme + Görevler (gelen kutusu) paneli. Renk paleti siyah-beyaz (monokrom): vurgu siyah (`primary`), nötr gri tonları.
- Bugün siyah başlık + pill ile vurgulanır; pazar soluk. Kartlarda çok hafif gölge serbest.
- Font: Manrope (`next/font`, latin-ext). Renkler CSS değişkenleriyle tanımlanır (karanlık mod için hazır).
- Saat ekseni yok; görevler gün başına kart listesi.
- Hafta görünümü yatay kaydırılabilir: her gün en az 14 rem genişliğinde, geniş ekranda 7 gün sığar, dar ekranda kaydırılır (bugünün sütunu otomatik görünür alana gelir).
- Animasyonlar kısa ve dikkat dağıtmayan.

### Ek özellik: Zinciri Kırma (`/zincir`)
- Sabit günlük alışkanlıklar (`habits`, `habitLogs`; Dexie v2). Her gün işaretlenir, geçmiş günler de düzenlenebilir.
- GitHub tarzı ısı haritası, dönem seçici (1 Ay / 3 Ay / 6 Ay / 1 Yıl), genel görünüm + zincir başına seri ve oran istatistikleri.
- Gece/gündüz modu: üst çubuktaki düğmeyle değişir, tercih localStorage'da saklanır, ilk açılışta sistem temasına uyar (`html.dark`).

## Çalışma şekli

- Her özellik bitince `npm run build` ve `npm run lint` hatasız geçmeli.
- Her tamamlanan adımdan sonra anlamlı bir commit mesajı öner.

## Özelleştirme (sağ alttaki + butonu)

- Üzerine gelince menü açılır: "Arka planı değiştir", "Renkleri değiştir", "Varsayılana dön".
- Arka plan: bilgisayardan görsel (1920 px'e küçültülüp Dexie `settings` tablosunda saklanır), yerleşim (Kapla/Sığdır/Ortala/Döşe), konum, görsel üstüne renk katmanı + katman opaklığı.
- Renkler: gündüz/gece için ayrı palet (vurgu, yazı, panel, kart, zemin, 3 gradyan rengi), hazır paletler, panel/kart opaklığı ve panel bulanıklığı. `localStorage`'da saklanır, `lib/theme.ts` CSS değişkenlerini üretir ve sayfa çizilmeden uygulanır.

## Tırmanış sahnesi (sol alt)

- Masaüstünde sol altta sabit kart: tepeye tırmanan yürüyüşçü SVG sahnesi, süre sayacı ve düğmeler. Kapatılınca küçük bir dağ düğmesine döner.
- Konum, bugünün görevlerinin tamamlanma oranına bağlıdır. "Çalış" süreyi başlatır ve yürüyüşçü yürür; "Mola" süreyi durdurur ve yürüyüşçü oturur. "Bitti" yalnızca bugünün tüm görevleri tamamlanınca açılır; tıklayınca zirveye çıkılır, bayrak dikilir ve günün süresi Dexie `sessions` tablosuna yazılır.
- 21:00-05:00 arası ay ve yıldızlar; 15:00'ten sonra ilerleme %30'un altındaysa yağmur bulutu ve "Yavaş ilerlemek de olur" mesajı çıkar.
- Kart sayfada istenen yere sürüklenebilir (konum kaydedilir).
- Oturum durumu `localStorage`'da (`lib/session.ts`) tutulur; gün değişince sahne başa sarar.

## Flip sayaç (tırmanış kartı)

- Kartta tek bir süre vardır: `components/ui/flip-countdown.tsx` içindeki `FlipDigits` ile çizilen flip kartlar. "Çalış"a basınca 00:00'dan yukarı doğru, saniyede bir kart dönerek sayar; molada durur, kaldığı yerden devam eder. Bir saati geçince `h:mm:ss` gösterilir.
- Hedef süre / geri sayım seçeneği yoktur (kaldırıldı).

## İstatistik (`/istatistik`)

- Hafta / Ay / Yıl kayan düğmesiyle dönem seçilir; kayan rakamlı kartlar (çalışma süresi, tamamlanan görev, aktif gün, en uzun zincir serisi), süre/görev arasında geçiş yapan çubuk grafik (hover tooltip), görev tamamlama halkası, "en verimli gün" cümlesi ve zincir başına oran + son 12 hafta haritası.
- Hesaplar `lib/stats.ts` içinde saf fonksiyonlardır. Çalışma süresi artık mola, süre dolması ve gün değişiminde de `sessions` tablosuna yazılır (yalnızca "Bitti"de değil).

## Masaüstü / PWA

- `output: "export"` ile statik çıktı (`out/`), `public/manifest.webmanifest`, `public/sw.js` (ağ-öncelikli sayfalar, önbellek-öncelikli statik dosyalar) ve `components/pwa/RegisterSW.tsx` (yalnızca üretimde kayıt). Yayın adımları README.md içinde.

## Mobil görünüm (< 768 px)

- Üstte yalnızca logo ve tema düğmesi; sekmeler ve görünüm/yedek menüsü altta yüzen, hap şeklinde ikon çubuğunda (`components/layout/MobileNav.tsx`).
- Tırmanış kartı yerine ikon çubuğunun üstünde ince sayaç çubuğu (flip sayaç, mesaj, Çalış/Mola/Bitti); küçültülebilir.
- Hafta: her gün ekranın ~%85'i genişliğinde, kaydırınca güne oturur. Üzerine gelince çıkan ikonlar dokunmatikte hep görünür; giriş alanları 16 px (iPhone yakınlaştırmasın). Alttaki öğeler `env(safe-area-inset-bottom)` hesaba katar.
