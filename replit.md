# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- `artifacts/api-server` — Express API + HaremAPI proxy (`GET /api/harem/prices`, 3s in-memory cache)
- `artifacts/doviz-altin` — Expo/React Native mobile app "Canlı Döviz & Altın"
- `artifacts/mockup-sandbox` — Vite preview server for canvas mockups

## doviz-altin (Canlı Döviz & Altın)

> **⚠️ MIGRATION STATUS — DO NOT RE-ASK, DO NOT RE-DO:**
> finansveri.com tamamen kaldırıldı (kod + secret). HaremAPI geçişi %100 tamamlandı: SYMBOL_REGISTRY (68 sembol/5 kategori), AppContext bucket refactor, tüm UI ekranları (parities.tsx dahil), AssetIcon fallback'leri, widget, banka fiyatları hepsi hazır. `FINANSVERI_API_KEY` secret'ı silinmiş; `EXPO_PUBLIC_HAREMAPI_KEY` shared env'de ayarlı. Bu konuda herhangi bir "migration" görevi açıldığında NO-OP olarak kapatın.

**Data source:** HaremAPI.tr (68 sembol, 5 kategori: DOVIZ / MADEN / PARITE / GRAM ALTIN / SARRAFIYE + BANKA bucket)
- `EXPO_PUBLIC_HAREMAPI_KEY` shared env var olarak ayarlı (api-server tarafında `HAREMAPI_KEY` fallback'iyle de okunur)
- `lib/haremApi.ts` — `SYMBOL_REGISTRY` ile 68 sembolün TR isim / grup / birim / decimal / flag / iconKey eşlemesi; `mapPrices()` API yanıtını AssetRate listesine çevirir; `bid===0 && ask===0` olan stale semboller filtrelenir. `BANKAUSD` ve `BANKA ALTIN` için ayrı `bank` group'u eklendi.
- `lib/haremSocket.ts` — socket.io ile canlı `prices:snapshot` / `prices:update` / `data:stale` / `data:live` event'leri (sadece native; web platformunda CORS nedeniyle kapalı, polling fallback'a düşer)
- Web önizleme: `Platform.OS === "web"` durumunda haremApi.ts ve haremSocket.ts api-server proxy'sini kullanır (`https://${EXPO_PUBLIC_DOMAIN}/api/harem/prices`, 3sn in-memory cache)
- `contexts/AppContext.tsx` — bucket'lar: currencies, currencyParities, parities, goldGram, goldCoinsYeni, goldCoinsEski, goldBars, goldBracelets, goldParities, metals, silvers, ratios, spreads, **banks**; `findRateByCode()` tüm bucket'larda arama yapar (favoriler, portföy, alarm, mini kart picker tek yerden); rolling 24h baseline AsyncStorage'a saatlik persist edilir
- UI ekranları:
  - `(tabs)/index.tsx` — **Hero/marquee/mini-card kaldırıldı.** `MinimalTopBar` (sol: hamburger→drawer, orta: tema-adaptif logo, sağ: tarih + canlı saat noktası) + "Döviz Kurları" başlığı + Tümü/Favoriler segment chip + `ModernTableHeader` + `ModernPriceRow` listesi + **"Banka Fiyatları" footer section** (BANKAUSD + BANKA ALTIN, aynı row componenti)
  - `(tabs)/gold.tsx` — Hero kaldırıldı; aynı `MinimalTopBar`; başlık altında scroll'lanabilir bölüm chip'leri (Tümü / Gram & Ons / Sarrafiye / Külçe / Bilezik / Platin / Gümüş / Pariteler / Oran / Favoriler), her section header altında `ModernTableHeader`; Sarrafiye sektionunda Yeni/Eski toggle pill + her satıra YENİ/ESKİ badge
  - `components/MinimalTopBar.tsx` — paylaşımlı topbar; `useTheme().effective` ile logo otomatik swap (`logo-light.png` light mode'da, `logo-dark.png` dark mode'da); 1sn tick'leyen canlı saat; hamburger butonu `useDrawer().open()` çağırır
  - `components/ModernPriceRow.tsx` — yeni temiz satır: AssetIcon disc + (kod/badge + isim) + monospace alış (sönük) + monospace satış (bold) + altında renkli pill içinde `▲/▼ %X.XX`; `nameFirst` ve `badge` prop'ları gold için
  - `components/Icon.tsx` — `"menu"` ikonu eklendi (Lucide `Menu`)
  - `(tabs)/menu.tsx` — Drawer-style menü; üst kısımda ortalı `logo-dark.png` (ikon/metin yok, "Hakkında" linki kaldırıldı), alt footer: "Anlık Döviz & Altın Takibinde Türkiye'nin Tercihi"
  - `app/parities.tsx` — detaylı parite ekranı (Uluslararası + Çapraz)
  - `app/news.tsx` — RSS haberler (kategori filtreli, featured + liste, bildirim toggle)
  - `app/tools/converter.tsx` — kompakt çevirici (hero 36pt, swap 38pt, tek ekrana sığar)
  - `app/settings/*` — tema kartı (YAKINDA badge yok), widget açıklaması iki satıra fit edilmiş
- `components/AssetIcon.tsx` — yeni semboller için fallback (B$ / B-Au labels banka için)

**Android Widget (4×1 Pulse):**
- Tek tasarım: **Pulse** layout — solda logo (light/dark otomatik), 4 fiyat hücresi (renkli tint stripler), sağda dairesel ↻ refresh butonu + güncelleme saati. Eski `list`/`strip` template ayrımı kaldırıldı; `WidgetTemplate` tipi ve `priceField: "both"` seçeneği config'den çıkarıldı.
- `widgets/config.ts` — `WidgetConfig = { codes[4], priceField: "buy"|"sell", theme: "auto"|"dark"|"light" }`. Eski `template` alanı sanitize'da düşürülür (geriye dönük uyumluluk).
- `widgets/PriceWidget.tsx` — tek `PulseView`, `ImageWidget` ile bundled logo (`assets/images/logo-{light,dark}.png`); refresh butonu `clickAction="REFRESH"`, kart geneli `clickAction="OPEN_APP"`.
- `widgets/widget-task.tsx` — `clickAction === "REFRESH"` olduğunda cache'i atlayıp doğrudan fresh fetch yapar.
- `app/settings/widget.tsx` — ŞABLON bölümü kaldırıldı; üstte canlı önizleme bloğu (PulseView'in pure-RN kopyası, seçimlere anında reaktif), FİYAT ALANI sadece Alış/Satış, TEMA aynen.
- `widgets/index.ts` — `registerWidgetTaskHandler` çağrısı; **`index.js` içinde `expo-router/entry`'den ÖNCE** import edilerek headless JS context'te task'ın garantili olarak kayıt olması sağlanır
- `app.json` plugin: `updatePeriodMillis: 1800000` (30 dk, Android minimumu); resizable; widget'a tıklayınca uygulama açılır
- `app.json` splash + bildirim ikonları renkli `icon.png`'ye taşındı (yeni APK gerekiyor)
- **DEVAM EDEN:** APK'da widget hâlâ tamamen şeffaf — root cause araştırması sürüyor

### Bildirim çubuğu (canlı / foreground service) — KALDIRILDI
- Daha önce notifee tabanlı ongoing foreground-service notification widget'ı vardı; kullanıcı isteğiyle tamamen kaldırıldı.
- Silinen: `lib/ongoingNotification.ts`, `plugins/withNotifeeFgsType.js`, `index.js`'deki notifee handler, widget.tsx'teki "BİLDİRİM ÇUBUĞU · CANLI" toggle, `_layout.tsx`'teki `restoreOngoingNotificationIfEnabled` çağrısı, onboarding'deki "BİLDİRİM" slide'ı.
- `app.json` permissions'tan FOREGROUND_SERVICE + FOREGROUND_SERVICE_DATA_SYNC çıkarıldı; `withNotifeeFgsType` plugin kaydı silindi; `@notifee/react-native` package.json'dan kaldırıldı.
- Ana ekran (home-screen) widget'ı (react-native-android-widget) AYNEN korunuyor.

### Onboarding (ilk açılış)
- `app/onboarding.tsx` — 3 sayfa swipeable (FlatList horizontal pagingEnabled). Sayfa 1 hero, Sayfa 2 widget, Sayfa 3 alarm. (Eski "BİLDİRİM" slide'ı notification widget özelliğiyle birlikte kaldırıldı.) Renk tokenleri `constants/colors.ts` ile birebir uyumlu. icon.png koyu zeminlerde beyaz çip içinde.
- `lib/onboardingPref.ts` — AsyncStorage flag `onboarding-seen-v1` (`isOnboardingSeen`, `setOnboardingSeen`, `resetOnboardingSeen`).
- `app/_layout.tsx` — startup tab redirect'inden ÖNCE `isOnboardingSeen()` kontrol edilir; false ise `/onboarding`'e replace, true ise startup tercihi uygulanır.
- Stack.Screen `onboarding` `gestureEnabled: false`, `animation: "fade"`. Mockup referansı: `mockup-sandbox/src/components/mockups/carsi-widget/OnboardingFlow.tsx`.

**newArchEnabled:** `true` (Reanimated 4 gerektiriyor, sabit)

**Backend haberler:**
- `functions/src/news.ts` — 6 Türkçe RSS kaynağı (Bloomberg HT, AA, TRT, Dünya, CNN Türk, BBC Türkçe), dedup + kategorize (Döviz/Altın/Merkez Bankası/Emtia/Parite/Ekonomi)
- HTTP endpoint'leri: `pollNews` (30dk schedule), `getNews`, `setPrefs`, `getPrefs`

**Cleanup notu:** finansveri.com tamamen kaldırıldı; eski `FINANSVERI_API_KEY` secret'ı silindi.

### Tarihsel grafikler (MetalpriceAPI)
- **Sunucu:** `artifacts/api-server/src/metalprice/` — MetalpriceAPI client + 36 sembol türetme + JSON storage + 5 yıllık backfill + 6 saatte bir self-healing daily cron.
  - `symbols.ts` — sembol formülleri (USD baz). Forex TRY (USDTRY=TRY, EURTRY=TRY/EUR…), pariteler (EURUSD=1/EUR…), madenler USD (XAUUSD=1/XAU…), gram TL madenler (ALTIN=(1/XAU)·TRY/31.1034768).
  - `storage.ts` — `data/history.json` tek dosya (~1.5 MB), atomik temp+rename, write queue ile race-koruma. `meta.highWatermark` = contiguous backfill cursor (today /latest yazımı bunu **ilerletmez** → kaçırılan günler bir sonraki tick'te otomatik tamamlanır).
  - `backfill.ts` — `runBackfillIfNeeded()` 5 yıl × 365 gün chunk; `runDailyUpdate()` watermark'tan dünyaya kadar gap fill + today /latest refresh.
  - `init.ts` — açılışta backfill+daily, sonra `setInterval(6h)`.
- **Endpoint:** `GET /api/history/:symbol?range=1H|1A|3A|1Y|5Y` → `{ symbol, range, points: [{t,c}] }`. Admin POST `/admin/backfill` ve `/admin/refresh` sadece `NODE_ENV !== production`'da açık.
- **Mobil:** `lib/historyApi.ts` mobile code → backend symbol mapping + `EXPO_PUBLIC_API_BASE` (default `https://$EXPO_PUBLIC_DOMAIN`). `hooks/usePriceHistory.ts` 6h staleTime memory cache. `components/PriceChart.tsx` close-only SVG line + period selector (1H/1A/1Y/5Y) + statlar. `app/detail/[code].tsx`'te `hasHistorySupport(code)` true ise "GEÇMİŞ FİYAT" kartı render olur; sarrafiye/külçe/parite altın/fark gibi sembollerde gizli.
- **Maliyet:** ücretli plana göre 5 yıl backfill = 5 istek (tek seferlik), günlük 1 /latest çağrısı.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
