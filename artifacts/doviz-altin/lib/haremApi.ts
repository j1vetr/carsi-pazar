import { FN } from "./api";

export type AssetCategory =
  | "DOVIZ"
  | "MADEN"
  | "PARITE"
  | "GRAM ALTIN"
  | "SARRAFIYE";

export type AssetGroup =
  | "currency"
  | "gold-gram"
  | "gold-coin"
  | "gold-bar"
  | "gold-bracelet"
  | "silver"
  | "metal"
  | "ratio"
  | "parity"
  | "gold-parity"
  | "spread"
  | "bank";

export interface SymbolMeta {
  symbol: string;
  code: string;
  nameTR: string;
  name: string;
  category: AssetCategory;
  group: AssetGroup;
  unit: string;
  decimals: number;
  flag?: string;
  iconKey: string;
  emission?: "yeni" | "eski" | "standart";
}

export const SYMBOL_REGISTRY: SymbolMeta[] = [
  // ===== DOVIZ (TL bazlı kurlar) =====
  { symbol: "USDTRY", code: "USD", nameTR: "Amerikan Doları", name: "US Dollar", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "US", iconKey: "USD" },
  { symbol: "EURTRY", code: "EUR", nameTR: "Euro", name: "Euro", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "EU", iconKey: "EUR" },
  { symbol: "GBPTRY", code: "GBP", nameTR: "İngiliz Sterlini", name: "British Pound", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "GB", iconKey: "GBP" },
  { symbol: "CHFTRY", code: "CHF", nameTR: "İsviçre Frangı", name: "Swiss Franc", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "CH", iconKey: "CHF" },
  { symbol: "AUDTRY", code: "AUD", nameTR: "Avustralya Doları", name: "Australian Dollar", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "AU", iconKey: "AUD" },
  { symbol: "CADTRY", code: "CAD", nameTR: "Kanada Doları", name: "Canadian Dollar", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "CA", iconKey: "CAD" },
  { symbol: "JPYTRY", code: "JPY", nameTR: "Japon Yeni", name: "Japanese Yen", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "JP", iconKey: "JPY" },
  { symbol: "SARTRY", code: "SAR", nameTR: "Suudi Riyali", name: "Saudi Riyal", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "SA", iconKey: "SAR" },
  { symbol: "DKKTRY", code: "DKK", nameTR: "Danimarka Kronu", name: "Danish Krone", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "DK", iconKey: "DKK" },
  { symbol: "NOKTRY", code: "NOK", nameTR: "Norveç Kronu", name: "Norwegian Krone", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "NO", iconKey: "NOK" },
  { symbol: "SEKTRY", code: "SEK", nameTR: "İsveç Kronu", name: "Swedish Krona", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "SE", iconKey: "SEK" },
  { symbol: "EURGBP", code: "EURGBP", nameTR: "Euro / İngiliz Sterlini", name: "EUR / GBP", category: "DOVIZ", group: "parity", unit: "", decimals: 4, flag: "EU", iconKey: "EURGBP" },
  { symbol: "EURCHF", code: "EURCHF", nameTR: "Euro / İsviçre Frangı", name: "EUR / CHF", category: "DOVIZ", group: "parity", unit: "", decimals: 4, flag: "EU", iconKey: "EURCHF" },
  { symbol: "EURUSDS", code: "EURUSDS", nameTR: "Euro / Dolar (Spot)", name: "EUR / USD Spot", category: "DOVIZ", group: "parity", unit: "", decimals: 4, flag: "EU", iconKey: "EURUSD" },
  { symbol: "XUSDTRY", code: "XUSDTRY", nameTR: "USD/TRY (Çapraz)", name: "USD / TRY Cross", category: "DOVIZ", group: "currency", unit: "₺", decimals: 4, flag: "US", iconKey: "USD" },
  { symbol: "FARKEUR", code: "FARKEUR", nameTR: "EUR Fark Değeri", name: "EUR Spread", category: "DOVIZ", group: "spread", unit: "", decimals: 4, flag: "EU", iconKey: "EUR" },

  // ===== MADEN (Altın, Gümüş, Platin, Paladyum, Pariteler) =====
  { symbol: "ALTIN", code: "ALTIN", nameTR: "Gram Altın (Has)", name: "Gold (TL/g)", category: "MADEN", group: "gold-gram", unit: "₺/gr", decimals: 2, iconKey: "ALTIN" },
  { symbol: "XAUUSD", code: "ONS", nameTR: "Ons Altın", name: "XAU/USD", category: "MADEN", group: "gold-gram", unit: "$/oz", decimals: 2, iconKey: "ONS" },
  { symbol: "XAUUSDS", code: "ONS_SPOT", nameTR: "Ons Altın (Spot)", name: "XAU/USD Spot", category: "MADEN", group: "gold-gram", unit: "$/oz", decimals: 2, iconKey: "ONS" },
  { symbol: "XAUEUR", code: "ONS_EUR", nameTR: "Ons Altın (EUR)", name: "XAU/EUR", category: "MADEN", group: "gold-gram", unit: "€/oz", decimals: 2, iconKey: "ONS" },
  { symbol: "XAUXAG", code: "AU_AG", nameTR: "Altın / Gümüş Oranı", name: "Gold/Silver Ratio", category: "MADEN", group: "ratio", unit: "x", decimals: 4, iconKey: "RATIO" },
  { symbol: "GUMTRY", code: "GUMUS_TRY", nameTR: "Gram Gümüş", name: "Silver TL/g", category: "MADEN", group: "silver", unit: "₺/gr", decimals: 2, iconKey: "GUMUS" },
  { symbol: "GUMUSD", code: "GUMUS_USD_GR", nameTR: "Gram Gümüş (USD)", name: "Silver USD/g", category: "MADEN", group: "silver", unit: "$/gr", decimals: 4, iconKey: "GUMUS" },
  { symbol: "XAGUSD", code: "ONS_GUMUS", nameTR: "Ons Gümüş", name: "XAG/USD", category: "MADEN", group: "silver", unit: "$/oz", decimals: 2, iconKey: "GUMUS" },
  { symbol: "KXAGUSD", code: "KG_GUMUS", nameTR: "Kilo Gümüş (USD)", name: "Silver USD/kg", category: "MADEN", group: "silver", unit: "$/kg", decimals: 2, iconKey: "GUMUS" },
  { symbol: "PLATIN", code: "PLATIN", nameTR: "Platin (TL)", name: "Platinum TL", category: "MADEN", group: "metal", unit: "₺/gr", decimals: 2, iconKey: "PLATIN" },
  { symbol: "XPTUSD", code: "PLATIN_USD", nameTR: "Ons Platin (USD)", name: "XPT/USD", category: "MADEN", group: "metal", unit: "$/oz", decimals: 2, iconKey: "PLATIN" },
  { symbol: "PALADYUM", code: "PALADYUM", nameTR: "Paladyum (TL)", name: "Palladium TL", category: "MADEN", group: "metal", unit: "₺/gr", decimals: 2, iconKey: "PALADYUM" },
  { symbol: "XPDUSD", code: "PALADYUM_USD", nameTR: "Ons Paladyum (USD)", name: "XPD/USD", category: "MADEN", group: "metal", unit: "$/oz", decimals: 2, iconKey: "PALADYUM" },
  { symbol: "PARUSD", code: "PAR_USD", nameTR: "Altın Parite (USD)", name: "Gold Parity USD", category: "MADEN", group: "gold-parity", unit: "$", decimals: 4, iconKey: "PAR_USD" },
  { symbol: "PAREUR", code: "PAR_EUR", nameTR: "Altın Parite (EUR)", name: "Gold Parity EUR", category: "MADEN", group: "gold-parity", unit: "€", decimals: 4, iconKey: "PAR_EUR" },
  { symbol: "PARGBP", code: "PAR_GBP", nameTR: "Altın Parite (GBP)", name: "Gold Parity GBP", category: "MADEN", group: "gold-parity", unit: "£", decimals: 4, iconKey: "PAR_GBP" },
  { symbol: "PARCHF", code: "PAR_CHF", nameTR: "Altın Parite (CHF)", name: "Gold Parity CHF", category: "MADEN", group: "gold-parity", unit: "₣", decimals: 4, iconKey: "PAR_CHF" },
  { symbol: "FARK", code: "FARK", nameTR: "Altın Fark", name: "Gold Spread", category: "MADEN", group: "spread", unit: "₺", decimals: 2, iconKey: "FARK" },
  { symbol: "VADE FARK", code: "VADE_FARK", nameTR: "Vadeli Altın Fark", name: "Forward Spread", category: "MADEN", group: "spread", unit: "₺", decimals: 2, iconKey: "FARK" },

  // ===== GRAM ALTIN (Külçe boyutları) =====
  { symbol: "5 Gr Gram Altın", code: "GRAM5", nameTR: "5 Gram Külçe Altın", name: "5 Gram Bar", category: "GRAM ALTIN", group: "gold-bar", unit: "5 gr", decimals: 2, iconKey: "BAR5" },
  { symbol: "10 Gr Gram Altın", code: "GRAM10", nameTR: "10 Gram Külçe Altın", name: "10 Gram Bar", category: "GRAM ALTIN", group: "gold-bar", unit: "10 gr", decimals: 2, iconKey: "BAR10" },
  { symbol: "20 Gr Gram Altın", code: "GRAM20", nameTR: "20 Gram Külçe Altın", name: "20 Gram Bar", category: "GRAM ALTIN", group: "gold-bar", unit: "20 gr", decimals: 2, iconKey: "BAR20" },
  { symbol: "50 Gr Gram Altın", code: "GRAM50", nameTR: "50 Gram Külçe Altın", name: "50 Gram Bar", category: "GRAM ALTIN", group: "gold-bar", unit: "50 gr", decimals: 2, iconKey: "BAR50" },
  { symbol: "100 Gr Gram Altın", code: "GRAM100", nameTR: "100 Gram Külçe Altın", name: "100 Gram Bar", category: "GRAM ALTIN", group: "gold-bar", unit: "100 gr", decimals: 2, iconKey: "BAR100" },

  // ===== SARRAFIYE (Cumhuriyet altınları + bilezik + külçe) =====
  { symbol: "CEYREK_YENI", code: "CEYREK", nameTR: "Çeyrek Altın (Yeni)", name: "Quarter (New)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "CEYREK", emission: "yeni" },
  { symbol: "CEYREK_ESKI", code: "CEYREK_ESKI", nameTR: "Çeyrek Altın (Eski)", name: "Quarter (Old)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "CEYREK", emission: "eski" },
  { symbol: "YARIM_YENI", code: "YARIM", nameTR: "Yarım Altın (Yeni)", name: "Half (New)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "YARIM", emission: "yeni" },
  { symbol: "YARIM_ESKI", code: "YARIM_ESKI", nameTR: "Yarım Altın (Eski)", name: "Half (Old)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "YARIM", emission: "eski" },
  { symbol: "TEK_YENI", code: "TAM", nameTR: "Tam Altın (Yeni)", name: "Full (New)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "TAM", emission: "yeni" },
  { symbol: "TEK_ESKI", code: "TAM_ESKI", nameTR: "Tam Altın (Eski)", name: "Full (Old)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "TAM", emission: "eski" },
  { symbol: "ATA_YENI", code: "ATA", nameTR: "Ata Altın (Yeni)", name: "Ata (New)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "ATA", emission: "yeni" },
  { symbol: "ATA_ESKI", code: "ATA_ESKI", nameTR: "Ata Altın (Eski)", name: "Ata (Old)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "ATA", emission: "eski" },
  { symbol: "ATA5_YENI", code: "ATA5", nameTR: "5'li Ata (Yeni)", name: "5x Ata (New)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "ATA5", emission: "yeni" },
  { symbol: "ATA5_ESKI", code: "ATA5_ESKI", nameTR: "5'li Ata (Eski)", name: "5x Ata (Old)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "ATA5", emission: "eski" },
  { symbol: "GREMESE_YENI", code: "GREMESE_YENI", nameTR: "Gremese Altın (Yeni)", name: "Gremese (New)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "GREMESE", emission: "yeni" },
  { symbol: "GREMESE_ESKI", code: "GREMESE_ESKI", nameTR: "Gremese Altın (Eski)", name: "Gremese (Old)", category: "SARRAFIYE", group: "gold-coin", unit: "adet", decimals: 2, iconKey: "GREMESE", emission: "eski" },
  { symbol: "KULCEALTIN", code: "KULCE", nameTR: "Külçe Altın", name: "Bullion", category: "SARRAFIYE", group: "gold-bar", unit: "₺/kg", decimals: 2, iconKey: "KULCE" },
  { symbol: "AYAR22", code: "AYAR22", nameTR: "22 Ayar Bilezik", name: "22K Bracelet", category: "SARRAFIYE", group: "gold-bracelet", unit: "₺/gr", decimals: 2, iconKey: "AYAR22" },
  { symbol: "AYAR14", code: "AYAR14", nameTR: "14 Ayar Altın", name: "14K Gold", category: "SARRAFIYE", group: "gold-bracelet", unit: "₺/gr", decimals: 2, iconKey: "AYAR14" },

  // ===== PARITE (Uluslararası pariteler) =====
  { symbol: "EURUSD", code: "EURUSD", nameTR: "Euro / Dolar", name: "EUR / USD", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "EU", iconKey: "EURUSD" },
  { symbol: "GBPUSD", code: "GBPUSD", nameTR: "Sterlin / Dolar", name: "GBP / USD", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "GB", iconKey: "GBPUSD" },
  { symbol: "AUDUSD", code: "AUDUSD", nameTR: "Avustralya $ / Dolar", name: "AUD / USD", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "AU", iconKey: "AUDUSD" },
  { symbol: "USDCHF", code: "USDCHF", nameTR: "Dolar / İsviçre Frangı", name: "USD / CHF", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "US", iconKey: "USDCHF" },
  { symbol: "USDCAD", code: "USDCAD", nameTR: "Dolar / Kanada $", name: "USD / CAD", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "US", iconKey: "USDCAD" },
  { symbol: "USDJPY", code: "USDJPY", nameTR: "Dolar / Japon Yeni", name: "USD / JPY", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "US", iconKey: "USDJPY" },
  { symbol: "USDSAR", code: "USDSAR", nameTR: "Dolar / Suudi Riyali", name: "USD / SAR", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "US", iconKey: "USDSAR" },
  { symbol: "USDDKK", code: "USDDKK", nameTR: "Dolar / Danimarka Kronu", name: "USD / DKK", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "US", iconKey: "USDDKK" },
  { symbol: "USDNOK", code: "USDNOK", nameTR: "Dolar / Norveç Kronu", name: "USD / NOK", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "US", iconKey: "USDNOK" },
  { symbol: "USDSEK", code: "USDSEK", nameTR: "Dolar / İsveç Kronu", name: "USD / SEK", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "US", iconKey: "USDSEK" },
  { symbol: "USDRUB", code: "USDRUB", nameTR: "Dolar / Rus Rublesi", name: "USD / RUB", category: "PARITE", group: "parity", unit: "", decimals: 4, flag: "US", iconKey: "USDRUB" },

  // ===== BANKA FİYATLARI (Türk bankalarının ortalama alış/satış kuru) =====
  { symbol: "BANKAUSD", code: "BANKAUSD", nameTR: "Banka USD", name: "Bank USD", category: "DOVIZ", group: "bank", unit: "₺", decimals: 4, flag: "TR", iconKey: "BANKAUSD" },
  { symbol: "BANKA ALTIN", code: "BANKA_ALTIN", nameTR: "Banka Gram Altın", name: "Bank Gold", category: "MADEN", group: "bank", unit: "₺/gr", decimals: 2, iconKey: "BANKA_ALTIN" },
];

const SYMBOL_INDEX = new Map(SYMBOL_REGISTRY.map((m) => [m.symbol.toUpperCase(), m]));
const CODE_INDEX = new Map(SYMBOL_REGISTRY.map((m) => [m.code, m]));

export function findMetaBySymbol(symbol: string): SymbolMeta | undefined {
  return SYMBOL_INDEX.get(symbol.toUpperCase());
}

export function findMetaByCode(code: string): SymbolMeta | undefined {
  return CODE_INDEX.get(code);
}

export interface RawHaremPrice {
  symbol: string;
  category: string;
  description?: string;
  bid: number;
  ask: number;
  timestamp: string;
  created_at?: string;
}

export type ServerPrev24h = Record<string, { bid: number | null; ask: number | null }>;

export interface RawHaremResponse {
  data: RawHaremPrice[];
  updatedAt?: string;
  stale?: boolean;
  prev24h?: ServerPrev24h;
}

/**
 * Backend'den tüm fiyatları çeker. Timeout vermek için `timeoutMs` opsiyonu
 * geçilebilir; widget ve foreground notification gibi arka plan görevlerinde
 * fetch sonsuza kadar asılı kalmasın diye kullanılır.
 */
export async function fetchAllPrices(opts?: { timeoutMs?: number }): Promise<RawHaremResponse> {
  const timeoutMs = opts?.timeoutMs;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let raceTimer: ReturnType<typeof setTimeout> | undefined;
  let signal: AbortSignal | undefined;
  if (timeoutMs && typeof AbortController !== "undefined") {
    const ctrl = new AbortController();
    signal = ctrl.signal;
    timer = setTimeout(() => ctrl.abort(), timeoutMs);
  }
  // RN fetch bazı koşullarda AbortController.abort()'u onurlandırmadan hang
  // ediyor (özellikle FGS aktifken arka planda). Bu yüzden Promise.race ile
  // ek bir hard-timeout sarmalı kullanıyoruz: timeoutMs+2sn'de promise reject
  // olur ve underlying fetch askıda kalsa bile akış devam eder.
  let res: Response;
  try {
    // Cache-Control: no-cache → CDN/proxy stale veri döndürmesin.
    // Connection: close → HTTP keep-alive bağlantısı reuse edilmesin. Stale
    // keep-alive bağlantıları (özellikle FGS arka planda uzun süre dururken)
    // yeni isteklerde silent hang'e neden olabiliyor; her fetch temiz TCP
    // bağlantısı açsın.
    const fetchInit: RequestInit = {
      headers: {
        "Cache-Control": "no-cache",
        Connection: "close",
      },
    };
    if (signal) fetchInit.signal = signal;
    const fetchPromise = fetch(FN.getPrices, fetchInit);
    if (timeoutMs) {
      const guardMs = timeoutMs + 2_000;
      const racePromise = new Promise<Response>((_, reject) => {
        raceTimer = setTimeout(
          () => reject(new Error(`fetch hard-timeout ${guardMs}ms`)),
          guardMs,
        );
      });
      res = await Promise.race([fetchPromise, racePromise]);
    } else {
      res = await fetchPromise;
    }
  } finally {
    if (timer) clearTimeout(timer);
    if (raceTimer) clearTimeout(raceTimer);
  }
  if (!res.ok) throw new Error(`Backend hatası: ${res.status}`);
  const json = (await res.json()) as
    | { ts?: number; items?: RawHaremPrice[]; prev24h?: ServerPrev24h }
    | RawHaremResponse;
  if (Array.isArray((json as { items?: unknown }).items)) {
    const j = json as { ts: number; items: RawHaremPrice[]; prev24h?: ServerPrev24h };
    return {
      data: j.items,
      updatedAt: j.ts ? new Date(j.ts).toISOString() : undefined,
      stale: false,
      prev24h: j.prev24h ?? undefined,
    };
  }
  return json as RawHaremResponse;
}

export interface AssetRate {
  meta: SymbolMeta;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
  prevClose: number;
  timestamp: number;
}

export interface PreviousPriceCache {
  [code: string]: { buy: number; sell: number };
}

export function mapPrices(
  data: RawHaremResponse,
  prevCache: PreviousPriceCache
): AssetRate[] {
  if (!data?.data || !Array.isArray(data.data)) return [];
  const serverPrev = data.prev24h ?? {};
  const out: AssetRate[] = [];
  for (const raw of data.data) {
    const meta = findMetaBySymbol(raw.symbol);
    if (!meta) continue;
    if (raw.bid === 0 && raw.ask === 0) continue;
    // Backend 24h snapshot öncelikli (sembol uppercase ile key'lenmiş);
    // yoksa local hafıza fallback'ine düşer; o da yoksa değişim 0 gösterilir.
    const sKey = meta.symbol.toUpperCase();
    const sp = serverPrev[sKey];
    const localPrev = prevCache[meta.code];
    const prevBuy =
      typeof sp?.bid === "number" && Number.isFinite(sp.bid)
        ? sp.bid
        : localPrev?.buy;
    const prevClose = typeof prevBuy === "number" ? prevBuy : raw.bid;
    const change = raw.bid - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
    let ts = 0;
    try {
      ts = new Date(raw.timestamp).getTime();
      if (!Number.isFinite(ts)) ts = Date.now();
    } catch {
      ts = Date.now();
    }
    out.push({
      meta,
      buy: raw.bid,
      sell: raw.ask,
      change,
      changePercent,
      prevClose,
      timestamp: ts,
    });
  }
  return out;
}

export function groupByCategory(rates: AssetRate[]): Record<AssetCategory, AssetRate[]> {
  const result: Record<AssetCategory, AssetRate[]> = {
    DOVIZ: [],
    MADEN: [],
    PARITE: [],
    "GRAM ALTIN": [],
    SARRAFIYE: [],
  };
  rates.forEach((r) => {
    if (result[r.meta.category]) result[r.meta.category].push(r);
  });
  return result;
}

export function groupByGroup(rates: AssetRate[]): Record<AssetGroup, AssetRate[]> {
  const result: Record<string, AssetRate[]> = {};
  rates.forEach((r) => {
    if (!result[r.meta.group]) result[r.meta.group] = [];
    result[r.meta.group].push(r);
  });
  return result as Record<AssetGroup, AssetRate[]>;
}
