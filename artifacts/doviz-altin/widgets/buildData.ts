"use no memo";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchAllPrices, mapPrices, type AssetRate } from "@/lib/haremApi";
import type { PriceWidgetData, WidgetRow } from "./PriceWidget";

export const WIDGET_CACHE_KEY = "@carsi/widget-cache-v1";

export const SHOWN_CODES: { code: string; label: string }[] = [
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
  { code: "ALTIN", label: "GRAM" },
  { code: "CEYREK", label: "ÇYREK" },
];

function fmtPrice(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "—";
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

    const rows: WidgetRow[] = SHOWN_CODES.map(({ code, label }) => {
      const r = byCode.get(code);
      if (!r) {
        return { label, value: "—", changePercent: 0 };
      }
      return {
        label,
        value: fmtPrice(r.sell),
        changePercent: r.changePercent,
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
