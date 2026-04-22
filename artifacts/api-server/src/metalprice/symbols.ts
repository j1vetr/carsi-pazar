export const TROY_OUNCE_GRAMS = 31.1034768;

export const BASE_CURRENCIES = [
  "TRY",
  "EUR",
  "GBP",
  "CHF",
  "AUD",
  "CAD",
  "JPY",
  "SAR",
  "DKK",
  "NOK",
  "SEK",
  "RUB",
  "XAU",
  "XAG",
  "XPT",
  "XPD",
] as const;

export type BaseCurrency = (typeof BASE_CURRENCIES)[number];

export type RatesUSD = Partial<Record<BaseCurrency, number>>;

export interface SymbolDef {
  symbol: string;
  group: "forex_try" | "parity" | "metal_usd" | "metal_eur" | "metal_try";
  derive: (r: RatesUSD) => number | null;
}

const safeDiv = (a: number | undefined, b: number | undefined): number | null => {
  if (typeof a !== "number" || typeof b !== "number" || b === 0) return null;
  return a / b;
};

const safeInv = (a: number | undefined): number | null => {
  if (typeof a !== "number" || a === 0) return null;
  return 1 / a;
};

const safe = (a: number | undefined): number | null =>
  typeof a === "number" ? a : null;

export const SYMBOLS: SymbolDef[] = [
  { symbol: "USDTRY", group: "forex_try", derive: (r) => safe(r.TRY) },
  { symbol: "EURTRY", group: "forex_try", derive: (r) => safeDiv(r.TRY, r.EUR) },
  { symbol: "GBPTRY", group: "forex_try", derive: (r) => safeDiv(r.TRY, r.GBP) },
  { symbol: "CHFTRY", group: "forex_try", derive: (r) => safeDiv(r.TRY, r.CHF) },
  { symbol: "AUDTRY", group: "forex_try", derive: (r) => safeDiv(r.TRY, r.AUD) },
  { symbol: "CADTRY", group: "forex_try", derive: (r) => safeDiv(r.TRY, r.CAD) },
  { symbol: "JPYTRY", group: "forex_try", derive: (r) => safeDiv(r.TRY, r.JPY) },
  { symbol: "SARTRY", group: "forex_try", derive: (r) => safeDiv(r.TRY, r.SAR) },
  { symbol: "DKKTRY", group: "forex_try", derive: (r) => safeDiv(r.TRY, r.DKK) },
  { symbol: "NOKTRY", group: "forex_try", derive: (r) => safeDiv(r.TRY, r.NOK) },
  { symbol: "SEKTRY", group: "forex_try", derive: (r) => safeDiv(r.TRY, r.SEK) },

  { symbol: "EURUSD", group: "parity", derive: (r) => safeInv(r.EUR) },
  { symbol: "GBPUSD", group: "parity", derive: (r) => safeInv(r.GBP) },
  { symbol: "AUDUSD", group: "parity", derive: (r) => safeInv(r.AUD) },
  { symbol: "USDCHF", group: "parity", derive: (r) => safe(r.CHF) },
  { symbol: "USDCAD", group: "parity", derive: (r) => safe(r.CAD) },
  { symbol: "USDJPY", group: "parity", derive: (r) => safe(r.JPY) },
  { symbol: "USDSAR", group: "parity", derive: (r) => safe(r.SAR) },
  { symbol: "USDDKK", group: "parity", derive: (r) => safe(r.DKK) },
  { symbol: "USDNOK", group: "parity", derive: (r) => safe(r.NOK) },
  { symbol: "USDSEK", group: "parity", derive: (r) => safe(r.SEK) },
  { symbol: "USDRUB", group: "parity", derive: (r) => safe(r.RUB) },
  { symbol: "EURGBP", group: "parity", derive: (r) => safeDiv(r.GBP, r.EUR) },
  { symbol: "EURCHF", group: "parity", derive: (r) => safeDiv(r.CHF, r.EUR) },

  { symbol: "XAUUSD", group: "metal_usd", derive: (r) => safeInv(r.XAU) },
  { symbol: "XAGUSD", group: "metal_usd", derive: (r) => safeInv(r.XAG) },
  { symbol: "XPTUSD", group: "metal_usd", derive: (r) => safeInv(r.XPT) },
  { symbol: "XPDUSD", group: "metal_usd", derive: (r) => safeInv(r.XPD) },
  { symbol: "GUMUSD", group: "metal_usd", derive: (r) => {
    const inv = safeInv(r.XAG);
    return inv === null ? null : inv / TROY_OUNCE_GRAMS;
  } },
  { symbol: "KGGUMUSD", group: "metal_usd", derive: (r) => {
    const inv = safeInv(r.XAG);
    return inv === null ? null : (inv / TROY_OUNCE_GRAMS) * 1000;
  } },
  { symbol: "ONS", group: "metal_usd", derive: (r) => safeInv(r.XAU) },
  { symbol: "ONS_EUR", group: "metal_eur", derive: (r) => safeDiv(r.EUR, r.XAU) },

  {
    symbol: "ALTIN",
    group: "metal_try",
    derive: (r) => {
      const xauUsd = safeInv(r.XAU);
      if (xauUsd === null || typeof r.TRY !== "number") return null;
      return (xauUsd * r.TRY) / TROY_OUNCE_GRAMS;
    },
  },
  {
    symbol: "GUMUSTRY",
    group: "metal_try",
    derive: (r) => {
      const xagUsd = safeInv(r.XAG);
      if (xagUsd === null || typeof r.TRY !== "number") return null;
      return (xagUsd * r.TRY) / TROY_OUNCE_GRAMS;
    },
  },
  {
    symbol: "PLATIN",
    group: "metal_try",
    derive: (r) => {
      const xptUsd = safeInv(r.XPT);
      if (xptUsd === null || typeof r.TRY !== "number") return null;
      return (xptUsd * r.TRY) / TROY_OUNCE_GRAMS;
    },
  },
  {
    symbol: "PALADYUM",
    group: "metal_try",
    derive: (r) => {
      const xpdUsd = safeInv(r.XPD);
      if (xpdUsd === null || typeof r.TRY !== "number") return null;
      return (xpdUsd * r.TRY) / TROY_OUNCE_GRAMS;
    },
  },
];

export const SUPPORTED_SYMBOLS: ReadonlySet<string> = new Set(
  SYMBOLS.map((s) => s.symbol),
);

export function deriveAllForDay(rates: RatesUSD): Record<string, number> {
  const out: Record<string, number> = {};
  for (const def of SYMBOLS) {
    const v = def.derive(rates);
    if (v !== null && Number.isFinite(v) && v > 0) {
      out[def.symbol] = v;
    }
  }
  return out;
}
