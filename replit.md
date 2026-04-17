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

**Data source:** HaremAPI.tr (66 sembol, 5 kategori: DOVIZ / MADEN / PARITE / GRAM ALTIN / SARRAFIYE)
- `EXPO_PUBLIC_HAREMAPI_KEY` shared env var olarak ayarlı
- `lib/haremApi.ts` — `SYMBOL_REGISTRY` ile tüm sembollerin TR isim/grup/birim/decimal/flag eşlemesi; `mapPrices()` API yanıtını AssetRate listesine çevirir; `bid===0 && ask===0` olan stale semboller (USDRUB, FARKEUR vs.) filtrelenir
- `lib/haremSocket.ts` — socket.io ile canlı `prices:snapshot` / `prices:update` / `data:stale` / `data:live` event'leri (sadece native; web platformunda CORS nedeniyle kapalı, polling fallback'a düşer)
- Web önizleme: `Platform.OS === "web"` durumunda haremApi.ts ve haremSocket.ts api-server proxy'sini kullanır (`https://${EXPO_PUBLIC_DOMAIN}/api/harem/prices`)
- `contexts/AppContext.tsx` — 14 bucket (currencies, currencyParities, parities, goldGram, goldCoinsYeni, goldCoinsEski, goldBars, goldBracelets, goldParities, metals, silvers, ratios, spreads); rolling 24h baseline AsyncStorage'a saatlik persist edilir
- UI ekranları:
  - `(tabs)/index.tsx` — hero + marquee + döviz listesi
  - `(tabs)/gold.tsx` — SectionList: Gram Altın & Ons / Sarrafiye (Yeni/Eski toggle pill) / Külçe / Bilezik / Platin & Paladyum / Gümüş / Altın Pariteleri / Au-Ag Oranı
  - `(tabs)/more.tsx` — 2 sekme: Haberler (kategori filtreli, featured + listeden, RSS bildirim toggle, hızlı eylem kartları) / Pariteler (Uluslararası + Çapraz)

**Backend haberler:**
- `functions/src/news.ts` — 6 Türkçe RSS kaynağı (Bloomberg HT, AA, TRT, Dünya, CNN Türk, BBC Türkçe), dedup + kategorize (Döviz/Altın/Merkez Bankası/Emtia/Parite/Ekonomi)
- HTTP endpoint'leri: `pollNews` (30dk schedule), `getNews`, `setPrefs`, `getPrefs`

**Cleanup notu:** finansveri.com tamamen kaldırıldı; eski `FINANSVERI_API_KEY` secret'ı Secrets panelinden manuel silinmelidir.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
