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

### Bildirim çubuğu (canlı / foreground service)
- `lib/ongoingNotification.ts` — `@notifee/react-native` ile Android foreground service. Widget config'inden 4 sembolü okur, BIGTEXT stilinde 4 satır gösterir. ~90 sn'de bir refresh, AppState=active'de de tetiklenir. iOS no-op.
- `app/settings/widget.tsx` — "BİLDİRİM ÇUBUĞU · CANLI" bölümünde toggle (varsayılan KAPALI). Açıldığında runtime POST_NOTIFICATIONS izni istenir, kapatıldığında service durur.
- `app/_layout.tsx` — `restoreOngoingNotificationIfEnabled` ile uygulama açılışında AsyncStorage flag'i true ise service yeniden bağlanır.
- `app.json` android.permissions: POST_NOTIFICATIONS, FOREGROUND_SERVICE, FOREGROUND_SERVICE_DATA_SYNC, WAKE_LOCK eklendi.
- Native modül; Expo Go çalışmaz, dev client/EAS build gerekir.

**newArchEnabled:** `true` (Reanimated 4 gerektiriyor, sabit)

**Backend haberler:**
- `functions/src/news.ts` — 6 Türkçe RSS kaynağı (Bloomberg HT, AA, TRT, Dünya, CNN Türk, BBC Türkçe), dedup + kategorize (Döviz/Altın/Merkez Bankası/Emtia/Parite/Ekonomi)
- HTTP endpoint'leri: `pollNews` (30dk schedule), `getNews`, `setPrefs`, `getPrefs`

**Cleanup notu:** finansveri.com tamamen kaldırıldı; eski `FINANSVERI_API_KEY` secret'ı silindi.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
