import { logger } from "../lib/logger";
import { BASE_CURRENCIES, type RatesUSD } from "./symbols";

const METALPRICE_BASE = "https://api.metalpriceapi.com/v1";

function getApiKey(): string {
  const key = process.env["METALPRICE_API_KEY"];
  if (!key) {
    throw new Error("METALPRICE_API_KEY is not set");
  }
  return key;
}

interface TimeframeResponse {
  success?: boolean;
  base?: string;
  start_date?: string;
  end_date?: string;
  rates?: Record<string, Record<string, number>>;
  error?: { code?: number; message?: string; type?: string };
  message?: string;
}

interface LatestResponse {
  success?: boolean;
  base?: string;
  timestamp?: number;
  rates?: Record<string, number>;
  error?: { code?: number; message?: string; type?: string };
  message?: string;
}

const CURRENCIES_PARAM = BASE_CURRENCIES.join(",");

export interface DailyRates {
  date: string;
  rates: RatesUSD;
}

/**
 * Fetch daily close rates for a date range (inclusive). MetalpriceAPI returns
 * USD-based rates: { TRY: 32.5, EUR: 0.92, XAU: 0.00043, ... }.
 *
 * Note: free/cheap plans typically cap timeframe queries at ~365 days, so
 * callers should chunk multi-year backfills into yearly windows.
 */
export async function fetchTimeframe(
  startDate: string,
  endDate: string,
): Promise<DailyRates[]> {
  const url = new URL(`${METALPRICE_BASE}/timeframe`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("base", "USD");
  url.searchParams.set("currencies", CURRENCIES_PARAM);

  logger.info({ startDate, endDate }, "metalprice: fetching timeframe");

  const r = await fetch(url.toString());
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`MetalpriceAPI ${r.status}: ${text.slice(0, 200)}`);
  }

  const body = (await r.json()) as TimeframeResponse;
  if (body.success === false || !body.rates) {
    const msg = body.error?.message ?? body.message ?? "unknown error";
    throw new Error(`MetalpriceAPI returned error: ${msg}`);
  }

  const result: DailyRates[] = [];
  for (const [date, dayRates] of Object.entries(body.rates)) {
    result.push({ date, rates: dayRates as RatesUSD });
  }
  result.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return result;
}

/**
 * Fetch the latest USD-based rates (single call, used by daily cron).
 */
export async function fetchLatest(): Promise<RatesUSD> {
  const url = new URL(`${METALPRICE_BASE}/latest`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("base", "USD");
  url.searchParams.set("currencies", CURRENCIES_PARAM);

  const r = await fetch(url.toString());
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`MetalpriceAPI ${r.status}: ${text.slice(0, 200)}`);
  }
  const body = (await r.json()) as LatestResponse;
  if (body.success === false || !body.rates) {
    const msg = body.error?.message ?? body.message ?? "unknown error";
    throw new Error(`MetalpriceAPI returned error: ${msg}`);
  }
  return body.rates as RatesUSD;
}
