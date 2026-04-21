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
  - `(tabs)/index.tsx` — hero + marquee + döviz listesi + **"Banka Fiyatları" footer section** (BANKAUSD + BANKA ALTIN)
  - `(tabs)/gold.tsx` — SectionList: Gram Altın & Ons / Sarrafiye (Yeni/Eski toggle pill) / Külçe / Bilezik / Platin & Paladyum / Gümüş / Altın Pariteleri / Au-Ag Oranı
  - `(tabs)/menu.tsx` — Drawer-style menü; üst kısımda ortalı `logo-dark.png` (ikon/metin yok, "Hakkında" linki kaldırıldı), alt footer: "Anlık Döviz & Altın Takibinde Türkiye'nin Tercihi"
  - `app/parities.tsx` — detaylı parite ekranı (Uluslararası + Çapraz)
  - `app/news.tsx` — RSS haberler (kategori filtreli, featured + liste, bildirim toggle)
  - `app/tools/converter.tsx` — kompakt çevirici (hero 36pt, swap 38pt, tek ekrana sığar)
  - `app/settings/*` — tema kartı (YAKINDA badge yok), widget açıklaması iki satıra fit edilmiş
- `components/AssetIcon.tsx` — yeni semboller için fallback (B$ / B-Au labels banka için)

**Android Widget (4×2):**
- `widgets/PriceWidget.tsx` — `react-native-android-widget` ile yazılmış FlexWidget tabanlı UI; `{ light, dark }` `WidgetRepresentation` döndürür (kütüphane `light` ve opsiyonel `dark` JSX kabul eder), sistem temasına göre Android otomatik seçer
- `widgets/widget-task.tsx` — headless task; `WIDGET_ADDED/UPDATE/RESIZED/CLICK` event'lerinde önce loading state çizilir, sonra `fetchAllPrices()` ile USD/EUR/Gram Altın/Çeyrek fiyatları render edilir
- `widgets/index.ts` — `registerWidgetTaskHandler` çağrısı; **`index.js` içinde `expo-router/entry`'den ÖNCE** import edilerek headless JS context'te task'ın garantili olarak kayıt olması sağlanır
- `app.json` plugin: `updatePeriodMillis: 1800000` (30 dk, Android minimumu); resizable; widget'a tıklayınca uygulama açılır
- `app.json` splash + bildirim ikonları renkli `icon.png`'ye taşındı (yeni APK gerekiyor)
- **DEVAM EDEN:** APK'da widget hâlâ tamamen şeffaf — root cause araştırması sürüyor

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
