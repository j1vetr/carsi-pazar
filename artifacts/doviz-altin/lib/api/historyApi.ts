/**
 * Mobile -> backend symbol mapping. Keys are the `code` field used inside
 * the app (haremApi.ts SYMBOL_REGISTRY); values are the backend symbol
 * stored by the metalprice subsystem on the API server.
 *
 * Codes not present here have no historical chart (sarrafiye, külçe, oran,
 * fark, vb.). The detail screen hides the chart section for those.
 */
const HISTORY_SYMBOL_MAP: Record<string, string> = {
  USD: "USDTRY",
  EUR: "EURTRY",
  GBP: "GBPTRY",
  CHF: "CHFTRY",
  AUD: "AUDTRY",
  CAD: "CADTRY",
  JPY: "JPYTRY",
  SAR: "SARTRY",
  DKK: "DKKTRY",
  NOK: "NOKTRY",
  SEK: "SEKTRY",
  XUSDTRY: "USDTRY",

  EURUSDS: "EURUSD",

  ALTIN: "ALTIN",
  ONS: "ONS",
  ONS_SPOT: "ONS",
  ONS_EUR: "ONS_EUR",

  GUMUS_TRY: "GUMUSTRY",
  ONS_GUMUS: "XAGUSD",
  GUMUS_USD_GR: "GUMUSD",
  KG_GUMUS: "KGGUMUSD",

  EURGBP: "EURGBP",
  EURCHF: "EURCHF",

  PLATIN: "PLATIN",
  PLATIN_USD: "XPTUSD",
  PALADYUM: "PALADYUM",
  PALADYUM_USD: "XPDUSD",
};

export type HistoryRange = "1H" | "1A" | "3A" | "1Y" | "3Y" | "5Y";

export interface HistoryPoint {
  t: string;
  c: number;
}

export function getBackendSymbol(code: string): string | null {
  return HISTORY_SYMBOL_MAP[code] ?? null;
}

export function hasHistorySupport(code: string): boolean {
  return code in HISTORY_SYMBOL_MAP;
}

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  (process.env.EXPO_PUBLIC_DOMAIN
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
    : "http://localhost:5000");

export async function fetchHistory(
  code: string,
  range: HistoryRange,
): Promise<HistoryPoint[]> {
  const symbol = getBackendSymbol(code);
  if (!symbol) return [];
  const url = `${API_BASE}/api/history/${symbol}?range=${range}`;
  const r = await fetch(url);
  if (!r.ok) {
    throw new Error(`history ${r.status} for ${symbol}`);
  }
  const body = (await r.json()) as { points?: HistoryPoint[] };
  return body.points ?? [];
}

/**
 * Verilen tarih için, hangi history range'inin çağrılması gerektiğini seçer.
 * Hafta sonu/tatil toleransı için 5 gün buffer ekler.
 */
export function pickRangeForDate(target: Date, now: Date = new Date()): HistoryRange {
  const diffDays = Math.ceil((now.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));
  const padded = diffDays + 5;
  if (padded <= 7) return "1H";
  if (padded <= 31) return "1A";
  if (padded <= 92) return "3A";
  if (padded <= 366) return "1Y";
  if (padded <= 366 * 3) return "3Y";
  return "5Y";
}

/**
 * Verilen tarihe en yakın işlem gününün fiyatını döner. Hafta sonu/tatil için
 * +/- toleranceDays gün arar; bulunamazsa null döner.
 */
export function findClosestPoint(
  points: HistoryPoint[],
  target: Date,
  toleranceDays: number = 5,
): HistoryPoint | null {
  if (points.length === 0) return null;
  const targetMs = target.getTime();
  const toleranceMs = toleranceDays * 24 * 60 * 60 * 1000;
  let best: HistoryPoint | null = null;
  let bestDiff = Infinity;
  for (const p of points) {
    const pMs = new Date(p.t).getTime();
    if (Number.isNaN(pMs)) continue;
    const diff = Math.abs(pMs - targetMs);
    if (diff < bestDiff && diff <= toleranceMs) {
      best = p;
      bestDiff = diff;
    }
  }
  return best;
}
