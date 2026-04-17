import { defineSecret } from "firebase-functions/params";

export const HAREMAPI_KEY = defineSecret("HAREMAPI_KEY");

const HAREM_BASE = "https://haremapi.tr/api/v1";

export type HaremPrice = {
  code: string;
  alis?: number;
  satis?: number;
  buying?: number;
  selling?: number;
  changerate?: number;
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
  if (body && typeof body === "object" && Array.isArray((body as { data?: unknown }).data)) {
    return (body as { data: HaremPrice[] }).data;
  }
  throw new Error("Harem unexpected payload shape");
}

export function priceOf(p: HaremPrice): number | null {
  const v = p.satis ?? p.selling ?? p.alis ?? p.buying;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
