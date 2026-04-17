import { defineSecret } from "firebase-functions/params";

export const HAREMAPI_KEY = defineSecret("HAREMAPI_KEY");

const HAREM_BASE = "https://haremapi.tr/api/v1";

export type HaremPrice = {
  symbol?: string;
  code?: string;
  category?: string;
  bid?: number;
  ask?: number;
  alis?: number;
  satis?: number;
  buying?: number;
  selling?: number;
  changerate?: number;
  timestamp?: string;
  date?: string;
  [k: string]: unknown;
};

export async function fetchHaremPrices(apiKey: string): Promise<HaremPrice[]> {
  const r = await fetch(`${HAREM_BASE}/prices`, {
    headers: { Authorization: `Bearer ${apiKey}`, "x-api-key": apiKey },
  });
  if (!r.ok) throw new Error(`Harem upstream ${r.status}`);
  const body = (await r.json()) as unknown;
  if (Array.isArray(body)) return body as HaremPrice[];
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as HaremPrice[];
    if (Array.isArray(obj.items)) return obj.items as HaremPrice[];
  }
  throw new Error("Harem unexpected payload shape");
}

export function priceOf(p: HaremPrice): number | null {
  const v = p.bid ?? p.ask ?? p.satis ?? p.selling ?? p.alis ?? p.buying;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
