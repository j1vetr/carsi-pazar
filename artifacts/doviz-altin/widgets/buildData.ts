"use no memo";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchAllPrices, mapPrices, type AssetRate } from "@/lib/haremApi";
import type { AssetKind, PriceWidgetData, WidgetRow } from "./PriceWidget";

export const WIDGET_CACHE_KEY = "@carsi/widget-cache-v2";

export const SHOWN_CODES: { code: string; label: string; kind: AssetKind }[] = [
  { code: "USD", label: "USD", kind: "currency" },
  { code: "EUR", label: "EUR", kind: "currency" },
  { code: "ALTIN", label: "GRAM", kind: "gold" },
  { code: "CEYREK", label: "ÇYREK", kind: "gold" },
];

function fmtPrice(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "—";
  // Use 0 decimals for prices >= 1000 (gold), 2 decimals otherwise (FX).
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

export async function buildData(): Promise<PriceWidgetData> {
  try {
    const raw = await fetchAllPrices();
    const rates = mapPrices(raw, {});
    const byCode = new Map<string, AssetRate>(rates.map((r) => [r.meta.code, r]));

    const rows: WidgetRow[] = SHOWN_CODES.map(({ code, label, kind }) => {
      const r = byCode.get(code);
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
