"use no memo";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  fetchAllPrices,
  mapPrices,
  SYMBOL_REGISTRY,
  type AssetRate,
  type RawHaremResponse,
} from "@/lib/haremApi";
import type { AssetKind, PriceWidgetData, WidgetRow } from "./PriceWidget";

export const WIDGET_CACHE_KEY = "@carsi/widget-cache-v3";

function kindForCode(code: string): AssetKind {
  const meta = SYMBOL_REGISTRY.find((m) => m.code === code);
  if (!meta) return "currency";
  return meta.category === "MADEN" ? "gold" : "currency";
}

function labelForCode(code: string): string {
  const meta = SYMBOL_REGISTRY.find((m) => m.code === code);
  return meta?.code ?? code;
}

function fmtPrice(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "—";
  const decimals = value >= 1000 ? 0 : 2;
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function loadingData(): PriceWidgetData {
  return {
    rows: [],
    updatedAt: fmtTime(new Date()),
    loading: true,
  };
}

export function errorData(message: string): PriceWidgetData {
  return {
    rows: [],
    updatedAt: fmtTime(new Date()),
    error: message,
  };
}

/**
 * Toplam süre üst sınırı: ilk deneme 7sn, kısa retry 6sn → max ~13sn.
 * Widget task'ı asla bunu aşmaz, "Yükleniyor..." kilidine girmez.
 */
async function fetchWithRetry(): Promise<RawHaremResponse> {
  try {
    return await fetchAllPrices({ timeoutMs: 7000 });
  } catch (e1) {
    // Geçici network glitch için kısa bir bekleme + tek retry
    await new Promise((r) => setTimeout(r, 1500));
    try {
      return await fetchAllPrices({ timeoutMs: 6000 });
    } catch (e2) {
      throw e2 instanceof Error ? e2 : e1;
    }
  }
}

export async function buildData(codes: string[]): Promise<PriceWidgetData> {
  try {
    const raw = await fetchWithRetry();
    const rates = mapPrices(raw, {});
    const byCode = new Map<string, AssetRate>(rates.map((r) => [r.meta.code, r]));

    const rows: WidgetRow[] = codes.slice(0, 4).map((code) => {
      const r = byCode.get(code);
      const kind = kindForCode(code);
      const label = labelForCode(code);
      if (!r) {
        return { label, buy: "—", sell: "—", changePercent: 0, kind };
      }
      return {
        label,
        buy: fmtPrice(r.buy),
        sell: fmtPrice(r.sell),
        changePercent: r.changePercent,
        kind,
      };
    });

    return { rows, updatedAt: fmtTime(new Date()) };
  } catch (e) {
    // Network başarısız → eldeki son başarılı cache'i kullan (kullanıcı eski
    // ama doğru fiyat görmeli; widget'ta "Bağlantı yok" basmaktansa).
    const cached = await readWidgetCache();
    if (cached && cached.rows.length > 0) {
      // updatedAt'i koru — kullanıcı son verinin saatini görsün.
      return { ...cached, error: undefined };
    }
    const msg = e instanceof Error ? e.message : "Bağlantı yok";
    return errorData(msg.length > 30 ? "Bağlantı yok" : msg);
  }
}

export async function readWidgetCache(): Promise<PriceWidgetData | null> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PriceWidgetData;
    if (!Array.isArray(parsed.rows) || parsed.rows.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeWidgetCache(data: PriceWidgetData): Promise<void> {
  try {
    if (!data.rows || data.rows.length === 0) return;
    await AsyncStorage.setItem(WIDGET_CACHE_KEY, JSON.stringify(data));
  } catch {
    /* no-op */
  }
}
